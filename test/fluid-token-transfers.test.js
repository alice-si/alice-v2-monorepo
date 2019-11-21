var FluidEscrow = artifacts.require("FluidEscrow");
var FluidToken = artifacts.require("FluidToken");
var GBP = artifacts.require("AliceUSD");

require("./test-setup");

contract('Full tokens transfer', function ([owner, operator, sender, recipient]) {
  var escrow;
  var gbp;
  var fluidToken;

  before("deploy and fund fluid escrow and token contracts", async function () {
    gbp = await GBP.new();
    escrow = await FluidEscrow.new(gbp.address, 1000, operator);
    fluidToken = await FluidToken.at(await escrow.paymentRights());
    gbp.mint(escrow.address, 1000);

    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('1000');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('1000');
  });


  it("should distribute paymentRights", async function () {
    await fluidToken.transfer(sender, 100, {from: owner});

    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('900');
    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('100');
  });


  it("should unlock", async function () {
    await escrow.unlock(100, {from: operator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('90');
    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('10');
  });


  it("should transfer fluid tokens", async function () {
    await fluidToken.transfer(recipient, 100, {from: sender});

    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('0');
    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('100');

    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('0');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('10');
  });


  it("should redeem the funds after transfer", async function () {
    await fluidToken.redeem(10, {from: recipient});

    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(recipient)).should.be.bignumber.equal('10');
  });

});

contract('Part tokens transfer', function ([owner, operator, sender, recipient]) {
  var escrow;
  var gbp;
  var fluidToken;

  before("deploy and fund fluid escrow and token contracts", async function () {
    gbp = await GBP.new();
    escrow = await FluidEscrow.new(gbp.address, 1000, operator);
    fluidToken = await FluidToken.at(await escrow.paymentRights());
    gbp.mint(escrow.address, 1000);

    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('1000');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('1000');
  });


  it("should distribute paymentRights", async function () {
    await fluidToken.transfer(sender, 100, {from: owner});

    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('900');
    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('100');
  });


  it("should unlock", async function () {
    await escrow.unlock(100, {from: operator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('90');
    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('10');
  });


  it("should transfer fluid tokens", async function () {
    await fluidToken.transfer(recipient, 20, {from: sender});

    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('80');
    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('20');

    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('8');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('2');
  });


  it("sender should redeem the funds after transfer", async function () {
    await fluidToken.redeem(8, {from: sender});

    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('80');
    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(sender)).should.be.bignumber.equal('8');
  });


  it("recipient should redeem the funds after transfer", async function () {
    await fluidToken.redeem(2, {from: recipient});

    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('20');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(recipient)).should.be.bignumber.equal('2');
  });

});

contract('Mixed token transfer', function ([owner, operator, sender, recipient, unauthorised]) {
  var escrow;
  var gbp;
  var fluidToken;

  before("deploy and fund fluid escrow and token contracts", async function () {
    gbp = await GBP.new();
    escrow = await FluidEscrow.new(gbp.address, 1000, operator);
    fluidToken = await FluidToken.at(await escrow.paymentRights());
    gbp.mint(escrow.address, 1000);

    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('1000');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('1000');
  });


  it("should distribute paymentRights", async function () {
    await fluidToken.transfer(sender, 100, {from: owner});
    await fluidToken.transfer(recipient, 100, {from: owner});

    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('800');
    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('100');
    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('100');
  });


  it("should unlock", async function () {
    await escrow.unlock(100, {from: operator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('80');
    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('10');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('10');
  });


  it("sender should redeem half of the funds before transfer", async function () {
    await fluidToken.redeem(5, {from: sender});

    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('5');
    (await gbp.balanceOf(sender)).should.be.bignumber.equal('5');
  });


  it("should transfer fluid tokens", async function () {
    await fluidToken.transfer(recipient, 100, {from: sender});

    (await fluidToken.balanceOf(sender)).should.be.bignumber.equal('0');
    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('200');

    (await fluidToken.getAvailableToRedeem({from: sender})).should.be.bignumber.equal('0');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('15');
  });


  it("recipient should redeem the funds after transfer", async function () {
    await fluidToken.redeem(15, {from: recipient});

    (await fluidToken.balanceOf(recipient)).should.be.bignumber.equal('200');
    (await fluidToken.getAvailableToRedeem({from: recipient})).should.be.bignumber.equal('0');
    (await gbp.balanceOf(recipient)).should.be.bignumber.equal('15');
  });

});



