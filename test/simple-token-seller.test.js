var AUSD = artifacts.require("AliceUSD");
var FluidToken = artifacts.require("FluidToken");
var FluidEscrow = artifacts.require("FluidEscrow");
var Sts = artifacts.require("SimpleTokenSeller");

require("./test-setup");

contract('Simple Token Seller', function ([owner, investor, unauthorised]) {
  var sts;
  var fbt;
  var usd;
  var escrow;

  before("deploy escrow and token contracts", async function () {
    usd = await AUSD.new();


    escrow = await FluidEscrow.new(usd.address, 1000, owner);
    fbt = await FluidToken.at(await escrow.paymentRights());
    sts = await Sts.new(usd.address, fbt.address, owner);

    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await fbt.balanceOf(owner)).should.be.bignumber.equal('1000');
  });


  it("should mint", async function () {
    await usd.mint(investor, 1000);
    (await usd.balanceOf(investor)).should.be.bignumber.equal('1000');

    await usd.mint(escrow.address, 1000);
    (await usd.balanceOf(escrow.address)).should.be.bignumber.equal('1000');
    (await escrow.funded()).should.be.bignumber.equal('1000');
  });


  it("should create first condition", async function () {
    fbt.approve(sts.address, 1000);
    sts.updateConditions(100, 20);
    (await sts.getEffectivePrice(100)).should.be.bignumber.equal('80');

    (await fbt.balanceOf(sts.address)).should.be.bignumber.equal('100');
  });


  it("should buy distributed tokens", async function () {
    usd.approve(sts.address, 1000, {from: investor});
    sts.buy(100, {from: investor});

    (await usd.balanceOf(investor)).should.be.bignumber.equal('920');
    (await fbt.balanceOf(investor)).should.be.bignumber.equal('100');
    (await fbt.balanceOf(sts.address)).should.be.bignumber.equal('0');

  });


  it("should redeem some of the owner tokens from escrow", async function () {
    await escrow.unlock(500);
    (await fbt.getAvailableToRedeem()).should.be.bignumber.equal('450');

    await fbt.redeem(450);
    (await fbt.getRedeemed(owner)).should.be.bignumber.equal('450');

    (await usd.balanceOf(owner)).should.be.bignumber.equal('530');
  });


  it("should update condition", async function () {
    await sts.updateConditions(100, 20);
    (await fbt.getRedeemed(sts.address)).should.be.bignumber.equal('50');
    (await sts.getEffectivePrice(100)).should.be.bignumber.equal('40');

    (await fbt.balanceOf(sts.address)).should.be.bignumber.equal('100');
  });


  it("should buy for the second time", async function () {
    sts.buy(100, {from: investor});

    (await usd.balanceOf(investor)).should.be.bignumber.equal('880');
    (await fbt.balanceOf(investor)).should.be.bignumber.equal('200');
    (await fbt.balanceOf(sts.address)).should.be.bignumber.equal('0');
  });

});



