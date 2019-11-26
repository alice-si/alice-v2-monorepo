var Ida = artifacts.require("Ida");
var AUSD = artifacts.require("AliceUSD");
var ImpactPromise = artifacts.require("ImpactPromise");
var FluidToken = artifacts.require("FluidToken");
var Escrow = artifacts.require("Escrow");
var Sts = artifacts.require("SimpleTokenSeller");
var StsFactory = artifacts.require("SimpleTokenSellerFactory");
var ImpactPromiseFactory = artifacts.require("ImpactPromiseFactory");
var IdaFactory = artifacts.require("IdaFactory");
var ClaimsRegistry = artifacts.require("ClaimsRegistry");


require("./test-setup");
const { time } = require('openzeppelin-test-helpers');

contract('Ida Factory', function ([owner, validator, investor, unauthorised]) {
  var escrow;
  var gbp;
  var ida;
  var paymentRights;
  var impactPromise;

  var factory, sts, claimsRegistry;
  var end;

  before("deploy Ida factory & gbp", async function () {
    end = await time.latest() + time.duration.years(1);
    gbp = await AUSD.new();
    let impactPromiseFactory = await ImpactPromiseFactory.new();
    let stsFactory = await StsFactory.new();
    claimsRegistry = await ClaimsRegistry.new();
    factory = await IdaFactory.new(stsFactory.address, impactPromiseFactory.address, claimsRegistry.address, {gas: 6000000});
  });

  it("should create a new Ida", async function () {

    let tx = await factory.createIda(gbp.address, "TEST", 10, 100, validator, end, {gas: 6500000});
    console.log("Gas used: " + tx.receipt.gasUsed);
    let idaAddress = tx.receipt.logs[0].args.ida;
    let stsAddress = tx.receipt.logs[0].args.sts;
    ida = await Ida.at(idaAddress);
    sts = await Sts.at(stsAddress);

    paymentRights = await FluidToken.at(await ida.paymentRights());
    (await paymentRights.balanceOf(sts.address)).should.be.bignumber.equal('1000');
    (await paymentRights.totalSupply()).should.be.bignumber.equal('1000');

    let impactPromiseAddress = await ida.impactPromise();
    console.log("Impact promise token: " + impactPromiseAddress);
    impactPromise = await ImpactPromise.at(impactPromiseAddress);
    (await impactPromise.balanceOf(owner)).should.be.bignumber.equal('0');
    (await impactPromise.totalSupply()).should.be.bignumber.equal('0');

    escrow = await Escrow.at(await ida.escrow());
    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('0');
  });


  it("should not allow buying before price is set up", async function () {
    await gbp.mint(investor, 100);
    await sts.buy(100, {from: investor}).shouldBeReverted();
  });


  it("should not allow updating conditions by other than owner", async function () {
    await sts.updateConditions(100, 50, {from: investor}).shouldBeReverted();
  });


  it("should allow updating conditions by owner", async function () {
    await sts.updateConditions(100, 50, {from: owner});

    (await sts.currentSupply()).should.be.bignumber.equal('100');
    (await sts.currentDiscount()).should.be.bignumber.equal('50');
  });


  it("should buy tokens by investor", async function () {
    await gbp.approve(sts.address, 100, {from:investor});

    await sts.buy(50, {from: investor});

    (await gbp.balanceOf(owner)).should.be.bignumber.equal('25');
    (await gbp.balanceOf(investor)).should.be.bignumber.equal('75');

    (await paymentRights.balanceOf(sts.address)).should.be.bignumber.equal('950');
    (await paymentRights.balanceOf(investor)).should.be.bignumber.equal('50');
  });

});



