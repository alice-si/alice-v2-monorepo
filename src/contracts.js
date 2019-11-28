/* eslint-disable */
const {promisify} = require("es6-promisify");

import state from "@/state";
import contract from 'truffle-contract'
import AUSD_JSON from '@contracts/AliceUSD.json'
import IDA_JSON from '@contracts/IdaMock.json'
import IP_JSON from '@contracts/ImpactPromise.json'
import FT_JSON from '@contracts/FluidToken.json'
import ESCROW_JSON from '@contracts/Escrow.json'
import IDA_FACTORY_JSON from '@contracts/IdaFactory.json'
import IP_FACTORY_JSON from '@contracts/ImpactPromiseFactory.json'
import STS_FACTORY_JSON from '@contracts/SimpleTokenSellerFactory.json'
import STS_JSON from '@contracts/SimpleTokenSeller.json'
import CLAIMS_REGISTRY_JSON from '@contracts/ClaimsRegistry.json'

let ethereum = window.ethereum;
let web3 = window.web3;

const START_BLOCK = 5481000;
const AUSD_ADDRESS = "0x22d64d4A9DD6e3531BE6A93a532084f3093B388f";
const IDA_FACTORY_ADDRESS = "0x567ef0f528A7576f02E9F4e0c7A46C2C42Aa4FD4";


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
const FLUID_TOKEN = setup(FT_JSON);
const Escrow = setup(ESCROW_JSON);
const IDA_FACTORY = setup(IDA_FACTORY_JSON);
const STS_FACTORY = setup(STS_FACTORY_JSON);
const IP_FACTORY = setup(IP_FACTORY_JSON);
const STS = setup(STS_JSON);
const CLAIMS_REGISTRY = setup(CLAIMS_REGISTRY_JSON);


var main, ausd, idaFactory, ida, impactPromise, paymentRights, sts, claimsRegistry, owner;

async function updateInvestments() {
  let investingAllowance = await ausd.allowance(main, sts.address);
  state.ida.investingUnlocked = investingAllowance > 0;
  console.log("Is investing unlocked: " + state.ida.investingUnlocked);

  state.balance.invested = web3.fromWei((await paymentRights.balanceOf(main)), 'ether');
  console.log("Invested by You: " + state.balance.invested);
  let left = web3.fromWei((await paymentRights.balanceOf(sts.address)), 'ether');
  state.balance.totalInvested = state.ida.budget - left;
  state.ida.maxInvestment = state.ida.budget - state.balance.totalInvested;
  console.log("Invested by others");
  state.balance.redeemable = web3.fromWei((await paymentRights.getAvailableToRedeem({from: main})), 'ether');
  console.log("Reedemable: " + state.balance.redeemable);

  state.investingChartData.You = state.balance.invested;
  state.investingChartData.Others = state.balance.totalInvested - state.balance.invested;
}

async function updateFunding() {
  console.log('Updating funding...');

  state.balance.funded = parseInt(web3.fromWei(await impactPromise.balanceOf(main), 'ether'));

  state.balance.totalFunded = parseInt(web3.fromWei(await impactPromise.totalSupply()), 'ether');
  state.ida.maxFunding = state.ida.budget - state.balance.totalFunded;

  state.fundingChartData.You = state.balance.funded;
  state.fundingChartData.Others = state.balance.totalFunded - state.balance.funded;
}

async function updateHoldings() {
  state.balance.tokens = parseInt(web3.fromWei(await ausd.balanceOf(main), 'ether'));
}

