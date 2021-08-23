<template>
  <div id="target-dom" @click.capture="handleClick" :onscroll="handleScroll">
    <div id="top-helper"></div>
    <div v-for="value in checkboxFixedValues" :key="value">
      <slot :checkValue="value"></slot>
    </div>
    <div v-if="loading"><a-spin /></div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, toRaw } from "vue";

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
    let cache = [];

    let pageNum = 0;
    let itemTotalNum = 0;
    let currentScrollTop, originScrollTop = 0;
    let requesting = false;
    let targetDom, targetTopDom;

    // 点击触发视图更新
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (e) => {
      context.emit("checkBoxClick", e.target.defaultValue);
    };


    // 处理滚动事件
    const handleScroll = () => {

      currentScrollTop = targetDom.scrollTop;

      // 更新视图中的加载符状态
      if ( !requesting && (pageNum + 2) * pageSize >= itemTotalNum){
        loading.value = false;
      }

      // 满足“下滚”更新数据的状态
      // 四个条件逻辑分别表示：非正在请求数据、下滚、仍有数据可请求、初始进入下一个页码(请求数据的阶段)
      if ( !requesting && currentScrollTop > originScrollTop && (pageNum + 2) * pageSize < itemTotalNum && currentScrollTop >= pageNum * pageSize * slotHeight ) {
        console.log("down", pageNum, currentScrollTop);

        pageNum += 1;

        // 读取缓存
        if((pageNum + 1)*pageSize<cache.length){
          console.log('cache', pageNum+1);
          checkboxFixedValues.value.splice(checkboxFixedValues.value.length, 0, ...cache.slice((pageNum +1)*pageSize, (pageNum + 2)*pageSize));
          cutOldDataScrollDown();
          updateSelected();

          return ;
        }

        // 请求数据
        requesting = true; 
        reqData(pageNum + 1).then((res) => {
          const { results } = res;
          checkboxFixedValues.value.splice(checkboxFixedValues.value.length, 0, ...results);
          cache = cache.concat(results||[]);

          cutOldDataScrollDown();
          updateSelected();
         
        }).catch(()=>{
          pageNum -= 1;
        }).finally(()=>{
          requesting = false;
        });
      }

      // 满足“上滚”更新数据的状态
      // 四个条件逻辑分别表示：非正在请求数据、上滚、仍需要请求数据、初始进入上一个页码(请求数据的阶段)
      if ( !requesting && currentScrollTop < originScrollTop && pageNum > 1 && currentScrollTop < (pageNum - 1) * pageSize * slotHeight ) {
        // console.log("up", pageNum, currentScrollTop);
        cutOldDataScrollUp();
        if (pageNum > 2) {
          console.log('cache', pageNum-3);
          checkboxFixedValues.value.splice(0, 0, ...cache.slice((pageNum - 3)*pageSize, (pageNum - 2)*pageSize));
          updateSelected();
        }
        pageNum -= 1;
      }

      originScrollTop = currentScrollTop;
    };

    // 下滚时裁剪旧数据
    const cutOldDataScrollDown = ()=>{
      if (pageNum > 2) {
        targetTopDom.style.height = (pageNum - 2) * pageSize * slotHeight + "px";
        checkboxFixedValues.value.splice(0, pageSize);
      }
    }

    // 上滚时裁剪旧数据
    const cutOldDataScrollUp = ()=>{
      checkboxFixedValues.value.splice(3 * pageSize, pageSize);
      if (pageNum > 2)
          targetTopDom.style.height = (pageNum - 3) * pageSize * slotHeight + "px";
    }

    // 请求第一页数据直到状态成功，并带动第二页请求
    const init = ()=>{
      requesting = true;
      reqData(0).then((res)=>{
        const { results, total } = res;
        itemTotalNum = total;
        checkboxFixedValues.value = results;

        cache = cache.concat(results||[]);
        if (total > results.length) init1(); 
        else {requesting = false;loading.value=false;}
      }).catch(()=>{
        setTimeout(init, 2000);
      });
    }
    // 请求第二页数据直到状态成功
    const init1 = ()=>{
      reqData(1).then((res)=>{
        const { results } = res;
        checkboxFixedValues.value.splice(pageSize, 0, ...results);

        cache = cache.concat(results||[]);
        requesting = false;
      }).catch(()=>{
        setTimeout(init1, 2000);
      });
    }


    onMounted(() => {
      targetDom = document.querySelector("#target-dom");
      targetTopDom = document.querySelector("#top-helper");
      init();
    });


    return {
      checkboxFixedValues,
      handleClick,
      handleScroll,
      loading
    };
  },
});
</script>

<style>
#target-dom {
  width: 600px;
  height: 500px;
  background-color: lightgreen;
  overflow: auto;
}

#top-helper {
  width: 500px;
  background-color: lightblue;
}

</style>