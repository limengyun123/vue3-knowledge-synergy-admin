<template>
  <a-table :data-source="data" :columns="columns" style="margin: 30px">
    <template #filterDropdown="">
      <!-- <a-button @click="handleClick(e)">点我</a-button> -->
    </template>
    <template #filterIcon="filtered">
         <a-dropdown :placement="placement">
        
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" @click="handleClick()"/>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
               ???
              </a>
            </a-menu-item>
            <a-menu-item>
              <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                2nd menu item
              </a>
            </a-menu-item>
            <a-menu-item>
              <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
                3rd menu item
              </a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
    
  </a-table>
</template>
<script>
import { SearchOutlined } from '@ant-design/icons-vue';
import { defineComponent, reactive, ref } from 'vue';
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Joe Black',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Jim Green',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
  },
];

export default defineComponent({
  components: {
    SearchOutlined,
  },
  setup() {
    const state = reactive({
      searchText: '',
      searchedColumn: '',
    });

    const searchInput = ref();

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        slots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        slots: {
        //   filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        }
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        slots: {
          filterDropdown: 'filterDropdown',
        //   filterIcon: 'filterIcon',
        }
      },
    ];

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = clearFilters => {
      clearFilters();
      state.searchText = '';
    };

    const handleClick = (e)=>{
        console.log('click', e);
    }

    return {
      data,
      columns,
      handleSearch,
      handleReset,
      searchText: '',
      searchInput,
      searchedColumn: '',
      handleClick
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