async function getAllClaims() {
  state.ida.claims = [];
  let idaTopic = '0x' + web3.padLeft(ida.address.substring(2).toLocaleLowerCase(), 64);
  let ownerTopic = '0x' + web3.padLeft(owner.substring(2).toLocaleLowerCase(), 64);
  console.log(idaTopic);
  let filter = web3.eth.filter({
    fromBlock: START_BLOCK,
    topics: [
      "0x8c9f893548e8429f9352aba6698e6f4dca2e390604f6e8c5881a7a505d94ae50", //setClaim
      ownerTopic,
      idaTopic
    ]
  });
  let filterValidated = web3.eth.filter({
    fromBlock: START_BLOCK,
    topics: [
      "0xcc1d5cc2da95ba3e4e62fd4fc753229e033b0a3c7700e8f6d084029ad74fe769", //approveClaim
      ownerTopic,
      idaTopic
    ]
  });

  filterValidated.get(async function (err, validatedEvents) {

    let validated = validatedEvents.reduce(function (map, obj) {
      map[web3.toAscii(obj.topics[3])] = true;
      return map;
    }, {});

    filter.get(async function (err, results) {
      console.log("Claims size: " + results.length);
      for (var i = 0; i < results.length; i++) {
        let code = web3.toAscii(results[i].topics[3]);
        state.ida.claims.push({
          code: code,
          isValidated: validated[code]
        })
      }
    })
  });
}



