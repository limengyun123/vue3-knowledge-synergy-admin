<template>
  <h3>HelloWorld</h3>
  <div v-html="ruleStatementJoined"></div>
    <!-- <span>
      <span v-for="item in ruleStatementParsed.condition" :key="item">
        <span v-if="item.type=='table'">
          <span :class="`'table-'${item.stateItems[0].tableBelonging}`">item.stateItems[0].statement</span>
        </span>
        <span v-else-if="item.type=='fieldExp'">
          <span :class="`'table-'${item.stateItems[0].tableBelonging}`">item.stateItems[0].statement</span>
          =
          <span :class="`'table-'${item.stateItems[1].tableBelonging}`">item.stateItems[1].statement</span>
        </span>
        <span v-else>

        </span>
        ^
      </span>
    </span>
    ->
    <span>

    </span> -->
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const rule = "tablea(t0)^tablea(t1) ^ t0.name='zhangsan' ^ t0.class=t1.class -> t0.age=t1.age";
    const ruleStatementParsed = parseRuleStatement(rule);
    // const rule = "tablea(t0)^tableb(t2) ^ similar(Jaro-Winkler, tp.addr, t2.addr, 0.75) -> t0.phone=t2.phone";
    console.log(ruleStatementParsed);
    console.log(fieldToTable);

    const ruleStatementJoined = joinRuleStatement(ruleStatementParsed||{} as RuleStatement);

    return {
      ruleStatementJoined
    }
  },
})

type RuleAtomType = 'constant'|'algorithm'|'field';

type RuleAtom = {
  type: RuleAtomType
  statement: string
  tableBelonging?: string
}

type RuleExpression = {
  type: 'similar'|'ml'|'table'|'fieldExp'
  stateItems: RuleAtom[]
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
      parseType = /similar/.test(item)?'similar':'ml';
    
    ruleExpresParsed.push(parseRuleAtom(item.trim(), parseType));  
  });

  assignTableToFiled(ruleExpresParsed);

  return ruleExpresParsed;
}

function parseRuleAtom(statemt: string, type: string): RuleExpression{
  const ruleAtomParsed:RuleExpression = {
    type: type as "fieldExp" | "similar" | "ml" | "table",
    stateItems: []
  };

  const pushIntoRuleAtomParsed = (param: RuleAtom)=>{
    ruleAtomParsed.stateItems.push(param);
  };

  switch(type){
    case 'similar':
    case 'ml': {
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
      fieldToTable.set(exprItems[1].substring(0, exprItems[1].length-1), exprItems[0]);
      pushIntoRuleAtomParsed({
          type: 'field',
          statement: statemt
        });
      break;  
    }
  }

  return ruleAtomParsed;
}

function assignTableToFiled(RuleExpresParsed: RuleExpression[]): void{
  RuleExpresParsed.forEach((item)=>{
    item.stateItems.forEach((atom)=>{
      if(atom.type!='field') return;
      if(splitSign.bracket.test(atom.statement)){
        const exprItems = atom.statement.split('(');
        atom.tableBelonging = fieldToTable.get(exprItems[1].substring(0, exprItems[1].length-1));
        return;
      }
      
      const exprItems = atom.statement.split('.');
      atom.tableBelonging = fieldToTable.get(exprItems[0]);
    })
  })
}

function joinRuleStatement(ruleStatementParsed: RuleStatement): string{
  return "<h1>world!</h1>"
}

</script>
