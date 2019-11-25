/* eslint-disable */
<template>
  <div class="page">

    <md-dialog :md-active.sync="processing" :md-click-outside-to-close="false">
      <md-dialog-title>Processing transaction</md-dialog-title>

      <md-dialog-content style="text-align: center">


        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>

        <div>
          Please wait....
        </div>

      </md-dialog-content>
    </md-dialog>

    <md-drawer class="md-drawer md-right" :md-active.sync="showFundPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Fund IDA</span>
      </md-toolbar>

      <div class="form" v-if="ida.fundingUnlocked">
        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Amount</label>
            <md-input name="fundingAmount" id="fundingAmount" v-model="fundingAmount" :disabled="processing" />
          </md-field>
        </div>

        <md-button class="md-primary md-raised" @click="fund()">Fund</md-button>
      </div>

      <div v-else>
        <div class="unlock-info">Please enable funding by making a token allowance</div>
        <md-button @click="unlockFunding()" class="md-icon-button md-raised md-accent">
          <md-icon>vpn_key</md-icon>
          <md-tooltip md-direction="right">Unlock access</md-tooltip>
        </md-button>
      </div>

    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showDistributePanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Distribute payment rights</span>
      </md-toolbar>

      <div class="form" >

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Discount (%)</label>
            <md-input name="fundingAmount" id="discount" v-model="distributeDiscount" :disabled="processing" />
          </md-field>
        </div>


        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Amount</label>
            <md-input name="distributeAmount" id="distributeAmount" v-model="distributeAmount" :disabled="processing" />
          </md-field>
        </div>

        <md-button class="md-primary md-raised" @click="updateConditions()">Update conditions</md-button>
      </div>

    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showInvestPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Invest</span>
      </md-toolbar>

      <div class="form" v-if="ida.investingUnlocked">

        <div class="md-layout-item md-small-size-100">
          You can invest with <b>{{ida.distributeDiscount}}%</b> discount
        </div>



        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Amount to invest</label>
            <md-input name="investmentAmount" id="investmentAmount" v-model="investmentAmount" :disabled="processing" />
          </md-field>
          This will get you {{investmentAmount * (100/(100-distributeDiscount))}} payment rights
        </div>

        <md-button class="md-primary md-raised" @click="invest()">Invest</md-button>
      </div>

      <div v-else>
        <div class="unlock-info">Please enable investing by making a token allowance</div>
        <md-button @click="unlockInvesting()" class="md-icon-button md-raised md-accent">
          <md-icon>vpn_key</md-icon>
          <md-tooltip md-direction="right">Unlock access</md-tooltip>
        </md-button>
      </div>

    </md-drawer>


    <div class="md-layout md-gutter">

      <div class="md-layout-item md-size-100">

        <md-card class="md-primary md-accent tokens-notification" v-if="ida.isOwner">
          <md-card-header>
            <md-card-header-text>
              <div class="md-title">
                You are the creator of this IDA
                <md-button class="funds-button" @click="distribute()">Distribute payment rights</md-button>
              </div>

            </md-card-header-text>
          </md-card-header>
        </md-card>

        <md-card class="md-primary md-accent tokens-notification" v-else>
          <md-card-header>
            <md-card-header-text>
              <div class="md-title" v-if="balance.tokens == 0">
                You currently don't have any funds to invest
                <md-button class="funds-button" @click="getDemoTokens()">Get $100 demo tokens</md-button>
              </div>
              <div class="md-title" v-else>
                You currently have <b>${{balance.tokens}}</b> to invest
                <md-button class="funds-button" @click="getDemoTokens()">Get $100 more tokens</md-button>
              </div>

            </md-card-header-text>
          </md-card-header>
        </md-card>
      </div>

      <div class="md-layout-item md-size-33">
        <md-card>
          <md-ripple>

            <md-card-header>
              <md-card-header-text>
                <div class="md-title">Agreement details</div>
                <div class="md-subhead">a list of parameters specified by the creator</div>
              </md-card-header-text>

            </md-card-header>


            <md-card-content style="text-align: left">
              <div>
                <md-list>

                  <md-divider></md-divider>
                  <md-subheader>Number of promises</md-subheader>

                  <md-list-item>
                    <div>
                      <b>{{ida.promisesNumber}}</b>
                    </div>
                  </md-list-item>

                  <md-divider></md-divider>
                  <md-subheader>Price per promise</md-subheader>

                  <md-list-item>
                    <div>
                      <b>${{ida.promisePrice}}</b>
                    </div>
                  </md-list-item>

                  <md-divider></md-divider>

                  <md-subheader>Validator</md-subheader>

                  <md-list-item class="md-list-item-text">
                    <div class="md-list-item-text">
                      <b>{{ida.validator}}</b>
                    </div>
                  </md-list-item>

                  <md-divider></md-divider>

                  <md-subheader>Project deadline</md-subheader>

                  <md-list-item class="md-list-item-text">
                    <div class="md-list-item-text">
                      <b>{{ida.endTime}}</b>
                    </div>
                  </md-list-item>


                </md-list>
              </div>

            </md-card-content>
          </md-ripple>
        </md-card>
      </div>

      <div class="md-layout-item md-size-66">
        <md-card class="funding">
          <md-ripple>

            <md-card-header >
              <md-card-header-text>
                <div class="md-title">Funding</div>
              </md-card-header-text>

            </md-card-header>


            <md-card-content style="text-align: left">
              <div class="md-layout md-gutter">

                <div class="md-layout-item md-size-33">
                  <div class="value-big">${{balance.funded}}</div>
                  <div class="value-subtitle">funded by You</div>
                </div>

                <div class="md-layout-item md-size-33">
                  <div class="value-big">${{balance.totalFunded}}</div>
                  <div class="value-subtitle">total funding</div>
                </div>

                <div class="md-layout-item md-size-33">
                  <div class="value-big" style="padding-top:0; height:80px; margin-top: -5px">
                    <GChart
                      type="PieChart"
                      :data="fundingChart"
                      :options="chartOptions"
                      @ready="onChartReady"
                    />
                  </div>

                </div>

              </div>
            </md-card-content>

            <div class="button-box">
              <md-button class="md-primary action-button md-raised" @click="showFundPanel = true">Fund</md-button>
            </div>

          </md-ripple>
        </md-card>

        <md-card class="investing">
          <md-ripple>

            <md-card-header>
              <md-card-header-text>
                <div class="md-title">Investing</div>
              </md-card-header-text>

            </md-card-header>


            <md-card-content style="text-align: left">
              <div class="md-layout md-gutter">

                <div class="md-layout-item md-size-33">
                  <div class="value-big">${{balance.invested}}</div>
                  <div class="value-subtitle">invested by You</div>
                </div>

                <div class="md-layout-item md-size-33">
                  <div class="value-big">${{balance.totalInvested}}</div>
                  <div class="value-subtitle">total invested</div>
                </div>

                <div class="md-layout-item md-size-33">
                  <div class="value-big" style="padding-top:0; height:80px; margin-top: -5px">
                    <GChart
                      type="PieChart"
                      :data="fundingChart"
                      :options="investingChartOptions"
                      @ready="onChartReady"
                    />
                  </div>

                </div>

              </div>

            </md-card-content>

            <div class="button-box">
              <md-button class="md-primary create-if md-raised action-button" @click="showInvestPanel = true">Invest</md-button>
            </div>

          </md-ripple>
        </md-card>
      </div>
    </div>
  </div>
