<template>
  <a-pagination
    show-size-changer
    show-quick-jumper
    v-model:current="paginationInfo.pageNum"
    v-model:pageSize="paginationInfo.pageSize"
    :total="500"
    :show-total="total => `共有${total}条`"
    @change="getBestNameTaskList"
    @showSizeChange="(a,b)=>getBestNameTaskList(a,b)"
    
  />
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  setup() {
    const paginationInfo = reactive({
      pageNum: 1,
      pageSize: 10
    });

    const getBestNameTaskList = (current: number, pageSize: number) => {
      console.log(current, pageSize);
    };

    return {
      paginationInfo,
      getBestNameTaskList
    }
  },
})
</script>
