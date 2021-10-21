<template>
  <a-dropdown :trigger="['click']" v-model:visible="filterBoxVisible">
    <a @click.prevent="handleVisibleChange"><FilterOutlined :class="{'dropdown-icon-active': dropdownIconActive}" /></a>
    <template #overlay>
      <div class="property-filter-box">
        <a-row class="property-filter-row" type="flex" justify="space-between">
          <a-checkbox
            v-model:checked="selectAll"
            :indeterminate="indeterminate"
            @change="handleCheckAllClick($event.target.checked)"
          >
            {{seletedItemsNum}}
          </a-checkbox>
          <span>
            <a-radio-group v-model:value="ascend" size="small" @change="handleOrderChange($event.target.value)">
              <a-radio-button :value="true" class="property-filter-radio"><SortAscendingOutlined />升序</a-radio-button>
              <a-radio-button :value="false" class="property-filter-radio"><SortDescendingOutlined />降序</a-radio-button>
            </a-radio-group>
            <span @click="handleClearSelected" class="property-filter-button"><RestOutlined />清空条件</span>
          </span>
        </a-row>
        <a-row class="property-filter-row">
          <a-input-search v-model:value="searchingContent" style="margin: 0 6px" placeholder="请输入搜索内容" @search="handleKeyWordsSearch" @change="handleKeyWordsInput($event.target.value)" />
          <!-- <a-form class="property-filter-interval" ref="intervalRef" :model="intervalState" :rules="intervalRules" layout="inline">
            <a-col :span="9">
              <a-form-item ref="from" name="from">
                <a-input-number v-model:value="intervalState.from" placeholder="区间设置" style="width: 120px" />
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <SwapRightOutlined style="line-height: 32px"/>
            </a-col>
            <a-col :span="9">
              <a-form-item ref="to" name="to">
                <a-input-number v-model:value="intervalState.to" placeholder="区间设置" style="width: 120px" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-button type="primary" style="width: 40px" @click="handleInterValChange">
                <template #icon><SearchOutlined /></template>
              </a-button>
            </a-col>
          </a-form> -->
        </a-row>
        <a-row class="property-filter-row">
          <div ref="targetDom" class="filter-target-dom" :onscroll="handleScroll">
            <div ref="targetDomTop" class="filter-target-dom-top"></div>
            <a-checkbox-group v-model:value="checkboxSelectedValues" @click.capture="handleCheckboxClick($event.target)">
              <div v-for="value in checkboxFixedValues" :key="value">
                <a-checkbox :value="value" :style="{'height': slotHeight+'px', 'white-space': 'nowrap'}">{{value}}</a-checkbox>
              </div>
              <div v-if="loading" style="margin-left: 140px"><a-spin /></div>
            </a-checkbox-group>
          </div>
        </a-row>
        <a-row class="property-filter-row" justify="end">
          <a-button type="primary" style="margin-right: 6px;" @click="handleSubmitSelected">
            确定
          </a-button>
        </a-row>
      </div>
    </template>
  </a-dropdown>
</template>

<script lang="ts">
import { defineComponent, nextTick, reactive, Ref, ref, toRefs, unref } from 'vue';
import {
  FilterOutlined,
  RestOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SwapRightOutlined
} from "@ant-design/icons-vue";
// import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testData = require('../../assets/test.json');
const testDataReverse = testData.slice(0, testData.length).reverse();


type SearchConditionsType = {
  ascend: boolean
  searchingContent: string|undefined
  minEdge?: undefined
  maxEdge?: undefined
}

export default defineComponent({
  components: {
    FilterOutlined,
    RestOutlined,
    // SearchOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    // SwapRightOutlined
  },
  emits:['submitValues'],
  props: {
    columnName: {
      type: String,
      required: true
    },
    filterListURL: {
      type: String,
      required: true
    },
    additionalParams: {
      type: Object,
      default: ()=>({})
    }
  },
  setup(props, {emit}) {
    const properties = unref(props);
    const {refreshRequest, submitSelected, clearSelected, ...scrollControl} = useScroll(properties, emit);

    const {clearConditions, initCheckboxGroup, ...useSearchConditions} = useSearchCondition(refreshRequest);

    const params = {clearConditions, submitSelected, clearSelected, initCheckboxGroup};

    const filterBoxControl = useFilterBox(params);

    return {
      ...useSearchConditions,
      ...scrollControl,
      ...filterBoxControl,
    }
  },
})



