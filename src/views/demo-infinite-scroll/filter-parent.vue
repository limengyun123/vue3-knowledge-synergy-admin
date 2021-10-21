<template>
  <a-table :data-source="data" :columns="columns">
    <template #filterDropdown></template>
    <template #filterIcon="{column}">
      <Filter :columnName="column.dataIndex" :filterListURL="filterListReqURL" :additionalParams="additionalParam" @submitValues="submitColumnSelected"></Filter>
    </template>
  </a-table>
</template>

<script lang="ts">

/**
 * Filter公共组件的用法说明：
 * 1、参数 columnName(string) 为属性值列名
 * 2、filterListURL(string) 为弹窗请求待选项的 URL(POST)
 * 3、additionalParams(Object) 为需要附加的参数, 如{taskId: re412412}
 * 4、submitValues(Object) 向父组件传已提交的值
 * 5、区间设置这一样式待交互优化，目前已注释
 * 
 * 注意：
 * 1、filter.vue 522行的函数中切换 online/offline 演示效果
 * 2、若使用online请求，需配置跨域
 * 3、若使用offline请求，是直接使用模拟数据../assets/test_number.json
 */

import { defineComponent} from 'vue';
import Filter from './filter.vue';

const data = [
  {
    key: '1',
    contrib_institution_display: 'John Brown',
    contrib_country_bg: 32,
    contrib_state_bg: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    contrib_institution_display: 'Joe Black',
    contrib_country_bg: 42,
    contrib_state_bg: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    contrib_institution_display: 'Jim Green',
    contrib_country_bg: 32,
    contrib_state_bg: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    contrib_institution_display: 'Jim Red',
    contrib_country_bg: 32,
    contrib_state_bg: 'London No. 2 Lake Park',
  },
];

export default defineComponent({
  components:{
    Filter
  },
  setup() {
    const filterListReqURL = '/api/v1/ei/bestrecord/group/filter';
    const additionalParam = null;
    const columns = [
      {
        title: 'contrib_institution_display',
        dataIndex: 'contrib_institution_display',
        key: 'contrib_institution_display',
        slots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        }
      },
      {
        title: 'contrib_country_bg',
        dataIndex: 'contrib_country_bg',
        key: 'contrib_country_bg',
        slots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        }
      },
      {
        title: 'contrib_state_bg',
        dataIndex: 'contrib_state_bg',
        key: 'contrib_state_bg',
        slots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        }
      },
    ];

    const submitColumnSelected = (value: any)=>{
      console.log('submit', value);
    }


    return {
      data,
      columns,
      filterListReqURL,
      submitColumnSelected,
      additionalParam
    };
  },
});
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>