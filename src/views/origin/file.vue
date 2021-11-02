<template>
  <div>
    <input type="file" @change="handleFileChange($event.target)">
  </div>

  <div>
    <select @change="handleEncodeChange($event.target.value)">
      <option v-for="item in encodeType" :key="item" :value ="item">{{item}}</option>
    </select>
  </div>
  <div class="content-wrapper">{{fileContents}}</div>

  <div>
    <select @change="handleLFChange($event.target.value)">
      <option v-for="(val, key) in lineFeedType" :key="key" :value ="val">{{key}}</option>
    </select>
  </div>
  <div class="content-wrapper">
    <div v-for="(item,index) in splitByCRLF" :key="item">{{index+1}}  {{item}}</div>
  </div>

  <div>
    <div>
      <span @click="handleSeparatorChange($event.target)">
        <label v-for="(val, key) in lineSeparators" :key="key" style="margin: 20px;"><input type="radio" :value="val" :label="key" :checked="separatorSelected[key]"/>{{key}}</label> 
      </span>
      其他<input :value="otherSeparator" @input="handleSeparatorInput($event.target.value)" />
    </div>
    <div @click="handleMergeSeparators">
      <label><input type="radio" :checked="needMergeSep"/>连续分隔符号视为单个处理</label> 
    </div>
  </div>
  <div class="content-wrapper">
    <table>
      <tr v-for="line in splitBySep" :key="line">
        <td v-for="item in line" :key="item" style="margin: 10px">{{item}}</td>
      </tr>
    </table>
  </div>

  <div>
    <select @change="handleTextWrapperChange($event.target.value)" style="margin: 0 40px;">
      <option v-for="(val, key) in textWrapperSign" :key="key" :value ="val">{{key}}</option>
    </select>
  </div>
  <div class="content-wrapper">
    <table>
      <tr v-for="line in splitByQuotes" :key="line">
        <td v-for="item in line" :key="item" style="margin: 10px">{{item}}</td>
      </tr>
    </table>
  </div>
  <div>
    <span @click="handleColumnTypeChange($event.target)">
      <label v-for="(val, key) in columnDataType" :key="key">
        <input type="radio" :value="val" :checked="columnsType[selectedColumn]===val"/>{{key}}
      </label> 
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

type FileReadType = string | ArrayBuffer | null;
type SeparatorType = string|RegExp;

const encodeType = ["UTF-8", "Unicode", "GBK", "GB2312"];

const lineFeedType = {
  LF: '\n',
  CR: '\r',
  CRLF: '\r\n'
}

const lineSeparators: { [key: string]: SeparatorType} = {
  comma: ',',
  tab: '\t',
  semicolon: ';',
  space: ' ',
  other: ''
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


const fileRead1 = `abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#
abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#
abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#abc,;#`;

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
    
    const uploadControl = useUpload();
    const lineFeedControl = useLineFeed(unref(uploadControl.fileContents));
    const separatorControl = useSeparator(unref(lineFeedControl.splitByCRLF));
    const quotesControl = useQuotes(unref(separatorControl.splitBySep));
    const columnControl = useColumnOperate(unref(quotesControl.splitByQuotes));

    return {
      encodeType,
      lineFeedType,
      lineSeparators,
      textWrapperSign,
      columnDataType,

      ...uploadControl,
      ...lineFeedControl,
      ...separatorControl,
      ...quotesControl,
      ...columnControl

    }
  },
})



/*********************************** 文件上传 ***********************************/
function useUpload(){
  // const file = ref({} as Blob);
  // const fileContents: Ref<FileReadType> = ref('结果');
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
  //   }
  // }

  const fileContents: Ref<string> = ref(fileRead);

  return {
    fileContents,
    // handleFileChange,
    // handleEncodeChange
  }
}



/*********************************** 换行符选择 ***********************************/
function useLineFeed(fileContents: string){
  const splitByCRLF: Ref<string[]> = ref([]);

  const handleLFChange = (lineFeed: string)=>{
    splitByCRLF.value = unref(fileContents).split(lineFeed);
  }
  handleLFChange(lineFeedType.LF);

  return {
    splitByCRLF,
    handleLFChange
  }
}



