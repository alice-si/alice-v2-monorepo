<template>
  <md-app id="app">
    <md-app-toolbar class="md-primary">
      <span class="md-title">{{$router.currentRoute.name == 'creator' ? 'Create a new IDA' : ida.name}}</span>
      <md-button :href="'https://rinkeby.etherscan.io/address/'+ ida.address" target="_blank" style="padding-top: 5px;" v-if="ida.address">
        {{ida.address}}
        <md-icon style="font-size: 14px !important; padding-bottom: 4px;">open_in_new</md-icon>
      </md-button>
      <div class="md-toolbar-section-end">
        <!--<md-button style="color: white" @click="showLogs()">Show logs</md-button>-->



        <md-tabs class="md-primary" md-sync-route>
          <!--<md-tab v-for="route in $router.options.routes"-->
          <!--:key="route.path"-->
          <!--v-if="route.path != '*'"-->
          <!--:to="route.path"-->

          <!--:md-label="route.name"-->
          <!--exact>-->

          <!--</md-tab>-->
          <md-tab
            key="list"
            to="/list"
            md-label="Browse IDAs"
            exact>

          </md-tab>

          <md-tab
            key="creator"
            to="/creator"
            md-label="Create another IDA"
            exact>

          </md-tab>
        </md-tabs>

      </div>

      <div class="md-toolbar-row">



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
        ida: State.ida
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

  .md-toolbar.md-theme-default.md-primary {
    background-color: #8A48DB;
  }

  .md-tabs.md-theme-default.md-primary .md-tabs-navigation {
    background-color: #8A48DB;
  }


</style>