const Contracts = {

  deployAliceUSD: async() => {
    let ausd = await AUSD.new({from: main, gas: 5000000});
    console.log("Alice USD address: " + ausd.address);
  },

  deployIdaFactory: async() => {
    console.log("Deploying ida factory...");
    let stsFactory = await STS_FACTORY.new({from: main, gas: 6000000});
    console.log("STS deplyed: " + stsFactory.address);
    let impactPromiseFactory = await IP_FACTORY.new({from: main, gas: 6000000});
    console.log("IP factory deplyed: " + impactPromiseFactory.address);
    let claimsRegistry = await CLAIMS_REGISTRY.new({from: main, gas: 6000000});
    console.log("Claims registry deplyed: " + impactPromiseFactory.address);

    idaFactory = await IDA_FACTORY.new(stsFactory.address, impactPromiseFactory.address, claimsRegistry.address, {from: main, gas: 6000000});
    console.log("Ida factory address: " + idaFactory.address);
  },

  deployIda: async(newIda) => {
    console.log(newIda);
    console.log("Deploying IDA for: " + newIda.outcomesNumber + " of outcomes with price: " + newIda.outcomesPrice);

    let tx = await idaFactory.createIda(
      newIda.paymentToken,
      newIda.name,
      newIda.outcomesNumber,
      web3.toWei(newIda.outcomesPrice, 'ether'),
      newIda.validator,
      newIda.endTime.getTime()/1000,
      {from: main, gas: 6500000}
    );
    console.log(tx);
    let idaAddress = tx.logs[0].args.ida;
    console.log("New Ida deployed to: " + idaAddress);
    return idaAddress;
  },

  getDemoTokens: async () => {
    await ausd.publicMint({from: main});
    await this.a.updateBalances();
  },

  unlockFunding: async() => {
    let amount = await paymentRights.totalSupply();
    console.log("Unlocking funding: " + amount);
    await ausd.approve(ida.address, amount, {from: main});

    state.ida.fundingUnlocked = true;
  },

  unlockInvesting: async() => {
    let amount = await paymentRights.totalSupply();
    console.log("Unlocking investing: " + amount);
    await ausd.approve(sts.address, amount, {from: main});

    state.ida.investingUnlocked = true;
  },

  fund: async(amount) => {
    console.log("Funding: " + amount);
    let wei = web3.toWei(amount, 'ether');
    await ida.fund(wei, {from: main, gas: 1000000});

    await updateFunding();
    await updateHoldings();
  },

  updateConditions: async(distributeAmount, distributeDiscount) => {
    console.log("Distribute: " + distributeAmount + " with discount: " + distributeDiscount);
    await sts.updateConditions(web3.toWei(distributeAmount, 'ether'), distributeDiscount, {from: main, gas: 1000000});
    await this.a.updateIda();
  },

  invest: async (amount) => {
    console.log("Investing: " + amount);
    await sts.buy(web3.toWei(amount, 'ether'), {from: main, gas: 1000000});

    await updateInvestments();
    await updateHoldings();
  },

  submitClaim: async (claimKey) => {
    let key = web3.fromAscii(claimKey);
    let val = '0x'+web3.padLeft(web3.toHex(web3.toWei(state.ida.promisePrice, 'ether')).substring(2), 64);
    console.log("Submitting claim: " + claimKey + " key: " + key + " value: " + val);

    await claimsRegistry.setClaim(ida.address, key, val, {from: main, gas: 1000000});
    await getAllClaims();
  },

  validateClaim: async (claimKey) => {
    console.log("Validating claim: " + claimKey);
    let key = web3.fromAscii(claimKey);
    await ida.validateOutcome(key, {from: main, gas: 1000000});
    await getAllClaims();
  },

  redeem: async () => {
    let available = await paymentRights.getAvailableToRedeem({from: main});
    console.log("Redeeming: " + available);
    await paymentRights.redeem(available, {from: main, gas: 1000000});

    state.balance.redeemable = web3.fromWei((await paymentRights.getAvailableToRedeem({from: main})), 'ether');
    state.balance.tokens = parseInt(web3.fromWei(await ausd.balanceOf(main), 'ether'));
  },

  updateIda: async () => {
    if (ida) {
      let fundingAllowance = await ausd.allowance(main, ida.address);
      state.ida.fundingUnlocked = fundingAllowance > 0;
      console.log("Is funding unlocked: " + state.ida.fundingUnlocked);
    }
  },

  getAllIdas: async () => {
    console.log("Loading all idas...");
    state.allIdas = [];
    let filter = web3.eth.filter({
      fromBlock: START_BLOCK,
      topics: ["0x1480d181f6c9d1c5d69ff67235bd28f2d0de1345ad64d32803e8696b40d64549"]
    });

    filter.get(async function(err, results) {
      console.log(results[0]);
      window.d = results[0].data;
      for (var i = 0; i < results.length; i++) {
        state.allIdas.push({
          name: web3.toAscii('0x'+results[i].data.substring(194)),
          address: results[i].address,
          promisesNumber: web3.toDecimal(results[i].topics[2]),
          promisePrice: web3.fromWei((web3.toDecimal(results[i].data.substring(0,66))), 'ether')
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

    idaFactory = await IDA_FACTORY.at(IDA_FACTORY_ADDRESS);
    console.log("Linked Ida factory: " + idaFactory.address);

    if (idaAddress) {
      console.log("Fetching IDA: " + idaAddress);
      ida = await IDA.at(idaAddress);

      let paymentRightsAddress = await ida.paymentRights();
      console.log("Payment rights: " + paymentRightsAddress);
      paymentRights = await FLUID_TOKEN.at(paymentRightsAddress);

      let impactPromiseAddress = await ida.impactPromise();
      console.log("Impact promise address: " + impactPromiseAddress);
      impactPromise = await ImpactPromise.at(impactPromiseAddress);

      let claimsRegistryAddress = await ida.claimsRegistry();
      console.log("Claims Registry: " + claimsRegistryAddress);
      claimsRegistry = await CLAIMS_REGISTRY.at(claimsRegistryAddress);

      state.ida.name = (await ida.name());
      state.ida.promisesNumber = (await ida.outcomesNumber()).toString();
      state.ida.promisePrice = web3.fromWei((await ida.outcomePrice()), 'ether');
      state.ida.validator = await ida.validator();
      state.ida.endTime = new Date(await ida.endTime()*1000).toLocaleDateString("en-GB");
      state.ida.budget = state.ida.promisesNumber * state.ida.promisePrice;


      //Get sts
      let stsFilter = web3.eth.filter({
        fromBlock: START_BLOCK,
        topics: [
          "0x3aedc386eb06c3badc9815fdc61ff1ac848d8263144b24a174804ca1cd30e742",
          "0x000000000000000000000000" + ida.address.substring(2)
        ]
      });
      stsFilter.get(async function(err, results) {
        sts = await STS.at('0x'+results[0].topics[2].substring(26));
        console.log("STS linked: " + sts.address);
        owner = await sts.owner();
        console.log("Ida owner: " + owner);
        state.ida.isOwner = (main.toLocaleLowerCase() == owner.toLocaleLowerCase());
        state.ida.isValidator = (main.toLocaleLowerCase() == state.ida.validator.toLocaleLowerCase());
        state.ida.distributeAmount = web3.fromWei((await sts.currentSupply()), 'ether');
        state.ida.distributeDiscount = (await sts.currentDiscount()).toString();

        updateInvestments();

        await getAllClaims();
      });

      updateFunding();
      updateHoldings();
      await this.a.updateIda();

    }
  }
};


export default Contracts
