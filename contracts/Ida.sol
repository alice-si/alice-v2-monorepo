pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';
import './FluidEscrow.sol';
import './FluidToken.sol';
import './ImpactPromise.sol';

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


    string public name;
    uint256 public outcomesNumber;
    uint256 public validatedNumber;
    uint256 public outcomePrice;
    //Avoid storing budget to save gas
    uint256 public budget;
    address public validator;
    uint256 public endTime;

    constructor(ERC20 _paymentToken, string memory _name, uint256 _outcomesNumber, uint256 _outcomesPrice, address _validator, uint256 _endTime) public {
        name = _name;
        paymentToken = _paymentToken;
        outcomesNumber = _outcomesNumber;
        outcomePrice = _outcomesPrice;
        budget = outcomePrice.mul(outcomesNumber);
        validator = _validator;
        endTime = _endTime;

        escrow = new FluidEscrow(_paymentToken, budget, address(this));
        impactPromise = new ImpactPromise();
        paymentRights = FluidToken(escrow.recipient());
        paymentRights.transfer(msg.sender, budget);

        emit Created(msg.sender, outcomesNumber, outcomePrice, name);
    }


    function fund(uint256 _amount) public {
        require(!hasEnded());
        require(paymentToken.balanceOf(address(escrow)).add(_amount) <= budget, "The funding amount exceed allowed impact budget");
        paymentToken.transferFrom(msg.sender, address(escrow), _amount);
        impactPromise.mint(msg.sender, _amount);

        emit Funded(msg.sender, _amount);
    }


    function validateOutcome() public onlyValidator {
        escrow.unlock(outcomePrice);
        validatedNumber = validatedNumber.add(1);
        emit Validated(outcomePrice);
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
