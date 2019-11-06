require('mocha-steps');
require('chai/register-should');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const BN = web3.utils.BN;

chai.use(require('chai-bn')(BN));
chai.use(chaiAsPromised);

chai.use(
  (chai, utils) => {
    utils.addMethod(chai.Assertion.prototype, 'zeroAddress', function() {
      const obj = this._obj;
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
      this.assert(obj === ZERO_ADDRESS);
    })
  }
);

Promise.prototype.shouldBeReverted = async function (reason) {
  let networkId = await web3.eth.net.getId();
  if (networkId == 31337) {//Buidler EVM
    await this.should.be.rejectedWith(reason);
  } else {
    await this.should.be.rejectedWith('VM Exception while processing transaction: revert');
  }

};


