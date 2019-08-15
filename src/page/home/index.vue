<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="26px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="业务监控"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
      </x-header>
      <div class="yto-box">
        <h1 class="title">
          {{stationName}}
          <div class="position-vertical-demo" v-show="show">
            数据刷新完成
          </div>
        </h1>
        <div class="yto-hot" style="margin-top: 5px;"><label>网点排名：</label><strong style="font-size: 40px">{{realTimeRank}}</strong><span>/{{branchAmount}}</span>
        </div>
        <flexbox style="padding:20px 0 10px;">
          <flexbox-item>
            <div class="yto-hot"><label>相比昨天：</label><strong>{{compareToYes}}</strong><span>位</span>
              <svg-icon :icon-class="compareToYesClass" :className="compareToYesClass"/>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="yto-hot"><label>相比上周：</label><strong>{{compareToLW}}</strong><span>位</span>
              <svg-icon :icon-class="compareToLWClass" :className="compareToLWClass"/>
            </div>
          </flexbox-item>
        </flexbox>
      </div>
      <yto-card title="遗失预警" icon="warning" :data="lostWarningData" @onClickData="clickData" is-warning></yto-card>
      <yto-card title="实时业务量" icon="order" :data="businessDate" @on-click-header="clickHeader" is-link></yto-card>
      <yto-card title="实时投诉量" :data="complainDate" data-key="num"></yto-card>
      <yto-card title="昨日奖罚" icon="money" :data="rewardDate" data-key="amount"></yto-card>
    </view-box>
  </div>
</template>

<script>
  import {
    XHeader,
    ViewBox,
    Flexbox,
    FlexboxItem,
    TransferDomDirective as TransferDom
  } from 'vux';
  import {complaintAPI, rewardAPI, realTimeRankAPI, getUserInfo,queryMonitorInfo} from '../../service/service';
  import {appUtil} from "../../common/commonUtils";
  export default {
    directives: {
      TransferDom
    },
    components: {
      XHeader,
      ViewBox,
      Flexbox,
      FlexboxItem
    },
    methods: {
      clickHeader(val) {
        console.log(val);
        
        this.$router.push({name: val, params: this.businessDate});
      },
      clickData(val) {
        console.log(233);
        console.log(val);
        let num = 1 
        if(val == '催办') {
          num = 1
        }else if(val == '疑似遗失') {
          num = 2
        }else if(val == '待仲裁遗失') {
          num = 3
        }
        this.$router.push({name:'遗失预警类型',params:{name:num,orgName:this.stationName,stationCode:this.stationCode}})
      },
      backClick() {
        appUtil.back();
      },
      ajaxBack() {
       this.queryMonitorInfo();
        rewardAPI().then(backJson => {
          this.rewardDate = backJson.data.list;
          [this.rewardDate[1], this.rewardDate[2]] = [this.rewardDate[2], this.rewardDate[1]];
          this.rewardDate[0].color = '#FF9C9C';
          this.rewardDate[2].color = '#FF9C9C';
          this.rewardDate[1].color = '#84D42A';
          // this.rewardDate[1].textDecoration = 'underline';
        });
        complaintAPI().then(backJson => {
          this.complainDate = backJson.data.list;
        });
        realTimeRankAPI().then(backJson => {
          let {bdResponse} = backJson.data;
          this.businessDate = bdResponse.business;
          console.log(this.businessDate);
          
          this.compareToYes = bdResponse.compareToYes ? bdResponse.compareToYes : '--';
          this.compareToLW = bdResponse.compareToLW ? bdResponse.compareToLW : '--';
          this.realTimeRank = bdResponse.realTimeRank ? bdResponse.realTimeRank : '--';
          this.branchAmount = bdResponse.branchAmount ? bdResponse.branchAmount : '--';
          if (this.compareToYes !== '--') {
            this.compareToYes = parseInt(this.compareToYes);
            this.compareToYesClass = this.compareToYes < 0 ? 'arrow_up' : 'arrow_down';
            this.compareToYes = Math.abs(this.compareToYes);
          }
          if (this.compareToLW !== '--') {
            this.compareToLW = parseInt(this.compareToLW);
            this.compareToLWClass = this.compareToLW < 0 ? 'arrow_up' : 'arrow_down';
            this.compareToLW = Math.abs(this.compareToLW);
          }
        }).finally(() => {
          this.show = true;
        });
        getUserInfo().then(backJson => {
          this.stationName = backJson.data.stationName;
          this.stationCode = backJson.data.stationCode;
        });
      },
      async queryMonitorInfo () {
        let params = {};
        let res = await queryMonitorInfo(params);
        if (res.status === 0) {
          if (typeof (res.data) === 'undefined' || typeof (res.data) === 'undefined' || res.data.length <= 0) {
            this.$vux.alert.show({
              title: '对不起',
              content: '无查询结果'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 1000);
            return;
          }
          let obj = res.data;
          this.lostWarningData = [{name: '催办', value: obj.reminderCount, textDecoration: 'underline'}, {
            name: '疑似遗失',
            value: obj.suspectedCount,
            textDecoration: 'underline',
            color: '#FF9C9C'
          }, {name: '待仲裁遗失', value: obj.arbitramentCount, textDecoration: 'underline', color: '#FF9C9C'}]
        }
      }

    },
    data() {
      return {
        show: false,
        stationCode: '',
        stationName: '',
        lostWarning: {
          reminderCount:0,//催办数量
          SuspectedCount:0,//疑似遗失数据
          arbitramentCount:0,//待仲裁遗失数量
        },
        lostWarningData: [
          {name:'催办',value:'0'},
          {name:'疑似遗失',value:'0'},
          {name:'待仲裁遗失',value:'0'}
        ],
        businessDate: [],
        complainDate: [],
        rewardDate: [],
        compareToYes: '--',
        compareToLW: '--',
        realTimeRank: '--',
        branchAmount: '--',
        compareToYesClass: '',
        compareToLWClass: ''
      };
    },
    watch: {
      show(val) {
        if (val) {
          setTimeout(() => {
            this.show = false;
          }, 1500);
        }
      }
    },
    created() {
      this.ajaxBack();
      setInterval(() => {
        this.ajaxBack();
      }, 300000);
    },
    activated() {
      window.goToBack = () => {
        this.backClick();
      };
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .yto-box {
    padding-top: 15px;
    height: auto;
    background: linear-gradient(180deg, #4080CA, #41ACE6);
    .title {
      text-align: center;
      font-size: 16px;
      color: #fff;
      font-weight: 500;
      position: relative;
      margin-top:15px;
    }
    .yto-hot {
      text-align: center;
      color: #fff;
      font-size: 12px;
      strong {
        font-size: 28px;
        font-weight: 500;
        padding-right: 5px;
      }
    }
    .arrow_up {
      font-size: 14px;
      color: #a3f645;
    }
    .arrow_down {
      font-size: 14px;
      color: #FF9C9C;
    }
  }
  .position-vertical-demo{
    position: absolute;
    top: 0;
    right: 10px;
    text-align: center;
    padding: 3px 5px;
    border-radius: 3px;
    background-color: #84D42A;
    font-size: 12px;
    color: #fff;
  }
</style>
