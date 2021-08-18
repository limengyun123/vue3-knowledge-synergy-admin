<template>
  <div style="padding: 20px 50px;">
    <div id='target-dom' :onscroll="handleScroll">
      <div id='top-helper'></div>
      <div v-for="value in choices" :key="value" style="height: 30px">{{value}}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testValue = require('../../assets/test.json');
let targetDom, targetTopDom;
const choices = ref([]);
let pageNum = 0;
let everyReqNum = 20;
let total = 111;
let originScrollTop = 0;

export default defineComponent({
  setup() {
    
    
    choices.value = getData(everyReqNum*2);

    onMounted(afterMounted);
    
    
    return {
      choices,
      handleScroll
    }
  }
})

function afterMounted(){
  targetDom = document.querySelector("#target-dom");
  targetTopDom = document.querySelector("#top-helper");

}

function handleScroll(){
  // console.log('here', e, targetDom.scrollTop);
  let b = targetDom.scrollTop;

  if(b>originScrollTop && ((pageNum+2)*everyReqNum)<total && b>=(pageNum*everyReqNum)*30 ){
    console.log('down', pageNum, b);
    if(pageNum>1){
      targetTopDom.style.height = (pageNum-1)*everyReqNum*30+'px';
      choices.value.splice(0, everyReqNum);
    }

    pageNum+=1;
    choices.value.splice(choices.value.length, 0, ...getData1(pageNum+1));
    
  }

  if(b<originScrollTop && pageNum>1 && b<((pageNum-1)*everyReqNum)*30){
    console.log('up', pageNum, b);

    if(pageNum>2){
      targetTopDom.style.height = ((pageNum-3)*everyReqNum)*30+'px';
      choices.value.splice(0,0,...getData1(pageNum-3));
      choices.value.splice(4*everyReqNum, everyReqNum);
    }
    else{
      choices.value.splice(3*everyReqNum, everyReqNum);
    }

    pageNum-=1;
  }

  originScrollTop = b;

}



function getData(num=0){
  return testValue.slice(0, num);
}

function getData1(pageN){
  return testValue.slice(Math.max(pageN*everyReqNum,0), Math.min((pageN+1)*everyReqNum, total));
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
