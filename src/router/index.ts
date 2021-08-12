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
    path: "/demo-infinite-scroll",
    name: "DemoInfiniteScroll",
    component: () =>
      import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/index.vue"),
    redirect: "/demo-infinite-scroll/oncereq",
    children: [
      {
        path: "oncereq",
        name: "OnceReq",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/once-req.vue"),
      },
      {
        path: "twicereq",
        name: "TwiceReq",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/twice-req.vue"),
      },
      {
        path: "parentcompo",
        name: "ParentCompo",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/parent-component.vue"),
      },
    ],
  },
  {
    path: "/demo-antv",
    name: "DemoAntV",
    component: () =>
      import(/* webpackChunkName: "demo-antv" */ "../views/demo-antv/index.vue"),
    redirect: "/demo-antv/oncereq",
    children: [
      {
        path: "layout",
        name: "Layout",
        component: () =>
          import(/* webpackChunkName: "demo-antv" */ "../views/demo-antv/modify-layout.vue"),
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
