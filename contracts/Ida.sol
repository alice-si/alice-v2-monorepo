pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';
import './PaymentRights.sol';
import './ImpactPromise.sol';
import './ClaimsRegistry.sol';

/**
 * @title Impact Delivery Agreement
 * @dev Contract to create flexible bounties with multiple actions to be completed (impact promises) and distributable reward payments.
 */
contract Ida {
    using SafeMath for uint256;

    event Created(address indexed creator, uint256 indexed promiseNumber, uint256 promisePrice, string name);
    event Funded(address indexed funder, uint256 amount, uint256 totalFunded);
    event Validated(uint256 amount);
    event Rejected(bytes32 key);

    /**
     * @dev Throws if called by any account other than the Validator.
     */
    modifier onlyValidator() {
        require(msg.sender == validator, "The caller is not the validator");
        _;
    }

    ERC20 public paymentToken;
    ImpactPromise public impactPromise;
    PaymentRights public paymentRights;

    Escrow public escrow;
    ClaimsRegistry public claimsRegistry;

    string public name;
    uint256 public promiseNumber;
    uint256 public validatedNumber;
    uint256 public promisePrice;
    address public validator;
    uint256 public endTime;
    address public serviceProvider;
    uint256 public nbPending;

    mapping (bytes32 => bool) public reportRegistered;

    constructor(
      ERC20 _paymentToken,
      ImpactPromise _impactPromise,
      Escrow _escrow,
      ClaimsRegistry _claimsRegistry,
      string memory _name,
      uint256 _promiseNumber,
      uint256 _promisePrice,
      address _validator,
      uint256 _endTime,
      address _serviceProvider
    ) public {
        require(address(_paymentToken) != address(0x0));
        require(address(_impactPromise) != address(0x0));

        name = _name;
        paymentToken = _paymentToken;
        impactPromise = _impactPromise;
        claimsRegistry = _claimsRegistry;
        promiseNumber = _promiseNumber;
        promisePrice = _promisePrice;
        validator = _validator;
        endTime = _endTime;
        serviceProvider = _serviceProvider;

        escrow = _escrow;
        paymentRights = PaymentRights(escrow.recipient());

        emit Created(serviceProvider, promiseNumber, promisePrice, name);
    }

    /**
    * @dev Allows people to fund the IDA with payments held in escrow until an impact promise is validated.
    */
    function fund(uint256 _amount) public {
        require(!hasEnded());
        require(paymentToken.balanceOf(address(escrow)).add(_amount) <= promisePrice.mul(promiseNumber), "The funding amount exceeds allowed funding cap");
        paymentToken.transferFrom(msg.sender, address(escrow), _amount);
        impactPromise.mint(msg.sender, _amount);

        emit Funded(msg.sender, _amount, impactPromise.totalSupply());
    }

    function registerReport(bytes32 key) public onlyValidator {
      require(!hasEnded(), "Cannot register after project end");
      require(!reportRegistered[key], "The report is already registered!");
      reportRegistered[key] = true;
      require(claimsRegistry.getClaim(serviceProvider, address(this), key) == bytes32(promisePrice), "A claim must be registered before registering a report");
      nbPending = nbPending.add(1);
    }

    function validatePromise(bytes32 key) public onlyValidator {
      require(!hasEnded(), "Cannot validate after project end");
      require(reportRegistered[key], "The report was not registered for this promise");
      reportRegistered[key] = false;
      if (validatedNumber < promiseNumber) {
        require(claimsRegistry.getClaim(serviceProvider, address(this), key) == bytes32(promisePrice), "A claim must be registered before validation");
        require(!claimsRegistry.isApproved(validator, serviceProvider, address(this), key), "This promise has already been validated");

        claimsRegistry.approveClaim(serviceProvider, address(this), key);
        escrow.unlock(promisePrice);
        validatedNumber = validatedNumber.add(1);
        emit Validated(promisePrice);
      }
      nbPending = nbPending.sub(1);
    }

    function rejectPromise(bytes32 key) public onlyValidator {
      require(!hasEnded(), "Cannot reject after project end");
      require(reportRegistered[key], "The report was not registered for this promise");
      reportRegistered[key] = false;
      nbPending = nbPending.sub(1);
      emit Rejected(key);
    }

    function hasEnded() public view returns(bool) {
      return now > endTime && nbPending == 0;
    }


    function getAvailableToRefund() public view returns(uint256) {
      uint256 remaining = escrow.funded().sub(escrow.unlocked());
      uint256 balance = impactPromise.balanceOf(msg.sender);
      return balance == 0 ? 0 : remaining.mul(balance).div(impactPromise.totalSupply());
    }


    function refund() public {
      require(hasEnded(), "Refund is only available after the project has ended");
      uint256 refundable = getAvailableToRefund();
      if (refundable > 0) {
        impactPromise.burnAll(msg.sender);
        escrow.refund(msg.sender, refundable);
      }
    }

}
