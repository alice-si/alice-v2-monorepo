/* eslint-disable */
const {promisify} = require("es6-promisify");

import state from "@/state";
import contract from 'truffle-contract'
import AUSD_JSON from '@contracts/AliceUSD.json'
import IDA_JSON from '@contracts/IdaMock.json'
import IP_JSON from '@contracts/ImpactPromise.json'
import FT_JSON from '@contracts/FluidToken.json'
import ESCROW_JSON from '@contracts/Escrow.json'

let ethereum = window.ethereum;
let web3 = window.web3;

const AUSD_ADDRESS = "0xe10212440bf8e8d2bc753Cda7FD82C2bd6c2DF44";


var connectWeb3 = async function() {
  if (typeof ethereum !== 'undefined') {
    await ethereum.enable();
    web3 = new Web3(ethereum);
  } else if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER));
  }
};


var setup = function(json) {
  let c = contract(json);
  c.setProvider(web3.currentProvider);
  return c;
};

const AUSD = setup(AUSD_JSON)
const IDA = setup(IDA_JSON)
const ImpactPromise = setup(IP_JSON)
const FluidToken = setup(FT_JSON)
const Escrow = setup(ESCROW_JSON)


var main, ausd;

var initAccounts = function(accounts) {
  //main = accounts[0];
  //console.log("Main: " + main);
};

var gbp, ida, impactPromises, paymentRights, escrow;

const Contracts = {


  deployAUSD: async() => {
    let ausd = await AUSD.new({from: main, gas: 2000000});
    console.log(ausd.address);
  },


  deployIda: async(newIda) => {
    console.log(newIda);
    console.log("Deploying IDA for: " + newIda.outcomesNumber + " of outcomes with price: " + newIda.outcomesPrice);
    ida = await IDA.new(
      newIda.paymentToken,
      newIda.outcomesNumber,
      newIda.outcomesPrice,
      newIda.validator,
      newIda.endTime.getTime()/1000,
      {from: main, gas: 6500000}
    );
    // impactPromises = await ImpactPromise.at(await ida.impactPromise());
    // paymentRights = await FluidToken.at(await ida.paymentRights());
    // escrow = await Escrow.at(await ida.escrow());
    // state.accounts.escrow.address = escrow.address;
    // state.accounts.ifu.address = ida.address;
    // console.log("ESCROW: " + escrow.address);
    //
    // state.logs.list.push({
    //   message: 'Deployed IDA contract to address: ' + ida.address,
    //   icon: 'all_inclusive',
    //   code: 'IDA.new(' + gbp.address + ', 10, 100, ' + validator + ', ' + main  +')',
    //   tx: ida.transactionHash,
    //   gas: 2077540
    // });
    //
    // await this.a.updateBalances()
    // await this.a.updateImpact()
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
    let tx = await ida.validateOutcome({from: validator});

    state.logs.list.push({
      message: 'Validated outcome',
      icon: 'check_circle_outline',
      code: 'ida.validateOutcome()',
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
    // if (state.accounts.ifu.escrow) {
    //   state.accounts.ifu.escrow.balance =   (await gbp.balanceOf(state.accounts.ifu.escrow.address)).valueOf();
    //   console.log("Escrow: " + state.accounts.ifu.escrow.balance);
    // }
  },

  updateImpact: async () => {
    if (ida) {
      state.impact.price = (await ida.outcomePrice()).toString();
      state.impact.all = (await ida.outcomesNumber()).toString();
      state.impact.validated = (await ida.validatedNumber()).toString();
      console.log("Validated: " + state.impact.validated);
      let promises = (await impactPromises.totalSupply()).toString();
      state.impact.remaining = state.impact.all - promises / state.impact.price;
      state.impact.ended = (await ida.hasEnded());
    }
  },

  init: async () => {
    await connectWeb3();
    let getAccounts = promisify(web3.eth.getAccounts);
    let accounts = await getAccounts();
    if (accounts.length > 0) {
      main = accounts[0];
      console.log("Connected to metamask: " + main);
    }
    let ausd = await AUSD.at(AUSD_ADDRESS);
    if (state.paymentTokens.length == 0) {
      state.paymentTokens.push({
        name: "Alice USD",
        address: ausd.address
      });
    }
    console.log("Linked AUSD token: " + ausd.address);
    web3.eth.getBlock(5440737, function(e,r) {
      console.log(r);
    });

  }
};

export default Contracts
