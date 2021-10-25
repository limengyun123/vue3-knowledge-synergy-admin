<template>
  <p>test router redirect</p>
  <router-view v-slot="{ Component }">
    <component :is="Component">
      <button @click="handleClick">点我(管理员可见)</button>
    </component>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const handleClick = ()=>{
      alert("clicked!");
    }
    return {
      handleClick
    }
  },
})
</script>
