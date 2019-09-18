pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Escrow
 * @dev Contract dedicated to hold funds until impact is validated.
 *
 */
contract Escrow {
    using SafeMath for uint256;

    event Unlocked(uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);

    /**
     * @dev Throws if called by any account other than the operator.
     */
    modifier onlyOperator() {
        require(msg.sender == operator, "The caller is not the operator");
        _;
    }


    /**
     * @dev Throws if called by any account other than the credit token contract.
     */
    modifier onlyRecipient() {
        require(msg.sender == recipient, "The caller is not the recipient");
        _;
    }

    ERC20 public paymentToken;
    address public operator;
    address public recipient;

    uint256 public unlocked;
    uint256 public withdrawn;
    uint256 public capacity;

    constructor(ERC20 _paymentToken, uint256 _capacity, address _operator, address _recipient) public {
        paymentToken = _paymentToken;
        capacity = _capacity;
        operator = _operator;
        recipient = _recipient;
    }


    function unlock(uint256 _amount) public onlyOperator {
        unlocked = unlocked.add(_amount);
        require(unlocked <= capacity, "Cannot unlock more than the max capacity of the escrow");

        emit Unlocked(_amount);
    }


    /**
     * @dev Withdraw part of the escrow reserved for receiver
     * @param _amount The amount of funds intended to be taken out
     */
    function withdraw(address _recipient, uint256 _amount) public onlyRecipient {
        withdrawn = withdrawn.add(_amount);
        require(withdrawn <= unlocked, "Cannot withdraw more funds than has been unlocked");

        require(paymentToken.transfer(_recipient, _amount));

        emit Withdrawn(msg.sender, _amount);
    }

    function funded() public view returns(uint256) {
      return paymentToken.balanceOf(address(this)).add(withdrawn);
    }
}
