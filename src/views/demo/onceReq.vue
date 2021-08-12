<template>
  <div style="padding: 20px 50px;">
    <div id='target-dom'>
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
let everyReqNum = 10;
let total = 111;

export default defineComponent({
  setup() {
    
    
    choices.value = getData(everyReqNum*2);

    onMounted(afterMounted);
    
    
    return {
      choices
    }
  }
})

function afterMounted(){
  targetDom = document.querySelector("#target-dom");
  targetTopDom = document.querySelector("#top-helper");
  // console.log(target-dom);
  
  addEvent(targetDom, 'mousewheel', handleScroll)
  addEvent(targetDom, 'DOMMouseScroll', handleScroll)

}

function handleScroll(e){
  let b = targetDom.scrollTop;

  if(e.deltaY>0 && ((pageNum+2)*everyReqNum)<total && b>=(pageNum*everyReqNum)*30 ){
    console.log('down', pageNum, b);
    if(pageNum>1){
      targetTopDom.style.height = (pageNum-1)*everyReqNum*30+'px';
      choices.value.splice(0, everyReqNum);
    }

    pageNum+=1;
    choices.value.splice(choices.value.length, 0, ...getData1(pageNum+1));
    
  }

  if(e.deltaY<0 && pageNum>1 && b<((pageNum-1)*everyReqNum)*30){
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
