pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';

/**
 * @title RefundableEscrow
 * @dev An extension to the Escrow contract that allows the owner to withdraw
 * the funds that haven't been yet unlocked.
 *
 */
contract RefundableEscrow is Escrow {
  using SafeMath for uint256;

  event Refunded(address recipient, uint amount);

  uint256 public refunded;

  constructor(ERC20 _paymentToken, uint256 _capacity, address _operator, address _recipient) public
    Escrow(_paymentToken, _capacity, _operator, _recipient) { }

  function refund(address _recipient, uint256 _amount) public onlyOperator {
    uint256 committed = unlocked.sub(withdrawn);
    uint256 available = paymentToken.balanceOf(address(this)).sub(committed);
    require(_amount <= available, "Cannot refund more than is available");

    refunded = refunded.add(_amount);
    require(paymentToken.transfer(_recipient, _amount));

    emit Refunded(_recipient, _amount);
  }

  function funded() public view returns(uint256) {
    return paymentToken.balanceOf(address(this)).add(withdrawn).add(refunded);
  }
}
