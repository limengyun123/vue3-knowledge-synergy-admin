<template>
  <button @click="handleClick">点我</button>
  <div class="style1" ref="child1">
    <div class="style2" ref="child2"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const child1 = ref();
    const child2 = ref();
    let domHeight = 0;

    const handleClick = ()=>{
      console.log(child1.value);
      domHeight += 500;
      child1.value.scrollTo(0,domHeight);
      child2.value.style.height = 0;
    }

    return {
      child1,
      child2,
      handleClick
    }
  },
})
</script>

<style>
.style1{
  width: 400px;
  height: 500px;
  overflow: auto;
  background-color: aquamarine;
}

.style2{
  width: 300px;
  height: 2000px;
  margin: 50px;
  background-color: deeppink;
}

</style>
