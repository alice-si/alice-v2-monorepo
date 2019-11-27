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
  paymentTokens: [],
  ida: {
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
    distributeAmount: null,
    distributeDiscount: null,
    claims: []
  },
  allIdas: [],
  investingChartData: {You: 0, Others: 0},
  fundingChartData: {You: 0, Others: 0}

};

export default state;
