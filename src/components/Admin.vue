/* eslint-disable */
<template>
  <div class="page">


    <md-button class="md-primary create-if md-raised" @click="deployIdaFactory()">Deploy Factory</md-button>


    <md-button class="md-primary create-if md-raised" @click="deployAliceUSD()">Deploy Alice USD</md-button>

    <md-button class="md-primary create-if md-raised" @click="test()">Test</md-button>

    {{chartData}}
    <div>
    <div style="width: 200px; height: 200px; margin: auto;">
      <ratio-chart second-color="#01C0EF" :values="chartData"></ratio-chart>
    </div>
    </div>
  </div>
</template>

<script>
  import Contracts from '@/contracts'
  import RatioChart from './RatioChart'
  import State from '@/state'

  export default {
    components: {RatioChart},
    name: 'Admin',
    data() {
      return {
        chartData: State.investedChart
      }
    },
    methods: {
      deployIdaFactory: async function () {
        await Contracts.deployIdaFactory();
      },
      deployAliceUSD: async function () {
        await Contracts.deployAliceUSD();
      }
    },
    beforeCreate: function () {
      Contracts.init();
    },
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



</style>
