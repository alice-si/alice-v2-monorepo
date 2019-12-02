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

    <md-drawer class="md-drawer md-right" :md-active.sync="showClaimPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Submit Claim</span>
      </md-toolbar>

      <div class="form">
        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Code</label>
            <md-input name="fundingAmount" id="claimKey" v-model="claimKey" :disabled="processing"/>
          </md-field>
        </div>

        <md-button class="md-primary md-raised" @click="submitClaim()">Submit</md-button>
      </div>
    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showFundPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Fund IDA</span>
      </md-toolbar>

      <form novalidate v-if="ida.fundingUnlocked">
        <div class="form-container">
          <md-field :class="getValidationClass('fundingForm', 'fundingAmount')">
            <label for="fundingAmount">Amount (up to ${{ida.maxFunding}})</label>
            <md-input name="fundingAmount" id="fundingAmount" v-model="fundingForm.fundingAmount"
                      :disabled="processing"/>
            <span class="md-error"
                  v-if="!$v.fundingForm.fundingAmount.required">Please provide the amount to fund</span>
            <span class="md-error"
                  v-else-if="!$v.fundingForm.fundingAmount.maxValue">Can fund up to ${{ida.maxFunding}}</span>
            <span class="md-error" v-else-if="!$v.fundingForm.fundingAmount.maxAvailable">You only have ${{balance.tokens}} tokens to spend</span>
          </md-field>
        </div>

        <md-button class="md-primary md-raised" @click="fund()">Fund</md-button>

      </form>

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

      <div class="form">

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Discount (%)</label>
            <md-input name="fundingAmount" id="discount" v-model="distributeDiscount" :disabled="processing"/>
          </md-field>
        </div>


        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="fundingAmount">Amount</label>
            <md-input name="distributeAmount" id="distributeAmount" v-model="distributeAmount" :disabled="processing"/>
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
          You buy up to <b>${{ida.maxInvestment}}</b> rights with <b>{{ida.distributeDiscount}}%</b> discount
        </div>

        <form novalidate v-if="ida.investingUnlocked">
          <div class="form-container">
            <md-field :class="getValidationClass('investmentForm', 'investmentAmount')">
              <label for="fundingAmount">Number of payment rights to buy</label>
              <md-input name="investmentAmount" id="investmentAmount" v-model="investmentForm.investmentAmount"
                        :disabled="processing"/>
              <span class="md-error" v-if="!$v.investmentForm.investmentAmount.required">Please provide the amount to invest</span>
              <span class="md-error" v-else-if="!$v.investmentForm.investmentAmount.maxValue">You can invest up to ${{ida.maxInvestment}}</span>
              <span class="md-error" v-else-if="!$v.investmentForm.investmentAmount.maxAvailable">You only have ${{balance.tokens}} tokens to invest</span>
            </md-field>
            This will cost you ${{investmentForm.investmentAmount * (ida.distributeDiscount/100)}}
          </div>
        </form>

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

        <md-card class="md-primary md-accent tokens-notification" v-if="ida.isValidator">
          <md-card-header>
            <md-card-header-text>
              <div class="md-title">
                You are the validator of this IDA
              </div>

            </md-card-header-text>
          </md-card-header>
        </md-card>

        <md-card class="md-primary md-accent tokens-notification" v-if="!ida.isValidator && !ida.isOwner">
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
        <md-card class="description" v-if="ida.data">
          <md-ripple>
            <md-card-content style="text-align: left">

              <div style="padding-top: 10px;">
                <div class="text">
                  {{ida.data['project-description']}}
                </div>
              </div>

              <div>
                <md-divider></md-divider>
                <md-subheader>{{ida.data['organisation-name']}}</md-subheader>
                <div class="text">
                  {{ida.data['organisation-description']}}
                </div>
              </div>

              <div>
                <md-divider></md-divider>
                <md-subheader>{{ida.promisesNumber}} x ${{ida.promisePrice}}</md-subheader>
                <div class="text">
                  {{ida.data['promise-description']}}
                </div>
              </div>

              <div>
                <md-divider></md-divider>
                <md-subheader>Validator</md-subheader>
                <div class="text">
                  {{ida.data['validator-name']}} <br/>
                  <span class="address-text"> {{ida.validator}}</span>
                </div>
              </div>

              <div>
                <md-divider></md-divider>
                <md-subheader>Project deadline</md-subheader>
                <div class="text">
                  <b>{{ida.endTime}}</b>
                </div>
              </div>
            </md-card-content>
          </md-ripple>
        </md-card>
      </div>

      <div class="md-layout-item md-size-66">
        <md-tabs class="md-transparent" md-alignment="fixed">

          <md-tab id="tab-funding" md-label="Funding">
            <md-card class="funding">
              <md-ripple>

                <md-card-header>
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
                      <ratio-chart second-color="#21B7C5" :values="fundingChartData"></ratio-chart>
                    </div>

                  </div>
                </md-card-content>

                <div class="button-box">
                  <md-button class="md-primary action-button md-raised" @click="showFundPanel = true">Fund</md-button>
                </div>

              </md-ripple>
            </md-card>
          </md-tab>
          <md-tab id="tab-investing" md-label="Investing">
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
                      <ratio-chart second-color="#01C0EF" :values="investingChartData"></ratio-chart>
                    </div>

                  </div>

                </md-card-content>

                <div class="button-box">
                  <md-button class="md-primary md-raised action-button" @click="showInvestPanel = true">Invest
                  </md-button>
                  <md-button class="md-primary md-raised action-button" v-if="balance.redeemable > 0" @click="redeem()">
                    Redeem ${{balance.redeemable}}
                  </md-button>
                </div>

              </md-ripple>
            </md-card>
          </md-tab>
          <md-tab id="tab-impact" md-label="Impact">
            <md-card class="impact">
              <md-ripple>

                <md-card-header>
                  <md-card-header-text>
                    <div class="md-title">Impact</div>
                  </md-card-header-text>

                </md-card-header>


                <md-card-content style="text-align: left">


                  <md-table>
                    <md-table-row>
                      <md-table-head md-numeric>ID</md-table-head>
                      <md-table-head>Code</md-table-head>
                      <md-table-head v-if="ida.isValidator">Validate</md-table-head>
                      <md-table-head v-else>Validated</md-table-head>
                    </md-table-row>

                    <md-table-row v-for="(claim, index) in ida.claims" :key="claim.code">
                      <md-table-cell md-numeric>{{index + 1}}</md-table-cell>
                      <md-table-cell>{{claim.code}}</md-table-cell>
                      <md-table-cell>
                        <md-button @click="validateClaim(claim.code)"
                                   class="md-icon-button md-raised md-dense md-accent"
                                   :disabled="!ida.isValidator || claim.isValidated">
                          <md-icon v-if="claim.isValidated || ida.isValidator">done</md-icon>
                          <md-icon v-if="!claim.isValidated && !ida.isValidator">hourglass_empty</md-icon>
                          <md-tooltip md-direction="right">Validate claim</md-tooltip>
                        </md-button>
                      </md-table-cell>
                    </md-table-row>
                  </md-table>

                </md-card-content>

                <div class="button-box" v-if="ida.isOwner">
                  <md-button class="md-primary action-button md-raised" @click="showClaimPanel = true">Submit Claim
                  </md-button>
                </div>

                <div style="height: 20px" v-else></div>

              </md-ripple>
            </md-card>
          </md-tab>
        </md-tabs>
      </div>
    </div>
  </div>
