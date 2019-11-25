/* eslint-disable */
<template>
  <div class="page">


    <md-button class="md-primary create-if md-raised" @click="deployIdaFactory()">Deploy Factory</md-button>


    <md-button class="md-primary create-if md-raised" @click="deployAliceUSD()">Deploy Alice USD</md-button>
  </div>
</template>

<script>
  import Contracts from '@/contracts'
  import State from '@/state'

  export default {
    name: 'Admin',
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

    methods: {
      deployIdaFactory: async function () {
        await Contracts.deployIdaFactory();
      },
      deployAliceUSD: async function () {
        await Contracts.deployAliceUSD();
      },
    },
    beforeCreate: function () {
      Contracts.init();
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  div.page {
    padding: 0 20px 0 20px;
    width: 100%;
    text-align: center;
  }

  .idas-table {
    width: 100%;
  }



</style>
