var Escrow = artifacts.require("Escrow");
var ImpactFutures = artifacts.require("ImpactFutures");
var ImpactPromise = artifacts.require("ImpactPromise");
var FluidToken = artifacts.require("FluidToken");
var GBP = artifacts.require("DigitalGBPToken");

require("./test-setup");

contract('Impact Futures', function ([owner, validator, funder, investor, unauthorised]) {
  var escrow;
  var gbp;
  var impactFutures;
  var impactCredit;
  var impactPromise;

  before("deploy escrow and token contracts", async function () {
    gbp = await GBP.new();
    impactFutures = await ImpactFutures.new(gbp.address, 10, 100, validator, owner);

    impactCredit = await FluidToken.at(await impactFutures.impactCredit());
    (await impactCredit.balanceOf(owner)).should.be.bignumber.equal('1000');
    (await impactCredit.totalSupply()).should.be.bignumber.equal('1000');

    impactPromise = await ImpactPromise.at(await impactFutures.impactPromise());
    (await impactPromise.balanceOf(owner)).should.be.bignumber.equal('0');
    (await impactPromise.totalSupply()).should.be.bignumber.equal('0');

    escrow = await Escrow.at(await impactFutures.escrow());
    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('0');
  });

  it("should get impact credits", async function () {
    await impactCredit.transfer(investor, 100);
    (await impactCredit.balanceOf(investor)).should.be.bignumber.equal('100');
  });

  it("should fund", async function () {
    await gbp.mint(funder, 100);
    await gbp.approve(impactFutures.address, 100, {from: funder});
    await impactFutures.fund(100, {from: funder});

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('100');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('100');
  });


  it("should validate", async function () {
    await impactFutures.validateOutcome({from: validator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await impactCredit.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('10');
  });


  it("should withdraw from escrow", async function () {
    await impactCredit.redeem(10, {from: investor});

    (await gbp.balanceOf(investor)).should.be.bignumber.equal('10');
    (await impactCredit.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('90');
  });

});



