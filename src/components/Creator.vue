/* eslint-disable */
<template>
  <div class="page">

    <md-dialog :md-active.sync="deploying" :md-click-outside-to-close="false">
      <md-dialog-title>Deploying the contract</md-dialog-title>

      <md-dialog-content style="text-align: center">


        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>

        <div >
          Please wait....
        </div>

      </md-dialog-content>
    </md-dialog>

    <md-card class="card-center creator">
      <md-ripple>

        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Create IDA</div>
            <div class="md-subhead">to automatically deploy a smart-contract</div>
          </md-card-header-text>

        </md-card-header>


        <md-card-content>
          <div class="form">

            <md-field>
              <label>Project name</label>
              <md-input v-model="newIda.name"></md-input>
            </md-field>

            <md-field>
              <label>Number of promises</label>
              <md-input v-model="newIda.outcomesNumber"></md-input>
            </md-field>

            <md-field>
              <label>Price per promise</label>
              <md-input v-model="newIda.outcomesPrice"></md-input>
            </md-field>

            <md-field>
              <label for="paymentToken">Payment Token</label>
              <md-select v-model="newIda.paymentToken" name="paymentToken" id="paymentToken">
                <md-option v-for="(p, index) in paymentTokens" :value="p.address" :key="p.address">{{p.name}}</md-option>
              </md-select>
            </md-field>

            <md-datepicker v-model="newIda.endTime">
              <label>Project deadline</label>
            </md-datepicker>

            <md-field>
              <label>Validator</label>
              <md-input v-model="newIda.validator"></md-input>
            </md-field>

          </div>
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

  export default {
    name: 'Creator',
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
        newIda: {
          validator: "0xcC554f8c7C2b49151AE0A81524c3434307dE33cC"
        },
        deploying: false
      }
    },
    beforeCreate: function () {
      Contracts.init()
    },
    methods: {
      deployIda: async function () {
        this.deploying = true;
        let idaAddress = await Contracts.deployIda(this.newIda);
        this.deploying = false;
        this.$router.push({path: '/dashboard/'+idaAddress});
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" >

  div.page {
    padding: 0 20px 0 20px;
    width: 100%;
    text-align: center;
  }

  .md-card.creator {
    width: 33% !important;
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
    padding: 10px 10px 0 10px !important;
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
  .md-field>.md-icon~.md-file, .md-field>.md-icon~.md-input, .md-field>.md-icon~.md-textarea {
    margin-left: 0;
  }



</style>
