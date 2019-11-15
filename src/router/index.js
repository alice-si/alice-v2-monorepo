import Vue from 'vue'
import Router from 'vue-router'
import Demo from '@/components/Demo'
import Creator from '@/components/Creator'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'creator',
      component: Creator
    },
    {
      path: '/demo',
      name: 'Demo',
      component: Demo
    },

  ]
})
