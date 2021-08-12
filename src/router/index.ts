import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/user",
    name: "User",
    component: () =>
      import(/* webpackChunkName: "user" */ "../views/user/index.vue"),
    redirect: "/user/login",
    children: [
      {
        path: "login",
        name: "Login",
        component: () =>
          import(/* webpackChunkName: "user" */ "../views/user/login.vue"),
      },
      {
        path: "register",
        name: "Register",
        component: () =>
          import(/* webpackChunkName: "user" */ "../views/user/register.vue"),
      },
    ],
  },
  {
    path: "/demo",
    name: "User",
    component: () =>
      import(/* webpackChunkName: "demo" */ "../views/demo/index.vue"),
    redirect: "/demo/oncereq",
    children: [
      {
        path: "oncereq",
        name: "OnceReq",
        component: () =>
          import(/* webpackChunkName: "demo" */ "../views/demo/OnceReq.vue"),
      },
      {
        path: "twicereq",
        name: "TwiceReq",
        component: () =>
          import(/* webpackChunkName: "demo" */ "../views/demo/TwiceReq.vue"),
      },
      {
        path: "parentcompo",
        name: "ParentCompo",
        component: () =>
          import(/* webpackChunkName: "demo" */ "../views/demo/ParentCompo.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
