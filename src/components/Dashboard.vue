/* eslint-disable */
<template>
  <div class="dashboard">

    <md-card md-with-hover>
      <md-ripple>
        <md-card-header style="background-color: #00c0ef">
          <div class="md-title"> <md-icon class="md-size-2x card-icon" >input</md-icon> Investor</div>
          <!--<div class="md-subhead">Subtitle here</div>-->
        </md-card-header>

        <div class="stats">
          Address: <span class="address">{{investor.address}}</span> <br/>
          Balance: <span class="value">{{investor.balance}} GBP</span> <br/>
          Impact Promises: <span class="value">{{investor.ip}}</span> <br/>
          Impact Credits: <span class="value">{{investor.ic}}</span>
        </div>

        <md-card-content>
          Description who the funder is.
        </md-card-content>

        <md-card-actions>
          <md-button @click="deposit(investor)">Deposit</md-button>
          <md-button @click="invest()">Invest</md-button>
        </md-card-actions>
      </md-ripple>
    </md-card>

    <div style="width: 100px;  display: inline-block;"></div>

    <md-card md-with-hover>
      <md-ripple>
        <md-card-header style="background-color: #00c0ef">
          <div class="md-title"> <md-icon class="md-size-2x card-icon" >input</md-icon> Impact Futures</div>
          <!--<div class="md-subhead">Subtitle here</div>-->
        </md-card-header>

        <div class="stats" v-if="escrow.address">
          Address: <span class="address">{{ifu.address}}</span> <br/>
          Escrow: <span class="value">{{escrow.balance}} ({{escrow.unlocked}}) GBP</span> <br/>
          Working capital: <span class="value">{{main.balance}} GBP</span> <br/>
          Impact Promises: <span class="value">{{ifu.ip}}</span> <br/>
          Impact Credits: <span class="value">{{ifu.ic}}</span>
        </div>

        <md-card-content>
          A funder pays the final bill for the outcome.
        </md-card-content>

        <md-card-actions>
          <md-button @click="validate()">Validate</md-button>
          <md-button @click="deployIF()">Create</md-button>
        </md-card-actions>
      </md-ripple>
    </md-card>



    <div style="width: 100px;  display: inline-block;"></div>

    <md-card md-with-hover>
      <md-ripple>
        <md-card-header style="background-color: #00c0ef">
          <div class="md-title"> <md-icon class="md-size-2x card-icon" >input</md-icon> Funder</div>
          <!--<div class="md-subhead">Subtitle here</div>-->
        </md-card-header>

        <div class="stats">
          Address: <span class="address">{{funder.address}}</span> <br/>
          Balance: <span class="value">{{funder.balance}} GBP</span> <br/>
          Impact Promises: <span class="value">{{funder.ip}}</span> <br/>
          Impact Credits: <span class="value">{{funder.ic}}</span>
        </div>

        <md-card-content>
          Description who the funder is.
        </md-card-content>

        <md-card-actions>
          <md-button @click="deposit(funder)">Deposit</md-button>
          <md-button @click="fund()">Fund</md-button>
        </md-card-actions>
      </md-ripple>
    </md-card>

  </div>
</template>

<script>
import Blockchain from '@/blockchain'
import State from '@/state'

export default {
  name: 'dashboard',
  data () {
    return {
      funder: State.accounts.funder,
      investor: State.accounts.investor,
      ifu: State.accounts.ifu,
      escrow: State.accounts.escrow,
      main: State.accounts.main
    }
  },
  beforeCreate: function () {
    Blockchain.deploy()
    // Users.init().then(() => {
    //   Users.exists(window.web3.eth.accounts[0]).then((exists) => {
    //     if (exists) {
    //       Users.authenticate().then(pseudo => {
    //         this.pseudo = pseudo
    //       })
    //     }
    //   })
    // }).catch(err => {
    //   console.log(err)
    // })
  },
  methods: {
    deposit: async function (account) {
      await Blockchain.deposit(account)
    },
    fund: async function() {
      await Blockchain.fund(100);
    },
    invest: async function() {
      await Blockchain.invest(100);
    },
    validate: async function() {
      await Blockchain.validate(100);
    },
    deployIF: async function() {
      await Blockchain.deployIF();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .md-card {
    width: 320px;
    margin: 4px;
    display: inline-block;
    vertical-align: top;
  }

  .stats {
    text-align: left;
    padding: 20px;

    .value {
      font-weight: bolder;
    }

    .address {
      font-size: 9px;
    }
  }

  .md-title {
    text-align: left !important;
    color: white;
  }

  .md-subhead {
    color: white;
  }

  .card-icon {
    color: white;
  }

  .md-card-content {
    padding-top: 20px;
  }


  .md-card-example {
    .md-subhead {
      .md-icon {
        $size: 16px;

        width: $size;
        min-width: $size;
        height: $size;
        font-size: $size !important;
      }

      span {
        vertical-align: middle;
      }
    }
  }
</style>
