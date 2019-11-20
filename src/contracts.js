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

const AUSD = setup(AUSD_JSON);
const IDA = setup(IDA_JSON);
const ImpactPromise = setup(IP_JSON);
const FluidToken = setup(FT_JSON);
const Escrow = setup(ESCROW_JSON);


var main, ausd, ida, impactPromise, paymentRights;

const Contracts = {


  deployAUSD: async() => {
    let ausd = await AUSD.new({from: main, gas: 2000000});
    console.log(ausd.address);
  },


  deployIda: async(newIda) => {
    console.log(newIda);
    console.log("Deploying IDA for: " + newIda.outcomesNumber + " of outcomes with price: " + newIda.outcomesPrice);
    let ida = await IDA.new(
      newIda.paymentToken,
      newIda.name,
      newIda.outcomesNumber,
      web3.toWei(newIda.outcomesPrice, 'ether'),
      newIda.validator,
      newIda.endTime.getTime()/1000,
      {from: main, gas: 6500000}
    );
    console.log("New Ida deployed to: " + ida.address);
    return ida.address;
  },

  getDemoTokens: async () => {
    await ausd.publicMint({from: main});
    await this.a.updateBalances();
  },

  unlockFunding: async() => {
    let amount = await ausd.balanceOf(main);
    console.log("Unlocking funding: " + amount);
    await ausd.approve(ida.address, amount, {from: main});

    state.ida.fundingUnlocked = true;
  },

  fund: async(amount) => {
    console.log("Funding: " + amount);
    let wei = web3.toWei(amount, 'ether');
    await ida.fund(wei, {from: main, gas: 5000000});

    await this.a.updateBalances();
    await this.a.updateIda();
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

    state.balance.tokens = parseInt(web3.fromWei(await ausd.balanceOf(main), 'ether'));
    state.balance.funded = parseInt(web3.fromWei(await impactPromise.balanceOf(main), 'ether'));

    console.log('Promises: ' + state.balance.funded);


    // for(const account of Object.values(state.accounts)) {
    //   if (account.address) {
    //     console.log("Checking balance for: " + account.address);
    //     account.balance = (await gbp.balanceOf(account.address)).toString();
    //     if (impactPromises && paymentRights) {
    //       account.ip = (await impactPromises.balanceOf(account.address)).toString();
    //       account.ic = (await paymentRights.balanceOf(account.address)).toString();
    //     }
    //   }
    // };
    // if (state.accounts.escrow.address) {
    //   state.accounts.escrow.unlocked = (await escrow.unlocked()).toString();
    //   console.log("Unlocked: " + state.accounts.escrow.unlocked);
    //   state.accounts.investor.available = (await paymentRights.getAvailableToRedeem({from: investor})).toString();
    //   state.accounts.main.available = (await paymentRights.getAvailableToRedeem({from: main})).toString();
    // }
    // if (state.accounts.ifu.escrow) {
    //   state.accounts.ifu.escrow.balance =   (await gbp.balanceOf(state.accounts.ifu.escrow.address)).valueOf();
    //   console.log("Escrow: " + state.accounts.ifu.escrow.balance);
    // }
  },

  updateIda: async () => {
    if (ida) {
      let allowance = await ausd.allowance(main, ida.address);
      state.ida.fundingUnlocked = allowance > 0;
      console.log("Is funding unlocked: " + state.ida.fundingUnlocked);
    }
  },

  getAllIdas: async () => {
    console.log("Loading all idas...");
    state.allIdas = [];
    let filter = web3.eth.filter({
      fromBlock: 5469483,
      //from: "0xbc773ca86d9071e163168a8a5ad25e235907f9e7",
      //address: "0x838aF3F202e482641F539ce237e7B8eC46b9e7D6"
      topics: ["0x1480d181f6c9d1c5d69ff67235bd28f2d0de1345ad64d32803e8696b40d64549"]
    });

    filter.get(async function(err, results) {
      for (var i = 0; i < results.length; i++) {
        let ida = await
        IDA.at(results[i].address);
        state.allIdas.push({
          name: await ida.name(),
          address: results[i].address,
          promisesNumber: (await ida.outcomesNumber()).toString(),
          promisePrice: web3.fromWei((await ida.outcomePrice()), 'ether')
        });
      }
    });
  },

  init: async (idaAddress) => {
    await connectWeb3();
    let getAccounts = promisify(web3.eth.getAccounts);
    let accounts = await getAccounts();
    if (accounts.length > 0) {
      main = accounts[0];
      console.log("Connected to metamask: " + main);
    }
    ausd = await AUSD.at(AUSD_ADDRESS);
    if (state.paymentTokens.length == 0) {
      state.paymentTokens.push({
        name: "Alice USD",
        address: ausd.address
      });
    }
    console.log("Linked AUSD token: " + ausd.address);

    if (idaAddress) {
      console.log("Fetching IDA: " + idaAddress);
      ida = await IDA.at(idaAddress);

      let paymentRightsAddress = await ida.paymentRights();
      console.log("Payment rights: " + paymentRightsAddress);

      let impactPromiseAddress = await ida.impactPromise();
      console.log("Impact promise: " + impactPromise);
      impactPromise = await ImpactPromise.at(impactPromiseAddress);

      state.ida.name = (await ida.name());
      state.ida.promisesNumber = (await ida.outcomesNumber()).toString();
      state.ida.promisePrice = web3.fromWei((await ida.outcomePrice()), 'ether');
      state.ida.validator = await ida.validator();
      state.ida.endTime = new Date(await ida.endTime()*1000).toLocaleDateString("en-GB");

      await this.a.updateBalances();
      await this.a.updateIda();
    }


  }
};

export default Contracts
