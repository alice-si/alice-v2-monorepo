pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Ida.sol';

/**
 * @title SimpleSeller - a contract designed to orchestrate Ida creation
 * by automatically deploying and linking payment rights seller contract
 *
 */
contract SimpleTokenSeller is Ownable {
  using SafeMath for uint256;

  event TokensSold(ERC20 indexed soldToken, ERC20 indexed paymentToken, uint256 amountSold, uint256 discount);

  ERC20 public paymentToken;
  ERC20 public offeredToken;
  uint256 public currentSupply;
  uint256 public currentDiscount;

  constructor(ERC20 _paymentToken, ERC20 _offeredToken, address owner) public {
    paymentToken = _paymentToken;
    offeredToken = _offeredToken;
    _transferOwnership(owner);
  }

  function updateConditions(uint256 supply, uint256 discount) public onlyOwner {
    require(supply <= offeredToken.balanceOf(address(this)), "Cannot set supply greater than the amount of tokens available");
    require(discount < 100, "Discount must be less than 100%");
    currentSupply = supply;
    currentDiscount = discount;
  }

  function buy(uint256 amount) public {
    require(amount <= currentSupply);
    uint256 price = 100;
    price = price.sub(currentDiscount).mul(amount).div(100);
    currentSupply = currentSupply.sub(amount);

    offeredToken.transfer(msg.sender, amount);
    paymentToken.transferFrom(msg.sender, owner(), price);

    emit TokensSold(offeredToken, paymentToken, amount, currentDiscount);
  }

}

contract SimpleTokenSellerFactory {

  function createSimpleTokenSeller(ERC20 _paymentToken, ERC20 _offeredToken, address owner) public returns (SimpleTokenSeller) {
    return new SimpleTokenSeller(_paymentToken, _offeredToken, owner);
  }

}
