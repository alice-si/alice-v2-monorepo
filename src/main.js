// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Web3 from 'web3'
import router from './router'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'

Vue.config.productionTip = false
Vue.use(VueMaterial)



window.addEventListener('load', function () {
  let host = window.location.hostname;
  let providerUrl =  (host === 'localhost') ? 'localhost:8545' : 'http://ganache.demo.alice.si:80';
  window.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  })
})

