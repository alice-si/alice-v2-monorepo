pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title Escrow
 * @dev Contract dedicated to holds funds that may be gradually unlocked to the recipient.
 *
 */
contract Escrow is Ownable {
  using SafeMath for uint256;

  event Unlocked(uint256 amount);
  event Withdrawn(address indexed receiver, uint256 amount);

  /**
   * @dev Throws if called by any account other than the recipient.
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
  uint256 public refunded;
  uint256 public capacity;

  constructor(ERC20 _paymentToken, uint256 _capacity) public {
    paymentToken = _paymentToken;
    capacity = _capacity;
  }


  function setRecipient(address _recipient) public onlyOwner {
    recipient = _recipient;
  }


  function unlock(uint256 _amount) public onlyOwner {
    unlocked = unlocked.add(_amount);
    require(unlocked <= capacity, "Cannot unlock more than the max capacity of the escrow");

    emit Unlocked(_amount);
  }


  /**
   * @dev Withdraw part of the escrow reserved for recipient
   * @param _amount The amount of funds intended to be taken out
   */
  function withdraw(address _to, uint256 _amount) public onlyRecipient {
    withdrawn = withdrawn.add(_amount);
    require(withdrawn <= unlocked, "Cannot withdraw more funds than has been unlocked");

    require(paymentToken.transfer(_to, _amount));

    emit Withdrawn(msg.sender, _amount);
  }

  function refund(address _recipient, uint256 _amount) public onlyOwner {
    refunded = refunded.add(_amount);
    require(paymentToken.transfer(_recipient, _amount));
  }

  function funded() public view returns(uint256) {
    return paymentToken.balanceOf(address(this)).add(withdrawn);
  }
}
