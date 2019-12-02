<template>
  <md-app id="app">
    <md-app-toolbar class="md-primary">
      <span class="md-title">{{$router.currentRoute.name == 'creator' ? 'Create a new IDA' : $router.currentRoute.name == 'List' ? 'Browse Idas' : ida.name}}</span>
      <md-button :href="'https://rinkeby.etherscan.io/address/'+ ida.address" target="_blank" style="padding-top: 5px;"
                 v-if="$router.currentRoute.name == 'Dashboard' && ida.address">
        {{ida.address}}
        <md-icon style="font-size: 14px !important; padding-bottom: 4px;">open_in_new</md-icon>
      </md-button>
      <div class="md-toolbar-section-end">
        <!--<md-button style="color: white" @click="showLogs()">Show logs</md-button>-->



        <md-tabs class="md-primary" md-sync-route>
          <md-tab
            key="list"
            to="/"
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
      <md-dialog :md-active.sync="showDialog">
        <md-dialog-title>Welcome to the IDA dApp!</md-dialog-title>

        Impact Delivery Agreements (IDAs) are a new primitive that turn the delivery of impact into
        a transparent financial instrument. Think of them as investable bounty contracts.
        <br/><br/>

        IDAs allow you to make promises about actions you aim to achieve, and raise funds that will be paid only
        if you actually achieve them. If you need money upfront to get started, you can sell your payment rights
        as an investment, meaning that investors will receive the IDA's unlocked funds instead of you.
        IDAs are essentially cashflow financing tools for the delivery of impact (in its broadest possible sense).
        <br/><br/>

        This dApp is built on the Alice protocol (www.alice.si), and is still in test mode.
        Please make sure you're connected to Rinkeby or our Skale endpoint: [endpoint].
        We'd appreciate it if you could send your feedback to IDA@alice.si.
        Ask us anything via Twitter: @alice_si_



        <md-dialog-actions>
          <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        </md-dialog-actions>
      </md-dialog>

      <router-view></router-view>
    </md-app-content>

  </md-app>
</template>



<script>
  import State from '@/state'

  export default {
    data() {
      return {
        showDialog: false,
        ida: State.ida
      }
    },
    methods: {
      showLogs: function() {
        console.log("Showing logs");
        State.logs.show = !State.logs.show;
      }
    },
    mounted: function () {
      console.log("SHOWTIME");
      this.showDialog = true;
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

  .md-dialog {
    max-width: 768px;
    padding: 0 20px 20px 20px;
  }

  .md-dialog-title {
    text-align: center;
  }


</style>

