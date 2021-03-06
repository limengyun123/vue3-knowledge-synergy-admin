import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Admin from "@/views/auth/admin-compo.vue";
import NonAdmin from "@/views/auth/non-admin-compo.vue";

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
      {
        path: "selectall",
        name: "SelectAll",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/parent-select-all.vue"),
      },
      {
        path: "massmemory",
        name: "MassMemory",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/parent-mass-memory.vue"),
      },
      {
        path: "filter",
        name: "Filter",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/filter-parent.vue"),
      },
      {
        path: "drag",
        name: "Drag",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/drop.vue"),
      },
      {
        path: "scrollto",
        name: "ScrollTo",
        component: () =>
          import(/* webpackChunkName: "demo-infinite-scroll" */ "../views/demo-infinite-scroll/scroll-to.vue"),
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
      }
    ]
  },
  {
    path: "/demo-ant-design",
    name: "DemoAntDesign",
    component: () =>
      import(/* webpackChunkName: "demo-ant-design" */ "../views/demo-antv/index.vue"),
    redirect: "/demo-ant-design/dropdown",
    children: [
      {
        path: "dropdown",
        name: "Dropdown",
        component: () =>
          import(/* webpackChunkName: "demo-ant-design" */ "../views/demo-ant-design/table-dropdown.vue"),
      },
      {
        path: "ref",
        name: "Ref",
        component: () =>
          import(/* webpackChunkName: "demo-ant-design" */ "../views/demo-ant-design/variable-ref.vue"),
      },
      {
        path: "checkbox",
        name: "Checkbox",
        component: () =>
          import(/* webpackChunkName: "demo-ant-design" */ "../views/demo-ant-design/checkbox.vue"),
      },
      {
        path: "pagination",
        name: "Pagination",
        component: () =>
          import(/* webpackChunkName: "demo-ant-design" */ "../views/demo-ant-design/pagination.vue"),
      }
    ]
  },
  {
    path: "/demo-vue3",
    name: "DemoVue3",
    component: () =>
      import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/index.vue"),
    redirect: "/demo-vue3/setup",
    children: [
      {
        path: "setup",
        name: "Setup",
        component: () =>
          import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/script-setup.vue"),
      },
      {
        path: "property",
        name: "Property",
        component: () =>
          import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/property-choose.vue"),
      },
      {
        path: "asyncawait",
        name: "AsyncAwait",
        component: () =>
          import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/async-await.vue"),
      },
      {
        path: "repeatclick",
        name: "RepeatClick",
        component: () =>
          import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/repeat-click.vue"),
      },
      {
        path: "ruleparse",
        name: "RuleParse",
        component: () =>
          import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/rule-parse.vue"),
      },
      {
        path: "rulejoin",
        name: "RuleJoin",
        component: () =>
          import(/* webpackChunkName: "demo-vue3" */ "../views/demo-vue3/rule-join.vue"),
      },
    ]
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import(/* webpackChunkName: "auth" */ "../views/auth/index.vue"),
    children: [
      {
        path: "router",
        name: "Router",
        meta: { splitByAuth: true },  // ????????????requireAuth?????????????????????
        component: () => import(/* webpackChunkName: "auth" */ "../views/auth/router.vue"),
        children: [
          {
            path: ":",
            component: NonAdmin
          }
        ]
      },
    ]
  },
  {
    path: "/origin",
    name: "Origin",
    component: () => import(/* webpackChunkName: "origin" */ "../views/origin/index.vue"),
    children: [
      {
        path: "file",
        name: "File",
        component: () => import(/* webpackChunkName: "origin" */ "../views/origin/file.vue")
      },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});


router.beforeEach((to, from, next) => {
  console.log(to, from, next);
  if(to.meta.splitByAuth){
    const isAdmin = localStorage.getItem('admin');

    if(isAdmin)to.matched[to.matched.length-1].components.default = Admin;
    else to.matched[to.matched.length-1].components.default = NonAdmin;

    next();
  }
  else next();
});

export default router;
