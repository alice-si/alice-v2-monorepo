/*
This is a new token type that gives the holder right to funds that may not yet be available.
It is based and compatible with the ERC20 token standard but has a double bottom line:
funds that are available for a holder and funds that have been already redeemed.
Both balances are automatically update when tokens are transferred making it fully tradable.
*/

pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/math/Math.sol';
import './Escrow.sol';

contract FluidToken is ERC20 {
    using SafeMath for uint256;


    /**
    * @dev Emitted when tokens are redeemed for funds locked in the escrow
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
     * Can transfer non-zero amounts only.
     * After the transfer we update both the token balance and the amount redeemed.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        uint256 redeemedProRata = amount.mul(_redeemed[sender]).div(balanceOf(sender));

        _redeemed[sender] = _redeemed[sender].sub(redeemedProRata);
        _redeemed[recipient] = _redeemed[recipient].add(redeemedProRata);

        super._transfer(sender, recipient, amount);
    }

    function redeem(uint256 _amount) public {
        uint256 available = getAvailableToRedeem();
        require(_amount <= available, "Cannot redeem more tokens than available");

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
