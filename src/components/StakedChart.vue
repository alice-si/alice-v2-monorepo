<template>
  <div>
    <reactive-horizontal :chart-data="datacollection" :options="options" style="height: 100px;"></reactive-horizontal>
  </div>
</template>

<script>
  import ReactiveHorizontal from "../js/ReactiveHorizontal";

  export default {
    name: 'StakedChart',
    props: ['secondColor', 'values'],
    components: {
      ReactiveHorizontal
    },
    data() {
      return {
        datacollection: {},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          tooltips: {
            enabled: true,
            titleFontSize: 0,
            filter: function(item) {
              console.log(item);
              return item.datasetIndex !== 1;
            },
          },
          scales: {
            xAxes: [{
              ticks: {
                display: false,
                stepSize: 1
              },
              gridLines: {
                display: false,
                color: "#fff",
                zeroLineColor: "#fff",
                zeroLineWidth: 0
              },
              stacked: true
            }],
            yAxes: [{
              gridLines: {
                display: false,
                color: "#fff",
                zeroLineColor: "#fff",
                zeroLineWidth: 0
              },
              stacked: true
            }]
          },
          legend: {
            position: 'top',
            labels: {
              filter: function(item) {
                // Logic to remove a particular legend item goes here
                return !item.text.includes('GAP');
              }
            }
          }
        }
      }
    },
    mounted() {
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
      fillData() {
        let total = (parseInt(Object.values(this.values)[0]) + parseInt(Object.values(this.values)[1]));
        let gap = total / 40;
        this.datacollection = {
          datasets: [
            {
              label: Object.keys(this.values)[0],
              data: [Object.values(this.values)[0]],
              backgroundColor: "#8A48DB",
            },
            {
              label: 'GAP',
              data: [gap],
              backgroundColor: "#FFFFFF",
            },
            {
              label: Object.keys(this.values)[1],
              data: [Object.values(this.values)[1]],
              backgroundColor: "#00C0D1",
            }]
        };

      }
    }
  }
</script>