/*********************************** 行分隔符选择 ***********************************/
function useSeparator(splitByCRLF: string[]){
  const separatorSelected: Ref<{[key:string]:boolean}> = ref({});
  const splitBySep: Ref<string[][]> = ref([]);
  const otherSeparator: Ref<string> = ref('');
  const needMergeSep: Ref<boolean> = ref(false);

  const avoidSeparatorUndefined = (sep: SeparatorType|undefined): SeparatorType=>{
    return sep||lineSeparators.comma;
  }

  const initSelected = ()=>{
    Object.keys(lineSeparators).forEach((item)=>{
      unref(separatorSelected)[item] = false;
    })
    unref(separatorSelected)['comma'] = true;
  }
  initSelected();
    
  const handleSeparatorChange = (target: HTMLInputElement)=>{
    const lineSep = target.value;
    if(lineSep===undefined) return ;

    const lineSepLabel = target.getAttribute('label')||'comma';
    separatorSelected.value[lineSepLabel] = !separatorSelected.value[lineSepLabel];
    // if(!(lineSepLabel==='other')||lineSeparators.other) updateDataBySeparators();
    updateDataBySeparators();
  }

  const handleSeparatorInput = (val: string)=>{
    otherSeparator.value = val;
    
    if(val){
      // // 限定输入单个字符
      // otherSeparator.value = val[val.length-1];
      
      // 正则分割
      try{
        lineSeparators.other = new RegExp(unref(otherSeparator));
        unref(separatorSelected)['other'] && updateDataBySeparators();
      }catch(error){
        console.log(error);
      }
    }
    else{
      lineSeparators.other = '';
    }
  }

  const updateDataBySeparators = ()=>{
    const usedSeparatorsLabel: string[] = Object.keys(lineSeparators).filter((item)=>separatorSelected.value[item]&&lineSeparators[item]);
    const usedSeparators: SeparatorType[] = usedSeparatorsLabel.map((item)=>lineSeparators[item]) as SeparatorType[];

    if(usedSeparators.length===0) splitBySep.value = splitByCRLF.map((line)=>[line]);
    else{
      const firstSeparator = avoidSeparatorUndefined(usedSeparators.shift());
      splitBySep.value = splitByCRLF.map((line)=>line.split(firstSeparator));

      if(usedSeparators.length>0){
        // 对表格中每一行进行多元分隔符分割
        splitBySep.value = unref(splitBySep).map((line)=>{
          let targetLine = line;
          usedSeparators.forEach((sep)=>{
            targetLine = targetLine.map((item)=>item.split(sep)).reduce((total, item)=>{return total.concat(...item)}, []);
          })
          return targetLine;
        })
      }
    } 
  }
  updateDataBySeparators();

  const handleMergeSeparators = ()=>{
    needMergeSep.value = !unref(needMergeSep);
    if(unref(needMergeSep)){
      splitBySep.value = unref(splitBySep).map((line)=>line.filter((item)=>item!=''));
    }else{
      updateDataBySeparators();
    }
  }
  

  return {
    splitBySep,
    separatorSelected,
    otherSeparator,
    needMergeSep,

    handleSeparatorChange,
    handleSeparatorInput,
    handleMergeSeparators
  }
}



/*********************************** 文本识别符号选择 ***********************************/
function useQuotes(splitBySep: string[][]){
  const splitByQuotes: Ref<string[][]> = ref([]);
  const handleTextWrapperChange = (textWrapper: string)=>{
    if(textWrapper===textWrapperSign.empty) return ;

    splitByQuotes.value = splitBySep.map((line)=>line.map((item)=>{
      return item.split(textWrapper)[1]??item;
    }));
  }
  handleTextWrapperChange(textWrapperSign.double);

  return {
    splitByQuotes,
    handleTextWrapperChange
  }
}



/*********************************** 行点击 ***********************************/
function useColumnOperate(splitByQuotes: string[][]){
  const columnsNum = unref(splitByQuotes)[0].length;
  const columnsType = ref(new Array(columnsNum).fill("常规"));


  const selectedColumn: Ref<number> = ref(0);
  const handleTableCellClick = (target: HTMLElement)=>{
    const columnIndex = target.getAttribute('columnIndex');
    if(columnIndex!=undefined) selectedColumn.value = parseInt(columnIndex);
  }

  const handleColumnTypeChange = (target: HTMLInputElement)=>{
    const selectedValue = target.value;
    selectedValue && (columnsType.value[unref(selectedColumn)]=selectedValue);
  }

  return {
    columnsType,
    selectedColumn,
    handleTableCellClick,
    handleColumnTypeChange
  }
}
</script>

<style>
.content-wrapper{
  width: 1000px;
  margin: 30px auto;
  padding: 20px;
  border: solid 1px #cccccc;
  text-align: left;
  overflow: auto;
}

.content-wrapper td{
  border-right: solid #aaaaaa 1px;
  padding: 0 10px;
}
</style>
