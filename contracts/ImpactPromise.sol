/*
Implements ERC20 Token Standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';

contract ImpactPromise is ERC20Mintable {

    string public name = "Impact Promise";
    uint8 public decimals = 18;
    string public symbol = "IP";
    string public version = '1.0';


}
