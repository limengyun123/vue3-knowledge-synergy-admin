<template>
  <div>
    <input type="file" @change="handleFileChange($event.target)">
  </div>

  <div>
    <select @change="handleEncodeChange($event.target.value)">
      <option value ="UTF-8">UTF-8</option>
      <option value ="Unicode">Unicode</option>
      <option value="GBK">GBK</option>
      <option value="GB2312">GB2312</option>
    </select>
  </div>
  <div class="content-wrapper">{{fileContents}}</div>

  <div>
    <select @change="handleLFChange($event.target.value)">
      <option v-for="(val, key) in lineFeedTypes" :key="key" :value ="val">{{key}}</option>
    </select>
  </div>
  <div class="content-wrapper">
    <div v-for="(item,index) in splitByCRLF" :key="item">{{index+1}}  {{item}}</div>
  </div>

  <div>
    <select @change="handleSeparatorChange($event.target.value)">
      <option v-for="(val, key) in lineSeparators" :key="key" :value ="val">{{key}}</option>
    </select>
    <select @change="handleTextWrapperChange($event.target.value)" style="margin: 0 40px;">
      <option v-for="(val, key) in textWrapperSign" :key="key" :value ="val">{{key}}</option>
    </select>
    <span @click="handleColumnTypeChange($event.target)">
      <label v-for="(val, key) in columnDataType" :key="key"><input name="Fruit" type="radio" :value="val" :checked="columnsType[selectedColumn]===val"/>{{key}}</label> 
    </span>
  </div>
  <div class="content-wrapper">
    <table @click="handleTableCellClick($event.target)">
      <thead>
        <tr>
          <th v-for="(item, index) in columnsType" :key="index" style="text-align: center; background-color: white !important">{{item}}</th>
        </tr>
      </thead>
      <colgroup>
        <col v-if="selectedColumn>0" :span="selectedColumn">
        <col span="1" style="background-color:lightgreen">
      </colgroup>
      <tr v-for="line in splitByQuotes" :key="line">
        <td v-for="(item, index) in line" :key="item" :columnIndex="index" style="margin: 10px">{{item}}</td>
      </tr>
    </table>
  </div>

</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, unref } from 'vue'

type FileRead = string | ArrayBuffer | null;

const lineFeedTypes = {
  LF: '\n',
  CR: '\r',
  CRLF: '\r\n'
}

const lineSeparators = {
  comma: ',',
  tab: '\t',
  semicolon: ';',
  space: ' '
}

const textWrapperSign = {
  double: '"',
  single: "'",
  empty: ''
}

const columnDataType = {
  "常规": "常规",
  "文本": "文本",
  "日期": "MDY",
  "不导入此列": "忽略列"
}


const fileRead = `"t1","sa1","张建国","上海市","200002","北京西路5号","54687452","03/06/1993","男","钢铁侠玩具"
"t2","sa2","张建国","上海市","510045","北京路5号","54687452","03/06/1993","空","跑步鞋"
"t3","sa3","张建国","上海市","200002","北京西路5号","54687452","空","男","绿巨人玩具"
"t4","sa3","张建国","广州市","200002","北京路5号","52141212","36041","女","普拉达"
"t5","sa4","彭万里","广州市","510032","滨海路30号","20275142","10/27/1955","男","乒网羽鞋"
"t6","sa5","高大山","韶关市","512002","深南路57号","25144042","05/14/1983","空","跑步鞋"
"t7","sa6","谢大海","深圳市","518035","红荔路44号","98061332","35589","男","运动鞋"
"t8","sa7","马宏宇","珠海市","519000","笋岗路2号","58157841","08/15/1954","男","足球鞋"
"t9","sa8","林莽","汕头市","515041","北环路1号","23142891","03/14/1957","空","综训鞋"
"t10","sa9","黄强辉","佛山市","528000","南海大道46号","97264281","07/26/1972","男","篮球鞋"
"t11","sa10","章汉夫","江门市","529000","沙河西路26号","90292191","10/29/1970","男","凉鞋/拖鞋"
"t12","sa11","范长江","湛江市","524047","沙河东路23号","40148091","10/14/1950","空","休闲鞋"
"t13","sa12","林君雄","茂名市","525000","香蜜湖路31号","71226432","11/22/1978","男","帆布鞋"
"t14","sa13","谭平山","肇庆市","526040","彩田路5号","79215782","09/21/1972","男","甩脂机"
"t15","sa14","朱希亮","惠州市","516000","皇岗路8号","81243342","01/24/1982","空","杠铃哑铃"
"t16","sa15","李四光","梅州市","514021","华富路33号","49287002","09/28/1964","男","跑步机"
"t17","sa16","甘铁生","汕尾市","516600","华强路42号","59213451","09/21/1999",,"健身器械"
"t18","sa17","伍绍祖","河源市","517000","上步路55号","91125742","31757",,"椭圆机"
"t19","sa18","马继祖","阳江市","529500","红岭路33号","83103842","25114","男","多功能器材"
"t20","sa19","程孝先","清远市","511500","宝安路51号","51133472","01/13/1973","男","举重床"
"t21","sa20","宗敬先","东莞市","523888","东门路18号","91123682","22616","男","小器材"
"t22","sa21","年广嗣","中山市","528403","北环大道7号","60164821","10/16/1972","男","健腹器"
"t23","sa22","汤绍箕","潮州市","521000","滨海大道15号","15272961","05/27/1956","空","踏步机"
"t24","sa23","吕显祖","揭阳市","522000","文锦路13号","22195702","02/19/1965","男","动感单车"
"t25","sa24","何光宗","云浮市","527300","深南大道41号","11245812","01/24/1985","男","仰卧板"`;


