<template>
  <div>
    <reactive-doughnut :chart-data="datacollection" :options="options" style="height: 150px;"></reactive-doughnut>
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
        datacollection: {},
        options: {
          legend: {
            position: 'right'
          },
          responsive: true,
          maintainAspectRatio: false,
        }
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
              backgroundColor: ['#8A48DB', this.secondColor, '#00C0D1'],
              data: Object.values(this.values)
            }
          ]
        }
      }
    }
  }
</script>
