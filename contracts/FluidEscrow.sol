pragma solidity ^0.5.2;

import './Escrow.sol';
import './FluidToken.sol';

/**
 * @title Fluid Escrow
 * @dev Contract dedicated to hole funds until impact is validated.
 *
 */
contract FluidEscrow is Escrow {

    FluidToken public creditToken;

    constructor(ERC20 _paymentToken, uint256 _capacity, address _operator) public
        Escrow(_paymentToken, _capacity, _operator, address(new FluidToken(_capacity))) {
        creditToken = FluidToken(recipient);
        creditToken.transfer(msg.sender, _capacity);
    }

}
