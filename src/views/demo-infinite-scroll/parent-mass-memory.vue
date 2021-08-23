<template>
  <div style="width: 800; height: 700; overflow: auto;">
    <a-checkbox v-model:checked="checkAll" @change="onCheckAllChange" >全选</a-checkbox>
    <a-checkbox-group v-model:value="checkboxSelectedValues" >
      <children-compo ref="child" @checkBoxClick="handleCheckBoxClick" :reqData="reqData" :updateSelected="updateSelectedValues" :pageSize="pageSize" :slotHeight="30">
        <template v-slot:default="slotProps">
          <a-checkbox :value="slotProps.checkValue" style="height: 30px;">{{ slotProps.checkValue }}</a-checkbox>
        </template>
      </children-compo>
    </a-checkbox-group>
  </div> 
</template>

<script>

import { defineComponent, ref, nextTick } from 'vue';
import ChildrenCompo from './children-mass-memory.vue';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const testValue = require('../../assets/test.json');

export default defineComponent({
  components: {
    ChildrenCompo,
  },
  setup() {
    const pageNumber = 0;
    const pageSize = 30;

    const checkAll = ref(false);
    const checkboxSelectedValues = ref([]);
    let checkboxTrueValues = [];

    // const child = ref<HTMLElement>(null);
    const child = ref();

    let itemTotalNum = 263;

    const handleCheckBoxClick = (val)=>{
      if (val != undefined) {
        val = parseInt(val);
        const index = checkboxTrueValues.indexOf(val);
        if (index == -1) checkboxTrueValues.push(val);
        else checkboxTrueValues.splice(index, 1);
      }
    }

    const reqData = (pageN)=>{
      console.log('request', pageN);
      if(pageN==0 || pageN==1) 
        return Promise.resolve({
          total:itemTotalNum, 
          results: testValue.slice(Math.max(pageN*pageSize,0), Math.min((pageN+1)*pageSize, itemTotalNum))
        });
        
      return Math.random()>0.9?
        Promise.resolve({
          total:itemTotalNum, 
          results: testValue.slice(Math.max(pageN*pageSize,0), Math.min((pageN+1)*pageSize, itemTotalNum))
        })
      :
        Promise.reject();
    }

    const updateSelectedValues = ()=>{
      if(checkAll.value){
        checkboxSelectedValues.value = child.value.checkboxFixedValues.filter((v)=>{
          return checkboxTrueValues.indexOf(v)==-1;
        })
      }
      else{
        checkboxSelectedValues.value = [...checkboxTrueValues];
      }
      
    }

    const onCheckAllChange = (e)=>{
      checkAll.value = e.target.checked;
      checkboxTrueValues = [];
      console.log(e.target.checked);
      nextTick(()=>{
        if(e.target.checked){
          checkboxSelectedValues.value = [...child.value.checkboxFixedValues];
        }else
          checkboxSelectedValues.value = [];
      });
    }


    return {
      pageNumber,
      pageSize,
      checkAll,
      checkboxSelectedValues,
      child,
      handleCheckBoxClick,
      reqData,
      updateSelectedValues,
      onCheckAllChange,
    }
  }
});
</script>