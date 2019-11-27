<template>
  <div>
    <reactive-doughnut :chart-data="datacollection"></reactive-doughnut>
  </div>
</template>

<script>
  import ReactiveDoughnut from "../js/ReactiveDoughnut";

  export default {
    name: 'RatioChart',
    props: ['secondColor', 'values'],
    components: {
      ReactiveDoughnut
    },
    data () {
      return {
        datacollection: {}
      }
    },
    mounted () {
      this.fillData()
    },
    watch: {
      values: {
        deep: true,
        handler(newVal, oldVal) { // watch it
          this.fillData();
        }
      }
    },
    methods: {
      fillData () {
        this.datacollection = {
          labels: Object.keys(this.values),
          datasets: [
            {
              backgroundColor: ['#8A48DB', this.secondColor],
              data: Object.values(this.values)
            }
          ]
        }
      }
    }
  }
</script>
