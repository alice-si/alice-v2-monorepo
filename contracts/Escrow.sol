pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Escrow
 * @dev Contract dedicated to hole funds until impact is validated.
 *
 */
contract Escrow is Ownable {
    using SafeMath for uint256;

    event Validated(uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);

    ERC20 public paymentToken;
    uint256 public capacity;
    uint256 public validated;
    address public validator;


    constructor(ERC20 _paymentToken, uint256 _capacity, address _validator) public {
        paymentToken = _paymentToken;
        capacity = _capacity;
        validator = _validator;
    }


    /**
     * @dev Withdraw part of the escrow reserved for receiver
     * @param _amount The amount of funds intended to be taken out
     */
    function withdraw(uint256 _amount) public {
        //TODO: Validate amount

        require(paymentToken.transfer(msg.sender, _amount));

        emit Withdrawn(msg.sender, _amount);
    }
}
