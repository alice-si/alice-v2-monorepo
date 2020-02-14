pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './PaymentRights.sol';

/**
 * @title SimpleSeller - a contract designed to orchestrate IDA creation
 * by automatically deploying and linking payment rights seller contract
 *
 */
contract SimpleTokenSeller is Ownable {
  using SafeMath for uint256;

  event MarketAdded(address indexed operator, PaymentRights offeredToken, ERC20 indexed paymentToken);
  event TokensSold(address indexed operator, PaymentRights indexed offeredToken, ERC20 indexed paymentToken, uint256 amountSold, uint256 discount);
  event ConditionsUpdated(address indexed operator, PaymentRights indexed offeredToken, uint256 amountAvailable, uint256 discount);

  uint256 public constant FULL_PERCENTAGE = 100;

  struct Market {
    ERC20 paymentToken;
    PaymentRights offeredToken;
    uint256 supply;
    uint256 discount;
  }

  mapping (address => Market) public markets;

  function addMarket(address _operator, PaymentRights _offeredToken, ERC20 _paymentToken) public onlyOwner {
    markets[_operator] = Market(_paymentToken, _offeredToken, 0, 0);
    emit MarketAdded(_operator, _offeredToken, _paymentToken);
  }

  function updateConditions(uint256 supply, uint256 discount) public {
    Market storage market = markets[msg.sender];
    require(address(market.paymentToken) != address(0), "There is no market defined for a given operator");

    require(market.supply <= market.offeredToken.balanceOf(msg.sender).add(market.supply),
      "Cannot set supply greater than the amount of tokens available");
    require(market.discount < FULL_PERCENTAGE, "Discount must be less than 100%");

    //Unlock unsold tokens
    if (market.supply > 0) {
      market.offeredToken.transfer(msg.sender, market.supply);
    }

    market.supply = supply;
    market.discount = discount;

    //Lock offered tokens under this contract
    market.offeredToken.transferFrom(msg.sender, address(this), supply);

    emit ConditionsUpdated(msg.sender, market.offeredToken, market.supply, market.discount);
  }

  function buy(address operator, uint256 amount) public {
    Market storage market = markets[operator];
    require(address(market.paymentToken) != address(0), "There is no market defined for a given Ida");

    require(amount > 0);
    require(amount <= market.supply);

    uint256 price = getEffectivePrice(operator, amount);
    market.supply = market.supply.sub(amount);

    market.offeredToken.transfer(msg.sender, amount);
    market.paymentToken.transferFrom(msg.sender, operator, price);

    emit TokensSold(msg.sender, market.offeredToken, market.paymentToken, amount, market.discount);
    emit ConditionsUpdated(msg.sender, market.offeredToken, market.supply, market.discount);
  }

  function getEffectivePrice(address operator, uint256 amount) public view returns(uint256) {
    Market storage market = markets[operator];
    require(address(market.paymentToken) != address(0), "There is no market defined for a given Ida");

    uint256 unRedeemed = market.offeredToken.balanceOf(address(this)).sub(market.offeredToken.getRedeemed(address(this)));
    uint256 unRedeemedAmount = unRedeemed.mul(amount).div(market.offeredToken.balanceOf(address(this)));

    return FULL_PERCENTAGE.sub(market.discount).mul(unRedeemedAmount).div(FULL_PERCENTAGE);
  }

}

contract SimpleTokenSellerFactory {

  function createSimpleTokenSeller() public returns (SimpleTokenSeller) {
    return new SimpleTokenSeller();
  }

}
