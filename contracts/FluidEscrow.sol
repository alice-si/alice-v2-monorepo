pragma solidity ^0.5.2;

import './Escrow.sol';
import './PaymentRights.sol';

/**
 * @title Fluid Escrow
 * @dev A special type of escrow account that is linked to the payment rights token which represents
 * the right to redeem only a pro-rata portion of funds held in an escrow contract.
 *
 */
contract FluidEscrow is Escrow {

    PaymentRights public paymentRights;

   /**
   * @dev The constructor automatically creates a dedicated payment rights token,
   * mints an amount that is equal to the escrow capacity and sends the tokens to the contract creator.
   *
   */
    constructor(ERC20 _paymentToken, uint256 _capacity, address _operator) public
        Escrow(_paymentToken, _capacity, _operator, address(new PaymentRights(_capacity))) {
        paymentRights = PaymentRights(recipient);
        paymentRights.transfer(msg.sender, _capacity);
    }

}
