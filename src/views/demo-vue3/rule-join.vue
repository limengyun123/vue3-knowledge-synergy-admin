<template>
  <div style="text-align: left; margin: 50px">
    <div>
      <a-button @click="addRuleExp">添加组件</a-button>
    </div>
    <div v-for="expId in ruleExpressions" :key="expId">
      <RuleExp :expId="expId" :returnOperate="returnChildOperate" @deleteRuleExp="deleteRuleExp"></RuleExp>
    </div>
    <a-button @click="generateRule">生成规则</a-button>
    <div>
      <h3>规则语句：{{ruleStmtGenerated}}</h3>
      <h3>文字表示：{{ruleWordsGenerated}}</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import RuleExp from './rule-join-exp.vue';
import {ChildOperation, ruleStatWords} from './rule-join-exp.vue';

export default defineComponent({
  components:{
    RuleExp
  },
  setup() {
    const ruleExpControl = useRuleExpression();
    const generateControl = useGenerateRule();

    return {
      ...ruleExpControl,
      ...generateControl
    }
    
  },
})

function useRuleExpression(){
  // 以时间戳作为RuleExp组件的唯一key
  const getCompoId = ()=>`exp${Date.now()}`;

  // 保存RuleExp组件的key
  const ruleExpressions: Ref<string[]> = ref([getCompoId()]);



  // 下列两个方法添加/删除key，即添加/删除某一RuleExp组件
  const addRuleExp = ()=>{
    ruleExpressions.value.push(getCompoId());
  }

  const deleteRuleExp = (expId: string)=>{
    if(ruleExpressions.value.length<2) return ;
 
    ruleExpressions.value = ruleExpressions.value.filter((item)=>item!=expId);
  }

  return {
    ruleExpressions,
    addRuleExp,
    deleteRuleExp
  }
}


function useGenerateRule(){
  // 下列两个变量分别渲染 规则表达式、规则文字
  const ruleStmtGenerated: Ref<string> = ref('');
  const ruleWordsGenerated: Ref<string> = ref('');
  
  // 存放RuleExp子组件们的调用方法
  let childOperations: ChildOperation[] = [];

  

  // 生成规则表达式及文字形式
  const generateRule = ()=>{
    ruleStmtGenerated.value = "";
    ruleWordsGenerated.value = "";

    childOperations = childOperations.filter((item: ChildOperation)=>item.generateRule!=null);

    childOperations.forEach((element, index: number) => {
      const ruleGenerated = element.generateRule() as any as ruleStatWords;
      if(index!=0) {
        ruleStmtGenerated.value += ' ^ ';
        ruleWordsGenerated.value += ' 、';
      }
      ruleStmtGenerated.value += ruleGenerated.exp;
      ruleWordsGenerated.value += ruleGenerated.word;
    });
  };

  // 接收RuleExp子组件们暴露的方法
  const returnChildOperate = (childOperate: any)=>{
    childOperations.push(childOperate);
  }


  return {
    generateRule,
    returnChildOperate,
    ruleStmtGenerated,
    ruleWordsGenerated
  }
}

// const extractTableFromExpression = (expressions: ruleExpression[]): string[]=>{
  
//   return [];
// }

// const generateRuleTable = (tableNames: Ref<string[]>): string =>{
//   return ""
// }

// const joinRuleExpression = (expressions: ruleExpression[]): string=>{
//   return expressions.map((item)=>{
//     return joinRuleItem(item.expItems);
//   }).join(' ^ ');
// }

// const joinRuleItem = (ruleItem: RuleAtom[]): string=>{
//   return ""
// }

</script>
