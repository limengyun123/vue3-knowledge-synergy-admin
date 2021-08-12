<template>
  <div class="home">
    <p>
      <router-link to='/user/login'>登录</router-link> | 
      <router-link to='/user/register'>注册</router-link>
    </p>
    <p>
      <router-link to="/demo/oncereq">onceReq</router-link> |
      <router-link to="/demo/twicereq">twiceReq</router-link>
      <router-link to="/demo/parentCompo">twiceReq</router-link>
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
