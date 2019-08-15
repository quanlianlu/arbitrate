<template>
  <!-- 分部下业务员和派件量详情 -->
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="46px" >
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"  v-if="params.type === 1"
        title="催办"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backTolost'>
      </x-header>
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"  v-if="params.type === 2"
        title="疑似遗失"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backTolost'>
      </x-header>
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"  v-if="params.type === 3"
        title="待仲裁遗失"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backTolost'>
      </x-header>
      <div>
      
        <tab :line-width="1" custom-bar-width="90px" v-model="toDealIs">
            <tab-item @on-item-click='quertData'>应派未派</tab-item>
            <tab-item @on-item-click='quertData'>应签未签</tab-item>
        </tab>
         <div v-show="toDealIs==0" class="content">
                <div class="total">
                  <span class="titleTotal">{{ManList1.name}}</span><span class="totalNum" @click="toDetail()">{{ManList1.count}}</span>
                </div>
                <div  class="list">
                  <x-table :cell-bordered="false" style="background-color:#fff;">
                    <thead class="thead">
                      <tr>
                        <th>三段码</th>
                        <th>业务员</th>
                        <th>应派未派量</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in ManList1.dataList" :key="item.code">
                        <td>{{item.code}}</td>
                        <td v-if="item.salesMan.length>1"><span @click="showSales(item.salesMan)">{{item.salesMan[0]+'...'}}</span></td>
                        <td v-if="item.salesMan.length<=1"><span >{{item.salesMan.length?item.salesMan[0]:''}}</span></td>
                        <td class="num" @click="toDetail(item.code)">{{item.count}}</td>
                      </tr>
                  <!--    <tr>
                        <td>其他</td>
                        <td></td>
                        <td class="num" @click="toDetail()">3</td>
                      </tr>-->
                     
                    </tbody>
                  </x-table>
                        <alert v-model="alertShow" title="业务员信息" @on-show="onShow" @on-hide="onHide"> {{alertMsg}}</alert>
                </div>
            </div>
            <div v-show="toDealIs==1" class="content">
              <div class="total">
                  <span class="titleTotal">{{ManList2.name}}</span><span class="totalNum" @click="toDetail()">{{ManList2.count}}</span>
                </div>
                <div  class="list" >
                  <x-table :cell-bordered="false" style="background-color:#fff;">
                    <thead class="thead">
                      <tr>
                        <th>业务员</th>
                        <th>应签未签量</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in ManList2.dataList" :key="item.code">
                        <td><span v-for="(sales, index) in item.salesMan" :key="index">{{sales+' '}}</span></td>
                        <td class="num" @click="toDetail(item.code)">{{item.count}}</td>
                      </tr>
                    </tbody>
                  </x-table>
                </div>
            </div>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    XHeader,
    ButtonTab, ButtonTabItem,Tab, TabItem,
    ViewBox,XTable,Alert 
  } from 'vux';
  import {queryTcodeManList,getUserInfo} from '../../service/service';

  export default {
    components: {
      XHeader,
      ViewBox,
      ButtonTab,
      ButtonTabItem,
      Tab, TabItem,XTable,Alert
    },
    data() {
      return {
        classTab:{
          toDeal:'催办',
          suspectedLost:'疑似遗失',
          toJudge:'待仲裁遗失',
        },
        alertShow:false,
        lostType:0,
        toDealIs:0,
        stationName:'',
        stationCode:'',
        alertMsg:'',
        ManList1:{
          name:'',
          count:'',
          dataList:[
            {
              salesMan:[]
            }
          ]
        },
        ManList2:{
          name:'',
          count:'',
          dataList:[
            {
              salesMan:[]
            }
          ]
        },

        params:{
          type:1,
          childType:1,
          org:''
        }
      };
    },
    methods: {
      showSales(val) {
        this.alertMsg = val.join(',')
        this.alertShow = true
      },
      onShow() {
        console.log('wo show le');
        
      },
      onHide() {
        console.log('wo onHide le');
        
      },
      toDetail(val) {
        if(val) {
          if(this.toDealIs == 0){
            //应派未派
            this.params.thirdCode = val

          }else {
            //应签未签
            this.params.empCode = val
          }
        }
          this.params.org = this.stationCode
          console.log(this.$route.params);
       
          this.$router.push({name:'催办明细',params:this.params})
      },
      backTolost () {
        console.log(this.params);
        this.$router.push({name:'遗失预警类型',params:this.params})
      },
      test() {
        let _this = this;
        let leaveBtn = document.getElementsByClassName('left-arrow')[0];
        leaveBtn.addEventListener('click',function() {
          _this.$route.meta.keepAlive = false
        })
      },
      quertData() {
          this.toDealIs == 0 ? this.params.childType = 1 : this.params.childType = 2
          let params = this.params;
          let _this = this;
          this.queryTcodeManList(params);
      },
      async queryTcodeManList (params) {
        let _this = this;
        let result = await queryTcodeManList(params);
        if(result.status === 0) {
          console.log(result.data.dataList.length);
          
          for(let i = 0 ; i < result.data.dataList.length ; i ++) {
            
            result.data.dataList[i].salesMan = result.data.dataList[i].salesMan.split(',')
          }
          if(_this.toDealIs === 0) {
            _this.ManList1.count = result.data.count;
            _this.ManList1.dataList = result.data.dataList
           
          }else {
            _this.ManList2.count = result.data.count;
            _this.ManList2.dataList = result.data.dataList
            // if(_this.ManList2.dataList.salesMan) {
            //   _this.ManList2.dataList.salesMan = _this.ManList2.dataList.salesMan.split(',')
            // }
          }

        }
      }
     
    },
    created() {
        this.params.type = this.$route.params.type
        this.params.childType = this.$route.params.childType
        this.params.org = this.$route.params.org
        let _this = this
        getUserInfo().then(backJson => {
            _this.stationCode = backJson.data.stationCode;
            if(!_this.$route.params.name) {
              _this.stationName = backJson.data.stationName
              _this.ManList1.name = backJson.data.stationName
              _this.ManList2.name = backJson.data.stationName
              console.log('expressCreatedexpressCreated',_this.ManList1.name);
            }else {
              _this.stationName = _this.$route.params.name
              _this.ManList1.name = _this.$route.params.name
              _this.ManList2.name = _this.$route.params.name
            }
        });
    },
    mounted() {
      this.$nextTick(()=>{
        if(this.$route.params.childType) {
          this.toDealIs = +this.params.childType - 1
        }
        this.quertData()
      })
      // this.test()
      console.log(this.$route.params);
      
    },
    activated() {
      window.goToBack = () => {
        this.backClick();
      };
    },
    // beforeRouteLeave(to,from,next) {
    //       if(to.name == '催办明细' && from.name == '分部下业务员和派件量详情' ) {
    //         console.log(12222222);
            
    //         from.meta.keepAlive = true
    //       }
    //       if(to.name == '遗失预警类型' && from.name == '分部下业务员和派件量详情' ) {
    //         from.meta.keepAlive = false
    //       }
    //       next()
    // }
  };
</script>
<style>
.vux-tab-bar-inner {
  background-color: #4080CA !important;
}
#vux_view_box_body {
  background: #fff;
}
.vux-table:after {
  border-top:0px !important;
}
.vux-table td {
  font-size: 16px;
}
.total {
  
}
.titleTotal {
    color: #333;
    font-size: 16px;
}
.num {
  color:#ff9c9c;
  /* text-decoration: underline; */
}
</style>

<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';

  .grid-center {
    display: block;
    text-align: center;
    color: #666;
  }
  .content {
    margin-top:10px;
    font-size: 20px;
    // background: #fff;
    .total{
      text-align: center;
      color: #5c92d2;
      padding-bottom: 10px;
      border-bottom: 1px solid  #ddd;
      .totalNum {
        margin-left:30px;
        color: #ff9c9c;
        // text-decoration: underline;
      }
    }
    .list {
      padding: 0px 15px 0px 15px;
      .listTitle {
        color: #5c92d2;
        margin-top:10px;
        .listNum {
          float: right;
          color: #ff9c9c;
          margin-right:10px;
          // text-decoration: underline;
        }
      }
    }
  }
</style>
