var Escrow = artifacts.require("Escrow");
var FluidEscrowFactory = artifacts.require("FluidEscrowFactory");
var ImpactPromise = artifacts.require("ImpactPromise");
var FluidToken = artifacts.require("FluidToken");
var AUSD = artifacts.require("AliceUSD");
var Ida = artifacts.require("Ida");
var StsFactory = artifacts.require("SimpleTokenSellerFactory");
var ImpactPromiseFactory = artifacts.require("ImpactPromiseFactory");
var IdaFactory = artifacts.require("IdaFactory");
var ClaimsRegistry = artifacts.require("ClaimsRegistry");
var Sts = artifacts.require("SimpleTokenSeller");

require("./test-setup");
const { time } = require('openzeppelin-test-helpers');

contract('Impact Delivery Agreement', function ([owner, validator, funder, investor, unauthorised]) {
  var escrow, factory;
  var ausd;
  var ida, sts;
  var paymentRights;
  var impactPromise;
  var claimsRegistry;

  before("deploy escrow and token contracts", async function () {
    ausd = await AUSD.new();
    let impactPromiseFactory = await ImpactPromiseFactory.new();
    let stsFactory = await StsFactory.new();
    let escrowFactory = await FluidEscrowFactory.new();
    claimsRegistry = await ClaimsRegistry.new();
    factory = await IdaFactory.new(stsFactory.address, impactPromiseFactory.address, escrowFactory.address, claimsRegistry.address, {gas: 6500000});
    sts = await Sts.at(await factory.simpleTokenSeller());
  });


  it("should create a new Ida", async function () {
    let end = (await time.latest()).add(time.duration.years(1));
    let tx = await factory.createIda(ausd.address, "TEST", 10, 100, validator, end, {gas: 7000000});
    console.log("Gas used for Ida deployment: " + tx.receipt.gasUsed);

    let idaAddress = tx.receipt.logs[0].args.ida;
    ida = await Ida.at(idaAddress);

    paymentRights = await FluidToken.at(await ida.paymentRights());
    (await paymentRights.balanceOf(owner)).should.be.bignumber.equal('1000');
    (await paymentRights.totalSupply()).should.be.bignumber.equal('1000');

    let impactPromiseAddress = await ida.impactPromise();
    impactPromise = await ImpactPromise.at(impactPromiseAddress);
    (await impactPromise.balanceOf(owner)).should.be.bignumber.equal('0');
    (await impactPromise.totalSupply()).should.be.bignumber.equal('0');

    escrow = await Escrow.at(await ida.escrow());
    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('0');
  });


  it("should get impact payment rights", async function () {
    await paymentRights.approve(sts.address, 100, {from: owner});
    await sts.updateConditions(100, 50);
    (await paymentRights.balanceOf(sts.address)).should.be.bignumber.equal('100');

    await ausd.mint(investor, 100);
    await ausd.approve(sts.address, 100, {from: investor});

    (await ausd.balanceOf(owner)).should.be.bignumber.equal('0');
    (await ausd.balanceOf(investor)).should.be.bignumber.equal('100');
    (await paymentRights.balanceOf(investor)).should.be.bignumber.equal('0');

    await sts.buy(owner, 100, {from: investor});

    (await ausd.balanceOf(owner)).should.be.bignumber.equal('50');
    (await ausd.balanceOf(investor)).should.be.bignumber.equal('50');
    (await paymentRights.balanceOf(investor)).should.be.bignumber.equal('100');
  });


  it("should fund", async function () {
    await ausd.mint(funder, 200);
    await ausd.approve(ida.address, 200, {from: funder});
    await ida.fund(200, {from: funder});

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('200');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('200');
  });


  it("should not validate before registering a claim", async function () {
    let key = web3.utils.fromAscii("TEST");
    await claimsRegistry.setClaim(ida.address, key, web3.utils.padLeft(web3.utils.numberToHex(100), 64));
    // A report can't be validated without registration, but registration itself requires a claim to be set, so just remove the claim after registration to peform this check.
    await ida.registerReport(web3.utils.fromAscii("TEST"), {from: validator});
    await claimsRegistry.removeClaim(ida.address, key);
    await ida.validatePromise(web3.utils.fromAscii("TEST"), {from: validator}).shouldBeReverted("A claim must be registered before validation");
  });


  it("should validate", async function () {
    let key = web3.utils.fromAscii("TEST");
    await claimsRegistry.setClaim(ida.address, key, web3.utils.padLeft(web3.utils.numberToHex(100), 64));
    await ida.validatePromise(web3.utils.fromAscii("TEST"), {from: validator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await paymentRights.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('10');
  });


  it("should withdraw from escrow by investor", async function () {
    await paymentRights.redeem(10, {from: investor});

    (await ausd.balanceOf(investor)).should.be.bignumber.equal('60');
    (await paymentRights.getAvailableToRedeem({from: investor})).should.be.bignumber.equal('0');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('190');
  });


  it("should withdraw part of funds from escrow by ida creator", async function () {
    await paymentRights.redeem(50, {from: owner});

    (await ausd.balanceOf(owner)).should.be.bignumber.equal('100');
    (await paymentRights.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('40');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('140');
  });


  it("should not refund the money before the project ends", async function () {
    (await ida.hasEnded()).should.be.false;
    await ida.refund({from: funder}).shouldBeReverted("Refund is only available after the project has ended");
  });


  it("should return remaining funds", async function () {
    await time.increase(time.duration.years(1));
    (await ida.hasEnded()).should.be.true;

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('200');
    (await ausd.balanceOf(funder)).should.be.bignumber.equal('0');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('140');

    (await ida.getAvailableToRefund({from: funder})).should.be.bignumber.equal('100');

    await ida.refund({from: funder});

    (await ida.getAvailableToRefund({from: funder})).should.be.bignumber.equal('0');

    (await impactPromise.balanceOf(funder)).should.be.bignumber.equal('0');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('40');
    (await ausd.balanceOf(funder)).should.be.bignumber.equal('100');

  });


  it("should not allow validating promises after project is ended", async function () {
    let key = web3.utils.fromAscii("TEST2");
    await claimsRegistry.setClaim(ida.address, key, web3.utils.padLeft(web3.utils.numberToHex(100), 64));
    await ida.validatePromise(web3.utils.fromAscii("TEST2"), {from: validator}).shouldBeReverted("Cannot validate after project end");
  });


  it("should withdraw rest of funds from escrow by ida creator", async function () {
    await paymentRights.redeem(40, {from: owner});

    (await ausd.balanceOf(owner)).should.be.bignumber.equal('140');
    (await paymentRights.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('0');
    (await ausd.balanceOf(escrow.address)).should.be.bignumber.equal('0');
  });

});



