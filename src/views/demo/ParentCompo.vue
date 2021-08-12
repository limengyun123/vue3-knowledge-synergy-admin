<template>
  <div style="width: 800; height: 700; overflow: auto;">
    <a-checkbox-group v-model:value="checkboxSelectedValues" >
      <children-compo @checkBoxClick="handleCheckBoxClick" :reqData="reqData" :updateSelected="updateSelectedValues" :pageSize="pageSize" :slotHeight="30">
        <template v-slot:default="slotProps">
          <a-checkbox :value="slotProps.checkValue" style="height: 30px;">{{ slotProps.checkValue }}</a-checkbox>
        </template>
      </children-compo>
    </a-checkbox-group>
  </div> 
</template>

<script>

import { defineComponent, ref } from 'vue';
import ChildrenCompo from './ChildrenCompo.vue';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const testValue = require('../../assets/test.json');

export default defineComponent({
  components: {
    ChildrenCompo,
  },
  setup() {
    const pageNumber = 0;
    const pageSize = 20;
    const checkboxSelectedValues = ref([]);
    const checkboxTrueValues = [];

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
      return {
        total:itemTotalNum, 
        results: testValue.slice(Math.max(pageN*pageSize,0), Math.min((pageN+1)*pageSize, itemTotalNum))
      };
    }

    const updateSelectedValues = ()=>{
      console.log("here");
      checkboxSelectedValues.value = [...checkboxTrueValues];
    }


    return {
      pageNumber,
      pageSize,
      checkboxSelectedValues,
      handleCheckBoxClick,
      reqData,
      updateSelectedValues
    }
  }
});
</script>