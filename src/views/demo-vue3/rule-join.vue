<template>
  <h3>Hello, world!</h3>
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
    return {

    }
  },
})
</script>
