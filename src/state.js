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
    promiseToken: null
  },
  allIdas: [],
  investingChartData: {You: 0, Others: 0},
  fundingChartData: {You: 0, Others: 0},
  investingTotalChartData: {Invested: 0, Remaining: 0},
  fundingTotalChartData: {Funded: 0, Remaining: 0}

};

export default state;