</template>

<script>
  import Contracts from '@/contracts'
  import State from '@/state'
  import RatioChart from './RatioChart'
  import {validationMixin} from 'vuelidate'
  import {
    required,
    maxValue
  } from 'vuelidate/lib/validators'

  export default {
    name: 'Dashboard',
    mixins: [validationMixin],
    components: {RatioChart},
    data() {
      return {
        ida: State.ida,
        balance: State.balance,
        processing: false,
        showFundPanel: false,
        fundingForm: {
          fundingAmount: null
        },
        showDistributePanel: false,
        distributeAmount: State.ida.distributeAmount,
        distributeDiscount: State.ida.distributeDiscount,
        showInvestPanel: false,
        investmentForm: {
          investmentAmount: null
        },
        showClaimPanel: false,
        claimKey: null,
        investingChartData: State.investingChartData,
        fundingChartData: State.fundingChartData
      }
    },
    validations: {
      fundingForm: {
        fundingAmount: {
          required,
          maxValue: (value, model) => value <= State.ida.maxFunding,
          maxAvailable: (value, model) => value <= State.balance.tokens
        }
      },
      investmentForm: {
        investmentAmount: {
          required,
          maxValue: (value, model) => value <= State.ida.maxInvestment,
          maxAvailable: (value, model) => value <= State.balance.tokens
        }
      }
    },
    beforeCreate: function () {
      let idaAddress = this.$route.params.ida;
      Contracts.init(idaAddress);
    },
    methods: {
      getDemoTokens: async function () {
        this.processing = true;
        await Contracts.getDemoTokens();
        this.processing = false;

      },
      unlockFunding: async function () {
        this.processing = true;
        await Contracts.unlockFunding();
        this.processing = false;
      },
      unlockInvesting: async function () {
        this.processing = true;
        await Contracts.unlockInvesting();
        this.processing = false;
      },
      fund: async function () {
        this.$v.fundingForm.$touch()
        if (!this.$v.fundingForm.$invalid) {
          this.processing = true;
          await Contracts.fund(this.fundingForm.fundingAmount);
          this.processing = false;
          this.showFundPanel = false;
        }
      },
      distribute: async function () {
        this.showDistributePanel = true;
      },
      updateConditions: async function () {
        this.processing = true;
        await Contracts.updateConditions(this.distributeAmount, this.distributeDiscount);
        this.processing = false;
        this.showDistributePanel = false;
      },
      invest: async function () {
        this.$v.investmentForm.$touch();
        if (!this.$v.investmentForm.$invalid) {
          this.processing = true;
          await Contracts.invest(this.investmentForm.investmentAmount);
          this.processing = false;
          this.showInvestPanel = false;
        }
      },
      submitClaim: async function () {
        this.processing = true;
        await Contracts.submitClaim(this.claimKey);
        this.processing = false;
        this.showClaimPanel = false;
      },
      validateClaim: async function (claimKey) {
        this.processing = true;
        await Contracts.validateClaim(claimKey);
        this.processing = false;
      },
      redeem: async function () {
        this.processing = true;
        await Contracts.redeem();
        this.processing = false;
      },
      getValidationClass(formName, fieldName) {
        const field = this.$v[formName][fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
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

  div.page .md-card.impact {
    min-height: 350px;
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

  .funding .md-title, .investing .md-title, .impact .md-title {
    color: white;
  }

  .impact .md-card-header-flex {
    background-color: #8A48DB;
  }

  .funding .md-card-header-flex {
    background-color: #21B7C5;
  }

  .investing .md-card-header-flex {
    background-color: #01C0EF;
  }

  .value-big {
    height: 100px;
    font-family: Avenir;
    font-size: 36px;
    text-align: center;
    padding-top: 50px;
    margin: 4px;
    border-bottom: 1px solid lightgray;
  }

  .value-subtitle {
    text-align: center;
    font-family: Avenir;
    font-size: 14px;
    color: gray;
  }

  .action-button {
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .impact .md-button.action-button.md-primary.md-theme-default {
    background-color: #8A48DB;
  }

  .funding .md-button.action-button.md-primary.md-theme-default {
    background-color: #21B7C5;
  }

  .investing .md-button.action-button.md-primary.md-theme-default {
    background-color: #01C0EF;
  }

  .md-app-content .md-card.investing, .md-app-content .md-card.funding, .md-app-content .md-card.impact {
    margin: 20px 10px 0 10px;
    height: 408px;
  }

  .md-tab {
    padding: 0;
  }

  .md-tabs-content {
    height: 450px !important;
  }

  .form-container {
    padding: 20px 20px 0 20px;
  }

  .description.md-card .text {
    font-size: 14px;
    height: auto;
    font-style: italic;
    color: gray;
    padding: 0 16px 16px 16px;
  }

  .description.md-card .md-subheader.md-theme-default {
    color: black;
    font-size: 14px;
    font-weight: bolder;
  }

  span.address-text {
    font-size: 11px;
    font-weight: bolder;
  }

</style>
