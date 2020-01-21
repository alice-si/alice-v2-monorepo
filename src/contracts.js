/* eslint-disable */
const {promisify} = require("es6-promisify");
const detectNetwork = require('web3-detect-network')
const BN = require('bn.js');

import { EventBus } from './event-bus.js';
import state from "@/state";
import contract from 'truffle-contract'
import AUSD_JSON from '@contracts/AliceUSD.json'
import IDA_JSON from '@contracts/Ida.json'
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

const START_BLOCK = 5833382;
const AUSD_ADDRESS = "0x5E2132F6e537CCbC270932242dcdB8F64efb544c";
const IDA_FACTORY_ADDRESS = "0x76F1Ddf37BbB16235f29f39E7e71AB0b89549AED";


var setup = function(json) {
  if (web3) {
    let c = contract(json);
    c.setProvider(web3.currentProvider);
    return c;
  }
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


var main, ausd, idaFactory, ida, impactPromise, paymentRights, sts, claimsRegistry, owner, box;
var getBlockNumber;

var connectWeb3 = async function() {
  if (typeof ethereum !== 'undefined') {
    await ethereum.enable();
    web3 = new Web3(ethereum);
  } else if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    throw 'NO_WEB3'
  }
  let network = await detectNetwork(web3.currentProvider);

  getBlockNumber = promisify(web3.eth.getBlockNumber);

  if (network.id != 4) {
    throw 'WRONG_NETWORK'
  }
};

var getBox = async function() {
  if (box === undefined && web3) {
    if (!Box.isLoggedIn(main)) {
      EventBus.$emit('3box-login');
    }
    box = await Box.openBox(main, web3.currentProvider);
    if (box) {
      state.isBoxLoaded = true;
    }
  }
  return box;
}




async function saveDetailsIn3Box(newIda) {
  let box = await getBox();
  const space = await box.openSpace(newIda.name);
  await space.public.set('project-description', newIda.projectDescription);
  await space.public.set('organisation-name', newIda.organisationName);
  await space.public.set('organisation-description', newIda.organisationDescription);
  await space.public.set('promise-description', newIda.promiseDescription);
  await space.public.set('validator-name', newIda.validatorName);
}

async function updateInvestments() {
  console.log("Updating investment...");

  let investingAllowance = await ausd.allowance(main, sts.address);
  state.ida.investingUnlocked = investingAllowance > 0;

  //Distribution
  let rawSupply = await sts.currentSupply();
  state.ida.distributeAmount = web3.fromWei(rawSupply, 'ether');
  state.ida.distributeDiscount = (await sts.currentDiscount()).toString();
  state.ida.distributePrice = web3.fromWei((await sts.getEffectivePrice(rawSupply)), 'ether');

  console.log("Loaded... Distribute: " + state.ida.distributeAmount + " with discount: " + state.ida.distributeDiscount);

  state.balance.invested = web3.fromWei((await paymentRights.balanceOf(main)), 'ether');
  console.log("Invested by you: " + state.balance.invested);
  let left = web3.fromWei((await paymentRights.balanceOf(owner)), 'ether');
  state.balance.totalInvested = state.ida.budget - left - state.ida.distributeAmount;
  state.ida.maxInvestment = state.ida.budget - state.balance.totalInvested;
  console.log("Invested by others");
  state.balance.redeemable = web3.fromWei((await paymentRights.getAvailableToRedeem({from: main})), 'ether');
  console.log("Redeemable: " + state.balance.redeemable);

  state.investingChartData.You = state.balance.invested;
  state.investingChartData.Others = state.balance.totalInvested - state.balance.invested;

  state.investingTotalChartData.Sold = state.balance.totalInvested;
  state.investingTotalChartData.Available = state.ida.distributeAmount;
  //state.investingTotalChartData.Remaining = state.ida.budget - state.ida.distributeAmount -state.balance.totalInvested;
  state.ida.unsold = state.ida.budget - state.balance.totalInvested;

  state.fluidBalanceChartData.Redeemed = web3.fromWei((await paymentRights.getRedeemed(main, {from: main})), 'ether').toLocaleString('en-GB', { maximumFractionDigits: 2 });
  state.fluidBalanceChartData.Redeemable = parseFloat(state.balance.redeemable).toLocaleString('en-GB', { maximumFractionDigits: 2 });
  state.fluidBalanceChartData['Still locked'] = (state.balance.invested - state.balance.redeemable - state.fluidBalanceChartData.Redeemed).toLocaleString('en-GB', { maximumFractionDigits: 2 });

}

