var Escrow = artifacts.require("Escrow");
var ImpactPromise = artifacts.require("ImpactPromise");
var FluidToken = artifacts.require("FluidToken");
var GBP = artifacts.require("AliceUSD");
var Ida = artifacts.require("Ida");
var StsFactory = artifacts.require("SimpleTokenSellerFactory");
var ImpactPromiseFactory = artifacts.require("ImpactPromiseFactory");
var IdaFactory = artifacts.require("IdaFactory");
var ClaimsRegistry = artifacts.require("ClaimsRegistry");
var Sts = artifacts.require("SimpleTokenSeller");

require("./test-setup");
const { time } = require('openzeppelin-test-helpers');

contract('Impact Delivery Agreement', function ([owner, validator, funder, investor, unauthorised]) {
  var escrow;
  var gbp;
  var ida, sts;
  var paymentRights;
  var impactPromise;
  var claimsRegistry;

  before("deploy escrow and token contracts", async function () {
    gbp = await GBP.new();
    let end = await time.latest() + time.duration.years(1);

    let impactPromiseFactory = await ImpactPromiseFactory.new();
    let stsFactory = await StsFactory.new();
    claimsRegistry = await ClaimsRegistry.new();
    let factory = await IdaFactory.new(stsFactory.address, impactPromiseFactory.address, claimsRegistry.address, {gas: 6500000});

    let tx = await factory.createIda(gbp.address, "TEST", 10, 100, validator, end);
    let idaAddress = tx.receipt.logs[0].args.ida;
    ida = await Ida.at(idaAddress);

    let stsAddress = tx.receipt.logs[0].args.sts;
    sts = await Sts.at(stsAddress);

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
    await paymentRights.approve(sts.address, 100, {from: owner});
    await sts.updateConditions(100, 50);

    await gbp.mint(investor, 100);
    await gbp.approve(sts.address, 100, {from: investor});

    (await gbp.balanceOf(owner)).should.be.bignumber.equal('0');
    (await gbp.balanceOf(investor)).should.be.bignumber.equal('100');
    (await paymentRights.balanceOf(investor)).should.be.bignumber.equal('0');

    await sts.buy(100, {from: investor});

    (await gbp.balanceOf(owner)).should.be.bignumber.equal('50');
    (await gbp.balanceOf(investor)).should.be.bignumber.equal('50');
    (await paymentRights.balanceOf(investor)).should.be.bignumber.equal('100');
  });

  it("should fund", async function () {
    await gbp.mint(funder, 200);
    await gbp.approve(ida.address, 200, {from: funder});
    await ida.fund(200, {from: funder});

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('200');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('200');
  });

  it("should not validate before registering a claim", async function () {
    await ida.validateOutcome(web3.utils.fromAscii("TEST"), {from: validator}).shouldBeReverted();;
  });


  it("should validate", async function () {
    let key = web3.utils.fromAscii("TEST");
    await claimsRegistry.setClaim(ida.address, key, web3.utils.padLeft(web3.utils.numberToHex(100), 64));
    await ida.validateOutcome(web3.utils.fromAscii("TEST"), {from: validator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await paymentRights.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('10');
  });


  it("should withdraw from escrow", async function () {
    await paymentRights.redeem(10, {from: investor});

    (await gbp.balanceOf(investor)).should.be.bignumber.equal('60');
    (await paymentRights.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('190');
  });

  // it("should return remaining funds", async function () {
  //   await ida.setEnd();
  //   (await ida.hasEnded()).should.be.true;
  //
  //   (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('200');
  //   (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('190');
  //
  //   await ida.refund({from: funder});
  //
  //   (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('90');
  //   (await gbp.balanceOf(funder)).should.be.bignumber.equal('100');
  //   (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('0');
  // });

});



