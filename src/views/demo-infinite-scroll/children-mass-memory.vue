<template>
  <div ref="targetDom" class="target-dom" @click.capture="handleClick" :onscroll="handleScroll">
    <div ref="targetTopDom" class="top-helper"></div>
    <div v-for="value in checkboxFixedValues" :key="value">
      <slot :checkValue="value"></slot>
    </div>
    <div v-if="loading"><a-spin /></div>
  </div>
</template>

<script>
import { defineComponent, ref, toRaw } from "vue";

export default defineComponent({
  props: {
    pageSize: {
      type: Number,
      default: 20,
    },
    slotHeight: {
      type: Number,
      default: 30,
    },
    reqData: {
      type: Function,
    },
    updateSelected: {
      type: Function,
    }
  },
  setup(props, context) {
    const { pageSize, slotHeight, reqData, updateSelected } = toRaw(props);
    const checkboxFixedValues = ref([]);
    const loading = ref(true);
    const targetDom = ref(), targetTopDom = ref();
    let cache = [];

    let pageNum = 0;
    let itemTotalNum = 0;
    let currentScrollTop, originScrollTop = 0;

    // 点击触发视图更新
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (e) => {
      context.emit("checkBoxClick", e.target.defaultValue);
    };


    // 处理滚动事件
    const handleScroll = () => {

      currentScrollTop = targetDom.value.scrollTop;

      // 满足“下滚”更新数据的状态
      // 四个条件逻辑分别表示：非正在请求数据、下滚、仍有数据可请求、初始进入下一个页码(请求数据的阶段)
      if ( !loading.value && currentScrollTop > originScrollTop && (pageNum + 2) * pageSize < itemTotalNum && currentScrollTop >= pageNum * pageSize * slotHeight ) {

        pageNum += 1;

        // 读取缓存
        if((pageNum + 1)*pageSize<cache.length){
          console.log('cache', pageNum+1);
          loading.value = true;
          checkboxFixedValues.value.splice(checkboxFixedValues.value.length, 0, ...cache.slice((pageNum +1)*pageSize, (pageNum + 2)*pageSize));
          cutOldDataScrollDown();
          updateSelected();
          loading.value = false;
          return ;
        }

        // 请求数据
        loading.value = true; 
        console.log('request', pageNum+1);
        reqData(pageNum + 1).then((res) => {
          const { results } = res;
          checkboxFixedValues.value.splice(checkboxFixedValues.value.length, 0, ...results);
          cache = cache.concat(results||[]);

          cutOldDataScrollDown();
          updateSelected();
         
        }).catch(()=>{
          pageNum -= 1;
        }).finally(()=>{
          loading.value = false;
        });
      }

      // 满足“上滚”更新数据的状态
      // 四个条件逻辑分别表示：非正在请求数据、上滚、仍需要请求数据、初始进入上一个页码(请求数据的阶段)
      if ( !loading.value && currentScrollTop < originScrollTop && pageNum > 1 && currentScrollTop < (pageNum - 1) * pageSize * slotHeight ) {
        // console.log("up", pageNum, currentScrollTop);
        loading.value = true;
        cutOldDataScrollUp();
        if (pageNum > 2) {
          console.log('cache', pageNum-3);
          checkboxFixedValues.value.splice(0, 0, ...cache.slice((pageNum - 3)*pageSize, (pageNum - 2)*pageSize));
          updateSelected();
        }
        pageNum -= 1;
        loading.value = false;
      }

      originScrollTop = currentScrollTop;
    };

    // 下滚时裁剪旧数据
    const cutOldDataScrollDown = ()=>{
      if (pageNum > 2) {
        targetTopDom.value.style.height = (pageNum - 2) * pageSize * slotHeight + "px";
        checkboxFixedValues.value.splice(0, pageSize);
      }
    }

    // 上滚时裁剪旧数据
    const cutOldDataScrollUp = ()=>{
      checkboxFixedValues.value.splice(3 * pageSize, pageSize);
      if (pageNum > 2)
          targetTopDom.value.style.height = (pageNum - 3) * pageSize * slotHeight + "px";
    }

    // 请求第一页数据直到状态成功，并带动第二页请求
    const init = ()=>{
      destroy();
      loading.value = true;
      console.log('request', 0);
      reqData(0).then((res)=>{
        const { results, total } = res;
        itemTotalNum = total;
        checkboxFixedValues.value = results;
        updateSelected();

        cache = cache.concat(results||[]);
        if (total > results.length) init1(); 
        else {loading.value = false;}
      }).catch(()=>{
        setTimeout(init, 2000);
      });
    }
    // 请求第二页数据直到状态成功
    const init1 = ()=>{
      console.log('request', 1);
      reqData(1).then((res)=>{
        const { results } = res;
        checkboxFixedValues.value.splice(pageSize, 0, ...results);
        updateSelected();

        cache = cache.concat(results||[]);
        loading.value = false;
      }).catch(()=>{
        setTimeout(init1, 2000);
      });
    }

    const destroy = () => {
      pageNum = 0;
      itemTotalNum = 0;
      checkboxFixedValues.value = [];
      loading.value = true;
      cache = [];
      currentScrollTop = 0;
      originScrollTop = 0;
      targetDom.value.scrollTo(0, 0);
      targetTopDom.value.style.height = 0;
    };



    return {
      targetDom,
      targetTopDom,
      checkboxFixedValues,
      handleClick,
      handleScroll,
      loading,
      init
    };
  },
});
</script>

<style>
.target-dom {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: lightpink;
}

.top-helper {
  width: 100%;
  background-color: lightgoldenrodyellow;
}
</style>