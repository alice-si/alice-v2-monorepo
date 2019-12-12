<template>
  <md-app id="app">
    <md-app-toolbar class="md-primary">
      <span class="md-title">{{$router.currentRoute.name == 'creator' ? 'Create a new IDA' : $router.currentRoute.name == 'List' ? 'Browse IDAs' : ida.name}}</span>
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
            md-label="Create an IDA"
            exact>

          </md-tab>
        </md-tabs>

      </div>

      <div class="md-toolbar-row">



      </div>
    </md-app-toolbar>

    <md-app-content>

      <md-dialog :md-active.sync="show3Box">
        <md-app-toolbar class="md-primary">
          <span class="md-title">Connect to 3 Box</span>
          <div class="md-toolbar-section-end">
            <md-button class="md-icon-button md-dense md-primary" @click="show3Box = false">
              <md-icon>close</md-icon>
            </md-button>
          </div>

        </md-app-toolbar>

        <md-dialog-content>
          In order to create an IDA, you must first connect to the 3Box protocol in order to store this IDAs metadata
          (don't worry it's decentralized, secure and free).
        </md-dialog-content>

      </md-dialog>

      <md-dialog :md-active.sync="showWelcome">
        <md-app-toolbar class="md-primary">
          <span class="md-title">Welcome to the IDA dApp!</span>
          <div class="md-toolbar-section-end">
            <md-button class="md-icon-button md-dense md-primary" @click="showWelcome = false">
              <md-icon>close</md-icon>
            </md-button>
          </div>

        </md-app-toolbar>

        <md-dialog-content>
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
        </md-dialog-content>

      </md-dialog>

      <md-dialog :md-active.sync="showNoWeb3">
        <md-app-toolbar class="md-accent">
          <span class="md-title">
            <md-icon>warning</md-icon>
            Cannot connect to the Ethereum Blockchain
          </span>


        </md-app-toolbar>

        <md-dialog-content>
          Viewing this content requires using a Web3 browser such as Metamask.
          Please connect to the Rinkeby testnet.
          <br/><br/>
          Please refresh the window after setting up the Web3 plugin.

        </md-dialog-content>

      </md-dialog>

      <md-dialog :md-active.sync="showWrongNetwork">
        <md-app-toolbar class="md-accent">
          <span class="md-title">
            <md-icon>warning</md-icon>
            Cannot connect to the Rinkeby testnet
          </span>


        </md-app-toolbar>

        <md-dialog-content>
          Please make sure you are connecting to the Rinkeby testnet using your web3 browser.
          <br/><br/>
          Please refresh the window after updating the Web3 plugin.

        </md-dialog-content>

      </md-dialog>

      <router-view></router-view>
    </md-app-content>

  </md-app>
</template>



<script>
  import State from '@/state'
  import Contracts from '@/contracts'
  import { EventBus } from './event-bus.js';

  export default {
    data() {
      return {
        showWelcome: false,
        showNoWeb3: false,
        showWrongNetwork: false,
        show3Box: false,
        ida: State.ida
      }
    },
    methods: {
      showLogs: function() {
        console.log("Showing logs");
        State.logs.show = !State.logs.show;
      }
    },
    watch: {
      '$route' (to, from) {
        Contracts.init(to.params.ida, to.name === "creator");
      }
    },
    mounted: async function () {
      let that = this;

      EventBus.$on('3box-login', function() {
        that.show3Box = true;
      });

      try {
        await Contracts.setupNetwork();

        let idaAddress = that.$route.params.ida;
        Contracts.init(idaAddress, that.$route.name == "creator");
        that.showWelcome = true;
      } catch (err) {
          if (err === 'NO_WEB3') {
            that.showNoWeb3 = true;
          } else if (err === 'WRONG_NETWORK') {
            that.showWrongNetwork = true;
          }
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

  .md-dialog.md-theme-default {
    max-width: 768px;
    background-color: #f5f5f5;
  }
  .md-dialog-content {
    padding: 20px;
  }


</style>

