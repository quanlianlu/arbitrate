<template>
  <!-- 催办明细 -->
  <div style="height:100%;" class="detailPage">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="46px">
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"  v-if="parameters.type === 1"
        title="催办明细"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backToExpress'>
      </x-header>
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"  v-if="parameters.type === 2"
        title="疑似遗失明细"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backToExpress'>
      </x-header>
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"  v-if="parameters.type === 3"
        title="待仲裁遗失明细"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back='backToExpress'>
      </x-header>
      <load-more v-show="showLoading" tip="正在加载"></load-more>
      <msg v-show="showEmpty" title="对不起" description="无查询结果" icon="info"></msg>
      <scroller v-show="!showEmpty && !showLoading" lock-x scrollbar-y :use-pullup="true"
                :height="showCheck ? '-92px':'-46px'"
                :pullup-config="hasNext ? pullupLessConfig : pullupConfig"
                ref="scroller" @on-pullup-loading="nextPage">
        <div style="padding:15px;background:#F5F5F5;font-size:14px;">
          <div class="listPart"  v-for="(detail, index) in detailList" :key="index" style="">
            <div class="firstLine"  @click="pushVC(detail.orderNo)">
              <div class="firstSpan" style="width:10vw;font-weight:600;">单号:</div><div class="listContent" style="text-align:left;color:#4080ca">{{detail.orderNo}}</div>
              <div class="arrow"></div>
            </div>
            <div class="secondLine">
              <div class="firstSpan">收件人</div><div class="listContent">{{detail.receiverName}}</div>
            </div>
            <div class="secondLine">
              <div class="firstSpan">收件地址</div><div class="listContent">{{detail.receiverAddr}}</div>
            </div>
            <div class="secondLine">
              <div class="firstSpan">应派时间</div><div class="listContent">{{detail.executeDate}}</div>
            </div>

          </div>
          <load-more :show-loading="false" v-show="showOver" tip="已经到底了"></load-more>
        </div>
      </scroller>
    </view-box>
  </div>
</template>

