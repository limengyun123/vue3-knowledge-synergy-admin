<template>
  <button @click="onThemeChange">change theme</button>
  <div ref='div1' class="style1">
    <div class='style2'>
    </div>
  </div>
</template>

<script lang="ts" setup>import { ref } from "vue";

  const div1 = ref(null);

  const onThemeChange = ()=>{
    if(div1.value.getAttribute('theme')){
      div1.value.setAttribute('theme', '');
      return ;
    }
    div1.value.setAttribute('theme', 'dark');
  }

</script>

<style>
[theme='dark'] .style1{
  width: 300px;
  height: 300px;
  background-color: #111111;
}

/* .style1[theme='dark']{
  width: 300px;
  height: 300px;
  background-color: #111111;
} */

[theme='dark'] .style2{
  width: 200px;
  height: 200px;
  background-color: #222222;
}

.style1{
  width: 300px;
  height: 300px;
  background-color: #dddddd;
}

.style2{
  width: 200px;
  height: 200px;
  background-color: #eeeeee;
}
</style>