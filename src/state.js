/* eslint-disable */
let state = {
  accounts: {},
  balance: {
    tokens: 0,
    funded: 0,
    totalFunded: 0,
    invested: 0,
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
    validator: '',
    endTime: '',
    fundingUnlocked: false,
    investingUnlocked: false,
    isOwner: false,
    distributeAmount: null,
    distributeDiscount: null
  },
  allIdas: []

};

export default state;
