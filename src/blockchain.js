/* eslint-disable */
import state from "@/state";
import contract from 'truffle-contract'
import GBP_JSON from '@contracts/DigitalGBPToken.json'
import M_JSON from '@contracts/Migrations.json'
import IF_JSON from '@contracts/ImpactFutures.json'
import IP_JSON from '@contracts/ImpactPromise.json'
import FT_JSON from '@contracts/FluidToken.json'
import ESCROW_JSON from '@contracts/Escrow.json'

import {default as Web3} from 'web3'

const WEB3_PROVIDER = 'http://ganache.demo.alice.si:80';

const ganacheProvider = new Web3.providers.HttpProvider(WEB3_PROVIDER);
const web3 = new Web3(ganacheProvider);

console.log(window.web3);

var setup = function(json) {
  let c = contract(json);
  c.setProvider(ganacheProvider);
  return c;
}

const GBP = setup(GBP_JSON)
const M = setup(M_JSON)
const ImpactFutures = setup(IF_JSON)
const ImpactPromise = setup(IP_JSON)
const FluidToken = setup(FT_JSON)
const Escrow = setup(ESCROW_JSON)


ImpactFutures.setProvider(ganacheProvider)

const main = web3.eth.accounts[0]
const investor = web3.eth.accounts[1]
const funder = web3.eth.accounts[2]
const validator = web3.eth.accounts[3]

state.accounts.main = {address: main, balance: 0, ic: 0, ip: 0};
state.accounts.funder = {address: funder, balance: 0, ic: 0, ip: 0};
state.accounts.ifu = {address: null, balance: 0, ic: 0, ip: 0};
state.accounts.investor = {address: investor, balance: 0, ic: 0, ip: 0, available: 0};
state.accounts.escrow = {address: null, balance: 0, unlocked: 0, ic: 0, ip: 0};


var gbp, impactFutures, impactPromises, impactCredits, escrow;



const Blockchain = {

  deploy: async () => {
    gbp = await GBP.new({from: main, gas: 5000000});
    await this.a.updateBalances()
  },
  deployIF: async() => {
    console.log("Deploying Impact Futures...");
    impactFutures = await ImpactFutures.new(gbp.address, 10, 100, validator, main, {from: main, gas: 6000000});
    impactPromises = await ImpactPromise.at(await impactFutures.impactPromise());
    impactCredits = await FluidToken.at(await impactFutures.impactCredit());
    escrow = await Escrow.at(await impactFutures.escrow());
    state.accounts.escrow.address = escrow.address;
    state.accounts.ifu.address = impactFutures.address;
    console.log("ESCROW: " + escrow.address);

    state.logs.push({
      message: 'Deployed impact futures contract to address: ' + impactFutures.address,
      icon: 'all_inclusive',
      code: 'ImpactFutures.new(' + gbp.address + ', 10, 100, ' + validator + ', ' + main  +')',
      tx: impactFutures.transactionHash,
      gas: 2077540
    });

    await this.a.updateBalances()
  },
  test: () => {
    console.log('Test')
    state.balance.investor = 15

  },
  fund: async(amount) => {
    console.log("Funding: " + amount + " from: " + funder);
    await gbp.approve(impactFutures.address, amount, {from: funder});
    let tx = await impactFutures.fund(amount, {from: funder, gas: 5000000});

    state.logs.push({
      message: 'Impact Futures funded with ' + amount + ' GBP donation',
      icon: 'people_outline',
      code: 'impactFutures.fund(' + amount +')',
      tx: impactFutures.transactionHash,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  deposit: async (account, label) => {
    let tx = await gbp.mint(account.address, 100, {from: main});
    console.log(tx);
    state.logs.push({
      message: 'Deposited 100 GBP to the ' + label + ' account',
      icon: 'add_circle_outline',
      code: 'gbp.mint(' + account.address + ', 100)',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });
    await this.a.updateBalances()
  },
  invest: async (amount, discount) => {
    console.log("Investing: " + amount);
    let invested = amount * (1-discount/100);
    await gbp.transfer(main, invested, {from: investor});
    let tx = await impactCredits.transfer(investor, amount, {from: main});

    state.logs.push({
      message: 'Invested ' + invested + ' GBP to buy ' + amount + ' of impact credits',
      icon: 'input',
      code: 'impactCredits.transfer(' + investor + ', ' + amount + ')',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  redeem: async (amount) => {
    console.log("Redeeming: " + amount);
    let available = await impactCredits.getAvailableToRedeem({from: investor});
    console.log("Available: " + available);
    let tx = await impactCredits.redeem(amount, {from: investor, gas: 1000000});

    state.logs.push({
      message: 'Redeemed ' + amount + ' impact credits',
      icon: 'attach_money',
      code: 'impactCredits.redeem(' + amount + ')',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  validate: async () => {
    console.log("Validating...");
    let tx = await impactFutures.validateOutcome({from: validator});

    state.logs.push({
      message: 'Validated outcome',
      icon: 'check_circle_outline',
      code: 'impactFutures.validateOutcome()',
      tx: tx.tx,
      gas: tx.receipt.cumulativeGasUsed
    });

    await this.a.updateBalances()
  },
  updateBalances: async () => {
    console.log('Updating balances...');
    for(const account of Object.values(state.accounts)) {
      if (account.address) {
        console.log("Checking balance for: " + account.address);
        account.balance = (await gbp.balanceOf(account.address)).valueOf();
        if (impactPromises && impactCredits) {
          account.ip = (await impactPromises.balanceOf(account.address)).valueOf();
          account.ic = (await impactCredits.balanceOf(account.address)).valueOf();
        }
      }
    };
    if (state.accounts.escrow.address) {
      state.accounts.escrow.unlocked = (await escrow.unlocked()).valueOf();
      console.log("Unlocked: " + state.accounts.escrow.unlocked);
      state.accounts.investor.available = (await impactCredits.getAvailableToRedeem({from: investor})).valueOf();
    }
    // if (state.accounts.ifu.escrow) {
    //   state.accounts.ifu.escrow.balance =   (await gbp.balanceOf(state.accounts.ifu.escrow.address)).valueOf();
    //   console.log("Escrow: " + state.accounts.ifu.escrow.balance);
    // }
  }
}

export default Blockchain
