<template>
  <div v-for="(rule,index) in rulesJoined" :key="rule">
    <h4>{{rulesOrigin[index]}}</h4>
    <h4>解析后：</h4><h3 v-html="rule.exp"></h3><h3>{{rule.word}}</h3>
    <div style="width: 60%; height: 2px; background-color: #cccccc; margin: 10px 20%;"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const rulesOrigin = [
      "tablea(t0) ^ t0.id='12345'->t0.name='zhangshan'",
      "tablea(t0)^tablea(t1) ^ t0.name='zhangsan' ^ t0.class=t1.class -> t0.age=t1.age",
      "tablea(t0)^tablea(t1) ^  t0.class=t1.class -> t0.age=t1.age",
      "tablea(t0)^tablea(t1) ^tableb(t2)^tableb(t3)^ t0.name=t2.name ^ t1.name=t2.name -> t0.id=t2.id",
      "tablea(t0)^tableb(t2) ^ similar(Jaro-Winkler, t0.addr, t2.addr, 0.75) -> t0.phone=t2.phone",
      "tablea(t0)^tableb(t2) ^ ML('modleID', t0.addr, t2.addr) -> t0.phone=t2.phone",
      "accuracy1 (t0) ^ tableb (t1) ^ latest(t0.status,t1.status) -> latest(t0.job,t1.job)"
    ];

    const rulesParsed = rulesOrigin.map((rule: string)=>{
      return parseRuleStatement(rule)||{};
    }) as RuleStatement[];
    

    const rulesJoined = rulesParsed.map((rule: RuleStatement)=>{
      return {
        exp: joinRuleStatement(rule),
        word: joinRuleStatementZH(rule)
      }
    })

    
    return {
      rulesOrigin,
      rulesJoined
    }
  },
})

type RuleAtomType = 'constant'|'algorithm'|'field';     // 规则

type RuleAtom = {     // 规则原子的类型，如133、jaccard、t0.name
  type: RuleAtomType
  statement: string
  tableBelonging?: string
}

type RuleExpression = {     //规则表达式的类型，如t0.name=t1.name的类型是fieldExp
  type: 'similar'|'ML'|'latest'|'table'|'fieldExp'
  stateItems: RuleAtom[]
}

type RuleStatement = {    // 规则语句的类型
  condition: RuleExpression[]
  result: RuleExpression[]
}

const splitSign = {   // 规则中会出现的特殊分隔符号
  arrow: /->/,
  equal: /=/,
  comma: /,/,
  quotation: /'/,
  bracket: /\(/
};

// 存放表字段名与表名的映射关系
const fieldToTable = new Map();


/************************************ 下面三个函数分粒度解析规则 ************************************/
// 将规则按“->”符号分离为条件和结果，再分别解析两部分
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

// 将规则按“^”符号分离为表达式，再分别解析各部分
function parseRuleExpression(ruleExpre: string): RuleExpression[]{
  // 存放解析过后的规则表达式
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

// 根据规则表达式的类型，分别按不同的方式解析
function parseRuleAtom(statemt: string, type: string): RuleExpression{
  // 存放解析过后的某一规则表达式的原子元素
  const ruleAtomParsed:RuleExpression = {
    type: type as "fieldExp" | "similar" | "ML" | "latest" | "table",
    stateItems: []
  };

  function pushIntoRuleAtomParsed(param: RuleAtom){
    ruleAtomParsed.stateItems.push(param);
  }

  // 下列三个parseRuleXXXAtom函数是解析XXX类型表达式的方法
  function parseRuleMLAtom(statemt: string){
    let algorithmParams = statemt.split('(')[1];
    const algorithmParamsTypes: RuleAtomType[] = ['algorithm', 'field', 'field', 'algorithm'];
    algorithmParams = algorithmParams.substring(0, algorithmParams.length-1);
    algorithmParams.split(',').forEach((item, index)=>{
      pushIntoRuleAtomParsed({
        type: algorithmParamsTypes[index],
        statement: item.trim()
      });
    })
  }

  function parseRuleLatestAtom(statemt: string){
    let algorithmParams = statemt.split('(')[1];
    algorithmParams = algorithmParams.substring(0, algorithmParams.length-1);
    algorithmParams.split(',').forEach((item)=>{
      pushIntoRuleAtomParsed({
        type: 'field',
        statement: item.trim()
      });
    })
  }

  function parseRuleTableAtom(statemt: string){
    const exprItems = statemt.split('(');
    const tableName = exprItems[0].trim();
    const fieldName = exprItems[1].substring(0, exprItems[1].length-1).trim();
    fieldToTable.set(fieldName, tableName);
    pushIntoRuleAtomParsed({
      type: 'field',
      statement: `${tableName}(${fieldName})`
    });
  }

  switch(type){
    case 'similar':
    case 'ML': {
      parseRuleMLAtom(statemt);
      break;
    }
    case 'latest': {
      parseRuleLatestAtom(statemt);
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
      parseRuleTableAtom(statemt);
      break;
    }
  }

  return ruleAtomParsed;
}



/************************************ 建立表字段与表名的映射关系 ************************************/
function assignTableToFiled(RuleExpresParsed: RuleExpression[]): void{
  RuleExpresParsed.forEach((item)=>{
    item.stateItems.forEach((atom)=>{
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




/************************************ 下面四个函数分粒度组装规则的表达式形式 ************************************/
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
        ruleItemParsed.stateItems.map((item)=>{
          return joinRuleAtom(item);
        }).join(', ')
      })`;
      break;
    case 'table':
      ruleResult = joinRuleAtom(ruleItemParsed.stateItems[0]);
      break;
    default:
      ruleResult = `${
        ruleItemParsed.stateItems.map((item)=>{
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


/************************************ 下面三个函数分粒度组装规则的文字形式 ************************************/
function joinRuleStatementZH(ruleStatementParsed: RuleStatement): string{
  const tableNames = Array.from(new Set(fieldToTable.values()));
  return `在${tableNames.map((item)=>`表${item}`).join('、')}中，如果${joinRuleExpressionZH(ruleStatementParsed.condition)}，那么${joinRuleExpressionZH(ruleStatementParsed.result)}`;
}

function joinRuleExpressionZH(ruleExpresParsed: RuleExpression[]): string{

  return ruleExpresParsed.filter((item)=>item.type!='table').map((item)=>{
    return joinRuleItemZH(item);
  }).join('、');
}

function joinRuleItemZH(ruleItemParsed: RuleExpression): string{
  console.log(ruleItemParsed);
  switch(ruleItemParsed.type){
    case 'fieldExp':
      return `${ruleItemParsed.stateItems[0].statement}等于${ruleItemParsed.stateItems[1].statement}`;
    case 'similar':
      return `${ruleItemParsed.stateItems[0].statement}算法判断${ruleItemParsed.stateItems[1].statement}相似于${ruleItemParsed.stateItems[2].statement}达到${ruleItemParsed.stateItems[3].statement}`;
    case 'ML':
      return `机器学习模型${ruleItemParsed.stateItems[0].statement}判断${ruleItemParsed.stateItems[1].statement}等于${ruleItemParsed.stateItems[2].statement}`;
    case 'latest':
      return `时序规则判断${ruleItemParsed.stateItems[0].statement}和${ruleItemParsed.stateItems[1].statement}是最新状态`;
    default:
      return '';
  }
}
</script>
