/**
This token type manages the redemption rights to funds that may or may not be currently held in an escrow account. It ensures that token holders may only ever redeem a fair, pro-rata share of funds that are available in a partially filled escrow at any given time, even if they are nominally entitled to more.
Fluid tokens are based on and compatible with the ERC20 token standard but have a double balance:
funds that are available for a holder to redeem, and funds that have been redeemed already.
If tokens are transferred to someone who already owns fluid tokens, then the balances of each set of tokens are combined, making them easily tradable.
*/

pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/math/Math.sol';
import './Escrow.sol';

contract FluidToken is ERC20 {
    using SafeMath for uint256;


    /**
    * @dev Emitted when tokens are redeemed for funds locked in the escrow contract
    */
    event Redeemed(address indexed to, uint256 value);

    /**
    * @dev A pot holding funds that may be gradually filled and released to token holders.
    */
    Escrow public escrow;


    /**
    * @dev A core structure keeping an account of funds that have been already redeemed.
    */
    mapping (address => uint256) private _redeemed;


    constructor(uint256 _initialSupply) public {
        escrow = Escrow(msg.sender);
        _mint(msg.sender, _initialSupply);
    }

    /**
     * @dev Only allows transfers of non-zero amounts.
     * After the transfer, the token balance and amount redeemed are both updated.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        uint256 redeemedProRata = amount.mul(_redeemed[sender]).div(balanceOf(sender));

        _redeemed[sender] = _redeemed[sender].sub(redeemedProRata);
        _redeemed[recipient] = _redeemed[recipient].add(redeemedProRata);

        super._transfer(sender, recipient, amount);
    }

    function redeem(uint256 _amount) public {
        uint256 available = getAvailableToRedeem();
        require(_amount <= available, "Cannot redeem more than available");

        escrow.withdraw(msg.sender, _amount);
        _redeemed[msg.sender] = _redeemed[msg.sender].add(_amount);
        emit Redeemed(msg.sender, _amount);
    }

    function getRedeemed(address account) public view returns(uint256) {
      return _redeemed[account];
    }

    function getAvailableToRedeem() public view returns(uint256) {
        uint256 potential = Math.min(escrow.unlocked(), escrow.funded());
        uint256 available = potential.mul(balanceOf(msg.sender)).sub(escrow.capacity().mul(_redeemed[msg.sender]));
        available = available.div(escrow.capacity());
        return available;
    }

}
