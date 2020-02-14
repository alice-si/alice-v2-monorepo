pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Ida.sol';
import './SimpleTokenSeller.sol';
import './ImpactPromiseFactory.sol';
import './FluidEscrowFactory.sol';

/**
 * @title IdaFactory - a contract designed to orchestrate Ida creation
 * by automatically deploying and linking payment rights seller contract
 *
 */
contract IdaFactory {
  using SafeMath for uint256;

  event IdaCreated(address indexed ida);

  SimpleTokenSellerFactory simpleTokenSellerFactory;
  ImpactPromiseFactory impactPromiseFactory;
  FluidEscrowFactory fluidEscrowFactory;
  ClaimsRegistry public claimsRegistry;


  constructor(SimpleTokenSellerFactory _simpleTokenSellerFactory, ImpactPromiseFactory _impactPromiseFactory, FluidEscrowFactory _fluidEscrowFactory, ClaimsRegistry _claimsRegistry) public {
    simpleTokenSellerFactory = _simpleTokenSellerFactory;
    impactPromiseFactory = _impactPromiseFactory;
    fluidEscrowFactory = _fluidEscrowFactory;
    claimsRegistry = _claimsRegistry;
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
    Escrow escrow = fluidEscrowFactory.createFluidEscrow(_paymentToken, _outcomesPrice.mul(_outcomesNumber), msg.sender);
    Ida ida = new Ida(_paymentToken, promiseToken, escrow, claimsRegistry, _name, _outcomesNumber, _outcomesPrice, _validator, _endTime, msg.sender);
    escrow.transferOwnership(address(ida));
    promiseToken.addMinter(address(ida));
    //SimpleTokenSeller sts = simpleTokenSellerFactory.createSimpleTokenSeller(ida.paymentToken(), ida.paymentRights(), msg.sender);

    emit IdaCreated(address(ida));
    return ida;
  }

}
