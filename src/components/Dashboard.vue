/* eslint-disable */
<template>
  <md-app>
    <md-app-toolbar class="md-primary">

      <span class="md-title">Impact Futures Protocol Demo</span>
      <div class="md-toolbar-section-end">
        <md-button style="color: white" @click="showSidepanel = true">Show logs</md-button>
      </div>
    </md-app-toolbar>


    <md-app-content>


      <div >

        <md-drawer class="md-right" :md-active.sync="showSidepanel">
          <md-toolbar class="md-transparent" md-elevation="0">
            <span class="md-title">Logs</span>
          </md-toolbar>

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

        </md-drawer>

        <div class="dashboard">
          <md-card class="card-left" md-with-hover>
            <md-ripple>
              <md-card-header style="background-color: #00c0ef">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">attach_money</md-icon>
                  Investor
                </div>
                <div class="md-subhead">{{investor.address}}</div>
              </md-card-header>


              <md-card-content>
                Provides working capital.

                <div class="stats">
                  Balance: <span class="value">${{investor.balance}}</span> <br/>
                  <div v-if="impact.price">
                  Impact Credits: <span class="value">{{investor.ic / impact.price}} x ${{impact.price}} (${{investor.available}})</span>
                  </div>
                </div>
              </md-card-content>

              <md-card-actions>
                <md-button @click="deposit(investor, 'investor')">Deposit</md-button>
                <md-button @click="invest()">Invest</md-button>
                <md-button @click="redeem(investor.address)">Redeem</md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>

          <md-card class="card-center" md-with-hover>
            <md-ripple>
              <md-card-header style="background-color: #1cb8c4">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">accessible_forward</md-icon>
                  Social Organisation
                </div>
                <div class="md-subhead">{{main.address}}</div>
              </md-card-header>


              <md-card-content v-if="escrow.address">

                Manages Impact Futures. {{impact.claimsCounter}} > {{impact.all}}

                <div class="stats">
                  Working capital: <span class="value">${{main.balance}}</span> <br/>
                  Impact Credits: <span class="value">{{main.ic / impact.price}} x ${{impact.price}} (${{main.available}})</span>


                  <div>
                    Discount:
                    <md-button @click="changeDiscount(-10)" class="md-fab md-micro md-plain">
                      <md-icon>remove</md-icon>
                    </md-button>

                    <span class="value">{{discount}}%</span>

                    <md-button @click="changeDiscount(10)" class="md-fab md-micro md-plain">
                      <md-icon>add</md-icon>
                    </md-button>
                  </div>

                </div>

              </md-card-content>

              <md-card-content v-else>
                <div class="creator">
                  <md-field>
                    <label>Number of promises</label>
                    <md-input v-model="outcomesNumber"></md-input>
                  </md-field>
                  <md-field>
                    <label>Price per promise</label>
                    <md-input v-model="outcomesPrice"></md-input>
                  </md-field>
                </div>
              </md-card-content>

              <md-card-actions v-if="escrow.address">
                <md-button @click="claimOutcome()" :disabled="impact.claimsCounter > impact.all">Claim outcome</md-button>
                <md-button @click="redeem(main.address)">Redeem</md-button>
              </md-card-actions>
              <div class="create-if-box" v-else>
                <md-button class="md-primary create-if md-raised" @click="deployIF()">Create impact futures</md-button>
              </div>

            </md-ripple>
          </md-card>

          <md-card class="card-right" md-with-hover>
            <md-ripple>
              <md-card-header style="background-color: #874FD8">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">people_outline</md-icon>
                  Funder
                </div>
                <div class="md-subhead">{{funder.address}}</div>
              </md-card-header>


              <md-card-content>
                Pays the final bill for the outcome.

                <div class="stats">
                  Balance: <span class="value">${{funder.balance}} </span> <br/>
                  <div v-if="impact.price">
                  Impact Promises: <span class="value">{{funder.ip / impact.price}} x ${{impact.price}}</span> <br/>
                  </div>
                </div>
              </md-card-content>

              <md-card-actions>
                <md-button @click="deposit(funder, 'funder')">Deposit</md-button>
                <md-button @click="fund()">Fund</md-button>
                <md-button @click="refund()">Refund</md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>
        </div>

        <div class="dashboard">
          <div class="md-card card-left"></div>

          <md-card class="card-center" md-with-hover v-if="escrow.address">
            <md-ripple>
              <md-card-header style="background-color: #1cb8c4">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">all_inclusive</md-icon>
                  Impact Futures {{impact.ended ? '[x]' : ''}}
                </div>
                <div class="md-subhead">{{ifu.address}}</div>
              </md-card-header>


              <md-card-content>

                Manages the flow of funds.

                <div class="stats">
                  Escrow: <span class="value">${{escrow.balance}} </span> <br/>
                  Unfunded Promises: <span class="value">{{impact.remaining}} x ${{impact.price}}</span> <br/>
                  Validated Promises: <span class="value">{{impact.validated}} x ${{impact.price}}</span> <br/>
                </div>


              </md-card-content>

              <md-card-actions>
                <md-button @click="finalize()">Finalize</md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>

          <md-card class="card-right" md-with-hover v-if="escrow.address">
            <md-ripple>
              <md-card-header style="background-color: #1cb8c4">
                <div class="md-title">
                  <md-icon class="md-size-2x card-icon">all_inclusive</md-icon>
                  Validator
                </div>
                <div class="md-subhead">{{validator.address}}</div>
              </md-card-header>


              <md-card-content>

                Verifies the impact.

                <div class="stats">
                  <div v-for="claim in claims">
                    {{claim}}
                    <md-button @click="validate(claim)" class="md-fab md-micro md-plain">
                      <md-icon>done</md-icon>
                    </md-button>
                  </div>

                </div>


              </md-card-content>

              <md-card-actions>
                <md-button ></md-button>
              </md-card-actions>
            </md-ripple>
          </md-card>
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
        validator: State.accounts.validator,
        funder: State.accounts.funder,
        investor: State.accounts.investor,
        ifu: State.accounts.ifu,
        escrow: State.accounts.escrow,
        main: State.accounts.main,
        logs: State.logs,
        impact: State.impact,
        showSidepanel: false,
        discount: 50,
        outcomesNumber: null,
        outcomesPrice: null,
        claims: State.claims
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
      refund: async function () {
        await Blockchain.refund();
      },
      invest: async function () {
        await Blockchain.invest(100, this.discount);
      },
      redeem: async function (account) {
        await Blockchain.redeem(account);
      },
      validate: async function (claim) {
        console.log("Validating: " + claim);
        await Blockchain.validate(100);
        State.claims.splice(State.claims.indexOf(claim), 1);
      },
      claimOutcome: async function() {
        console.log("Claiming outcome");
        State.claims.push("Impact " + this.impact.claimsCounter++);
      },
      finalize: async function () {
        await Blockchain.finalize();
      },
      deployIF: async function () {
        await Blockchain.deployIF(this.outcomesNumber, this.outcomesPrice);
      },
      changeDiscount: async function (change) {
        this.discount += change;
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

  div.dashboard {
    padding: 0 20px 0 20px;
    width:100%;
    text-align:center;
  }

  .md-card {
    width: 28% !important;
    display: inline-block;
    vertical-align: top;
  }

  .md-card.card-left {
    float:left;
  }

  .md-card.card-center {
    margin:0 auto;
  }

  .md-card.card-right {
    float:right;
  }

  .md-app-content .md-card {
    margin: 15px 0 15px 0;
  }

  .md-card-actions {
    padding: 0 6px 6px 6px;
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
    margin-top: 0px;
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
    padding: 10px 10px 0 10px !important;
    height: 120px;
  }

  .md-card-header {
    padding: 6px 16px 6px 16px;
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
    width: 1120px !important;
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
    margin-top: -5px !important;
  }

  .create-if {
    background-color: #1cb8c4 !important;
    color: white;
  }

  .md-drawer {
    background-color: white;
    width: 700px;
  }

  .md-field {
    margin: 0 !important;
  }

  .md-field label {
    font-size: 14px !important;
    margin: 0 !important;
  }

  .md-field .md-input {
    border-bottom: 1px solid #1cb8c4 !important;
    height: 28px !important;
  }

  .md-field.md-has-value .md-input {
    font-size: 12px !important;
  }

  .creator {
    padding: 0 20px 0 20px;
  }

  .md-fab {
    background-color: #1cb8c4 !important;
  }

  .md-fab.md-mini {
    width: 30px;
    height: 30px;
  }

  .md-fab.md-micro {
    width: 20px;
    height: 20px;
    margin: 0;
  }

  .md-fab.md-micro .md-icon {
    font-size: 12px !important;
  }

  .md-fab .md-icon {
    color: white !important;
  }

  div.gutter {
    width: 80px;
    display: inline-block;
  }


</style>
