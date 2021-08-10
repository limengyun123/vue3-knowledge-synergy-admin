<template>
  <div class="about">
    <div id='target-dom'>
      <div id='top-helper'></div>
      <div v-for="value in choices" :key="value" style="height: 30px">{{value}}</div>
      <div id='bottom-helper'></div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testValue = require('../assets/test.json');
let targetDom, targetTopDom, targetBottomDom;
const choices = ref([]);
let pageNum = 1;
let minCache = 20;
let everyReqNum = 40;

export default defineComponent({
  setup() {
    
    
    choices.value = getData(pageNum, minCache*3);

    onMounted(afterMounted);
    
    
    return {
      choices
    }
  }
})

function afterMounted(){
  targetDom = document.querySelector("#target-dom");
  targetTopDom = document.querySelector("#top-helper");
  targetBottomDom = document.querySelector("#bottom-helper");
  // console.log(target-dom);
  
  addEvent(targetDom, 'mousewheel', handleScroll)
  addEvent(targetDom, 'DOMMouseScroll', handleScroll)

}

function handleScroll(e){
  let a = targetDom.scrollHeight;
  let b = targetDom.scrollTop;
  let c = targetDom.clientHeight;

  if(e.deltaY>0 && b>=(pageNum*everyReqNum+minCache)*30){
    console.log(b)
    targetTopDom.style.height = pageNum*everyReqNum*30+'px';
    pageNum+=1;
    choices.value.splice(0, everyReqNum);
    choices.value.splice(choices.value.length, 0, ...getData1(pageNum));
    
  }

  if(e.deltaY<0 && b<((pageNum-1)*everyReqNum+minCache)*30 ){
    console.log(b)
    pageNum-=1;
    targetTopDom.style.height = (pageNum-1)*everyReqNum*30+'px';
    choices.value.splice(choices.value.length-everyReqNum, everyReqNum);
    choices.value.splice(0,0,...getData2(pageNum));
  }

  // console.log(a, b, c);
  // console.log(e);
}

function addEvent(obj, xEvent, fn){
  if(obj.attachEvent){
    obj.attachEvent('on'+xEvent, fn);
  }
  else{
    obj.addEventListener(xEvent, fn, false);
  }
}

function getData(pageN, minC=0){
  return testValue.slice((pageN-1)*everyReqNum, pageN*everyReqNum+minC);
}

function getData1(pageN){
  return testValue.slice((pageN-1)*everyReqNum+3*minCache, pageN*everyReqNum+3*minCache);
}

function getData2(pageN){
  return testValue.slice((pageN-1)*everyReqNum, pageN*everyReqNum);
}
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

#bottom-helper{
  width: 500px;
  background-color: pink
}
</style>
