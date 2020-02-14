pragma solidity ^0.5.2;

import './Escrow.sol';
import './FluidToken.sol';

/**
 * @title Fluid Escrow Factory
 * @dev A special type of an escrow account that is linked to the payment rights token which represents
 * the right to redeem funds hold by an escrow.
 *
 */
contract FluidEscrowFactory {

  event FluidTokenCreated(FluidToken token, Escrow escrow);

  function createFluidEscrow(ERC20 _paymentToken, uint256 _capacity, address creator) public returns(Escrow) {
    Escrow escrow = new Escrow(_paymentToken, _capacity);
    FluidToken fluidToken = new FluidToken(escrow, _capacity);
    escrow.setRecipient(address(fluidToken));
    fluidToken.transfer(creator, _capacity);
    escrow.transferOwnership(msg.sender);
    emit FluidTokenCreated(fluidToken, escrow);
    return escrow;
  }

}
