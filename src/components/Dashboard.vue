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

      <div class="text" v-if="ida.data">
        Please provide a short description that will allow <b>{{ida.data['validator-name']}}</b>
        to identify and validate the claim.
      </div>

      <form novalidate>
        <div class="form-container">
          <md-field :class="getValidationClass('validationForm', 'claimKey')">
            <label for="claimKey">Code</label>
            <md-input name="claimKey" id="claimKey" v-model="validationForm.claimKey"
                      :disabled="processing"/>
            <span class="md-error"
                  v-if="!$v.validationForm.claimKey.required">Please provide the claim key</span>
            <span class="md-error"
                  v-else-if="!$v.validationForm.claimKey.maxLength">The key cannot be longer than 32 characters</span>
            </md-field>
        </div>

        <md-button class="md-primary md-raised" @click="submitClaim()">Submit</md-button>

      </form>

    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showFundPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Fund Promises</span>
      </md-toolbar>

      <div class="text" v-if="ida.data">
        Fund the delivery of this IDA's promises. Your money will only be paid out each time <b>{{ida.data['organisation-name']}}</b>
        fulfils a promise, as validated by <b>{{ida.data['validator-name']}}</b>.
        If any money is still locked after <b>{{ida.endTime}}</b>, you will be able to reclaim your funds.
      </div>

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
        <span class="md-title">Create IDA investment market</span>
      </md-toolbar>

      <div class="text">
        Allow investors to buy a portion of your payment rights at a certain discount.
        This will allow you to get working capital upfront instead of waiting to be paid each time a promise is achieved.
      </div>

      <div class="form" v-if="ida.distributionUnlocked">

        <form novalidate>
          <div class="form-container">
            <md-field :class="getValidationClass('distributionForm', 'distributeDiscount')">
              <label for="distributeDiscount">Discount on unredeemed value (%)</label>
              <md-input name="distributeDiscount" id="distributeDiscount" v-model="distributionForm.distributeDiscount" :disabled="processing"/>
              <span class="md-error" v-if="!$v.distributionForm.distributeDiscount.required">Please provide the discount</span>
              <span class="md-error" v-else-if="!$v.distributionForm.distributeDiscount.maxValue">Max discount must be less than 100%</span>
              <span class="md-error" v-else-if="!$v.distributionForm.distributeDiscount.maxAvailable">You only have ${{balance.tokens}} tokens to invest</span>
            </md-field>

            <md-field :class="getValidationClass('distributionForm', 'distributeAmount')">
              <label for="distributeAmount">Amount</label>
              <md-input name="distributeAmount" id="distributeAmount" v-model="distributionForm.distributeAmount" :disabled="processing"/>
              <span class="md-error" v-if="!$v.distributionForm.distributeAmount.required">Please provide the amount to distribute</span>
              <span class="md-error" v-else-if="!$v.distributionForm.distributeAmount.maxValue">You can distribute up to {{ida.unsold}} tokens</span>
            </md-field>
          </div>
        </form>

        <md-button class="md-primary md-raised" @click="updateConditions()">Update conditions</md-button>
      </div>

      <div v-if="!ida.distributionUnlocked">
        <div class="unlock-info">Please enable investing by making a token allowance</div>
        <md-button @click="unlockDistribution()" class="md-icon-button md-raised md-accent">
          <md-icon>vpn_key</md-icon>
          <md-tooltip md-direction="right">Unlock access</md-tooltip>
        </md-button>
      </div>

    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showInvestPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Invest in this IDA</span>
      </md-toolbar>

      <div class="text" v-if="ida.data && ida.distributeAmount > 0">

        <b>{{ida.data['organisation-name']}}</b> is selling <b>{{ida.distributeAmount}}</b> payment rights tokens for <b>${{ida.distributePrice}}</b>
        which could be redeemed for <b>${{(ida.distributePrice * (100 / (100-ida.distributeDiscount))).toFixed(0)}}</b> if all of this IDA's promises are fulfilled. <br/><br/>

        This means that your maximum return on this investment is <b>{{(100 / (100-ida.distributeDiscount) * 100 - 100).toFixed(0)}}%</b>.
        You risk losing your investment if promises are not delivered or fully funded.

      </div>

      <div class="text" v-if="ida.data && ida.distributeAmount == 0">
        Unfortunately, <b>{{ida.data['organisation-name']}}</b> is not selling payment rights at the moment.
      </div>

      <div class="form" v-if="ida.investingUnlocked && ida.data && ida.distributeAmount > 0">

        <form novalidate>
          <div class="form-container">
            <md-field :class="getValidationClass('investmentForm', 'investmentAmount')">
              <label for="fundingAmount">Number of payment rights tokens to buy</label>
              <md-input name="investmentAmount" id="investmentAmount" v-model="investmentForm.investmentAmount"
                        :disabled="processing"/>
              <span class="md-error" v-if="!$v.investmentForm.investmentAmount.required">Please provide the amount to invest</span>
              <span class="md-error" v-else-if="!$v.investmentForm.investmentAmount.maxValue">You can buy up to {{ida.distributeAmount}} tokens</span>
              <span class="md-error" v-else-if="!$v.investmentForm.investmentAmount.maxAvailable">You only have ${{balance.tokens}} tokens to invest</span>
            </md-field>
            <div style="padding-top:10px">
            This will cost you ${{(investmentForm.investmentAmount * (ida.distributePrice/ida.distributeAmount)).toFixed(2)}}
            </div>
          </div>
        </form>

        <md-button class="md-primary md-raised" @click="invest()">Invest</md-button>
      </div>

      <div v-if="!ida.investingUnlocked">
        <div class="unlock-info">Please enable investing by making a token allowance</div>
        <md-button @click="unlockInvesting()" class="md-icon-button md-raised md-accent">
          <md-icon>vpn_key</md-icon>
          <md-tooltip md-direction="right">Unlock access</md-tooltip>
        </md-button>
      </div>

    </md-drawer>


    <div class="md-layout md-gutter">

      <div class="md-layout-item md-size-100">

        <md-card class="md-primary md-accent tokens-notification" v-if="ida.hasEnded">
          <md-card-header>
            <md-card-header-text>
              <div class="md-title">
                Funding and investment is closed as the project has already ended.
              </div>
            </md-card-header-text>
          </md-card-header>
        </md-card>

        <div v-else>

        <md-card class="md-primary md-accent tokens-notification" v-if="ida.isOwner">
          <md-card-header>
            <md-card-header-text>
              <div class="md-title">
                You are the creator of this IDA
                <md-button class="funds-button" @click="distribute()">Create IDA investment market</md-button>
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
                You currently don't have any tokens to fund or invest with
                <md-button class="funds-button" @click="getDemoTokens()">Get $1000 demo tokens</md-button>
              </div>
              <div class="md-title" v-else>
                You currently have <b>${{balance.tokens}}</b> to fund or invest with
                <md-button class="funds-button" @click="getDemoTokens()">Get $1000 more tokens</md-button>
              </div>

            </md-card-header-text>
          </md-card-header>
        </md-card>
        </div>
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
                <md-subheader>Creator</md-subheader>
                <div class="text">
                  {{ida.data['organisation-name']}} : {{ida.data['organisation-description']}}
                </div>
              </div>

              <div>
                <md-divider></md-divider>
                <md-subheader>Promises</md-subheader>
                <div class="text">
                  {{ida.data['promise-description']}}<br><br>
                  {{ida.promisesNumber}} promises at ${{ida.promisePrice}} each
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

          <md-tab id="tab-funding" :md-label="ida.isOwner? 'Collect Funds' : 'Fund Promises'" v-if="!ida.isValidator">
            <md-card class="funding">
              <md-ripple>

                <md-card-header>
                  <md-card-header-text>
                    <div class="md-title">{{ida.isOwner ? 'Collect Funds' : 'Fund Promises'}}</div>
                    <div class="md-subhead">
                      by {{ida.isOwner ? 'selling' : 'buying'}} this IDA's promise tokens
                      <md-button :href="'https://rinkeby.etherscan.io/token/'+ ida.promiseToken"
                                 target="_blank" class="md-icon-button token-button" >
                        <md-icon style="font-size: 16px !important; padding-bottom: 4px;">open_in_new</md-icon>
                        <md-tooltip md-direction="top">View on Etherscan</md-tooltip>
                      </md-button>

                      <md-button @click="watchToken(ida.promiseToken)" class="md-icon-button">
                        <md-icon>visibility</md-icon>
                        <md-tooltip md-direction="right">Watch on Metamask</md-tooltip>
                      </md-button>

                    </div>
                  </md-card-header-text>

                </md-card-header>


                <md-card-content style="text-align: left">

                  <div class="tab-desc" v-if="ida.isOwner">
                    Keep track of how much funding you have raised to deliver your impact here. <br/>
                    <a href="https://medium.com/@Raphalice/a-new-alice-is-coming-15dca7992469">Learn more</a> about IDAs and conditional impact payments.
                  </div>

                  <div class="tab-desc" v-else>
                    If you want to see this IDA’s impact happen, fund it here! <br/>
                    Your money will only be paid out if promises are fulfilled. <br/>
                    <a href="https://medium.com/@Raphalice/a-new-alice-is-coming-15dca7992469">Learn more</a>  about IDAs and conditional impact payments.
                  </div>



                  <div class="md-layout md-gutter">

                    <div class="md-layout-item md-size-33" v-if="!ida.isOwner">
                      <div class="value-big">${{balance.funded}}</div>
                      <div class="value-subtitle">funded by you</div>
                    </div>

                    <div class="md-layout-item md-size-33" v-if="ida.isOwner">

                    </div>

                    <div class="md-layout-item md-size-33">
                      <div class="value-big">${{balance.totalFunded}} / ${{ida.budget}}</div>
                      <div class="value-subtitle">total funded / cap</div>
                    </div>

                    <div class="md-layout-item md-size-33">
                      <ratio-chart second-color="#21B7C5" :values="fundingTotalChartData"></ratio-chart>
                    </div>

                  </div>
                </md-card-content>

                <div class="button-box" >
                  <md-button v-if="!ida.isOwner && !ida.hasEnded" class="md-primary action-button md-raised" @click="showFundPanel = true">Fund</md-button>
                  <md-button v-if="ida.hasEnded && balance.refundable > 0" class="md-primary action-button md-raised" @click="refund()">Refund ${{balance.refundable}}</md-button>

                </div>

              </md-ripple>
            </md-card>
          </md-tab>

          <md-tab id="tab-investing" :md-label="ida.isOwner ? 'Raise investment' : 'Invest in this IDA'" v-if="!ida.isValidator">
            <md-card class="investing">
              <md-ripple>

                <md-card-header>
                  <md-card-header-text>
                    <div class="md-title">{{ida.isOwner ? 'Raise investment' : 'Invest in this IDA'}}</div>
                    <div class="md-subhead">
                      by {{ida.isOwner ? 'selling' : 'buying'}} this IDA's payment rights tokens
                      <md-button :href="'https://rinkeby.etherscan.io/token/'+ ida.paymentRightsToken"
                                 target="_blank" class="md-icon-button token-button">
                        <md-icon style="font-size: 16px !important; padding-bottom: 4px;">open_in_new</md-icon>
                        <md-tooltip md-direction="top">View on Etherscan</md-tooltip>
                      </md-button>

                      <md-button @click="watchToken(ida.paymentRightsToken)" class="md-icon-button">
                        <md-icon>visibility</md-icon>
                        <md-tooltip md-direction="right">Watch on Metamask</md-tooltip>
                      </md-button>

                    </div>
                  </md-card-header-text>

                </md-card-header>


                <md-card-content style="text-align: left">

                  <div class="tab-desc" v-if="ida.isOwner">
                    You can sell this IDA’s future payments as an investment here.<br/>
                    <a href="https://medium.com/@Raphalice/a-new-alice-is-coming-15dca7992469">Learn more</a>  about IDA markets and fluid balance tokens.
                  </div>

                  <div class="tab-desc" v-else>
                    You can buy this IDA’s future payments as an investment here.<br/>
                    <a href="https://medium.com/@Raphalice/a-new-alice-is-coming-15dca7992469">Learn more</a>  about IDA markets and fluid balance tokens.
                  </div>

                  <div class="md-layout md-gutter">

                    <div class="md-layout-item md-size-50 tab-section" style="border-right: 1px solid black;">

                      <div class="tab-section-title">
                        Current investment market
                      </div>

                      <div class="tab-section-desc">
                        <b>{{ida.distributeAmount}}</b> Payment rights for sale <br/>
                        <span v-if="ida.isOwner">
                          <b>{{ida.distributeDiscount}}%</b>
                          Discount
                        </span>
                        <span v-else>
                          <b>{{(100 / (100-ida.distributeDiscount) * 100 - 100).toFixed(0)}}%</b>
                          Potential ROI
                        </span>

                        <md-icon class="question-icon">help
                          <md-tooltip md-direction="right" v-if="ida.isOwner">
                            Applied on the unredeemed value of PR tokens (redeemable + potential).
                          </md-tooltip>
                          <md-tooltip md-direction="right" v-else>
                            ROI is conditional on IDA's promises being funded and fulfilled.
                          </md-tooltip>
                        </md-icon>

                      </div>


                      <staked-chart v-if="ida.distributeAmount > 0" second-color="#01C0EF" :values="investingTotalChartData"></staked-chart>

                      <div v-if="!ida.hasEnded">
                        <div style="text-align: center; margin-top: 25px;">
                          <md-button class="md-primary md-raised action-button" @click="showDistributePanel = true" v-if="ida.isOwner">
                            {{ida.distributeAmount > 0 ? 'Update market conditions' : 'Create market'}}
                          </md-button>

                          <md-button class="md-primary md-raised action-button" @click="showInvestPanel = true" v-else>
                            Invest
                          </md-button>
                        </div>
                      </div>

                    </div>

                    <div class="md-layout-item md-size-50 tab-section" >

                      <div class="tab-section-title">
                        Your holdings
                        <md-icon class="question-icon">help
                          <md-tooltip md-direction="top">
                            PR tokens have a "fluid balance" of how much they can redeem from the IDA's escrowed funds.
                          </md-tooltip>
                        </md-icon>
                      </div>

                      <div class="tab-section-desc">
                        Payment rights you own: <b>{{balance.invested}}</b>
                      </div>

                      <ratio-chart v-if="balance.invested>0" second-color="#01C0EF" :values="fluidBalanceChartData"></ratio-chart>
                      <div style="text-align: center;">
                      <md-button class="md-primary md-raised action-button" v-if="balance.redeemable > 0" @click="redeem()">
                        Redeem ${{balance.redeemable | number('0.00')}}
                      </md-button>
                      </div>
                    </div>



                  </div>

                </md-card-content>

              </md-ripple>
            </md-card>
          </md-tab>

          <md-tab id="tab-impact" :md-label="ida.isOwner ? 'Report Impact' : ida.isValidator? 'Validate impact' : 'Track Impact'">
            <md-card class="impact">
              <md-ripple>

                <md-card-header>
                  <md-card-header-text>
                    <div class="md-title">{{ida.isOwner ? 'Report Impact' : ida.isValidator? 'Validate impact' : 'Track Impact'}}</div>
                  </md-card-header-text>

                </md-card-header>


                <md-card-content style="text-align: left">

                  <div class="tab-desc" v-if="ida.data">
                    {{ida.data['organisation-name']}} has fulfilled <b>{{ida.validatedNumber}}</b> promises, and <b>{{ida.pending}}</b> more are pending validation. <br/>
                    The deadline to fulfill the remaining  <b>{{ida.promisesNumber - ida.validatedNumber}}</b> promises is <b>{{ida.endTime}}</b>.
                  </div>


                  <md-table v-if="ida.claims && ida.claims.length > 0">
                    <md-table-row>
                      <md-table-head>Code</md-table-head>
                      <md-table-head>Submitted at</md-table-head>
                      <md-table-head>Validated at</md-table-head>
                      <md-table-head v-if="ida.isValidator">Validate</md-table-head>
                      <md-table-head v-else>Status</md-table-head>
                    </md-table-row>

                    <md-table-row v-for="(claim, index) in ida.claims" :key="claim.code">

                      <md-table-cell>{{claim.code}}</md-table-cell>
                      <md-table-cell>{{claim.submittedAt}}</md-table-cell>
                      <md-table-cell>
                        {{claim.validatedAt}}
                        <md-button :href="'https://rinkeby.etherscan.io/tx/'+ claim.validationTx"
                                   target="_blank" class="md-icon-button" style="height:20px;"
                                   v-if="claim.validationTx">
                          <md-icon style="font-size: 16px !important; padding-bottom: 4px;">open_in_new</md-icon>
                          <md-tooltip md-direction="top">View on Etherscan</md-tooltip>
                        </md-button>
                      </md-table-cell>
                      <md-table-cell>
                        <md-button @click="validateClaim(claim.code)"
                                   class="md-icon-button md-raised md-dense md-accent"
                                   :disabled="!ida.isValidator || claim.isValidated || ida.hasEnded">
                          <md-icon v-if="claim.isValidated || ida.isValidator">done</md-icon>
                          <md-icon v-if="!claim.isValidated && !ida.isValidator">hourglass_empty</md-icon>
                          <md-tooltip md-direction="right">Validate claim</md-tooltip>
                        </md-button>
                      </md-table-cell>
                    </md-table-row>
                  </md-table>

                  <div class="button-box" v-if="ida.isOwner && !ida.hasEnded">
                    <md-button class="md-primary action-button md-raised" @click="showClaimPanel = true">Submit Claim
                    </md-button>
                  </div>

                </md-card-content>

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
  import StakedChart from './StakedChart'
  import {validationMixin} from 'vuelidate'
  import {
    required,
    maxLength
  } from 'vuelidate/lib/validators'

  export default {
    name: 'Dashboard',
    mixins: [validationMixin],
    components: {RatioChart, StakedChart},
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
        distributionForm: {
          distributeAmount: State.ida.distributeAmount,
          distributeDiscount: State.ida.distributeDiscount,
        },
        showInvestPanel: false,
        investmentForm: {
          investmentAmount: null
        },
        showClaimPanel: false,
        validationForm: {
          claimKey: null
        },
        investingChartData: State.investingChartData,
        fundingChartData: State.fundingChartData,
        investingTotalChartData: State.investingTotalChartData,
        fundingTotalChartData: State.fundingTotalChartData,
        fluidBalanceChartData: State.fluidBalanceChartData
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
          maxValue: (value, model) => parseFloat(value) <= parseFloat(State.ida.distributeAmount),
          maxAvailable: (value, model) => parseFloat(value * (State.ida.distributePrice/State.ida.distributeAmount)) <= parseFloat(State.balance.tokens)
        }
      },
      distributionForm: {
        distributeAmount: {
          required,
          maxValue: (value, model) => parseFloat(value) <= parseFloat(State.ida.unsold),
        },
        distributeDiscount: {
          required,
          maxValue: (value, model) => value > 0 && value < 100
        }
      },
      validationForm: {
        claimKey: {
          required,
          maxLength: maxLength(32),
        }
      }

    },
    methods: {
      getDemoTokens: async function () {
        this.processing = true;
        try {
          await Contracts.getDemoTokens();
        } finally {
          this.processing = false;
        }
      },
      unlockFunding: async function () {
        this.processing = true;
        try {
          await Contracts.unlockFunding();
        } finally {
          this.processing = false;
        }
      },
      unlockInvesting: async function () {
        this.processing = true;
        try {
          await Contracts.unlockInvesting();
        } finally {
          this.processing = false;
        }
      },
      unlockDistribution: async function () {
        this.processing = true;
        try {
          await Contracts.unlockDistribution();
        } finally {
          this.processing = false;
        }
      },
      fund: async function () {
        this.$v.fundingForm.$touch()
        if (!this.$v.fundingForm.$invalid) {
          this.processing = true;
          try {
            await Contracts.fund(this.fundingForm.fundingAmount);
            this.showFundPanel = false;
          } finally {
            this.processing = false;
          }
        }
      },
      distribute: async function () {
        this.showDistributePanel = true;
      },
      updateConditions: async function () {
        this.$v.distributionForm.$touch()
        if (!this.$v.distributionForm.$invalid) {
          this.processing = true;
          try {
            await Contracts.updateConditions(this.distributionForm.distributeAmount, this.distributionForm.distributeDiscount);
            this.showDistributePanel = false;
          } finally {
            this.processing = false;
          }
        }
      },
      invest: async function () {
        this.$v.investmentForm.$touch();
        if (!this.$v.investmentForm.$invalid) {
          this.processing = true;
          try {
            await Contracts.invest(this.investmentForm.investmentAmount);
            this.showInvestPanel = false;
          } finally {
            this.processing = false;
          }
        }
      },
      refund: async function () {
          this.processing = true;
          try {
            await Contracts.refund();
          } finally {
            this.processing = false;
          }
      },
      submitClaim: async function () {
        this.$v.validationForm.$touch();
        if (!this.$v.validationForm.$invalid) {
          this.processing = true;
          try {
            await Contracts.submitClaim(this.validationForm.claimKey);
            this.showClaimPanel = false;
          } finally {
            this.processing = false;
          }
        }
      },
      validateClaim: async function (claimKey) {
        this.processing = true;
        try {
          await Contracts.validateClaim(claimKey);
        } finally {
          this.processing = false;
        }
      },
      redeem: async function () {
        this.processing = true;
        try {
          await Contracts.redeem();
        } finally {
          this.processing = false;
        }
      },
      getValidationClass(formName, fieldName) {
        const field = this.$v[formName][fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },
      watchToken: function(token) {
        console.log("Watching: " + token);
        try {
          web3.currentProvider.sendAsync({
            method: 'wallet_watchAsset',
            params: {
              'type': 'ERC20',
              'options': {
                'address': token,
                'symbol': 'IDA',
                'decimals': 18,
                'image': 'https://s3.eu-west-2.amazonaws.com/alice-res/favicon.ico',
              },
            },
            id: Math.round(Math.random() * 100000),
          }, (err, data) => {
            if (!err) {
              if (data.result) {
                console.log('Token added');
              } else {
                console.log(data);
                console.log('Some error');
              }
            } else {
              console.log(err.message);
            }
          });
        } catch (e) {
          console.log(e);
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
    font-size: 28px;
    text-align: center;
    padding-top: 65px;
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
    min-height: 408px;
  }

  .md-tab {
    padding: 0;
  }

  .form-container {
    padding: 20px 20px 0 20px;
  }

  .description.md-card .text, .text {
    font-size: 14px;
    height: auto;
    font-style: italic;
    color: gray;
    padding: 0 16px 16px 16px;
  }

  .md-drawer .text {
    padding-top: 16px;
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

  .investing .md-subhead, .funding .md-subhead {
    color: white;
    margin-bottom: 5px;
    opacity: 1;
  }

  .token-button {
    margin-left: -5px !important;
    padding-top:3px;
  }

  .token-button .md-icon.md-theme-default {
    color: white !important;
  }

  .md-subhead .md-button.md-icon-button.md-theme-default {
    font-size: 12px;
    height: 20px;
    margin-left: -16px;
  }

  .md-subhead .md-button .md-icon {
    color: white !important;
  }

  div.button-box {
    text-align: center;
  }

  div.tab-desc {
    text-align: center;
    color: #898989;
    font-style: italic;
  }

  div.tab-section-title {
    font-weight: bolder;
    font-size: 16px;
  }

  div.tab-section-desc {
    margin: 20px 0 20px 0;
    color: #898989;
    font-size: 16px;
  }

  .tab-section {
    margin-top: 20px;
    padding-left: 10% !important;
    padding-right: 10% !important;
    margin-bottom: 20px;
  }

  .tab-section .action-button {
    margin-bottom: 0px;
  }

  .question-icon {
    font-size: 12px !important;
    margin-top: -8px;
    margin-left: -8px;
    color: #898989;
    font-weight: normal;
  }

</style>
