<template>
  <div>
    <button @click="handleClick">{{tipAdmin?"已是管理员(点我清除管理员权限)":"不是管理员(点我添加管理员权限)"}}</button>
  </div>
  <div>
    <router-link to='/auth/router'>更换权限后点击此链接查看结果</router-link>
  </div>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {useRouter} from 'vue-router';

export default defineComponent({
  setup() {
    const tipAdmin = ref(!localStorage.getItem('admin'));
    const router = useRouter();

    const handleClick = ()=>{
      if(tipAdmin.value) localStorage.removeItem('admin');
      else localStorage.setItem('admin', 'true');
      tipAdmin.value = !tipAdmin.value
      router.push('/auth');
    };

    return {
      tipAdmin,
      handleClick
    }
  },
})
</script>
