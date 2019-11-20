import Vue from 'vue'
import Router from 'vue-router'
import Demo from '@/components/Demo'
import Creator from '@/components/Creator'
import Dashboard from '@/components/Dashboard'
import List from '@/components/List'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/creator',
      name: 'creator',
      component: Creator
    },
    {
      path: '/demo',
      name: 'Demo',
      component: Demo
    },
    {
      path: '/dashboard/:ida',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/list',
      name: 'List',
      component: List
    },

  ]
})
