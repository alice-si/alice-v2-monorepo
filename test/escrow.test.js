var Escrow = artifacts.require("Escrow");
var GBP = artifacts.require("DigitalGBPToken");

require("./test-setup");

contract('Escrow', function ([owner, validator, receiver]) {
  var escrow;
  var gbp;

  before("deploy escrow and token contracts", async function () {
    gbp = await GBP.new();
    escrow = await Escrow.new(gbp.address, 1000, validator);
  });

  it("should deposit", async function () {
    gbp.mint(escrow.address, 1000);
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('1000');
  });

  it("should withdraw", async function () {
    await escrow.withdraw(100, {from: receiver});
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('900');
    (await gbp.balanceOf(receiver)).should.be.bignumber.equal('100');
  });

});



