pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './Ida.sol';
import './SimpleTokenSeller.sol';
import './ImpactPromiseFactory.sol';

/**
 * @title IdaFactory - a contract designed to orchestrate Ida creation
 * by automatically deploying and linking payment rights seller contract
 *
 */
contract IdaFactory {

  event IdaCreated(address indexed ida, address indexed sts);

  SimpleTokenSellerFactory simpleTokenSellerFactory;
  ImpactPromiseFactory impactPromiseFactory;


  constructor(SimpleTokenSellerFactory _simpleTokenSellerFactory, ImpactPromiseFactory _impactPromiseFactory) public {
    simpleTokenSellerFactory = _simpleTokenSellerFactory;
    impactPromiseFactory = _impactPromiseFactory;
  }


  function createIda(
      ERC20 _paymentToken,
      string memory _name,
      uint256 _outcomesNumber,
      uint256 _outcomesPrice,
      address _validator,
      uint256 _endTime
  ) public returns (Ida) {

    ImpactPromise promiseToken = impactPromiseFactory.createImpactPromise();
    Ida ida = new Ida(_paymentToken, promiseToken, _name, _outcomesNumber, _outcomesPrice, _validator, _endTime);
    promiseToken.addMinter(address(ida));
    SimpleTokenSeller sts = simpleTokenSellerFactory.createSimpleTokenSeller(ida.paymentToken(), ida.paymentRights(), msg.sender);
    ERC20 paymentRights = ida.paymentRights();
    paymentRights.transfer(address(sts), paymentRights.balanceOf(address(this)));

    emit IdaCreated(address(ida), address(sts));
    return ida;
  }

}
