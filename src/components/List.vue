/* eslint-disable */
<template>
  <div class="page">

    <md-dialog :md-active.sync="loading" :md-click-outside-to-close="false">
      <md-dialog-title>Deploying the contract</md-dialog-title>

      <md-dialog-content style="text-align: center">


        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>

        <div >
          Please wait....
        </div>

      </md-dialog-content>
    </md-dialog>


    <div class="md-layout md-gutter">
      <md-table class="idas-table">
        <md-table-row>
          <md-table-head md-numeric>ID</md-table-head>
          <md-table-head>Name</md-table-head>
          <md-table-head>Address</md-table-head>
          <md-table-head>Promises number</md-table-head>
          <md-table-head>Promise price</md-table-head>
          <md-table-head>Details</md-table-head>
        </md-table-row>

        <md-table-row v-for="(ida, index) in allIdas" :key="ida.address">
          <md-table-cell md-numeric>{{index + 1}}</md-table-cell>
          <md-table-cell>{{ida.name}}</md-table-cell>
          <md-table-cell>{{ida.address}}</md-table-cell>
          <md-table-cell>{{ida.promisesNumber}}</md-table-cell>
          <md-table-cell>${{ida.promisePrice}}</md-table-cell>
          <md-table-cell>
            <router-link :to="'/dashboard/'+ida.address">
              <md-button class="md-icon-button">
                <md-icon>double_arrow</md-icon>
              </md-button>
            </router-link>
          </md-table-cell>
        </md-table-row>
      </md-table>

    </div>
  </div>
</template>

<script>
  import Contracts from '@/contracts'
  import State from '@/state'

  export default {
    name: 'List',
    data() {
      return {
        loading: false,
        showSidepanel: false,
        allIdas: State.allIdas,
        balance: State.balance,
        showFundPanel: false,
        fundingAmount: null
      }
    },
    beforeCreate: function () {
      Contracts.getAllIdas();
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
      fund: async function() {
        this.processing = true;
        await Contracts.fund(this.fundingAmount);
        this.processing = false;
        this.showFundPanel = false;
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

  .idas-table {
    width: 100%;
  }

  .md-table-cell-container {
    text-align: left;
  }



</style>
