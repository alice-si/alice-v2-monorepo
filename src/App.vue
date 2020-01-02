<template>
  <md-app id="app">
    <md-app-toolbar class="md-primary">
      <span class="md-title">{{$router.currentRoute.name == 'creator' ? 'Create a new IDA' : $router.currentRoute.name == 'List' ? 'Browse IDA\'s' : ida.name}}</span>
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
            md-label="Browse IDA's"
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
     </md-app-toolbar>

    <md-app-content>
      <div>
        <md-dialog :md-active.sync="show3Box">
          <md-app-toolbar class="md-primary">
            <span class="md-title">Connect to 3Box</span>
            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button md-dense md-primary" @click="show3Box = false">
                <md-icon>close</md-icon>
              </md-button>
            </div>

          </md-app-toolbar>

          <md-dialog-content>
            In order to create an IDA, you must first connect to the 3Box protocol in order to store this IDA's metadata
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
            Impact Delivery Agreements (IDA's) are a new primitive that turn the delivery of impact into transparent
            financial instruments. Think of them as bounty fundraising contracts with investable future cash flows.
            <br/><br/>

            Use IDA's to make promises about "impact" you aim to achieve, and raise funds that will be paid only if you deliver.
            To get money upfront, you can sell your payment rights to investors who will receive the IDA's future payments
            instead of you.
            <br/><br/>

            This dApp is built on the Alice protocol (www.alice.si), and is still in test mode. Please connect to
            Rinkeby or Skale and send feedback to IDA@alice.si or @alice_si_.
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

        <md-dialog :md-active.sync="showMobileScreen" style="width: 100%">
          <md-app-toolbar class="md-accent">
            <span class="md-title">
              <md-icon>warning</md-icon>
              Desktop only
            </span>


          </md-app-toolbar>

          <md-dialog-content style="font-size: 32px; line-height: 32px;">
            You can only access this dApp from a desktop computer for now. <br/>
            Apologies for the inconvenience.

          </md-dialog-content>

        </md-dialog>

        <router-view v-if="desktopScreen"></router-view>
      </div>
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
        ida: State.ida,
        desktopScreen: false,
        showMobileScreen: false
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

      if (screen.width <= 960) {
        that.showMobileScreen = true;
      } else {
        that.desktopScreen = true;
        EventBus.$on('3box-login', function () {
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

