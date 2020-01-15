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
    ClaimsRegistry _claimsRegistry,
    string memory _name,
    uint256 _promiseNumber,
    uint256 _promisePrice,
    address _validator,
    uint256 _endTime,
    address _serviceProvider
  ) public
    Ida(_paymentToken, _impactPromise, _claimsRegistry, _name, _promiseNumber, _promisePrice, _validator, _endTime, _serviceProvider) {
  }

  function setEnd() public {
    mockEnded = true;
  }


  function hasEnded() public view returns(bool) {
    return mockEnded;
  }

}
