pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './ImpactPromise.sol';

/**
 * @title ImpactPromiseFactory - a helper contract orchestrating the creation
 * of dedicated ImpactPromise tokens for each new IDA
 */
contract ImpactPromiseFactory {

  function createImpactPromise() public returns (ImpactPromise) {
    ImpactPromise ip = new ImpactPromise();
    ip.addMinter(msg.sender);
    return ip;
  }

}
