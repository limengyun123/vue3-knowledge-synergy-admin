<template>
  <h3>Hello, world!</h3>
  <div>
    <div>选择表格范围</div>
    <div>
      <a-tag closable @close="log">Prevent Default</a-tag>
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tablesAndFields = require('../../assets/table.json');

type ruleExpressionType = 'similar'|'fieldExp'|'ml';
type ruleExpression = {
  type: ruleExpressionType
  field1: string
  field2: string | number
  model?: string
  threshold?: number 
}

export default defineComponent({
  setup() {
    const tableNames = Object.keys(tablesAndFields);
    console.log(tableNames);

    const condition = ref([]), result = ref([]);
    const log = ()=>{console.log(Date.now())}
    return {
      condition,
      result,
      log
    }
  },
})
</script>
