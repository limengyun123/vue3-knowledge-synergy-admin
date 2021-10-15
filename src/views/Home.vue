<template>
  <div class="home">
    <p>
      <router-link to='/user/login'>登录</router-link> | 
      <router-link to='/user/register'>注册</router-link>
    </p>
    <p>
      <router-link to="/demo-infinite-scroll/oncereq">onceReq</router-link> |
      <router-link to="/demo-infinite-scroll/twicereq">twiceReq</router-link> | 
      <router-link to="/demo-infinite-scroll/parentcompo">parentCompo</router-link> | 
      <router-link to="/demo-infinite-scroll/selectall">parentSelectAll</router-link> | 
      <router-link to="/demo-infinite-scroll/massmemory">parentMassMemory</router-link> | 
      <router-link to="/demo-infinite-scroll/filter">filter</router-link> | 
      <router-link to="/demo-infinite-scroll/drag">drag</router-link> | 
      <router-link to="/demo-infinite-scroll/scrollto">scrollTo</router-link>
    </p>
    <p>
      <router-link to='/demo-antv/layout'>layout布局</router-link>
    </p>
    <p>
      <router-link to='/demo-ant-design/dropdown'>dropdown</router-link> | 
      <router-link to='/demo-ant-design/ref'>ref</router-link> | 
      <router-link to='/demo-ant-design/checkbox'>checkbox</router-link> | 
      <router-link to='/demo-ant-design/pagination'>pagination</router-link>
    </p>
    <p>
      <router-link to='/demo-vue3/setup'>setup</router-link> | 
      <router-link to='/demo-vue3/property'>property</router-link> | 
      <router-link to='/demo-vue3/asyncawait'>asyncAwait</router-link> | 
      <router-link to='/demo-vue3/repeatclick'>repeatClick</router-link> | 
      <router-link to='/demo-vue3/ruleparse'>ruleParse</router-link> | 
      <router-link to='/demo-vue3/rulejoin'>ruleJoin</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
// import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
// 
// @Options({
//   components: {
//     HelloWorld,
//   },
// })
export default class Home extends Vue {}
</script>
