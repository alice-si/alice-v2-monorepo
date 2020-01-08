/* eslint-disable */
<template>
  <div class="page">

    <md-dialog :md-active.sync="deploying" :md-click-outside-to-close="false">
      <md-dialog-title>Deploying the contract</md-dialog-title>

      <md-dialog-content style="text-align: center">


        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>

        <div>
          Please wait....
        </div>

      </md-dialog-content>
    </md-dialog>

    <md-card class="card-center creator">
      <md-ripple>
        <md-card-header class="md-layout-item md-size-100">
          <md-card-header-text>
            <div class="md-title">Create IDA</div>
            <div class="md-subhead">
              Fill out this form to create an IDA. Being specific about promises will help you raise more funds.
              Remember to nominate a validator who will verify your promise fulfillment.
            </div>
          </md-card-header-text>

        </md-card-header>


        <md-card-content>
          <form novalidate>
            <div class="form">

            <div class="md-layout md-gutter">

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'name')">
                  <label>Project name</label>
                  <md-input name="name" v-model="idaForm.name"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.name.required">Please provide the name</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'projectDescription')">
                  <label>Project description</label>
                  <md-input v-model="idaForm.projectDescription"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.projectDescription.required">Please provide the description</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'organisationName')">
                  <label>Your name or organization name</label>
                  <md-input v-model="idaForm.organisationName"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.name.required">Please provide the name</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'organisationDescription')">
                  <label>Describe who you are</label>
                  <md-input v-model="idaForm.organisationDescription"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.organisationDescription.required">Please provide the description</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'outcomesNumber')">
                  <label>Number of promises</label>
                  <md-input v-model="idaForm.outcomesNumber"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.outcomesNumber.required">Please provide the number of promises</span>
                  <span class="md-error" v-if="!$v.idaForm.outcomesNumber.numeric">Please provide a valid number</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'promiseDescription')">
                  <label>Promise description</label>
                  <md-input v-model="idaForm.promiseDescription"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.promiseDescription.required">Please provide the promise description</span>
                </md-field>
              </div>


              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'outcomesPrice')">
                  <label>Price per promise</label>
                  <md-input v-model="idaForm.outcomesPrice"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.outcomesPrice.required">Please provide the price per promise</span>
                  <span class="md-error" v-if="$v.idaForm.outcomesPrice.required && !$v.idaForm.outcomesPrice.numeric">
                    Please provide a valid number
                  </span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'paymentToken')">
                  <label for="paymentToken">Payment Token</label>
                  <md-select v-model="idaForm.paymentToken" name="paymentToken" id="paymentToken">
                    <md-option v-for="(p, index) in paymentTokens" :value="p.address" :key="p.address">{{p.name}}
                    </md-option>
                  </md-select>
                  <span class="md-error" v-if="!$v.idaForm.paymentToken.required">Please provide the payment token</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'validatorName')">
                  <label>Validator Name and Description</label>
                  <md-input v-model="idaForm.validatorName"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.validatorName.required">Please provide the validator name</span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
                <md-field :class="getValidationClass('idaForm', 'validator')">
                  <label>Validator Ethereum Address</label>
                  <md-input v-model="idaForm.validator"></md-input>
                  <span class="md-error" v-if="!$v.idaForm.validator.required">Please provide the validator Ethereum address</span>
                  <span class="md-error" v-if="$v.idaForm.validator.required && !$v.idaForm.validator.ethAddress">
                    Please provide the valid Ethereum address
                  </span>
                </md-field>
              </div>

              <div class="md-layout-item md-size-50">
              <md-datepicker v-model="idaForm.endTime" :class="getValidationClass('idaForm', 'endTime')">
                <label>Project deadline</label>
                <span class="md-error" v-if="!$v.idaForm.endTime.required">Please provide the project deadline</span>
                <span class="md-error" v-if="$v.idaForm.endTime.required && !$v.idaForm.endTime.notInThePast">
                  The project deadline must be in the future
                </span>
              </md-datepicker>
              </div>


            </div>

          </div>
          </form>
        </md-card-content>


        <div class="button-box">
          <md-button class="md-primary create-if md-raised" @click="deployIda()">Deploy</md-button>
        </div>

      </md-ripple>
    </md-card>
  </div>
</template>

<script>
  import Contracts from '@/contracts'
  import State from '@/state'
  import {validationMixin} from 'vuelidate'
  import {
    required,
    numeric
  } from 'vuelidate/lib/validators'


  export default {
    name: 'Creator',
    mixins: [validationMixin],
    data() {
      return {
        validator: State.accounts.validator,
        funder: State.accounts.funder,
        investor: State.accounts.investor,
        ifu: State.accounts.ifu,
        escrow: State.accounts.escrow,
        main: State.accounts.main,
        impact: State.impact,
        paymentTokens: State.paymentTokens,
        showSidepanel: false,
        idaForm: {

        },
        deploying: false
      }
    },
    methods: {
      deployIda: async function () {
        this.$v.idaForm.$touch();
        if (!this.$v.idaForm.$invalid) {
          this.deploying = true;
          try {
            let idaAddress = await Contracts.deployIda(this.idaForm);
            this.$router.push({path: '/dashboard/' + idaAddress});
          } finally {
            this.deploying = false;
          }
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
    },
    validations: {
      idaForm: {
        name: {required},
        projectDescription: {required},
        organisationName: {required},
        organisationDescription: {required},
        outcomesNumber: {required, numeric},
        promiseDescription: {required},
        outcomesPrice: {required, numeric},
        paymentToken: {required},
        validatorName: {required},
        validator: {
          required,
          ethAddress: (value, model) => web3.isAddress(value)
        },
        endTime: {
          required,
          notInThePast: (value, model) => value >= new Date()
        },
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

  div.page {
    padding: 0 20px 0 20px;
    width: 100%;
    text-align: center;
  }

  .md-card.creator {
    width: 66% !important;
    display: inline-block;
    vertical-align: top;
  }

  .md-card.creator.card-center {
    margin: 0 auto;
  }

  .md-app-content .md-card {
    margin: 15px 0 15px 0;
  }

  .creator .md-card-actions {
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
    color: #616161;
  }

  .md-card.creator .md-subhead {
    font-size: 12px;
  }

  .card-icon {
    color: white;
  }

  .creator .md-card-content {
    width: 100%;
    padding: 0;
  }

  .creator .md-card-header+.md-card-content {

  }

  .creator .md-card-header {
    padding: 6px 16px 6px 16px;
  }

  .creator.md-subhead {
    font-size: 11px;
    height: 15px;
  }

  .create-if {
    background-color: #1cb8c4 !important;
    color: white;
  }

  .md-field {
    width: auto !important;
    margin: 10px !important;
  }

  .md-field label {
    font-size: 14px !important;
    margin: 0 !important;
    left: 0 !important;
  }

  .md-field .md-input {
    height: 28px !important;
    width: 100%;
  }

  .md-field.md-has-value .md-input {
    font-size: 12px !important;
  }

  .creator {
    padding: 0 20px 0 20px;
  }

  .button-box {
    padding-bottom: 10px;
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

  /* Date controls */
  .md-date-icon {
    display: none;
  }

  .md-field > .md-icon ~ .md-file, .md-field > .md-icon ~ .md-input, .md-field > .md-icon ~ .md-textarea {
    margin-left: 0;
  }

</style>