async function updateFunding() {
  console.log('Updating funding...');

  state.balance.funded = parseInt(web3.fromWei(await impactPromise.balanceOf(main), 'ether'));

  state.balance.totalFunded = parseInt(web3.fromWei(await impactPromise.totalSupply()), 'ether');
  state.ida.maxFunding = state.ida.budget - state.balance.totalFunded;

  state.fundingChartData.You = state.balance.funded;
  state.fundingChartData.Others = state.balance.totalFunded - state.balance.funded;

  state.fundingTotalChartData.Funded = state.balance.totalFunded;
  state.fundingTotalChartData.Remaining = state.ida.budget - state.balance.totalFunded;
}

async function updateHoldings() {
  state.balance.tokens = parseInt(web3.fromWei(await ausd.balanceOf(main), 'ether'));
}

async function getAllClaims() {
  let idaTopic = '0x' + web3.padLeft(ida.address.substring(2).toLocaleLowerCase(), 64);
  let ownerTopic = '0x' + web3.padLeft(owner.substring(2).toLocaleLowerCase(), 64);
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

  let validatedTimesLookup = {};
  let validatedTxLookup = {};
  filterValidated.get(async function (err, validatedEvents) {
    let validated = validatedEvents.reduce(function (map, obj) {
      let code = web3.toAscii(obj.topics[3]);
      map[code] = true;
      validatedTimesLookup[code] = new Date(parseInt(obj.data.slice(-8), 16)*1000).toLocaleDateString("en-GB");
      validatedTxLookup[code] = obj.transactionHash;
      return map;
    }, {});

    filter.get(async function (err, results) {
      state.ida.claims = [];
      console.log("Claims size: " + results.length);
      state.ida.pending = results.length;

      for (var i = 0; i < results.length; i++) {
        console.log(results[i]);
        let submittedAt = new Date(parseInt(results[i].data.slice(-8), 16)*1000).toLocaleDateString("en-GB");
        let code = web3.toAscii(results[i].topics[3]);
        state.ida.pending -= validated[code] ? 1 : 0;

        state.ida.claims.push({
          code: code,
          submittedAt: submittedAt,
          validatedAt: validatedTimesLookup[code],
          validationTx: validatedTxLookup[code],
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
    console.log("Deploying IDA factory...");
    let stsFactory = await STS_FACTORY.new({from: main, gas: 8000000});
    console.log("STS deployed: " + stsFactory.address);
    let impactPromiseFactory = await IP_FACTORY.new({from: main, gas: 8000000});
    console.log("IP factory deployed: " + impactPromiseFactory.address);
    let claimsRegistry = await CLAIMS_REGISTRY.new({from: main, gas: 8000000});
    console.log("Claims registry deployed: " + impactPromiseFactory.address);

    idaFactory = await IDA_FACTORY.new(stsFactory.address, impactPromiseFactory.address, claimsRegistry.address, {from: main, gas: 8000000});
    console.log("IDA factory address: " + idaFactory.address);
  },

  deployIda: async(newIda) => {
    console.log(newIda);
    console.log("Deploying IDA for: " + newIda.promiseNumber + " of promises with price: " + newIda.promisePrice);

    await saveDetailsIn3Box(newIda);

    let tx = await idaFactory.createIda(
      newIda.paymentToken,
      newIda.name,
      newIda.promiseNumber,
      web3.toWei(newIda.promisePrice, 'ether'),
      newIda.validator,
      newIda.endTime.getTime()/1000,
      {from: main, gas: 7000000}
    );
    console.log(tx);
    let idaAddress = tx.logs[0].args.ida;
    console.log("New IDA deployed to: " + idaAddress);
    return idaAddress;
  },

  getDemoTokens: async () => {
    await ausd.publicMint({from: main});
    updateHoldings();
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

  unlockDistribution: async() => {
    console.log("Unlocking max amount");
    let amount = (new BN("2").pow(new BN("255")));
    await paymentRights.approve(sts.address, amount, {from: main});

    state.ida.distributionUnlocked = true;
  },

  fund: async(amount) => {
    console.log("Funding: " + amount);
    let wei = web3.toWei(amount, 'ether');
    await ida.fund(wei, {from: main, gas: 1000000});

    setTimeout(updateFunding, 2000);
    setTimeout(updateHoldings, 2000);
  },

  updateConditions: async(distributeAmount, distributeDiscount) => {
    console.log("Distribute: " + distributeAmount + " with discount: " + distributeDiscount);
    await sts.updateConditions(web3.toWei(distributeAmount, 'ether'), distributeDiscount, {from: main, gas: 1000000});

    setTimeout(updateInvestments, 1000);
  },

  invest: async (amount) => {
    console.log("Investing: " + amount);
    await sts.buy(web3.toWei(amount, 'ether'), {from: main, gas: 1000000});

    setTimeout(updateInvestments, 2000);
    setTimeout(updateHoldings, 2000);
  },

  submitClaim: async (claimKey) => {
    let key = web3.fromAscii(claimKey);
    let val = '0x'+web3.padLeft(web3.toHex(web3.toWei(state.ida.promisePrice, 'ether')).substring(2), 64);
    console.log("Submitting claim: " + claimKey + " key: " + key + " value: " + val);

    await claimsRegistry.setClaim(ida.address, key, val, {from: main, gas: 1000000});
    setTimeout(getAllClaims, 2000);
  },

  validateClaim: async (claimKey) => {
    console.log("Validating claim: " + claimKey);
    let key = web3.fromAscii(claimKey);
    await ida.validatePromise(key, {from: main, gas: 1000000});
    state.ida.validatedNumber = (await ida.validatedNumber()).toString();
    setTimeout(getAllClaims, 2000);
  },

  redeem: async () => {
    let available = await paymentRights.getAvailableToRedeem({from: main});
    console.log("Redeeming: " + available);
    await paymentRights.redeem(available, {from: main, gas: 1000000});

    state.balance.redeemable = web3.fromWei((await paymentRights.getAvailableToRedeem({from: main})), 'ether');
    updateHoldings();
    updateInvestments();
  },

  updateIda: async () => {
    if (ida) {
      let fundingAllowance = await ausd.allowance(main, ida.address);
      state.ida.fundingUnlocked = fundingAllowance > 0;
      console.log("IDA funding unlocked: " + state.ida.fundingUnlocked);
    }
  },

  getAllIdas: async () => {
    console.log("Loading all IDAs...");
    state.allIdas = [];
    let filter = web3.eth.filter({
      fromBlock: START_BLOCK,
      topics: ["0x1480d181f6c9d1c5d69ff67235bd28f2d0de1345ad64d32803e8696b40d64549"]
    });

    filter.get(async function(err, results) {
      for (var i = 0; i < results.length; i++) {

        let serviceProvider = '0x' + results[i].topics[1].substring(26);
        let address = results[i].address;
        let promisesNumber = web3.toDecimal(results[i].topics[2]);
        let rawName = web3.toAscii('0x'+results[i].data.substring(194));
        let promisePrice = web3.fromWei((web3.toDecimal(results[i].data.substring(0,66))), 'ether');



        let name = '';
        for(var j=0; j<rawName.length; j++) {
          if (rawName.charCodeAt(j) != 0) {
            name += rawName.charAt(j);
          }
        }

        let description = await Box.getSpace(serviceProvider, name);

        state.allIdas.push({
          name: name,
          creator: description['organisation-name'],
          promise: description['promise-description'],
          address: address,
          promisesNumber: promisesNumber,
          promisePrice: promisePrice
        });
      }
    });
  },

  setupNetwork: async function () {
    await connectWeb3();
  },

  init: async (idaAddress, isCreator) => {
    console.log("INIT ida: " + idaAddress + " creator: " + isCreator);
    let getAccounts = promisify(web3.eth.getAccounts);
    let accounts = await getAccounts();
    if (accounts.length > 0) {
      main = accounts[0];
      console.log("Connected to metamask: " + main);
    }
    ausd = await AUSD.at(AUSD_ADDRESS);
    if (state.paymentTokens.length == 0) {
      state.paymentTokens.push({
        name: "Test tokens",
        address: ausd.address
      });
    }
    console.log("Linked AUSD token: " + ausd.address);

    idaFactory = await IDA_FACTORY.at(IDA_FACTORY_ADDRESS);
    console.log("Linked IDA factory: " + idaFactory.address);

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
      state.ida.address = idaAddress;
      state.ida.promisesNumber = (await ida.promiseNumber()).toString();
      state.ida.validatedNumber = (await ida.validatedNumber()).toString();
      state.ida.promisePrice = web3.fromWei((await ida.promisePrice()), 'ether');
      state.ida.validator = await ida.validator();
      state.ida.endTime = new Date(await ida.endTime()*1000).toLocaleDateString("en-GB");
      state.ida.budget = state.ida.promisesNumber * state.ida.promisePrice;
      state.ida.serviceProvider = (await ida.serviceProvider());
      state.ida.paymentRightsToken = paymentRightsAddress;
      state.ida.promiseToken = impactPromiseAddress;

      //Get description from 3Box
      state.ida.data = await Box.getSpace(state.ida.serviceProvider, state.ida.name);

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


        if (state.ida.isOwner) {
          let ownerAllowance = await paymentRights.allowance(main, sts.address);
          console.log("Owner allowance: " + ownerAllowance);
          state.ida.distributionUnlocked = ownerAllowance > 0
        }

        updateInvestments();

        await getAllClaims();
      });

      updateFunding();
      updateHoldings();
      await this.a.updateIda();
    }

    if (isCreator) {
      await getBox();
    }

  }
};


export default Contracts