/******************************* 过滤弹窗全局控件 ********************************/ 
// eslint-disable-next-line @typescript-eslint/ban-types
const useFilterBox = function(params: {[key:string]:Function}){
  let boxShowCount = 0;
  const dropdownIconActive: Ref<boolean> = ref(false);
  const filterBoxVisible: Ref<boolean> = ref(false);
  const {clearConditions, submitSelected, clearSelected, initCheckboxGroup} = params;

  
  // 处理搜索项提交
  const handleSubmitSelected = ()=>{
    submitSelected();
    handleVisibleChange();
    dropdownIconActive.value = true;
  }  

  // 清空条件
  const handleClearSelected = ()=>{
    clearConditions();
    clearSelected();
    handleVisibleChange();
    boxShowCount=0;
    dropdownIconActive.value = false;
  }

  // 更改弹窗显隐状态
  const handleVisibleChange = ()=>{
    if(!filterBoxVisible.value){
      initCheckboxGroup(boxShowCount==0);
    }
    filterBoxVisible.value = !filterBoxVisible.value;
    boxShowCount++;
  }


  return {
    dropdownIconActive,
    filterBoxVisible,
    handleVisibleChange,
    handleSubmitSelected,
    handleClearSelected
  }
}





/******************************* 过滤弹窗搜索条件控件 ********************************/ 
function useSearchCondition(refreshRequest: (conditions: SearchConditionsType, isConditionsChange: boolean)=>void){
  
  const searchConditions: SearchConditionsType = reactive({
    ascend: true,
    searchingContent: undefined,
    minEdge: undefined,
    maxEdge: undefined
  });


  // 下列三个handle函数处理搜索条件改变
  const handleOrderChange = (asc: boolean)=>{
    refreshCheckboxGroup({ascend: asc}, true);
  }

  const handleKeyWordsInput = (inputContent: string)=>{
    inputContent === "" && refreshCheckboxGroup({inputContent: undefined},  true);
  }

  const handleKeyWordsSearch = (inputContent: string)=>{ 
    inputContent.trim() && refreshCheckboxGroup({inputContent: inputContent.trim()}, true);
  }

  // 刷新CheckboxGroup中的搜索条件
  const refreshCheckboxGroup = (conditions: any, isConditionsChange: boolean)=>{
    refreshRequest(Object.assign({}, searchConditions, conditions), isConditionsChange);
  }

  // const {clearIntervalField, ...interValControl} = useInterVal();

  // 重设搜索条件
  const clearConditions = ()=>{
    Object.assign(searchConditions, {
      ascend: true,
      searchingContent: undefined
    });
    // clearIntervalField();
  };

  const initCheckboxGroup = (isConditionsChange: boolean)=>{
    refreshCheckboxGroup(unref(searchConditions), isConditionsChange);
  };

  
  return {
    // ...interValControl,
    ...toRefs(searchConditions),
    handleOrderChange,
    handleKeyWordsInput,
    handleKeyWordsSearch,
    clearConditions,
    initCheckboxGroup
  }
}




/******************************* 过滤弹窗搜索条件中的区间控件 ********************************/
//  type InterValForm = {
//   from: number|undefined
//   to: number|undefined
// }
// function useInterVal(){
//   const intervalRef = ref();
//   const intervalState: InterValForm = reactive({
//     from: undefined,
//     to: undefined,
//   });

//   const intervalRules = {
//     from: [{ type: 'number', required: true, trigger: 'blur' }],
//     to: [{ type: 'number', required: true, trigger: 'blur' }]
//   };

//   const handleInterValChange = ()=>{
//     intervalRef.value
//       .validate()
//       .then(() => {
//         console.log('values', intervalState);
//       }).catch(()=>{
//         console.log('error');
//       });
//   };

