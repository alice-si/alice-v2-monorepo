// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Web3 from 'web3'
import router from './router'
import VueMaterial from 'vue-material'
import VueGoogleCharts from 'vue-google-charts'

import 'vue-material/dist/vue-material.css'
import 'vue-material/dist/theme/default.css'

Vue.config.productionTip = false
Vue.use(VueMaterial)
Vue.use(VueGoogleCharts)


window.addEventListener('load', function () {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  })
})

