<template>
  <!-- <a-dropdown :trigger="['click']">
    <a @click.prevent><FilterOutlined :class="{'dropdown-icon-inactive': dropdownIconInactive}"/></a>
    <template #overlay> -->
      <div style="padding: 8px; width: 390px; background-color: #ffffff; border-radius: 4px; box-shadow: 0 2px 8px #cccccc; ">
        <a-row style="padding: 9px" type="flex" justify="space-between">
          <a-checkbox
            v-model:checked="checkAllState.selectAll"
            :indeterminate="checkAllState.indeterminate"
            @change="handleCheckAllClick($event.target.checked)"
          >
            全选
          </a-checkbox>
          <span>
            <span><SortAscendingOutlined />升序</span>
            <span style="margin-left: 16px"><SortDescendingOutlined />降序</span>
            <span style="margin-left: 16px"><RestOutlined />清空条件</span>
          </span>
        </a-row>
        <a-row :gutter="8">
          <a-col :span="11">
            <a-input-search placeholder="请输入搜索内容" />
          </a-col>
          <a-col :span="6">
            <a-input placeholder="区间设置" />
          </a-col>
          <a-col :span="1">
            <SwapRightOutlined style="line-height: 32px"/>
          </a-col>
          <a-col :span="6">
            <a-input placeholder="区间设置" />
          </a-col>
        </a-row>
        <a-row style="height: 250px;">
          <div ref="targetDom" class="target-dom" :onscroll="handleScroll">
            <div ref="targetDomTop" class="target-dom-top"></div>
            <a-checkbox-group v-model:value="checkboxSelectedValues" style="background-color: lightgreen; text-align: left" @click.capture="handleCheckboxClick($event.target)">
              <div v-for="value in checkboxFixedValues" :key="value">
                <a-checkbox :value="value" style="height: 30px;">{{value}}</a-checkbox>
              </div>
            </a-checkbox-group>
          </div>
          <div v-if="loading"><a-spin /></div>
        </a-row>
        <a-row justify="end">
          <a-button type="primary" style="margin: 10px">
            确定
          </a-button>
        </a-row>
      </div>
    <!-- </template>
  </a-dropdown> -->
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import {
  FilterOutlined,
  RestOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SwapRightOutlined
} from "@ant-design/icons-vue";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testData = require('../../assets/test.json');

const requestData = (pageN: number)=>{
  const pageSize = 30;
  const itemTotalNum = testData.length;
  // return Promise.reject();
  return Promise.resolve({
    total: itemTotalNum, 
    results: testData.slice(Math.max((pageN-1)*pageSize,0), Math.min(pageN*pageSize, itemTotalNum))
  });
}

export default defineComponent({
  components: {
    // FilterOutlined,
    RestOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    SwapRightOutlined
  },
  setup() {

    const searchConditions = useSearchCondition();
    const scrollControl = useScroll();

    return {
      ...searchConditions,
      ...scrollControl
    }
  },
})

function useSearchCondition(){
  const dropdownIconInactive = true;
  const searchConditions = {
    ascend: true,
    searchContent: '',
    intervalFrom: '',
    intervalTo: ''
  };


  return {
    dropdownIconInactive,
    searchConditions
  }
}

type checkboxItemType = string|number|boolean|null;
type checkboxItemsType = checkboxItemType[];

