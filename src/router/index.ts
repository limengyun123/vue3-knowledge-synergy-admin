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
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
