/*
Implements ERC20 Token Standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';

contract FluidToken is ERC20 {
    using SafeMath for uint256;

    /**
    * @dev Emitted when tokens are redeemed for funds locked in the escrow
    */
    event Redeemed(address indexed to, uint256 value);

    Escrow public escrow;

    mapping (address => uint256) private _redeemed;

    constructor(uint256 _initialSupply) public {
        escrow = Escrow(msg.sender);
        _mint(msg.sender, _initialSupply);

    }

    function redeem(uint256 _amount) public {
        uint256 available = getAvailableToRedeem();
        require(_amount <= available);

        escrow.withdraw(msg.sender, _amount);
        _redeemed[msg.sender] = _redeemed[msg.sender].add(_amount);
        emit Redeemed(msg.sender, _amount);
    }


    function getAvailableToRedeem() public view returns(uint256) {
        uint256 available = escrow.unlocked().mul(balanceOf(msg.sender)).sub(escrow.capacity().mul(_redeemed[msg.sender]));
        available = available.div(escrow.capacity());
        return available;
    }




}
