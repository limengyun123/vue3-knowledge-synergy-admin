<template>
  <div v-for="rule in rules" :key="rule">
    <h3>{{rule}}</h3>
    <h3>添加样式后：</h3><h3 v-html="getRuleHTML(rule)"></h3>
    <div style="width: 60%; height: 2px; background-color: #cccccc; margin: 10px 20%;"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const rules = [
      "tablea(t0) ^ t0.id='12345'->t0.name='zhangshan'",
      "tablea(t0)^tablea(t1) ^ t0.name='zhangsan' ^ t0.class=t1.class -> t0.age=t1.age",
      "tablea(t0)^tablea(t1) ^  t0.class=t1.class -> t0.age=t1.age",
      "tablea(t0)^tablea(t1) ^tableb(t2)^tableb(t3)^ t0.name=t2.name ^ t1.name=t2.name -> t0.id=t2.id",
      "tablea(t0)^tableb(t2) ^ similar(Jaro-Winkler, t0.addr, t2.addr, 0.75) -> t0.phone=t2.phone",
      "tablea(t0)^tableb(t2) ^ ML('modleID', t0.addr, t2.addr) -> t0.phone=t2.phone",
      "accuracy1 (t0) ^ tableb (t1) ^ latest(t0.status,t1.status) -> latest(t0.job,t1.job)"
    ];
    
    const getRuleHTML = (rule: string): string=>{
      const ruleStatementParsed = parseRuleStatement(rule);
      console.log(ruleStatementParsed);
      return joinRuleStatement(ruleStatementParsed||{} as RuleStatement);
    }

    
    return {
      rules,
      getRuleHTML
    }
  },
})

type RuleAtomType = 'constant'|'algorithm'|'field'
type RuleExpressionType = 'similar'|'ML'|'latest'|'table'|'fieldExp'

type RuleAtom = {
  type: RuleAtomType
  statement: string
  tableBelonging?: string
}

type RuleExpression = {
  type: RuleExpressionType
  expItems: RuleAtom[]
}

type RuleStatement = {
  condition: RuleExpression[]
  result: RuleExpression[]
}

