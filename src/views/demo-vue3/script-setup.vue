
<template>
  <button @click="handleClick">
    Color is: {{ color }}
  </button>
</template>


<script setup>
import { ref } from 'vue'

const color = ref('red');
const handleClick = ()=>{color.value = color.value==='red'?'green':'red'}

</script>

<style scoped>
button {
  color: v-bind(color);
}
</style>