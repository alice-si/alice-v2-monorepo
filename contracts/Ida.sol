pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';
import './FluidEscrow.sol';
import './PaymentRights.sol';
import './ImpactPromise.sol';
import './ClaimsRegistry.sol';

/**
 * @title Impact Delivery Agreement
 * @dev Contract to manage social impact projects in a flexible way.
 *
 */
contract Ida {
    using SafeMath for uint256;

    event Created(address indexed creator, uint256 indexed outcomesNumber, uint256 outcomePrice, string name);
    event Funded(address indexed funder, uint256 amount, uint256 totalFunded);
    event Validated(bytes32 indexed key);
    event ValidationProposed(bytes32 indexed key);
    event ValidationCancelled(bytes32 indexed key);
    event ValidationRejected(bytes32 indexed key);

    /**
     * @dev Throws if called by any account other than the Validator.
     */
    modifier onlyValidator() {
        require(msg.sender == validator, "The caller is not the validator");
        _;
    }

    /**
     * @dev Throws if called by any account other than the Arbiter
     */
    modifier onlyArbiter() {
      require(msg.sender == arbiter, "The caller is not the arbiter");
      _;
    }

    ERC20 public paymentToken;
    ImpactPromise public impactPromise;
    PaymentRights public paymentRights;

    Escrow public escrow;
    ClaimsRegistry public claimsRegistry;


    string public name;
    uint256 public outcomesNumber;
    uint256 public validatedNumber;
    uint256 public outcomePrice;
    address public validator;
    address public arbiter;
    uint256 public endTime;
    uint256 public validationCoolOffPeriod;
    address public serviceProvider;

    mapping(bytes32 => uint) public pendingValidations;

    constructor(
      ERC20 _paymentToken,
      ImpactPromise _impactPromise,
      ClaimsRegistry _claimsRegistry,
      string memory _name,
      uint256 _outcomesNumber,
      uint256 _outcomesPrice,
      address _validator,
      address _arbiter,
      uint256 _endTime,
      uint256 _validationCoolOffPeriod,
      address _serviceProvider
    ) public {
        require(address(_paymentToken) != address(0x0));
        require(address(_impactPromise) != address(0x0));

        name = _name;
        paymentToken = _paymentToken;
        impactPromise = _impactPromise;
        claimsRegistry = _claimsRegistry;
        outcomesNumber = _outcomesNumber;
        outcomePrice = _outcomesPrice;
        validator = _validator;
        arbiter = _arbiter;
        endTime = _endTime;
        validationCoolOffPeriod = _validationCoolOffPeriod;
        serviceProvider = _serviceProvider;

        escrow = new FluidEscrow(_paymentToken, outcomePrice.mul(outcomesNumber), address(this));
        paymentRights = PaymentRights(escrow.recipient());
        paymentRights.transfer(serviceProvider, outcomePrice.mul(outcomesNumber));

        emit Created(serviceProvider, outcomesNumber, outcomePrice, name);
    }


    function fund(uint256 _amount) public {
        require(!hasEnded());
        require(paymentToken.balanceOf(address(escrow)).add(_amount) <= outcomePrice.mul(outcomesNumber), "The funding amount exceed allowed impact budget");
        paymentToken.transferFrom(msg.sender, address(escrow), _amount);
        impactPromise.mint(msg.sender, _amount);

        emit Funded(msg.sender, _amount, impactPromise.totalSupply());
    }


    function proposeValidation(bytes32 key) public onlyValidator {
        require(validatedNumber < outcomesNumber, "All of the outcomes have been already validated");
        require(pendingValidations[key] == 0, "The validation has already been proposed");
        require(claimsRegistry.getClaim(serviceProvider, address(this), key) == bytes32(outcomePrice), "The claim must be registered before validation");
        require(!claimsRegistry.isApproved(validator, serviceProvider, address(this), key), "The claim has already been approved");

        emit ValidationProposed(key);
    }


    function cancelValidation(bytes32 key) public onlyValidator {
      removeValidationProposal(key);
      emit ValidationCancelled(key);
    }


    function rejectValidation(bytes32 key) public onlyArbiter {
      removeValidationProposal(key);
      emit ValidationRejected(key);
    }


    function executeValidation(bytes32 key) public {
      require(pendingValidations[key] > 0, "The validation has not been proposed");
      require(now.sub(pendingValidations[key]) >= validationCoolOffPeriod);


      claimsRegistry.approveClaim(serviceProvider, address(this), key);
      escrow.unlock(outcomePrice);
      validatedNumber = validatedNumber.add(1);
      emit Validated(key);
    }


    function removeValidationProposal(bytes32 key) private {
      require(pendingValidations[key] > 0, "The validation has not been proposed");
      require(now.sub(pendingValidations[key]) < validationCoolOffPeriod);

      delete pendingValidations[key];
    }


    function hasEnded() public view returns(bool) {
      return now > endTime;
    }


    function refund() public {
      require(hasEnded());
      uint256 remaining = escrow.funded().sub(escrow.unlocked());
      uint256 balance = impactPromise.balanceOf(msg.sender);

      uint256 val = remaining.mul(balance).div(impactPromise.totalSupply());

      impactPromise.burnAll(msg.sender);
      escrow.refund(msg.sender, val);
    }

}
