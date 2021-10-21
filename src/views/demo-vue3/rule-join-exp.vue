<template>
  <a-radio-group v-model:value="expContainsConstant">
    <a-radio :value="false">单元格/关系词/单元格</a-radio>
    <a-radio :value="true">单元格/关系词/单元格</a-radio>
  </a-radio-group>
  <div>
    <a-space>
      <a-cascader :options="tablesAndFieldsOptions" @change="onField1Change" :displayRender="transformSymbol" />
      <a-select v-model:value="expModel.relative" style="width: 120px" :options="relativeOptions" @change="onRelativeChange" />
      <a-input v-if="expContainsConstant" v-model:value="value"/>
      <a-space v-else>
        <a-cascader :options="tablesAndFieldsOptions" @change="onField2Change" :displayRender="transformSymbol"/>
        <a-select v-if="showModelSelect" v-model:value="expModel.model" style="width: 120px" :options="modelOptions" @change="onModelChange" />
        <a-input-number v-if="showThresholdInput" v-model:value="expModel.threshold"/>
      </a-space>
    </a-space>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive, Ref, ref } from 'vue';
interface Option {
  value: string;
  label: string;
  children?: Option[];
}
type ruleExpressionType = 'similar'|'fieldExp'|'ml';
type ruleExpression = {
  type: ruleExpressionType
  field1: string
  field2: string | number
  relative: string
  model?: string
  threshold?: number 
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tablesAndFields = require('../../assets/table.json');
const tablesAndFieldsOptions = Object.keys(tablesAndFields).map((key)=>{
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


const relativeOptions = [
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
  props:{
    returnOperate:{
      type: Function,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: ()=>{}
    }
  },
  setup(props) {
    const expContainsConstant: Ref<boolean> = ref(false);
    const showModelSelect: Ref<boolean> = ref(false);
    const showThresholdInput: Ref<boolean> = ref(false);

    const expModel: ruleExpression = reactive({
      type: 'fieldExp' as ruleExpressionType,
      field1: '',
      field2: '',
      relative: '',
      model: '',
      threshold: undefined,
    });


    const transformSymbol = (param: {labels: string[]})=>{return param.labels.join('.')}

    const onField1Change = (value: string[], selectedOptions: Option[]) => {
      console.log(value, selectedOptions)
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

    const onField2Change = (value: string[], selectedOptions: Option[]) => {
      console.log(value, selectedOptions)
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

    const generateRule: any = ()=>{
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
            exp: `similar(${expModel.model}, ${expModel.field1}, ${expModel.field2})`,
            word: `${expModel.model}算法判断${expModel.field1}相似于${expModel.field2}`
          }
        default:
          return {
            exp: `${expModel.field1} ${expModel.relative} ${expModel.field2}`,
            word: `${expModel.field1}${getLabelByValue(expModel.relative)}${expModel.field2}`
          }
      }
    }

    const returnedParams: any = {generateRule};

    onMounted(()=>{
      props.returnOperate(returnedParams)
    });

    onUnmounted(()=>{
      returnedParams.generateRule = null;
      console.log('destroy')
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
    };
  },
});
</script>