<script>
  import {
    XHeader,
    ButtonTab, ButtonTabItem,Tab, TabItem,
    ViewBox,
    Scroller,
    LoadMore,
    Msg
  } from 'vux';
  import {queryRemindDetailList,getUserInfo} from '../../service/service';
  import { appUtil } from '../../common/commonUtils';
  export default {
    components: {
      XHeader,
      ViewBox,
      ButtonTab,
      ButtonTabItem,
      Tab, TabItem,
      Scroller,
      LoadMore,
      Msg
    },
    data() {
      return {
        classTab:{
          toDeal:'催办',
          suspectedLost:'疑似遗失',
          toJudge:'待仲裁遗失',
        },
        parameters:{
          type: 1,  //1，催办,2,疑似遗失;3,待仲裁遗失
          childType: 1, //1，应派未派，2，应签未签(只对催办生效)
          org: '',//网点编码
          empCode: '',//业务员
          thirdCode: '',//三段码
          page: 1,//第几页
          pageSize: 20//每页条数
        },
        detailList:[],//明细列表
        pullupLessConfig: {
          content: '',
          downContent: '',
          upContent: '',
          loadingContent: ''
        },
        pullupConfig: {
          content: '上拉加载更多',
          downContent: '松开进行加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...'
        },
        hasNext: false,//是否有下一页
        showEmpty: false,
        showLoading: true,
        showOver: false,
        showCheck: false
      };
    },
    methods: {
      pushVC(wayBillNo) {
        this.showScrollBox = false;
        appUtil.pushVCName('SearchOddNumViewController', {
          oddNum: wayBillNo
        });
      },
      formatTime(val) {
        let str = val
        str = str.split('T')
        let str1 = str[0]
        let str2 = str[1].split('.')[0]
        return str1+' '+str2
      },
      test() {
        let _this = this;
        let leaveBtn = document.getElementsByClassName('left-arrow')[0];
        leaveBtn.addEventListener('click',function() {
          _this.$route.meta.keepAlive = false
        })
      },
      backToExpress() {
        console.log(this.parameters);
        let obj  = {}
        obj.type = this.parameters.type
        obj.childType = this.parameters.childType
        getUserInfo().then(backJson => {
          obj.name = backJson.data.stationName;
          obj.org = backJson.data.stationCode;
          this.$router.push({name:'分部下业务员和派件量详情',params:obj})
        });

      },
      // 明细列表
      async queryRemindDetailList () {
        let res = await queryRemindDetailList(this.parameters);
        if (res.status === 0){
          if (typeof (res.data) === 'undefined' || typeof (res.data.dataList) === 'undefined' || res.data.dataList.length <= 0) {
            this.showLoading = false;
            this.showEmpty = true;
            return;
          }
          this.hasNext = res.data.hasNext;
          let result = res.data.dataList;
      /*    for(let i = 0 ; i < result.length ; i ++ ) {
            if (result[i].executeDate) {
              result[i].executeDate = this.formatTime(result[i].executeDate);
            }
          }*/
          this.detailList = this.detailList.concat(result);
          this.showLoading = false;
          if (this.detailList.length <= 0) {
            this.showEmpty = true;
          }
          this.$nextTick(() => {
            if (!this.hasNext) { // unload plugin
              this.$refs.scroller.donePullup();
              this.$refs.scroller.disablePullup();
              this.showOver = true;
            }
          });
        }
      },
      async nextPage() { // 上拉加载
        this.parameters.page += 1;
        await this.queryRemindDetailList();
        this.$refs.scroller.donePullup();
        if (!this.hasNext) { // unload plugin
          this.$refs.scroller.disablePullup();
          this.showOver = true;
        }
      }
    },
    created() {
      this.parameters.type = this.$route.params.type;
      this.parameters.childType = this.$route.params.childType;
      this.parameters.org = this.$route.params.org;
      let thirdCode = this.$route.params.thirdCode;
      if (thirdCode !== 'null' && thirdCode !== 'undefined' && thirdCode !== '' && thirdCode !== null && thirdCode !== undefined){
        this.parameters.thirdCode = thirdCode;
      }
      let empCode = this.$route.params.empCode;
      if (empCode !== 'null' && empCode !== 'undefined' && empCode !== '' && empCode !== null && empCode !== undefined){
        this.parameters.empCode = empCode;
      }
    },
    mounted() {
      // this.test();
      this.queryRemindDetailList();
    }
  };
</script>
<style>
  .vux-tab-bar-inner {
    background-color: #4080CA !important;
  }

  .total {

  }
  .listPart {
    background: #fff;
    border-radius: 5px;
    padding: 10px;
    color:#666;
    margin-bottom:15px;
  }
  .firstLine {
    border-bottom:1px solid #DDDDDD;
    padding-bottom:10px;
    position: relative;
  }
  .secondLine {
    margin-top:10px;
    overflow: hidden;
  }
  .firstSpan {
    margin-right:5px;
    color:#999999;
    float: left;
    width: 19vw;
  }
  .listContent {
    overflow: hidden;
    text-align: right;
    color:#333333;
  }
  .detailPage #vux_view_box_body {
    background: rgb(245, 245, 245);
  }
</style>

<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';
  .grid-center {
    display: block;
    text-align: center;
    color: #666;
  }
  .arrow {
    position: absolute;
    top:5px;
    right:10px;
    width: 14px;
    height: 14px;
    border-bottom: 2px solid #ccc;
    border-right: 2px solid #ccc;
    transform:rotate(-45deg);
  }
  .content {
    margin-top:10px;
    font-size: 20px;
    .total{
      text-align: center;
      color: #5c92d2;
      .totalNum {
        margin-left:20px;
        color: #ff9c9c;
        text-decoration: underline;
      }
    }
    .list {
      .listTitle {
        color: #5c92d2;
        margin-top:10px;
        .listNum {
          float: right;
          color: #ff9c9c;
          margin-right:10px;
          text-decoration: underline;
        }
      }
    }
  }
</style>
