pragma solidity ^0.5.2;

import './Ida.sol';

/**
 * @title Impact Delivery Agreement Mock
 * @dev Allows testing the end refunds
 *
 */
contract IdaMock is Ida {

  bool mockEnded;

  constructor(ERC20 _paymentToken, uint256 _outcomesNumber, uint256 _outcomesPrice, address _validator, address _manager, uint256 _end) public
    Ida(_paymentToken, _outcomesNumber, _outcomesPrice, _validator, _manager, _end) {
  }

  function setEnd() public {
    mockEnded = true;
  }


  function hasEnded() public view returns(bool) {
    return mockEnded;
  }

}
