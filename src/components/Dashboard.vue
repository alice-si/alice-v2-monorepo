/* eslint-disable */
<template>
  <md-app>
    <md-app-toolbar class="md-primary">

      <span class="md-title">Impact Futures Protocol Demo</span>
    </md-app-toolbar>

    <md-app-content>
      <div class="dashboard">

        <div>
          <md-card md-with-hover>
            <md-ripple>
              <md-card-header style="background-color: #00c0ef">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">attach_money</md-icon>
                  Investor
                </div>
                <div class="md-subhead">{{investor.address}}</div>
              </md-card-header>


              <md-card-content>
                Investor provides working capital.

                <div class="stats">
                  Balance: <span class="value">{{investor.balance}} GBP</span> <br/>
                  Impact Promises: <span class="value">{{investor.ip}}</span> <br/>
                  Impact Credits: <span class="value">{{investor.ic}} ({{investor.available}})</span>
                </div>
              </md-card-content>

              <md-card-actions>
                <md-button @click="deposit(investor, 'investor')">Deposit</md-button>
                <md-button @click="invest()">Invest</md-button>
                <md-button @click="redeem()">Redeem</md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>

          <div style="width: 100px;  display: inline-block;"></div>

          <md-card md-with-hover>
            <md-ripple>
              <md-card-header style="background-color: #1cb8c4">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">all_inclusive</md-icon>
                  Impact Futures
                </div>
                <div class="md-subhead">{{ifu.address}}</div>
              </md-card-header>


              <md-card-content>

                Impact Futures manages the flow of funds.

                <div class="stats" v-if="escrow.address">
                  Escrow: <span class="value">{{escrow.balance}} ({{escrow.unlocked}}) GBP</span> <br/>
                  Working capital: <span class="value">{{main.balance}} GBP</span> <br/>
                  Impact Credits: <span class="value">{{main.ic}}</span> <br/>
                  Discount: <span class="value">30%</span> <br/>
                </div>

                <div class="create-if-box" v-else>
                  <md-button class="md-primary create-if md-raised" @click="deployIF()">Create impact futures</md-button>
                </div>

              </md-card-content>

              <md-card-actions>
                <md-button @click="validate()">{{escrow.address ? 'Validate' : ''}}</md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>


          <div style="width: 100px;  display: inline-block;"></div>

          <md-card md-with-hover>
            <md-ripple>
              <md-card-header style="background-color: #874FD8">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">people_outline</md-icon>
                  Funder
                </div>
                <div class="md-subhead">{{funder.address}}</div>
              </md-card-header>


              <md-card-content>
                A funder pays the final bill for the outcome.

                <div class="stats">
                  Balance: <span class="value">{{funder.balance}} GBP</span> <br/>
                  Impact Promises: <span class="value">{{funder.ip}}</span> <br/>
                  Impact Credits: <span class="value">{{funder.ic}}</span>
                </div>
              </md-card-content>

              <md-card-actions>
                <md-button @click="deposit(funder, 'funder')">Deposit</md-button>
                <md-button @click="fund()">Fund</md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>
        </div>

        <div class="logs">
          <div class="md-toolbar md-primary md-dense md-elevation-0">
            <span class="md-title">Logs</span>
          </div>

          <md-list>
            <md-list-item md-expand v-for="log in logs" v-bind:key="log.tx">
              <md-icon>{{log.icon}}</md-icon>
              <span class="md-list-item-text">{{log.message}}</span>

              <md-list slot="md-expand">
                <md-list-item class="md-inset">{{log.code}}</md-list-item>
                <md-list-item class="md-inset">Transaction hash: {{log.tx}}</md-list-item>
                <md-list-item class="md-inset">Gas used: {{log.gas}}</md-list-item>
              </md-list>

            </md-list-item>
          </md-list>
        </div>
      </div>
    </md-app-content>
  </md-app>
</template>

<script>
  import Blockchain from '@/blockchain'
  import State from '@/state'

  export default {
    name: 'dashboard',
    data() {
      return {
        funder: State.accounts.funder,
        investor: State.accounts.investor,
        ifu: State.accounts.ifu,
        escrow: State.accounts.escrow,
        main: State.accounts.main,
        logs: State.logs
      }
    },
    beforeCreate: function () {
      Blockchain.deploy()
    },
    methods: {
      deposit: async function (account, label) {
        await Blockchain.deposit(account, label)
      },
      fund: async function () {
        await Blockchain.fund(100);
      },
      invest: async function () {
        await Blockchain.invest(100);
      },
      redeem: async function () {
        let amount = this.investor.available;
        await Blockchain.redeem(amount);
      },
      validate: async function () {
        await Blockchain.validate(100);
      },
      deployIF: async function () {
        await Blockchain.deployIF();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  #app {
    margin-top: 0px !important;
  }

  .md-app-content {
    padding: 16px 0 16px 0;
  }

  .md-card {
    width: 300px;
    margin: 4px;
    display: inline-block;
    vertical-align: top;
  }

  .md-app-content .md-card {
    margin: 0px;
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

  .md-card .md-subhead {
    color: white;
    font-size: 12px;
  }

  .card-icon {
    color: white;
  }

  .md-card-content {
    padding-top: 15px !important;
    height: 150px;
  }

  .md-subhead {
    font-size: 11px;
    height: 15px;
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

  .logs {
    margin-top: 30px;
    width: 1120px;
    display: inline-block;
    border: 1px solid rgba(#000, .12);
  }

  .md-list {
    max-width: 100%;
    vertical-align: top;
  }

  .md-list-item-container {
    font-size: 14px;
  }

  .md-list-item-content {
    min-height: 32px !important;
  }

  .md-toolbar {
    background-color: #616161;
  }

  .md-toolbar .md-title {
    margin: 0;
    margin-left: 8px;
    overflow: hidden;
    font-weight: 400;
    letter-spacing: .02em;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }

  .create-if-box {
    padding-top: 30px;
  }

  .create-if {
    background-color: #1cb8c4;
    color: white;
  }


</style>
