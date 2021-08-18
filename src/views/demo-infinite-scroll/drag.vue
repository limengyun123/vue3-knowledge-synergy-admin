<template>
  <div style="padding: 20px 50px;">
    <div id='target-dom' :onscroll="handleScroll">
      <div id='top-helper'></div>
      <div v-for="value in choices" :key="value" style="height: 30px">{{value}}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testValue = require('../../assets/test.json');
const choices = ref(testValue);


export default defineComponent({
  setup() {

    const handleScroll = (e)=>{
      console.log(e);
    }
    
    
    return {
      choices,
      handleScroll
    }
  }
})


</script>

<style>
#target-dom{
  width: 600px;
  height: 500px;
  background-color: lightgreen;
  overflow: auto;
}

#top-helper{
  width: 500px;
  background-color: lightblue
}

</style>
