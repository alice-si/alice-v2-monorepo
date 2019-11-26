pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';
import './FluidEscrow.sol';
import './FluidToken.sol';
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
    event Funded(address indexed funder, uint256 amount);
    event Validated(uint256 amount);

    /**
     * @dev Throws if called by any account other than the Validator.
     */
    modifier onlyValidator() {
        require(msg.sender == validator, "The caller is not the validator");
        _;
    }

    ERC20 public paymentToken;
    ImpactPromise public impactPromise;
    FluidToken public paymentRights;

    Escrow public escrow;
    ClaimsRegistry public claimsRegistry;


    string public name;
    uint256 public outcomesNumber;
    uint256 public validatedNumber;
    uint256 public outcomePrice;
    address public validator;
    uint256 public endTime;
    address public serviceProvider;

    constructor(
      ERC20 _paymentToken,
      ImpactPromise _impactPromise,
      ClaimsRegistry _claimsRegistry,
      string memory _name,
      uint256 _outcomesNumber,
      uint256 _outcomesPrice,
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
        outcomesNumber = _outcomesNumber;
        outcomePrice = _outcomesPrice;
        validator = _validator;
        endTime = _endTime;
        serviceProvider = _serviceProvider;

        escrow = new FluidEscrow(_paymentToken, outcomePrice.mul(outcomesNumber), address(this));
        paymentRights = FluidToken(escrow.recipient());
        paymentRights.transfer(msg.sender, outcomePrice.mul(outcomesNumber));

        emit Created(msg.sender, outcomesNumber, outcomePrice, name);
    }


    function fund(uint256 _amount) public {
        require(!hasEnded());
        require(paymentToken.balanceOf(address(escrow)).add(_amount) <= outcomePrice.mul(outcomesNumber), "The funding amount exceed allowed impact budget");
        paymentToken.transferFrom(msg.sender, address(escrow), _amount);
        impactPromise.mint(msg.sender, _amount);

        emit Funded(msg.sender, _amount);
    }


    function validateOutcome(bytes32 key) public onlyValidator {
        require(validatedNumber < outcomesNumber, "All of the outcomes have been already validated");
        require(claimsRegistry.getClaim(serviceProvider, address(this), key) == bytes32(outcomePrice), "The claim must be registered before validation");
        require(!claimsRegistry.isApproved(validator, serviceProvider, address(this), key), "The claim has already been approved");

        claimsRegistry.approveClaim(serviceProvider, address(this), key);
        escrow.unlock(outcomePrice);
        validatedNumber = validatedNumber.add(1);
        emit Validated(outcomePrice);
    }

    function check(bytes32 val) public view returns(bool) {
      return val == bytes32(outcomePrice);
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
