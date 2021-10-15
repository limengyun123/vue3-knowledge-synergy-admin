<template>
  <!-- <a-dropdown :trigger="['click']">
    <a @click.prevent><FilterOutlined :class="{'dropdown-icon-inactive': dropdownIconInactive}"/></a>
    <template #overlay> -->
      <div style="padding: 8px; width: 390px; background-color: #ffffff; border-radius: 4px; box-shadow: 0 2px 8px #cccccc; ">
        <a-row style="padding: 9px" type="flex" justify="space-between">
          <a-checkbox
            v-model:checked="selectResult.selectAll"
          >
            <!-- :indeterminate="dropdownIndeterminate" -->
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
        <a-row style="height: 250px; overflow-y: scroll">
          <div ref="targetDom" @click.capture="handleClick" :onscroll="handleScroll">
            <div ref="targetTopDom" class="top-helper"></div>
            <a-checkbox-group v-model:value="selectResult.selectedValues" style="background-color: lightgreen">
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
import { defineComponent, reactive, ref } from 'vue';
import {
  FilterOutlined,
  RestOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SwapRightOutlined
} from "@ant-design/icons-vue";
import testData from "@/assets/test.json";

export default defineComponent({
  components: {
    FilterOutlined,
    RestOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    SwapRightOutlined
  },
  setup() {
    const dropdownIconInactive = true;
    const loading = ref(false);
    const checkboxFixedValues = ref(testData);
    const searchConditions = {
      ascend: true,
      searchContent: '',
      intervalFrom: '',
      intervalTo: ''
    };

    const selectResult = reactive({
      selectAll: false,
      selectedValues: []
    });


    const handleClick = ()=>{};
    const handleScroll = ()=>{};
    return {
      dropdownIconInactive,
      loading,
      checkboxFixedValues,
      searchConditions,
      selectResult,
      handleClick,
      handleScroll
    }
  },
})
</script>

<style lang="less">
.dropdown-icon-inactive{
  color: #aaaaaa;
}
</style>
