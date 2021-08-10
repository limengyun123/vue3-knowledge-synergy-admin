<template>
  <div class="home">
    <router-link to='/user/login'>登录</router-link>
    <router-link to='/user/register'>注册</router-link>
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
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