</template>

<script>
  import Contracts from '@/contracts'
  import State from '@/state'

  export default {
    name: 'Creator',
    data() {
      return {
        ida: State.ida,
        balance: State.balance,
        processing: false,
        showFundPanel: false,
        fundingAmount: null,
        showDistributePanel: false,
        distributeAmount: State.ida.distributeAmount,
        distributeDiscount: State.ida.distributeDiscount,
        showInvestPanel: false,
        investmentAmount: null,
        chartOptions: {
          pieHole: 0.3,
          legend: {position: 'none'},
          colors: ['#8A48DB', '#21B7C5']

        },
        investingChartOptions: {
          pieHole: 0.3,
          legend: {position: 'none'},
          colors: ['#8A48DB', '#01C0EF']

        },
        fundingChart: [['Who',     'How much'], ['You',      0], ['Other', 70]]
      }
    },
    beforeCreate: function () {
      let idaAddress = this.$route.params.ida;
      Contracts.init(idaAddress);
    },
    methods: {
      getDemoTokens: async function() {
        this.processing = true;
        await Contracts.getDemoTokens();
        this.processing = false;

      },
      unlockFunding: async function() {
        this.processing = true;
        await Contracts.unlockFunding();
        this.processing = false;
      },
      unlockInvesting: async function() {
        this.processing = true;
        await Contracts.unlockInvesting();
        this.processing = false;
      },
      fund: async function() {
        this.processing = true;
        await Contracts.fund(this.fundingAmount);
        this.processing = false;
        this.showFundPanel = false;
      },
      distribute: async function() {
        this.showDistributePanel = true;
      },
      updateConditions: async function() {
        this.processing = true;
        await Contracts.updateConditions(this.distributeAmount, this.distributeDiscount);
        this.processing = false;
        this.showDistributePanel = false;
      },
      invest: async function() {
        this.processing = true;
        await Contracts.invest(this.investmentAmount);
        this.processing = false;
        this.showDistributePanel = false;
      },
      onChartReady: function(chart) {
        setTimeout(() => {
          console.log("Updating chart... ");
          let data = [['Who',     'How much'], ['You',      this.balance.funded], ['Other', this.balance.totalFunded - this.balance.funded]];
          chart.draw(google.visualization.arrayToDataTable(data), this.chartOptions);
        }, 5000);

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  div.page {
    padding: 0 20px 0 20px;
    width: 100%;
    text-align: center;
  }

  .md-card.card-center {
    margin: 0 auto;
  }

  .md-card-actions {
    padding: 0 6px 6px 6px;
  }

  .md-title {
    color: whtie;
  }

  .md-card .md-subhead {
    font-size: 12px;
  }

  .card-icon {
    color: white;
  }

  .md-card-content {
    padding: 10px 10px 0 10px !important;
  }

  .md-card-header {
    padding: 6px 16px 6px 16px;
  }

  .md-subhead {
    font-size: 11px;
    height: 15px;
  }

  .md-drawer {
    background-color: white;
    width: 400px;
  }

  .md-drawer .form {
    padding: 20px;
  }

  .tokens-notification {
    margin-bottom: 20px;
  }

  .tokens-notification .md-title {
    font-size: 18px;
    color: white;
    text-align: left;
    padding-bottom: 10px;
  }

  .funds-button {
    border: 1px solid white !important;
    padding: 7px;
    float: right;
  }

  .unlock-info {
    margin-top: 20px;
    margin-bottom: 20px;
    font-size: 14px;
    font-color: grey;
  }

  .funding .md-title, .investing .md-title {
    color: white;
  }



  .funding .md-card-header-flex {
    background-color: #21B7C5;
  }

  .investing .md-card-header-flex {
    background-color: #01C0EF;
  }

  .value-big {
    height: 100px;
    font-family:Avenir;
    font-size: 36px;
    text-align: center;
    padding-top: 50px;
    margin: 4px;
    border-bottom: 1px solid lightgray;
  }

  .value-subtitle {
    text-align: center;
    font-family:Avenir;
    font-size: 14px;
    color: gray;
  }

  .action-button {
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .funding .md-button.action-button.md-primary.md-theme-default {
    background-color: #21B7C5;
  }

  .investing .md-button.action-button.md-primary.md-theme-default {
    background-color: #01C0EF;
  }

  .investing {
    margin-top: 20px;
  }





</style>
