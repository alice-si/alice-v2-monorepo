pragma solidity ^0.5.2;

import './Escrow.sol';
import './FluidToken.sol';

/**
 * @title Fluid Escrow
 * @dev A special type of an escrow account that is linked to the payment rights token which represents
 * the right to redeem funds hold by an escrow.
 *
 */
contract FluidEscrow is Escrow {

    FluidToken public paymentRights;

   /**
   * @dev The constructor automatically creates a dedicated payment rights token,
   * mints the amount equal to the escrow capacity and sends the tokens to the contract creator.
   *
   */
    constructor(ERC20 _paymentToken, uint256 _capacity, address _operator) public
        Escrow(_paymentToken, _capacity, _operator, address(new FluidToken(_capacity))) {
        paymentRights = FluidToken(recipient);
        paymentRights.transfer(_operator, _capacity);
    }


    function createFluidEscrow(ERC20 _paymentToken, uint256 _capacity, address _operator) public {

    }

}
