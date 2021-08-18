<template>
    <div>
        <p :ref="test(0)">Monday</p>
        <p ref="">Tuesday</p>
        <p ref="">Wednesday</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  setup() {
    const child = [ref()];

    onMounted(()=>{
      console.log(child[0].value);
    })

    const test = (v: number)=>{
      return child[v];
    }

    return {
      child,
      test
    }
  },
})
</script>
