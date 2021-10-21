<template>
  <div>
    <a-button @click="isRendered = !isRendered">销毁组件</a-button>
    <RuleExp v-if="isRendered" :returnOperate="returnChildOperate"></RuleExp>
    <a-button @click="generateRule">生成规则</a-button>
    <div>{{generatedRuleExp}}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, unref } from 'vue';
import RuleExp from './rule-join-exp.vue';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const tablesAndFields = require('../../assets/table.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ruleParsed = require('../../assets/rule-parsed.json');

type RuleAtomType = 'constant'|'relative'|'field'   // 常量、关系词、表列名
type RuleAtom = {
  type: RuleAtomType
  statement: string
  statementZH?: string
  tableBelonging?: string
}

type ruleExpressionType = 'similar'|'fieldExp'|'ml';
// type ruleExpression = {
//   type: ruleExpressionType
//   field1: string
//   field2: string | number
//   relative: string
//   model?: string
//   threshold?: number 
// }
type ruleExpression = {
  type: ruleExpressionType
  expItems: RuleAtom[]
}

export default defineComponent({
  components:{
    RuleExp
  },
  setup() {
    const generatedRuleExp = ref('');
    const generatedRuleWords = ref('');
    const tableNames: Ref<string[]> = ref(['table0', 'table1', 'table2']);
    
    const conditions: Ref<ruleExpression[]> = ref(ruleParsed.conditions);
    
    const results: Ref<ruleExpression[]> = ref(ruleParsed.results);

    const validateTableNames = ()=>{
      const selectedTables = unref(tableNames);
      const usedTables = extractTableFromExpression(unref(conditions)).concat(extractTableFromExpression(unref(results)));
      for(let item of usedTables){
        if(!selectedTables.indexOf(item)) return false;
      }
      return true;
    };

    const childOperations: any = [];

    const generateRule = ()=>{
      // generatedRuleExp.value = `${generateRuleTable(tableNames)} ^ ${joinRuleExpression(unref(conditions))} -> ${joinRuleExpression(unref(results))}`;
      childOperations.forEach((element: any) => {
        element.generateRule && (generatedRuleExp.value = element.generateRule());
      });
    };


    const returnChildOperate = (childOperate: any)=>{
      childOperations.push(childOperate);
    }

    const isRendered = ref(true);

    return {
      isRendered,
      tableNames,
      conditions,
      results,
      generateRule,
      generatedRuleExp,
      returnChildOperate
    }
  },
})

const extractTableFromExpression = (expressions: ruleExpression[]): string[]=>{
  
  return [];
}

const generateRuleTable = (tableNames: Ref<string[]>): string =>{
  return ""
}

const joinRuleExpression = (expressions: ruleExpression[]): string=>{
  return expressions.map((item)=>{
    return joinRuleItem(item.expItems);
  }).join(' ^ ');
}

const joinRuleItem = (ruleItem: RuleAtom[]): string=>{
  return ""
}

</script>
