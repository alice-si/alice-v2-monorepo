pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './Ida.sol';
import './SimpleTokenSeller.sol';
import './ImpactPromiseFactory.sol';

/**
 * @title IdaFactory - a contract designed to orchestrate the creation of IDAs
 * by automatically deploying and linking payment rights seller contract
 *
 */
contract IdaFactory {

  event IdaCreated(address indexed ida, address indexed sts);

  SimpleTokenSellerFactory simpleTokenSellerFactory;
  ImpactPromiseFactory impactPromiseFactory;
  ClaimsRegistry public claimsRegistry;


  constructor(SimpleTokenSellerFactory _simpleTokenSellerFactory, ImpactPromiseFactory _impactPromiseFactory, ClaimsRegistry _claimsRegistry) public {
    simpleTokenSellerFactory = _simpleTokenSellerFactory;
    impactPromiseFactory = _impactPromiseFactory;
    claimsRegistry = _claimsRegistry;
  }


  function createIda(
      ERC20 _paymentToken,
      string memory _name,
      uint256 _promiseNumber,
      uint256 _promisePrice,
      address _validator,
      uint256 _endTime
  ) public returns (Ida) {

    ImpactPromise promiseToken = impactPromiseFactory.createImpactPromise();
    Ida ida = new Ida(_paymentToken, promiseToken, claimsRegistry, _name, _promiseNumber, _promisePrice, _validator, _endTime, msg.sender);
    promiseToken.addMinter(address(ida));
    SimpleTokenSeller sts = simpleTokenSellerFactory.createSimpleTokenSeller(ida.paymentToken(), ida.paymentRights(), msg.sender);

    emit IdaCreated(address(ida), address(sts));
    return ida;
  }

}
