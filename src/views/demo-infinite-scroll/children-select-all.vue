<template>
  <div id="target-dom" @click.capture="handleClick" :onscroll="handleScroll">
    <div id="top-helper"></div>
    <div v-for="value in checkboxFixedValues" :key="value">
      <slot :checkValue="value"></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, toRaw } from "vue";

export default defineComponent({
  props: {
    pageSize: Number,
    slotHeight: Number,
    reqData: Function,
    updateSelected: Function,
  },
  setup(props, context) {
    const { pageSize, slotHeight, reqData, updateSelected } = toRaw(props);
    const checkboxFixedValues = ref([]);

    let pageNum = 0;
    let itemTotalNum = 0;
    let currentScrollTop, originScrollTop = 0;
    let requesting = false;
    let targetDom, targetTopDom;

    const handleClick = (e) => {
      context.emit("checkBoxClick", e.target.defaultValue);
    };

    const handleScroll = () => {
      currentScrollTop = targetDom.scrollTop;

      if ( !requesting && currentScrollTop > originScrollTop && (pageNum + 2) * pageSize < itemTotalNum && currentScrollTop >= pageNum * pageSize * slotHeight ) {
        console.log("down", pageNum, currentScrollTop);
        if (pageNum > 1) {
          targetTopDom.style.height = (pageNum - 1) * pageSize * slotHeight + "px";
          checkboxFixedValues.value.splice(0, pageSize);
        }

        pageNum += 1;
        requesting = true; 
        reqData(pageNum + 1).then((res) => {
          const { results, total } = res;
          itemTotalNum = total;
          checkboxFixedValues.value.splice(checkboxFixedValues.value.length, 0, ...results);
          updateSelected();
          requesting = false;
        });

      }

      if ( !requesting && currentScrollTop < originScrollTop && pageNum > 1 && currentScrollTop < (pageNum - 1) * pageSize * slotHeight ) {
        console.log("up", pageNum, currentScrollTop);
        if (pageNum > 2) {
          requesting = true; 
          reqData(pageNum - 3).then((res) => {
            checkboxFixedValues.value.splice(3 * pageSize, pageSize);
            targetTopDom.style.height = (pageNum - 3) * pageSize * slotHeight + "px";

            const { results, total } = res;
            itemTotalNum = total;
            checkboxFixedValues.value.splice(0, 0, ...results);
            updateSelected();
            requesting = false;
            pageNum -= 1;
          });
        }
        else{
          checkboxFixedValues.value.splice(3 * pageSize, pageSize);
          pageNum -= 1;
        }
      }

      originScrollTop = currentScrollTop;
    };


    onMounted(() => {
      targetDom = document.querySelector("#target-dom");
      targetTopDom = document.querySelector("#top-helper");

      reqData(0).then((res)=>{
        const { results, total } = res;
        itemTotalNum = total;
        checkboxFixedValues.value = results;
        if (total > results.length){
          reqData(1).then((res)=>{
            const { results } = res;
            checkboxFixedValues.value.splice(pageSize, 0, ...results);
          });
        }
      });

    });


    return {
      checkboxFixedValues,
      handleClick,
      handleScroll,
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