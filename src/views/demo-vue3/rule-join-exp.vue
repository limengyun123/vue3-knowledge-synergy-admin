<template>
  <a-radio-group v-model:value="expContainsConstant">
    <a-radio :value="false">单元格/关系词/单元格</a-radio>
    <a-radio :value="true">单元格/关系词/单元格</a-radio>
  </a-radio-group>
  <div>
    <a-space>
      <a-cascader :options="tablesAndFieldsOptions" @change="onField1Change" :displayRender="transformSymbol" />
      <a-select v-model:value="expModel.relative" style="width: 120px" :options="relativeOptions" @change="onRelativeChange" />
      <a-input v-if="expContainsConstant" v-model:value="expModel.field2"/>
      <a-space v-else>
        <a-cascader :options="tablesAndFieldsOptions" @change="onField2Change" :displayRender="transformSymbol"/>
        <a-select v-if="showModelSelect" v-model:value="expModel.model" style="width: 120px" :options="modelOptions" @change="onModelChange" />
        <a-input-number v-if="showThresholdInput" v-model:value="expModel.threshold"/>
      </a-space>
      <a-button shape="circle" size="small" @click="deleteExpression">
        <template #icon><MinusOutlined /></template>
      </a-button>
    </a-space>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive, Ref, ref } from 'vue';
import { MinusOutlined } from "@ant-design/icons-vue";

type fieldOption = {
  value: string;
  label: string;
  children?: fieldOption[];
}
type RuleExpressionType = 'similar'|'fieldExp'|'ml';
type RuleExpression = {
  type: RuleExpressionType
  field1: string
  field2: string | number
  relative: string
  model?: string
  threshold?: number 
}
export type ChildOperation = {
  generateRule: ()=>void
}
export type ruleStatWords = {
  exp: string
  word: string
}
/********************************** 模拟数据定义 /**********************************/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tablesAndFields = require('../../assets/table.json');
const tablesAndFieldsOptions: fieldOption[] = Object.keys(tablesAndFields).map((key)=>{
  return {
    value: key,
    label: key,
    children: tablesAndFields[key].map((item: string)=>{
      return {
        value: item,
        label: item
      }
    })
  }
});

const relativeOptions: fieldOption[] = [
  { value: 'similar', label: '相似于' },
  { value: '=', label: '等于' },
  { value: '>', label: '大于' },
  { value: '<', label: '小于' },
  { value: '!=', label: '不等于' },
];

const models = [
  {name: "cosine", type: "MD"},
  {name: "jaccard", type: "MD"},
  {name: "jaro-winkler", type: "MD"},
  {name: "levenshtein", type: "MD"},
  {name: "ditto-multi-cas", type: "ML"},
  {name: "Sentence-Bert", type: "ML"}
];

const modelOptions = models.map((item)=>{
  return {
    label: item.name,
    value: item.name
  }
});

export default defineComponent({
  components:{
    MinusOutlined
  },
  emits: ['deleteRuleExp'],
  props:{
    expId:{
      type: String,
      require: true
    },
    returnOperate:{
      type: Function,
      default: ()=>{return }
    }
  },
  setup(props, {emit}) {
    // 控制不同表达式类型下不同输入框的呈现
    const expContainsConstant: Ref<boolean> = ref(false);
    const showModelSelect: Ref<boolean> = ref(false);
    const showThresholdInput: Ref<boolean> = ref(false);

    // 输入值的绑定量
    const expModel: RuleExpression = reactive({
      type: 'fieldExp' as RuleExpressionType,
      field1: '',
      field2: '',
      relative: '',
      model: '',
      threshold: undefined,
    });


    
    // 父组件调用子组件方法的桥梁
    const returnedParams: any = {generateRule};

    // 将Cascader中内容连接符由 ‘/’ 改为 ‘.’
    const transformSymbol = (param: {labels: string[]})=>{return param.labels.join('.')}

    // 下列四个onXXXchange方法响应各输入框的变化事件
    const onField1Change = (value: string[]) => {
      expModel.field1 = value.join('.');
    };

    const onRelativeChange = (value: string)=>{
      if(value==='similar'){
        showModelSelect.value = true;
        expModel.type = 'similar';
      }
      else{
        showModelSelect.value = false;
        expModel.type = 'fieldExp';
      }
      
    }

    const onField2Change = (value: string[]) => {
      expModel.field2 = value.join('.');
    };

    const onModelChange = (value: string)=>{
      const getTypeByModel = (value: string)=>{
        for(let item of models){
          if(item.name===value) return item.type;
        }
        return '';
      }

      if(getTypeByModel(value)==='MD'){
        showThresholdInput.value = true;
        expModel.type = 'similar';
      }
      else{
        showThresholdInput.value = false;
        expModel.type = 'ml';
      }
    }


    const deleteExpression = ()=>{
      console.log(props.expId);
      emit('deleteRuleExp', props.expId);
    }

    // 表达式生成规则，在组件内部根据表达式的类型生成，并将结果返回给父组件
    function generateRule(): ruleStatWords{
      const getLabelByValue = (value: string)=>{
        for(let item of relativeOptions){
          if(item.value===value) return item.label;
        }
        return '';
      }

      switch(expModel.type){
        case 'similar':
          return {
            exp: `similar(${expModel.model}, ${expModel.field1}, ${expModel.field2}, ${expModel.threshold})`,
            word: `${expModel.model}算法判断${expModel.field1}相似于${expModel.field2}达到${expModel.threshold}`
          }
        case 'ml':
          return {
            exp: `ml(${expModel.model}, ${expModel.field1}, ${expModel.field2})`,
            word: `${expModel.model}算法判断${expModel.field1}相似于${expModel.field2}`
          }
        default:
          return {
            exp: `${expModel.field1} ${expModel.relative} ${expModel.field2}`,
            word: `${expModel.field1}${getLabelByValue(expModel.relative)}${expModel.field2}`
          }
      }
    }

    // 组件挂载时将 供父组件调用的方法的引用 返回给父组件
    onMounted(()=>{
      props.returnOperate(returnedParams);
      console.log('mount');
    });

    // 组件解挂时将 供父组件调用的方法的引用置空
    onUnmounted(()=>{
      returnedParams.generateRule = null;
      console.log('destroy');
    })


    return {
      expContainsConstant,
      showModelSelect,
      showThresholdInput,

      expModel,
      tablesAndFieldsOptions,
      relativeOptions,
      modelOptions,

      transformSymbol,
      onField1Change,
      onRelativeChange,
      onField2Change,
      onModelChange,
      deleteExpression
    };
  },
});

</script>