const splitSign = {
  arrow: /->/,
  equal: /=/,
  comma: /,/,
  quotation: /'/,
  bracket: /\(/
};

const fieldToTable = new Map();

function parseRuleStatement(ruleStat: string): RuleStatement|undefined{
  
  const firstArrowPosition: RegExpExecArray | null = splitSign.arrow.exec(ruleStat);

  if(!firstArrowPosition) return;   // 考虑规则字符串中无‘->’的异常情况
  const conditionState = ruleStat.substring(0,firstArrowPosition.index-1); // "tablea(t0)^tablea(t1) ^ t0.name='zhangsan' ^ t0.class=t1.class"
  const resultSate = ruleStat.substring(firstArrowPosition.index+2);      // "t0.age=t1.age"


  if(splitSign.arrow.test(resultSate)) return;   // 考虑规则字符串中含多个‘->’的异常情况

  return {
    condition: parseRuleExpression(conditionState),
    result: parseRuleExpression(resultSate)
  };

}

function parseRuleExpression(ruleExpre: string): RuleExpression[]{
  const ruleExpresParsed: RuleExpression[] = [];
  let parseType = 'table';

  ruleExpre.split('^').forEach((item)=>{
    if(splitSign.equal.test(item))
      parseType = 'fieldExp';
    else if(splitSign.comma.test(item))
      parseType = /similar/.test(item)?'similar':(/latest/.test(item)?'latest':'ML');
    
    ruleExpresParsed.push(parseRuleAtom(item.trim(), parseType));  
  });

  assignTableToFiled(ruleExpresParsed);

  return ruleExpresParsed;
}

function parseRuleAtom(statemt: string, type: string): RuleExpression{
  const ruleAtomParsed:RuleExpression = {
    type: type as RuleExpressionType,
    expItems: []
  };

  const pushIntoRuleAtomParsed = (param: RuleAtom)=>{
    ruleAtomParsed.expItems.push(param);
  };

  switch(type){
    case 'similar':
    case 'ML': {
      let algorithmParams = statemt.split('(')[1];
      const algorithmParamsTypes: RuleAtomType[] = ['algorithm', 'field', 'field', 'algorithm'];
      algorithmParams.substring(0, algorithmParams.length-1);
      algorithmParams.split(',').forEach((item, index)=>{
        pushIntoRuleAtomParsed({
          type: algorithmParamsTypes[index],
          statement: item.trim()
        });
      })
      break;
    }
    case 'latest': {
      let algorithmParams = statemt.split('(')[1];
      algorithmParams.substring(0, algorithmParams.length-1);
      algorithmParams.split(',').forEach((item)=>{
        pushIntoRuleAtomParsed({
          type: 'field',
          statement: item.trim()
        });
      })
      break;
    }
    case 'fieldExp':
      statemt.split('=').forEach((item)=>{
        let itemType: RuleAtomType = 'field';
        if(splitSign.quotation.test(item)) itemType = 'constant';
        pushIntoRuleAtomParsed({
          type: itemType,
          statement: item.trim()
        });
      })
      break;
    default: {
      const exprItems = statemt.split('(');
      const tableName = exprItems[0].trim();
      const fieldName = exprItems[1].substring(0, exprItems[1].length-1).trim();
      fieldToTable.set(fieldName, tableName);
      pushIntoRuleAtomParsed({
          type: 'field',
          statement: `${tableName}(${fieldName})`
        });
      break;  
    }
  }

  return ruleAtomParsed;
}

function assignTableToFiled(RuleExpresParsed: RuleExpression[]): void{
  RuleExpresParsed.forEach((item)=>{
    item.expItems.forEach((atom)=>{
      if(atom.type!='field') return;
      if(splitSign.bracket.test(atom.statement)){
        const exprItems = atom.statement.split('(');
        atom.tableBelonging = fieldToTable.get(exprItems[1].substring(0, exprItems[1].length-1).trim());
        return;
      }
      
      const exprItems = atom.statement.split('.');
      atom.tableBelonging = fieldToTable.get(exprItems[0].trim());
    })
  })
}

function joinRuleStatement(ruleStatementParsed: RuleStatement): string{
  return `${joinRuleExpression(ruleStatementParsed.condition)} -> ${joinRuleExpression(ruleStatementParsed.result)}`;
}

function joinRuleExpression(ruleExpresParsed: RuleExpression[]): string{

  return ruleExpresParsed.map((item)=>{
    return joinRuleItem(item);
  }).join(' ^ ');
}

function joinRuleItem(ruleItemParsed: RuleExpression): string{
  let ruleResult = '';
  switch(ruleItemParsed.type){
    case 'similar':
    case 'ML':
    case 'latest':
      ruleResult = `${ruleItemParsed.type}(${
        ruleItemParsed.expItems.map((item)=>{
          return joinRuleAtom(item);
        }).join(', ')
      })`;
      break;
    case 'table':
      ruleResult = joinRuleAtom(ruleItemParsed.expItems[0]);
      break;
    default:
      ruleResult = `${
        ruleItemParsed.expItems.map((item)=>{
          return joinRuleAtom(item);
        }).join(' = ')
      }`;
      break;
  }

  return ruleResult;
}

function joinRuleAtom(ruleAtomParsed: RuleAtom): string{
  let color = '#333333';

  switch(ruleAtomParsed.type){
    case 'constant':
      color = '#00BFD0';
      break;
    case 'algorithm':
      color = '#00B578';
      break;
    default:
      if(ruleAtomParsed.tableBelonging=='tableb') color='#5260FF';
      break;
  }

  return `<span style="color: ${color}">${ruleAtomParsed.statement}</span>`;
}

</script>
