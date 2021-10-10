<template>
  <button @click="handleClick">click me</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const fetchDataSuccess = () => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              resolve('fetch data is me')
          }, 1000)
      })
    };

    const fetchDataFail = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('fetch data is me')
            }, 1000)
        })
    };


    const testFunc3 = async function(){
        const res = await fetchDataSuccess();
        alert('success!');
    };

    const testFunc4 = async function(){
        console.log('here');
        const res = await fetchDataFail();
        console.log('there');
        alert('fail!');
    };

    const handleClick = ()=>{

      testFunc3();
      testFunc4();
    };

    return {
      handleClick,
    }
  },
})
</script>