export default defineComponent({
  setup() {
    
    // const file = ref({} as Blob);
    // const fileContents: Ref<FileRead> = ref('结果');
    // const reader: FileReader = new FileReader();

    // const handleFileChange = (target: HTMLInputElement)=>{
    //   if(!target.files || target.files?.length==0) return ;
    //   else file.value = target.files[0];
    // }

    // const handleEncodeChange = (encodeType: string)=>{
    //   if(!unref(file).type) return;

    //   reader.readAsText(file.value, encodeType);
    //   reader.onload = function(){
    //     fileContents.value = reader.result;
    //   console.log(fileContents.value);
    //   }
    // }

    const fileContents: Ref<string> = ref(fileRead);


    // 换行符选择
    const splitByCRLF: Ref<string[]> = ref([]);

    const handleLFChange = (lineFeed: string)=>{
      splitByCRLF.value = unref(fileContents).split(lineFeed);
    }
    handleLFChange(lineFeedTypes.LF);


    // 行分隔符选择
    const splitBySep: Ref<string[][]> = ref([]);
    
    const handleSeparatorChange = (lineSep: string)=>{
      splitBySep.value = unref(splitByCRLF).map((line)=>line.split(lineSep));
    }
    handleSeparatorChange(lineSeparators.comma);


    // 文本识别符号选择
    const splitByQuotes: Ref<string[][]> = ref([]);
    const handleTextWrapperChange = (textWrapper: string)=>{
      if(textWrapper===textWrapperSign.empty) return ;

      splitByQuotes.value = unref(splitBySep).map((line)=>line.map((item)=>{
        return item.split(textWrapper)[1]??item;
      }));
    }
    handleTextWrapperChange(textWrapperSign.double);


    // 行点击
    const columnsNum = unref(splitByQuotes)[0].length;
    const columnsType = ref(new Array(columnsNum).fill("常规"));


    const selectedColumn: Ref<number> = ref(0);
    const handleTableCellClick = (target: HTMLElement)=>{
      const columnIndex = target.getAttribute('columnIndex');
      if(columnIndex!=undefined) selectedColumn.value = parseInt(columnIndex);
    }

    const handleColumnTypeChange = (target: HTMLInputElement)=>{
      console.log(target.value);
      const selectedValue = target.value;
      selectedValue && (columnsType.value[unref(selectedColumn)]=selectedValue);
      // const columnIndex = target.value;
      // if(columnIndex!=undefined) selectedColumn.value = parseInt(columnIndex);
    }

    return {
      lineFeedTypes,
      lineSeparators,
      textWrapperSign,
      columnDataType,

      fileContents,
      splitByCRLF,
      splitBySep,
      splitByQuotes,
      columnsType,
      selectedColumn,

      // handleFileChange,
      // handleEncodeChange,
      handleLFChange,
      handleSeparatorChange,
      handleTextWrapperChange,
      handleTableCellClick,
      handleColumnTypeChange
    }
  },
})
</script>

<style>
.content-wrapper{
  margin: 30px 100px; 
  padding: 20px; 
  border: solid 1px #cccccc;
  text-align: left;
}

.content-wrapper td{
  border-right: solid #aaaaaa 1px;
  padding: 0 10px;
}
</style>
