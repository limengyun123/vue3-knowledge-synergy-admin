import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/user',
    name: 'User',
    component: () => import(/* webpackChunkName: "user" */ '../views/user/index.vue'),
    redirect: '/user/login',
    children:[
      {
        path: 'login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "user" */ '../views/user/login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import(/* webpackChunkName: "user" */ '../views/user/register.vue')
      }
    ]
  },
  {
    path: '/demo/oncereq',
    name: 'onceReq',
    component: () => import(/* webpackChunkName: "demo" */ '../views/demo/onceReq.vue')
  },
  {
    path: '/demo/twicereq',
    name: 'twiceReq',
    component: () => import(/* webpackChunkName: "demo" */ '../views/demo/twiceReq.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
