pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Ida.sol';
import './FluidToken.sol';

/**
 * @title SimpleSeller - a contract designed to orchestrate Ida creation
 * by automatically deploying and linking payment rights seller contract
 *
 */
contract SimpleTokenSeller is Ownable {
  using SafeMath for uint256;

  event TokensSold(ERC20 indexed soldToken, ERC20 indexed paymentToken, uint256 amountSold, uint256 discount);
  event ConditionsChanged(ERC20 indexed paymentRightsToken, uint256 amountAvailable, uint256 discount);

  uint256 public constant FULL_PERCENTAGE = 100;

  ERC20 public paymentToken;
  FluidToken public offeredToken;
  uint256 public currentSupply;
  uint256 public currentDiscount;

  constructor(ERC20 _paymentToken, FluidToken _offeredToken, address owner) public {
    paymentToken = _paymentToken;
    offeredToken = _offeredToken;
    _transferOwnership(owner);
  }

  function updateConditions(uint256 supply, uint256 discount) public onlyOwner {
    require(supply <= offeredToken.balanceOf(address(owner())), "Cannot set supply greater than the amount of tokens available");
    require(discount < 100, "Discount must be less than 100%");

    //Unlock unsold tokens
    if (currentSupply > 0) {
      offeredToken.transfer(owner(), currentSupply);
    }

    currentSupply = supply;
    currentDiscount = discount;

    //Lock offered tokens under this contract
    offeredToken.transferFrom(owner(), address(this), supply);

    emit ConditionsChanged(offeredToken, currentSupply, discount);
  }

  function buy(uint256 amount) public {
    require(amount > 0);
    require(amount <= currentSupply);

    uint256 price = getEffectivePrice(amount);
    currentSupply = currentSupply.sub(amount);

    offeredToken.transfer(msg.sender, amount);
    paymentToken.transferFrom(msg.sender, owner(), price);

    emit TokensSold(offeredToken, paymentToken, amount, currentDiscount);
    emit ConditionsChanged(offeredToken, currentSupply, currentDiscount);
  }

  function getEffectivePrice(uint256 amount) public view returns(uint256) {
    uint256 unRedeemed = offeredToken.balanceOf(address(this)).sub(offeredToken.getRedeemed(address(this)));
    uint256 unRedeemedAmount = unRedeemed.mul(amount).div(offeredToken.balanceOf(address(this)));

    return FULL_PERCENTAGE.sub(currentDiscount).mul(unRedeemedAmount).div(100);
  }

}

contract SimpleTokenSellerFactory {

  function createSimpleTokenSeller(ERC20 _paymentToken, FluidToken _offeredToken, address owner) public returns (SimpleTokenSeller) {
    return new SimpleTokenSeller(_paymentToken, _offeredToken, owner);
  }

}
