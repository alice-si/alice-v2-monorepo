/* eslint-disable */
let state = {
  accounts: {},
  balance: {
    investor: 10
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
  paymentTokens: []

};

export default state;