//   const clearIntervalField = ()=>{
//     intervalRef.value.resetFields()
//   };


//   return {
//     intervalRef,
//     intervalState,
//     intervalRules,
//     handleInterValChange,
//     clearIntervalField
//   }
// }




/******************************* 过滤弹窗滚动列表控件 ********************************/
type CheckboxItemType = string|null;
type CheckboxItemsType = CheckboxItemType[];
type ScrollUpdateType = {
  results: CheckboxItemsType, 
  total?: number,
  needCache: boolean, 
  scrollUp: boolean, 
  minusPageNum: boolean
}

function useScroll(properties: any, emit: (event: "submitValues", ...args: any[]) => void){

  // 滚动列表位置控制
  const slotHeight = 30;
  let currentScrollTop, originScrollTop = 0;
  const targetDom: Ref = ref(), targetDomTop: Ref = ref();

  // 样式控制
  const loading: Ref<boolean> = ref(true);                    // 加载状态
  const checkAllState: {[key: string]: boolean} = reactive({  // 全选框的状态 
    selectAll: true,
    indeterminate: false
  });
  const seletedItemsNum: Ref<string> = ref('');               // 已选数目的文字提示

  // 分页信息
  const pageInfo: {[key:string]:number} = {
    pageNumber: 0,
    pageSize: 30,
    itemTotalNum: 0
  }

  // 滚动列表的各类值
  const checkboxFixedValues: Ref<CheckboxItemsType> = ref([]);          // 已渲染的checkbox项 
  const checkboxSelectedValues: Ref<CheckboxItemsType> = ref([]);       // 已渲染的checkbox项中的已选项，即框被勾上的项
  let checkboxTrueValues: CheckboxItemsType = [];                       // 真正的已选项，配合checkall使用用于处理大数据量情况下的多选
  let cache: CheckboxItemsType = [];let requestedDataType = '';         // 已经请求的列表数据缓存及类型

  // 列表请求的过滤条件
  let searchConditions = {} as SearchConditionsType;
  



  // 下列两个handle函数处理Checkbox的点击，包括单选和全选
  const handleCheckboxClick = (target: HTMLElement)=>{
    if (target.nodeName!='INPUT' ) return ;
    const val: CheckboxItemType = target.getAttribute('value');
    const index = checkboxTrueValues.indexOf(val);

    // 更新全选框的样式
    const updateCheckAllIcon = () => {
      const checkboxFakeValuesLength = checkboxTrueValues.length;

      if (!!checkboxFakeValuesLength && checkboxFakeValuesLength < pageInfo.itemTotalNum) {
        checkAllState.indeterminate = true;
        return;
      }
      else if (checkboxFakeValuesLength == pageInfo.itemTotalNum) {
        checkAllState.selectAll = !checkAllState.selectAll;
        checkboxTrueValues = [];
      }
      checkAllState.indeterminate = false;
    };


    if (index == -1) checkboxTrueValues.push(val);
    else checkboxTrueValues.splice(index, 1);
    
    updateSeletedItemsNum();
    updateCheckAllIcon();
  };

  
  const handleCheckAllClick = (val: boolean) => {
    Object.assign(checkAllState, {selectAll: val, indeterminate: false });
    checkboxTrueValues = [];
    checkboxSelectedValues.value = val? [...checkboxFixedValues.value]: [];
    updateSeletedItemsNum();
  };


  
  // 下列四个函数处理滚动事件
  // 处理滚动事件，分下滚和上滚两种情况
  const handleScroll = () => {
    currentScrollTop = targetDom.value.scrollTop;

    if(loading.value){  // 正在请求数据时则不处理
      originScrollTop = currentScrollTop;
      return ;
    }

    const {pageNumber, pageSize, itemTotalNum} = pageInfo;

    // 满足“下滚”更新数据的状态：下滚、仍有数据可请求、初始进入下一个页码(请求数据的阶段)
    if ( currentScrollTop > originScrollTop && pageNumber*pageSize < itemTotalNum && currentScrollTop >= (pageNumber-1) * pageSize * slotHeight ) {

      if(pageNumber*pageSize < cache.length){// 读取缓存
        console.log('cache', pageInfo.pageNumber+1);
        const results = cache.slice(pageNumber*pageSize, (pageNumber+1)*pageSize);

        updateAfterRequested({
          results: results,
          needCache: false,
          scrollUp: false,
          minusPageNum: false
        });
      }
      else{ // 请求数据
        console.log('request', pageNumber+1);
        reqData(pageNumber + 1).then((res: any) => {
          const { list: results, total } = res.data.data;

          updateAfterRequested({
            results: results,
            total: total||0,
            needCache: true,
            scrollUp: false,
            minusPageNum: false
          });

        }).finally(()=>{
          loading.value = false;
        });
      }
    }
    // 满足“上滚”更新数据的状态：上滚、仍需要请求数据、初始进入上一个页码(请求数据的阶段)
    else if ( currentScrollTop < originScrollTop && pageNumber > 2 && currentScrollTop < (pageNumber - 2) * pageSize * slotHeight ) {
      console.log('cache', pageNumber-3);
      const results = pageNumber>3? cache.slice((pageNumber - 4)*pageSize, (pageNumber - 3)*pageSize): [];

      updateAfterRequested({
        results: results,
        needCache: false,
        scrollUp: true,
        minusPageNum: true
      });
    }

    originScrollTop = currentScrollTop;
  };


  // 滚动时请求数据后的统一处理
  const updateAfterRequested = (params: ScrollUpdateType)=>{
    cutOldData(params.scrollUp);  // 裁剪旧数据
    refreshNewData(params);       // 根据新数据刷新
  };


  // 裁剪旧数据
  const cutOldData = (fromTail: boolean)=>{
    const {pageNumber, pageSize} = pageInfo;
    if(pageNumber <= 2) return;
    if(fromTail){
      checkboxFixedValues.value.splice(2 * pageSize, pageSize);
      pageNumber > 3 && (targetDomTop.value.style.height = (pageNumber - 4) * pageSize * slotHeight + "px");
    }
    else{
      targetDomTop.value.style.height = (pageNumber - 2) * pageSize * slotHeight + "px";
      checkboxFixedValues.value.splice(0, pageSize);
    }
  }

  // 根据新数据刷新
  const refreshNewData = (params: ScrollUpdateType)=>{
    const { needCache, total, scrollUp, minusPageNum} = params;
    let results = params.results;

    // 更新数据缓存
    if(needCache){
      results = results.map((v)=>{
        if(v===null) return v;
        (!requestedDataType) && (requestedDataType = typeof v); 
        return v.toString();
      });
      cache = cache.concat(results||[]);
    }
    
    // 更新checkbox group的项
    scrollUp?
      checkboxFixedValues.value.splice(0, 0, ...results) :
      checkboxFixedValues.value.splice(checkboxFixedValues.value.length, 0, ...results);

    // 更新checkbox group中已选择的项
    nextTick(() => {
      checkboxSelectedValues.value = checkAllState.selectAll?
        checkboxFixedValues.value.filter((v)=>{
          return checkboxTrueValues.indexOf(v)==-1;
        }) :
        [...checkboxTrueValues];
    });

    // 更新总数
    total!=undefined && (pageInfo.itemTotalNum = total);

    // 更新已选择条数的显示
    updateSeletedItemsNum();
    
    // 更新加载中的状态
    loading.value = false;

    // 更新当前页号
    if(minusPageNum) pageInfo.pageNumber -= 1;
    else pageInfo.pageNumber += 1;
  }



  // 当总数变化时，更新全选框的文字提示 “XX/XX条”
  const updateSeletedItemsNum = ()=>{
    const seletedLength = checkboxTrueValues.length;
    const { itemTotalNum } = pageInfo;
    seletedItemsNum.value = `${checkAllState.selectAll?itemTotalNum-seletedLength:seletedLength}/${itemTotalNum} 条`;
  }



  // 初始请求以及搜索条件变化时的请求，带重试功能
  const initReq = ()=>{
    reqData(pageInfo.pageNumber+1).then((res: any)=>{
      const { list: results, total } = res.data.data;
      updateAfterRequested({
        results: results, 
        total: total||0,
        needCache: true,
        scrollUp: false,
        minusPageNum: false
      });

    }).catch(()=>{
      setTimeout(initReq, 2000);
    });
  };

  // 封装请求
  const reqData = (pageNum: number)=>{
    loading.value = true;

    // for test offline
    const itemsLength = testData.length;
    const {pageSize} = pageInfo;
    const { ascend} = searchConditions;
    return Promise.resolve({
      data:{
        data:{
          total: itemsLength, 
          list: (ascend?testData:testDataReverse).slice(Math.max((pageNum-1)*pageSize,0), Math.min(pageNum*pageSize, itemsLength))
        }
      }
    });

    // for test online
    // if(properties.filterListURL){
    //   const {pageSize} = pageInfo;
    //   const params = {
    //     pageSize,
    //     pageNum,
    //     columnName: properties.columnName,
    //     ...searchConditions,
    //     ...(properties.additionalParams)
    //   }
    //   return axios.post(properties.filterListURL, params);
    // }
    // else
    //   return Promise.reject();
    
  };



  // 以下三个函数用于提供给外部函数
  // 修改请求条件
  const refreshRequest = (conditions: SearchConditionsType, isConditionsChange: boolean)=>{
    searchConditions = conditions;
    console.log('searchConditions', searchConditions)
    if(isConditionsChange){
      clearSelected();
      initReq();
    }
  }

  // 提交已选项
  const submitSelected = ()=>{
    const transferData = (item: CheckboxItemType)=>{
    switch(requestedDataType){
      case 'number': 
        return Number(item);
      case 'boolean': 
        return item==="true"? true: false;
      default:
        return item;
    }
  }

    const selectedValues = checkboxTrueValues.map((item: CheckboxItemType)=>{
      return item===null?item: transferData(item);
    });
    emit('submitValues', {
      columnName: properties.columnName,
      selectAll: checkAllState.selectAll,
      ...searchConditions,
      selectedValues
    });
  }  
  
  // 重置过滤列表
  const clearSelected = ()=>{
    loading.value = false;
    seletedItemsNum.value = '0/0条';
    checkboxFixedValues.value = [];
    checkboxSelectedValues.value = [];
    checkboxTrueValues = [];
    cache = [];
    pageInfo.pageNumber = 0;
    currentScrollTop = originScrollTop = 0;
    targetDom.value && targetDom.value.scrollTo(0, 0);
    targetDomTop.value && (targetDomTop.value.style.height = 0);
    Object.assign(checkAllState, {selectAll: true, indeterminate: false})
  }


  return {
    loading,
    targetDom,
    targetDomTop,
    slotHeight,

    ...toRefs(checkAllState),
    seletedItemsNum,
    requestedDataType,
    checkboxFixedValues,
    checkboxSelectedValues,
    checkboxTrueValues,

    handleCheckboxClick,
    handleCheckAllClick,
    handleScroll,
    refreshRequest,
    submitSelected,
    clearSelected
  }
}
</script>

<style>

.property-filter-box{
  width: 329px;
  color: #666666;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 8px #cccccc;
}

.property-filter-row{
    border-top: solid 2px #eeeeee;
    padding: 8px 0;
}

.property-filter-row:first-child{
  border: none;
  padding: 12px;
}

.property-filter-row .ant-radio-button-wrapper-checked::before{
  background-color: white;
}


.property-filter-radio{
  border: none !important; 
  box-shadow: none !important;
}

.property-filter-button{
  margin-left: 16px;
}

.property-filter-row-button:hover{
  color: #1677FF;
}


.property-filter-row-order-active{
  color: #1677FF;
}

.property-filter-row-interval{
  margin: 6px 0 0 6px;
  color: rgba(0, 0, 0, 0.25);
}


.dropdown-icon-active{
  color: #1677FF !important;
}

.filter-target-dom {
  height: 200px;
  min-width: 329px;
  overflow: auto;
  text-align: left;
  padding-left: 12px;
}

.filter-target-dom-top{
  width: 200px;
}

</style>