function useScroll(){
  const slotHeight = 30;
  const loading = ref<boolean>(true);
  const targetDom = ref(), targetDomTop = ref();
  const checkboxFixedValues = ref<checkboxItemsType>([]), checkboxSelectedValues = ref<checkboxItemsType>([]);
  let checkboxTrueValues: checkboxItemsType = [];
  let cache: checkboxItemsType = [];
  const checkAllState = reactive({
    selectAll: false,
    indeterminate: false
  });

  const pageInfo: {[key:string]:number} = {
    pageNumber: 1,
    pageSize: 30,
    itemTotalNum: 0
  }

  let currentScrollTop, originScrollTop = 0;
  let requestedDataType = '';

  // pass
  const handleCheckboxClick = (target: HTMLElement)=>{
    if (target.nodeName!='INPUT' ) return ;
    const val: checkboxItemType = target.getAttribute('value');
    const index = checkboxTrueValues.indexOf(val);
    if (index == -1) checkboxTrueValues.push(val);
    else checkboxTrueValues.splice(index, 1);
    updateCheckAllIcon();
  };

  // pass
  const handleCheckAllClick = (val: boolean) => {
    Object.assign(checkAllState, {selectAll: val, indeterminate: false });
    checkboxTrueValues = [];
    checkboxSelectedValues.value = val? [...checkboxFixedValues.value]: [];
  };

  // pass
  const updateCheckAllIcon = () => {
    const checkboxFakeValuesLength = checkboxTrueValues.length;

    if (
      !!checkboxFakeValuesLength &&
      checkboxFakeValuesLength < pageInfo.itemTotalNum
    ) {
      checkAllState.indeterminate = true;
      return;
    }
    if (checkboxFakeValuesLength == pageInfo.itemTotalNum) {
      checkAllState.selectAll = !checkAllState.selectAll;
      checkboxTrueValues = [];
    }

    checkAllState.indeterminate = false;
  };

  // 处理滚动事件
  const handleScroll = () => {
    currentScrollTop = targetDom.value.scrollTop;
    const {pageNumber, pageSize, itemTotalNum} = pageInfo;

    // 满足“下滚”更新数据的状态
    // 四个条件逻辑分别表示：非正在请求数据、下滚、仍有数据可请求、初始进入下一个页码(请求数据的阶段)
    if ( !loading.value && currentScrollTop > originScrollTop && pageNumber*pageSize < itemTotalNum && currentScrollTop >= (pageNumber-1) * pageSize * slotHeight ) {

      // 读取缓存
      if((pageNumber+1)*pageSize < cache.length){
        console.log('cache', pageInfo.pageNumber+1);
        const results = cache.slice(pageNumber*pageSize, (pageNumber+1)*pageSize);
        cutOldDataScrollDown();
        updateAfterRequested({results: results});
        pageInfo.pageNumber += 1;
        return ;
      }

      // 请求数据
      console.log('request', pageNumber+1);
      reqData(pageNumber + 1).then((res) => {
        const { results } = res;
        cutOldDataScrollDown();
        updateAfterRequested({
          results: results,
          needCache: true
        });
        pageInfo.pageNumber += 1;
      }).catch(()=>{
        console.log('error');
      }).finally(()=>{
        loading.value = false;
      });
      
    }

    // 满足“上滚”更新数据的状态
    // 四个条件逻辑分别表示：非正在请求数据、上滚、仍需要请求数据、初始进入上一个页码(请求数据的阶段)
    if ( !loading.value && currentScrollTop < originScrollTop && pageNumber > 2 && currentScrollTop < (pageNumber - 2) * pageSize * slotHeight ) {
      console.log('cache', pageInfo.pageNumber-2);
      const results = pageNumber>3? cache.slice((pageNumber - 4)*pageSize, (pageNumber - 3)*pageSize): [];
      // 先删除再插入
      cutOldDataScrollUp();
      updateAfterRequested({
        results: results,
        insertToHead: true
      });
      pageInfo.pageNumber -= 1;
    }

    originScrollTop = currentScrollTop;
  };

  // 下滚时裁剪旧数据
  const cutOldDataScrollDown = ()=>{
    const {pageNumber, pageSize} = pageInfo;

    if (pageNumber > 2) {
      targetDomTop.value.style.height = (pageNumber - 2) * pageSize * slotHeight + "px";
      checkboxFixedValues.value.splice(0, pageSize);
    }
  };

  // 上滚时裁剪旧数据
  const cutOldDataScrollUp = ()=>{
    const {pageNumber, pageSize} = pageInfo;

    checkboxFixedValues.value.splice(2 * pageSize, pageSize);
    pageNumber > 3 && (targetDomTop.value.style.height = (pageNumber - 4) * pageSize * slotHeight + "px");
  }


  // pass
  const init = ()=>{
    
    reqData(pageInfo.pageNumber).then((res)=>{
      const { results, total } = res;
      pageInfo.itemTotalNum = total;
      updateAfterRequested({results: results, needCache: true});

    }).catch(()=>{
      setTimeout(init, 2000);
    });
  };

  const reqData = (pageNumber: number)=>{
    loading.value = true;
    return requestData(pageNumber);
  }

  // pass
  const updateAfterRequested = (params: {results: checkboxItemsType, needCache?: boolean, insertToHead?: boolean})=>{
    
    const { needCache, insertToHead} = params;
    let results = params.results;
    // 更新数据缓存
    if(needCache){
      results = results.map((v)=>{
        if(v===null) return v;
        if(!requestedDataType) requestedDataType = typeof v; 
        return v.toString();
      })
      cache = cache.concat(results||[])
    }

    // 更新checkbox group的项
    insertToHead?
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
    

    // 更新加载中的状态
    loading.value = false;
  };

  onMounted(()=>{
    init();
  });

  

  return {
    targetDom,
    targetDomTop,

    checkAllState,
    checkboxFixedValues,
    checkboxSelectedValues,

    handleCheckboxClick,
    handleCheckAllClick,
    handleScroll,
  }
}
</script>

<style>
.dropdown-icon-inactive{
  color: #aaaaaa;
}

.target-dom {
  width: 374px;
  height: 235px;
  overflow: auto;
  background-color: pink;
}

.target-dom-top {
  width: 200px;
  background-color: lightblue;
}
</style>
