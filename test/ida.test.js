var Escrow = artifacts.require("Escrow");
var Ida = artifacts.require("IdaMock");
var ImpactPromise = artifacts.require("ImpactPromise");
var FluidToken = artifacts.require("FluidToken");
var GBP = artifacts.require("DigitalGBPToken");

require("./test-setup");
const { time } = require('openzeppelin-test-helpers');

contract('Impact Delivery Agreement', function ([owner, validator, funder, investor, unauthorised]) {
  var escrow;
  var gbp;
  var ida;
  var paymentRights;
  var impactPromise;

  before("deploy escrow and token contracts", async function () {
    gbp = await GBP.new();
    let end = await time.latest() + time.duration.years(1);
    ida = await Ida.new(gbp.address, "TEST", 10, 100, validator, end);

    paymentRights = await FluidToken.at(await ida.paymentRights());
    (await paymentRights.balanceOf(owner)).should.be.bignumber.equal('1000');
    (await paymentRights.totalSupply()).should.be.bignumber.equal('1000');

    impactPromise = await ImpactPromise.at(await ida.impactPromise());
    (await impactPromise.balanceOf(owner)).should.be.bignumber.equal('0');
    (await impactPromise.totalSupply()).should.be.bignumber.equal('0');

    escrow = await Escrow.at(await ida.escrow());
    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('0');
  });

  it("should get impact payment rights", async function () {
    await paymentRights.transfer(investor, 100);
    (await paymentRights.balanceOf(investor)).should.be.bignumber.equal('100');
  });

  it("should fund", async function () {
    await gbp.mint(funder, 200);
    await gbp.approve(ida.address, 200, {from: funder});
    await ida.fund(200, {from: funder});

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('200');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('200');
  });


  it("should validate", async function () {
    await ida.validateOutcome({from: validator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await paymentRights.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('10');
  });


  it("should withdraw from escrow", async function () {
    await paymentRights.redeem(10, {from: investor});

    (await gbp.balanceOf(investor)).should.be.bignumber.equal('10');
    (await paymentRights.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('190');
  });

  it("should return remaining funds", async function () {
    await ida.setEnd();
    (await ida.hasEnded()).should.be.true;

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('200');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('190');

    await ida.refund({from: funder});

    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('90');
    (await gbp.balanceOf(funder)).should.be.bignumber.equal('100');
    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('0');
  });

});



