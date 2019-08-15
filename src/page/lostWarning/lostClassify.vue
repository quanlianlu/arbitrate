<template>
  <!-- 遗失预警类型 -->
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="46px">
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"
        title="遗失预警"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backTohome' >
      </x-header>
      <div style="padding:15px 0px;">
        <div class="buttonTabPart">
          <button-tab v-model="lostType">
            <button-tab-item @on-item-click="queryDataList">{{classTab.toDeal}}</button-tab-item>
            <button-tab-item @on-item-click="queryDataList">{{classTab.suspectedLost}}</button-tab-item>
            <button-tab-item @on-item-click="queryDataList">{{classTab.toJudge}}</button-tab-item>
          </button-tab>
        </div>
        <div v-show="lostType==0">
          <tab :line-width="1" custom-bar-width="90px" v-model="toDealData.toDealIs">
            <tab-item @on-item-click="queryDataList(toDealData.toDealIs === 0)">应派未派</tab-item>
            <tab-item @on-item-click="queryDataList((toDealData.toDealIs === 1))">应签未签</tab-item>
          </tab>
          <div v-if="noBranch">
              <div v-show="toDealIs==0" class="content">
                <div class="total">
                  <span>上海市炸鸡排分部应派未派</span><span class="totalNum">112</span>
                </div>
                <div  class="list" style="margin-top:10px;">
                  <x-table :cell-bordered="false" style="background-color:#fff;">
                    <thead class="thead">
                      <tr>
                        <th>三段码</th>
                        <th>业务员</th>
                        <th>应派未派量</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in 4" :key="item">
                        <td>020</td>
                        <td>皮卡丘</td>
                        <td class="num">12</td>
                      </tr>
                      <tr>
                        <td>其他</td>
                        <td></td>
                        <td class="num">3</td>
                      </tr>
                     
                    </tbody>
                  </x-table>
                </div>
            </div>
            <div v-show="toDealIs==1" class="content">
              <div class="total">
                  <span>上海市炸鸡排分部应签未签</span><span class="totalNum">112</span>
                </div>
                <div  class="list" style="margin-top:10px;">
                  <x-table :cell-bordered="false" style="background-color:#fff;">
                    <thead class="thead">
                      <tr>
                        <th>三段码</th>
                        <th>业务员</th>
                        <th>应签未签量</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in 4" :key="item">
                        <td>020</td>
                        <td>皮卡丘</td>
                        <td class="num">12</td>
                      </tr>
                      <tr>
                        <td>其他</td>
                        <td></td>
                        <td class="num">3</td>
                      </tr>
                     
                    </tbody>
                  </x-table>
                </div>
            </div>
          </div>
          <div v-else>
            <div v-show="toDealData.toDealIs==0" class="content">
              <!-- 催办合计 应派未派-->
              <div class="total">
                <span>催办合计</span><span class="totalNum" @click="toExpressList()">{{toDealData.toDealSend.reminderCount}}</span>
              </div>
              <div class="list">
                  <div v-for="item in toDealData.toDealSend.list" :key="item.branchCode" class="listTitle">
                    {{item.branchName}}
                    <div class="listNum" @click="toExpressList(item.branchCode, item.branchName)">{{item.warnCount}}</div>
                  </div>
              </div>
            </div>
            <div v-show="toDealData.toDealIs==1" class="content">
              <!-- 催办合计 应签未签-->
              <div class="total">
                <span>催办合计</span><span class="totalNum" @click="toExpressList()">{{toDealData.toDealSign.reminderCount}}</span>
              </div>
              <div class="list">
                  <div v-for="item in toDealData.toDealSign.list" :key="item.branchCode" class="listTitle">
                    {{item.branchName}}
                    <div class="listNum" @click="toExpressList(item.branchCode, item.branchName)">{{item.warnCount}}</div>
                  </div>
              </div>
            </div>

          </div>
        </div>
        <div v-show="lostType==1">
          <tab :line-width="1" custom-bar-width="90px" v-model="suspectedLostData.toDealIs">
            <tab-item @on-item-click="queryDataList(toDealData.toDealIs === 0)">应派未派</tab-item>
            <tab-item @on-item-click="queryDataList(toDealData.toDealIs === 1)">应签未签</tab-item>
          </tab>
          <div v-if="noBranch">
           
              <div v-show="toDealIs==0" class="content">
                <div class="total">
                  <span>上海市炸鸡排分部应派未派</span><span class="totalNum">112</span>
                </div>
                <div  class="list" style="margin-top:10px;">
                  <x-table :cell-bordered="false" style="background-color:#fff;">
                    <thead class="thead">
                      <tr>
                        <th>三段码</th>
                        <th>业务员</th>
                        <th>应派未派量</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in 4" :key="item">
                        <td>020</td>
                        <td>皮卡丘</td>
                        <td class="num">12</td>
                      </tr>
                      <tr>
                        <td>其他</td>
                        <td></td>
                        <td class="num">3</td>
                      </tr>
                     
                    </tbody>
                  </x-table>
                </div>
            </div>
            <div v-show="toDealIs==1" class="content">
              <div class="total">
                  <span>上海市炸鸡排分部应签未签</span><span class="totalNum">112</span>
                </div>
                <div  class="list" style="margin-top:10px;">
                  <x-table :cell-bordered="false" style="background-color:#fff;">
                    <thead class="thead">
                      <tr>
                        <th>三段码</th>
                        <th>业务员</th>
                        <th>应签未签量</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in 4" :key="item">
                        <td>020</td>
                        <td>皮卡丘</td>
                        <td class="num">12</td>
                      </tr>
                      <tr>
                        <td>其他</td>
                        <td></td>
                        <td class="num">3</td>
                      </tr>
                     
                    </tbody>
                  </x-table>
                </div>
            </div>
          </div>
          <div v-else>
            <div v-show="suspectedLostData.toDealIs==0" class="content">
               <!-- 疑似遗失 应派未派 -->
              <div class="total">
                <span>疑似遗失合计</span><span class="totalNum"  @click="toExpressList()">{{suspectedLostData.suspectedLostSend.reminderCount}}</span>
              </div>
              <div class="list">
                  <div v-for="item in suspectedLostData.suspectedLostSend.list" :key="item.branchCode" class="listTitle">
                    {{item.branchName}}
                    <div class="listNum" @click="toExpressList(item.branchCode,item.branchName)">{{item.warnCount}}</div>
                  </div>
              </div>
            </div>
            <div v-show="suspectedLostData.toDealIs==1" class="content">
              <!-- 疑似遗失 应签未签 -->
              <div class="total">
                <span>疑似遗失合计</span><span class="totalNum" @click="toExpressList()">{{suspectedLostData.suspectedLostSign.reminderCount}}</span>
              </div>
              <div class="list">
                  <div v-for="item in suspectedLostData.suspectedLostSign.list" :key="item.branchCode" class="listTitle">
                    {{item.branchName}}
                    <div class="listNum" @click="toExpressList(item.branchCode,item.branchName)">{{item.warnCount}}</div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div v-show="lostType==2">
          <tab :line-width="1" custom-bar-width="90px" v-model="toJudgeData.toDealIs">
            <tab-item @on-item-click="queryDataList(toDealData.toDealIs === 0)">应派未派</tab-item>
            <tab-item @on-item-click="queryDataList(toDealData.toDealIs === 1)">应签未签</tab-item>
          </tab>
         
            <div v-show="toJudgeData.toDealIs==0" class="content">
               <!-- 待仲裁遗失 应派未派 -->
              <div class="total">
                <span>待仲裁遗失合计</span><span class="totalNum"  @click="toExpressList()">{{toJudgeData.toJudgeSend.reminderCount}}</span>
              </div>
              <div class="list">
                  <div v-for="item in toJudgeData.toJudgeSend.list" :key="item.branchCode" class="listTitle">
                    {{item.branchName}}
                    <div class="listNum" @click="toExpressList(item.branchCode,item.branchName)">{{item.warnCount}}</div>
                  </div>
              </div>
            </div>
            <div v-show="toJudgeData.toDealIs==1" class="content">
              <!-- 待仲裁遗失 应签未签 -->
              <div class="total">
                <span>待仲裁遗失合计</span><span class="totalNum" @click="toExpressList()">{{toJudgeData.toJudgeSign.reminderCount}}</span>
              </div>
              <div class="list">
                  <div v-for="item in toJudgeData.toJudgeSign.list" :key="item.branchCode" class="listTitle">
                    {{item.branchName}}
                    <div class="listNum" @click="toExpressList(item.branchCode,item.branchName)">{{item.warnCount}}</div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    XHeader,
    ButtonTab, ButtonTabItem,Tab, TabItem,XTable ,
    ViewBox,
  } from 'vux';
  import {queryMonitorList} from '../../service/service';

  export default {
    components: {
      XHeader,
      ViewBox,
      ButtonTab,
      ButtonTabItem,
      Tab, TabItem,XTable 
    },
    data() {
      return {
        classTab:{
          toDeal:'催办',
          suspectedLost:'疑似遗失',
          toJudge:'待仲裁遗失',
        },
        lostType:0,
        toDealIs:0,
        noBranch:false,
        stationName:'',
        stationCode:'',
        params:{
          type:1,
          childType:1
        },
        toDealData:{
          toDealIs:0,
          toDealSend:{
            reminderCount:'',
            list:[
            ]
          },
          toDealSign:{
            reminderCount:'',
            list:[
            ]
          },
        },
        suspectedLostData:{
          toDealIs:0,
          suspectedLostSend:{
            reminderCount:'',
            list:[

            ]
          },
          suspectedLostSign:{
            reminderCount:'',
            list:[
            ]
          },
        },
        toJudgeData:{
          toDealIs:0,
          toJudgeSend:{
            reminderCount:'',
            list:[
            ]
          },
          toJudgeSign:{
            reminderCount:'',
            list:[
            ]
          },
        },
      };
    },
    methods: {
      toExpressList(val,name) {
        let _this = this;
        console.log('222',val);
        let params = {};
        params.type = _this.params.type || 1;
        params.childType = _this.params.childType;
        params.name = name || this.stationName;
        // params.stationName = this.stationName
        console.log(params);
        
        let org = '';
        if(val) {
            params.org  = val 
        }
        this.$router.push({name:'分部下业务员和派件量详情',params:params})
      },
      backTohome() {
        console.log(123);
        this.$router.push({name:'首页'})
      },
      queryDataList(val) {
        let _this = this ;
        this.initData();
        console.log('inner');
        if(val && val === 'mounted') {
          //从home页面跳转过来查询对应的数据
          _this.params.type = _this.$route.params.name || _this.$route.params.type
          _this.params.childType = _this.$route.params.name ? 1 :  _this.$route.params.childType

        }else {
          // 不是从home页面调过来,本页面点击查询的
          if(_this.lostType === 0 && _this.toDealData.toDealIs === 0){
            _this.params.type = 1;
            _this.params.childType = 1;
            if(_this.toDealData.toDealSend.list.length>0) {
              return
            }
          }
          if(_this.lostType === 0 && _this.toDealData.toDealIs === 1){
            _this.params.type = 1;
            _this.params.childType = 2;
            if(_this.toDealData.toDealSign.list.length>0) {
              return
            }
          }
          if(_this.lostType === 1 && _this.suspectedLostData.toDealIs === 0){
            _this.params.type = 2;
            _this.params.childType = 1;
            if(_this.suspectedLostData.suspectedLostSend.list.length>0) {
              return
            }
          }
          if(_this.lostType === 1 && _this.suspectedLostData.toDealIs === 1){
            _this.params.type = 2;
            _this.params.childType = 2;
            if(_this.suspectedLostData.suspectedLostSend.list.length>0) {
              return
            }
          }
          if(_this.lostType === 2 && _this.toJudgeData.toDealIs === 0){
            _this.params.type = 3;
            _this.params.childType = 1;
            if(_this.toJudgeData.toJudgeSend.list.length>0) {
              return
            }
          }
          if(_this.lostType === 2 && _this.toJudgeData.toDealIs === 1){
            _this.params.type = 3;
            _this.params.childType = 2;
            if(_this.toJudgeData.toJudgeSend.list.length>0) {
              return
            }
          }
        }
      this.queryMonitorList(_this.params);
      },
      test() {
        let _this = this;
        let leaveBtn = document.getElementsByClassName('left-arrow')[0];
        leaveBtn.addEventListener('click',function() {
          _this.$route.meta.keepAlive = false
        })
      },
      async queryMonitorList (params) {
        let result = await queryMonitorList(params);
        if(result.status === 0) {
          if(this.lostType === 0 && this.toDealData.toDealIs === 0) {
            //数据渲染到催办的第一个tab页面
            this.toDealData.toDealSend.reminderCount = result.data.reminderCount;
            this.toDealData.toDealSend.list = (result.data.warnBranchList);
          }
          if(this.lostType === 0 && this.toDealData.toDealIs === 1) {
            //数据渲染到催办的第2个tab页面
            this.toDealData.toDealSign.reminderCount = result.data.reminderCount;
            this.toDealData.toDealSign.list = result.data.warnBranchList;
          }
          if(this.lostType === 1 && this.suspectedLostData.toDealIs === 0) {
            //数据渲染到疑似遗失的第一个tab页面
            this.suspectedLostData.suspectedLostSend.reminderCount = result.data.reminderCount;
            this.suspectedLostData.suspectedLostSend.list = result.data.warnBranchList;
          }
          if(this.lostType === 1 && this.suspectedLostData.toDealIs === 1) {
            //数据渲染到疑似遗失的第2个tab页面
            this.suspectedLostData.suspectedLostSign.reminderCount = result.data.reminderCount;
            this.suspectedLostData.suspectedLostSign.list = result.data.warnBranchList;
          }
          if(this.lostType === 2 && this.toJudgeData.toDealIs === 0) {
            //数据渲染到待仲裁遗失的第一个tab页面
            this.toJudgeData.toJudgeSend.reminderCount = result.data.reminderCount;
            this.toJudgeData.toJudgeSend.list = result.data.warnBranchList
          }
          if(this.lostType == 2 && this.toJudgeData.toDealIs == 1) {
            //数据渲染到待仲裁遗失的第2个tab页面
            this.toJudgeData.toJudgeSign.reminderCount = result.data.reminderCount
            this.toJudgeData.toJudgeSign.list = result.data.warnBranchList
          }
        }
      },
      initData(){
        this.toDealData.toDealSend.reminderCount = '';
        this.toDealData.toDealSend.list = [];
        this.toDealData.toDealSign.reminderCount = '';
        this.toDealData.toDealSign.list = [];
        this.suspectedLostData.suspectedLostSend.reminderCount = '';
        this.suspectedLostData.suspectedLostSend.list = [];
        this.toJudgeData.toJudgeSend.reminderCount = '';
        this.toJudgeData.toJudgeSend.list = [];
      }
    },
    created() {
      console.log('lost created',this.$route.params);


      if(this.$route.params.name) {
        // 首页进入这个页面
        this.stationName = this.$route.params.orgName
        if(this.$route.params.name == '1') {
          this.lostType = 0
        }else if(this.$route.params.name == '2') {
          this.lostType = 1
        }else if(this.$route.params.name == '3') {
          this.lostType = 2
        }
      }else {
        //别的页面进去这个页面
        this.lostType = +this.$route.params.type - 1
        console.log(123334,this.$route.params);
        
        if(this.$route.params.type == 1) {
          this.toDealData.toDealIs = +this.$route.params.childType - 1
        }
        if(this.$route.params.type == 2) {
          this.suspectedLostData.toDealIs = +this.$route.params.childType - 1
        }
        if(this.$route.params.type == 3) {
          this.toJudgeData.toDealIs = +this.$route.params.childType - 1
        }
      }
      console.log(123,this.lostType);
    },
    mounted() {
      
      // this.test();
      this.queryDataList('mounted')
    },
    activated() {
      window.goToBack = () => {
        this.backClick();
      };
    },
    // beforeRouteLeave(to,from,next) {
    //       if(to.name == '分部下业务员和派件量详情' && from.name == '遗失预警类型' ) {
    //         from.meta.keepAlive = true
    //       }
    //       if(to.name == '首页' && from.name == '遗失预警类型' ) {
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
.thead {
  color:#999;
  font-size: 16px;
}
.num {
  color:#ff9c9c;
  /* text-decoration: underline; */
}
.buttonTabPart {
  padding: 0px 15px;
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
    font-size: 16px;
    padding: 0px;
    .total{
      text-align: center;
      color: #333333;
      height: 50px;
      line-height: 50px;
      border-bottom:1px solid #ddd;
      .totalNum {
        margin-left:20px;
        color: #ff9c9c;
        display: inline-block;
        height: 40px;
        width: 40px;
        // text-decoration: underline;
      }
    }
    .list {
      font-size:16px;
      
      .listTitle {
        margin: 15px;
        margin-bottom:0px;
        padding-bottom:15px;
        color:#333333;
        font-size: 14px;
        border-bottom:1px solid #ddd;
        .listNum {
          float: right;
          color: #ff9c9c;
          margin-right:10px;
          height: 35px;
          width: 40px;
          text-align: right;

          // text-decoration: underline;
        }
      }
    }
  }
</style>
