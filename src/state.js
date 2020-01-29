/* eslint-disable */
let state = {
  accounts: {},
  balance: {
    tokens: 0,
    funded: 0,
    totalFunded: 0,
    invested: 0,
    redeemable: 0,
    totalInvested: 0
  },
  impact: {
    claimsCounter: 1,
    price: null,
    all: null,
    validated: null,
    remaining: null,
    ended: false
  },
  claims: [],
  logs: {
    show: false,
    list: []
  },
  isBoxLoaded: false,
  paymentTokens: [],
  ida: {
    address: null,
    name: '',
    promisesNumber: 0,
    promisePrice: 0,
    budget: 0,
    validator: '',
    endTime: '',
    fundingUnlocked: false,
    investingUnlocked: false,
    isOwner: false,
    isValidator: false,
    distributionUnlocked: false,
    distributeAmount: 0,
    distributeDiscount: 0,
    claims: [],
    paymentRightsToken: null,
    promiseToken: null,
    unsold: 0
  },
  allIdas: [],
  investingChartData: {You: 0, Others: 0},
  fundingChartData: {You: 0, Others: 0},
  investingTotalChartData: {Sold: 0, Available: 0},
  fundingTotalChartData: {Funded: 0, Remaining: 0},
  fluidBalanceChartData: {Redeemed: 0, Redeemable: 0, Potential: 0}

};

export default state;
