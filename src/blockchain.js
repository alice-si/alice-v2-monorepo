/* eslint-disable */
import state from "@/state";
import contract from 'truffle-contract'
import GBP_JSON from '@contracts/AliceUSD.json'
import IDA_JSON from '@contracts/IdaMock.json'
import IP_JSON from '@contracts/ImpactPromise.json'
import FT_JSON from '@contracts/FluidToken.json'
import ESCROW_JSON from '@contracts/Escrow.json'

import {default as Web3} from 'web3'

const WEB3_PROVIDER = 'http://ganache.demo.alice.si:80';

const ganacheProvider = new Web3.providers.HttpProvider(WEB3_PROVIDER);
const web3 = new Web3(ganacheProvider);

var setup = function(json) {
  let c = contract(json);
  c.setProvider(ganacheProvider);
  return c;
};

const GBP = setup(GBP_JSON)
const Ida = setup(IDA_JSON)
const ImpactPromise = setup(IP_JSON)
const FluidToken = setup(FT_JSON)
const Escrow = setup(ESCROW_JSON)


Ida.setProvider(ganacheProvider);

var main, investor, funder, validator;

state.accounts.main = {address: null, balance: 0, ic: 0, ip: 0, available: 0};
state.accounts.funder = {address: null, balance: 0, ic: 0, ip: 0};
state.accounts.ifu = {address: null, balance: 0, ic: 0, ip: 0};
state.accounts.investor = {address: null, balance: 0, ic: 0, ip: 0, available: 0};
state.accounts.escrow = {address: null, balance: 0, unlocked: 0, ic: 0, ip: 0};
state.accounts.validator = {address: null};

var init = function(accounts) {

  main = accounts[0];
  investor = accounts[1];
  funder = accounts[2];
  validator = accounts[3];

  state.accounts.main.address = main;
  state.accounts.funder.address = funder;
  state.accounts.investor.address = investor;
};

var gbp, ida, impactPromises, paymentRights, escrow;

const Blockchain = {

  deploy: async () => {
    let accounts = await web3.eth.getAccounts();
    init(accounts);
    gbp = await GBP.new({from: main, gas: 5000000});
    await this.a.updateBalances()
  },
  deployIF: async(number, price) => {
    console.log("Deploying Ida for: " + number + " of outcomes with price: " + price);
    ida = await Ida.new(gbp.address, number, price, validator, 1, {from: main, gas: 6700000});
    impactPromises = await ImpactPromise.at(await ida.impactPromise());
    paymentRights = await FluidToken.at(await ida.paymentRights());
    escrow = await Escrow.at(await ida.escrow());
    state.accounts.escrow.address = escrow.address;
    state.accounts.ifu.address = ida.address;
    console.log("ESCROW: " + escrow.address);

    state.logs.list.push({
      message: 'Deployed Ida contract to address: ' + ida.address,
      icon: 'all_inclusive',
      code: 'Ida.new(' + gbp.address + ', 10, 100, ' + validator + ', ' + main  +')',
      tx: ida.transactionHash,
      gas: 2077540
    });

    await this.a.updateBalances()
    await this.a.updateImpact()
  },
  test: () => {
    console.log('Test')
    state.balance.investor = 15

  },
  fund: async(amount) => {
    console.log("Funding: " + amount + " from: " + funder);
    await gbp.approve(ida.address, amount, {from: funder});
    let tx = await ida.fund(amount, {from: funder, gas: 5000000});

    state.logs.list.push({
      message: 'IDA funded with $' + amount + ' donation',
      icon: 'people_outline',
      code: 'ida.fund(' + amount +')',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
    await this.a.updateImpact()
  },
  refund: async(amount) => {
    console.log("Refunding...");
    let tx = await ida.refund({from: funder, gas: 5000000});

    state.logs.list.push({
      message: 'IDA refunded',
      icon: 'people_outline',
      code: 'ida.refund()',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  deposit: async (account, label) => {
    let tx = await gbp.mint(account.address, 100, {from: main});
    console.log(tx);
    state.logs.list.push({
      message: 'Deposited $100 to the ' + label + ' account',
      icon: 'add_circle_outline',
      code: 'stableToken.mint(' + account.address + ', 100)',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });
    await this.a.updateBalances()
  },
  invest: async (amount, discount) => {
    console.log("Investing: " + amount);
    let invested = amount * (1-discount/100);
    await gbp.transfer(main, invested, {from: investor});
    let tx = await paymentRights.transfer(investor, amount, {from: main});

    state.logs.list.push({
      message: 'Invested $' + invested + ' to buy ' + amount + ' of payment rights',
      icon: 'input',
      code: 'paymentRights.transfer(' + investor + ', ' + amount + ')',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  redeem: async (account) => {
    console.log("Redeeming from: " + account);
    let available = await paymentRights.getAvailableToRedeem({from: account});
    console.log("Available: " + available);
    let tx = await paymentRights.redeem(available, {from: account, gas: 1000000});

    state.logs.list.push({
      message: 'Redeemed ' + available + ' payment rights.',
      icon: 'attach_money',
      code: 'paymentRights.redeem(' + available + ')',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  validate: async () => {
    console.log("Validating...");
    let tx = await ida.validatePromise({from: validator});

    state.logs.list.push({
      message: 'Validated outcome',
      icon: 'check_circle_outline',
      code: 'ida.validatePromise()',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
    await this.a.updateImpact()
  },
  finalize: async () => {
    console.log("Finalizing...");
    let tx = await ida.setEnd({from: main});

    state.logs.list.push({
      message: 'Finalizing IDA',
      icon: 'cancel_presentation',
      code: 'ida.setEnd()',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateImpact();
  },
  updateBalances: async () => {
    console.log('Updating balances...');
    for(const account of Object.values(state.accounts)) {
      if (account.address) {
        console.log("Checking balance for: " + account.address);
        account.balance = (await gbp.balanceOf(account.address)).toString();
        if (impactPromises && paymentRights) {
          account.ip = (await impactPromises.balanceOf(account.address)).toString();
          account.ic = (await paymentRights.balanceOf(account.address)).toString();
        }
      }
    };

    if (state.accounts.escrow.address) {
      state.accounts.escrow.unlocked = (await escrow.unlocked()).toString();
      console.log("Unlocked: " + state.accounts.escrow.unlocked);
      state.accounts.investor.available = (await paymentRights.getAvailableToRedeem({from: investor})).toString();
      state.accounts.main.available = (await paymentRights.getAvailableToRedeem({from: main})).toString();
    }

  },

  updateImpact: async () => {
    if (ida) {
      state.impact.price = (await ida.promisePrice()).toString();
      state.impact.all = (await ida.promiseNumber()).toString();
      state.impact.validated = (await ida.validatedNumber()).toString();
      console.log("Validated: " + state.impact.validated);
      let promises = (await impactPromises.totalSupply()).toString();
      state.impact.remaining = state.impact.all - promises / state.impact.price;
      state.impact.ended = (await ida.hasEnded());
    }
  }
}

export default Blockchain
