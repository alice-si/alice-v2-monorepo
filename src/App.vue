<template>
  <md-app id="app">
    <md-app-toolbar class="md-primary">
      <span class="md-title">Impact Delivery Agreement</span>
      <div class="md-toolbar-section-end">
        <md-button style="color: white" @click="showLogs()">Show logs</md-button>
      </div>

      <div class="md-toolbar-row">

        <md-tabs class="md-primary" md-sync-route>
          <md-tab v-for="route in $router.options.routes"
                  :key="route.path"
                  v-if="route.path != '*'"
                  :to="route.path"

                  :md-label="route.name"
                  exact>

          </md-tab>
        </md-tabs>

      </div>
    </md-app-toolbar>

    <md-app-content>
      <router-view></router-view>
    </md-app-content>
  </md-app>
</template>



<script>
  import State from '@/state'

  export default {
    data() {
      return {
        // logs: State.logs,
        // showSidepanel: false
      }
    },
    methods: {
      showLogs: function() {
        console.log("Showing logs");
        State.logs.show = !State.logs.show;
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .md-app-content.md-theme-default {
    background-color: #F5F5F5;
  }

  .md-toolbar-row {
    width: auto;
  }


</style>

