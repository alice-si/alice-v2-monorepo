pragma solidity ^0.5.2;

import './Ida.sol';

/**
 * @title Impact Delivery Agreement Mock
 * @dev Allows testing the end refunds
 *
 */
contract IdaMock is Ida {

  bool mockEnded;

  constructor(
    ERC20 _paymentToken,
    ImpactPromise _impactPromise,
    Escrow _escrow,
    ClaimsRegistry _claimsRegistry,
    string memory _name,
    uint256 _outcomesNumber,
    uint256 _outcomesPrice,
    address _validator,
    uint256 _endTime,
    address _serviceProvider
  ) public
  Ida(_paymentToken, _impactPromise, _escrow, _claimsRegistry, _name, _outcomesNumber, _outcomesPrice, _validator, _endTime, _serviceProvider) {
  }

  function setEnd() public {
    mockEnded = true;
  }


  function hasEnded() public view returns(bool) {
    return mockEnded;
  }

}
