var Escrow = artifacts.require("Escrow");
var GBP = artifacts.require("DigitalGBPToken");

require("./test-setup");

contract('Escrow', function ([owner, operator, receiver, unauthorised]) {
  var escrow;
  var gbp;

  before("deploy escrow and token contracts", async function () {
    gbp = await GBP.new();
    escrow = await Escrow.new(gbp.address, 1000, operator, receiver);
  });

  it("should deposit", async function () {
    await gbp.mint(escrow.address, 1000);
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('1000');
  });

  it("should not withdraw until unlocked", async function () {
    await escrow.withdraw(receiver, 100, {from: receiver}).shouldBeReverted("VM Exception while processing transaction: revert Cannot withdraw more funds than has been unlocked");
  });

  it("should not unlock from unauthorised until unlocked", async function () {
    await escrow.unlock(100, {from: unauthorised}).shouldBeReverted();
  });

  it("should unlock", async function () {
    await escrow.unlock(100, {from: operator});
    (await escrow.unlocked()).should.be.bignumber.equal('100');
  });

  it("should not withdraw from unauthorised", async function () {
    await escrow.withdraw(receiver, 100, {from: unauthorised}).shouldBeReverted();
  });

  it("should withdraw", async function () {
    await escrow.withdraw(receiver, 100, {from: receiver});

    (await escrow.withdrawn()).should.be.bignumber.equal('100');

    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('900');
    (await gbp.balanceOf(receiver)).should.be.bignumber.equal('100');
  });

});



