<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="26px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="网点投诉查询"
                :left-options="{preventGoBack:true, backText:''}"
                @on-click-back="backClick">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
        <div slot="right" @click="subscribe()">
          <img src="../../assets/img/ding.png">
        </div>
      </x-header>
      <group label-width="4.5em" label-margin-right="2em" label-align="right">
        <!--<x-input :value="parameters.complaintType"></x-input>
        <x-input :value="parameters.sourceId"></x-input>
        <x-input :value="parameters.stateId"></x-input>-->
        <x-input id="waybillNo" type="text" title="运单号" :placeholder="'选填'" v-model="parameters.waybillNo"
                 ref="waybillNo" :show-clear="false">
          <img slot="right" class="code-img" src="../../assets/img/saoyisao@2x.png" v-on:click="getQRScanapp">
        </x-input>
        <Datetime title="查询时间" :placeholder="'开始时间'" v-model="parameters.complaintTimeLower"
                  @on-change="startDateChange"
                  :start-date="dateCondition.start.startDate" :end-date="dateCondition.start.endDate"
                  :value-text-align="'left'" :format="'YYYY-MM-DD HH:mm'" :year-row="'{value}年'" :month-row="'{value}月'"
                  :day-row="'{value}日'" :hour-row="'{value}时'" :minute-row="'{value}分'"></Datetime>
        <Datetime title="" :placeholder="'结束时间'" v-model="parameters.complaintTimeUpper"
                  @on-change="endDateChange"
                  :start-date="dateCondition.end.startDate" :end-date="dateCondition.end.endDate"
                  :value-text-align="'left'" :format="'YYYY-MM-DD HH:mm'" :year-row="'{value}年'" :month-row="'{value}月'"
                  :day-row="'{value}日'" :hour-row="'{value}时'" :minute-row="'{value}分'"></Datetime>
      </group>
      <group title="业务类型" label-width="4.5em" label-margin-right="2em" class="yto-group" label-align="right"
             title-color="#333">
        <p class="yto-p" style="padding-top:10px">
          <checker v-model="parameters.businessType" default-item-class="demo1-item"
                   selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
            <checker-item :key="index" :value="item.id" v-for="(item, index) in serviceList">{{item.name}}
            </checker-item>
          </checker>
        </p>
        <div v-if="parameters.businessType === '1'">

          <cell title="投诉类型" value-align="left"></cell>
          <p class="yto-p">
            <checker v-model="parameters.complaintType" default-item-class="demo1-item"
                     selected-item-class="demo1-item-selected" type="radio" :radio-required="true"
                     @on-change="changeType">
              <checker-item :key="index" :value="item.id" v-for="(item, index) in complaintTypeList"
                            @click.native="handleStateList = item.handleStateList">{{item.name}}
              </checker-item>
            </checker>
          </p>
          <cell title="处理状态" value-align="right">
            <span @click="allStatus=!allStatus">{{allStatus?'收起':'全部'}}</span>
          </cell>
          <p class="yto-p">
            <checker v-model="parameters.stateId" default-item-class="demo1-item"
                     selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
              <checker-item v-for="(item, index) in handleStateList" :key="index" :value="item.id"
                            v-if="allStatus || index < 4">
                {{item.name}}
              </checker-item>
            </checker>
          </p>
          <cell title="投诉来源" value-align="right">
            <span @click="allSource=!allSource">{{allSource?'收起':'全部'}}</span>
          </cell>
          <p class="yto-p">
            <checker v-model="parameters.sourceId" default-item-class="demo1-item yto-item"
                     selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
              <checker-item v-for="(item, index) in complaintSourceList" :key="index" :value="item.id"
                            v-if="allSource || index < 3">
                {{item.name}}
              </checker-item>
            </checker>
          </p>
        </div>
      </group>
      <div style="padding:20px;">
        <x-button type="primary" @click.native="searchSubmit">查询</x-button>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    Cell,
    CellBox,
    Checker,
    CheckerItem,
    Datetime,
    DatetimeRange,
    Flexbox,
    FlexboxItem,
    Group,
    Popup,
    Selector,
    Tabbar,
    TabbarItem,
    ViewBox,
    XButton,
    XHeader,
    XInput,
    XNumber,
    XTextarea
  } from 'vux';
  import {consultList, getComplainList, getComplainSource, complaintApiList, c5ApiLogin} from '../../service/service';
  import moment from 'moment';
  import {appUtil} from '../../common/commonUtils';
  import {mapActions} from 'vuex';
  import {NA} from '../../common/nativeAppUtil';

  export default {
    components: {
      XHeader,
      Group,
      Cell,
      XInput,
      ViewBox,
      Selector,
      XNumber,
      Checker,
      CheckerItem,
      XTextarea,
      XButton,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime,
      Tabbar,
      TabbarItem,
      Popup,
      CellBox
    },
    data() {
      return {
        // 0咨询 1投诉 2快件查询 3催件 4问题件上报
        serviceList: [
          {id: '1', name: '投诉'},
          {id: '0', name: '咨询'},
          {id: '2', name: '快件查询'}
        ],
        // 投诉类型
        complaintTypeList: [
          {
            id: '',
            name: '全部',
            handleStateList: [
              {id: '', name: '全部'},
              {id: '30', name: '处理中'},
              {id: '40', name: '申请完结'},
              {id: '60', name: '已完结'},
              {id: '20', name: '等待审核'},
              {id: '45', name: '系统申请完结'},
              {id: '50', name: '已驳回'},
              {id: '70', name: '无效投诉'},
              {id: '80', name: '菜鸟已回复'},
              {id: '90', name: '已回复邮政'},
              {id: '100', name: '邮政已结案'}
            ]
          },
          {
            id: '1',
            name: '普通投诉',
            handleStateList: [
              {id: '', name: '全部'},
              {id: '30', name: '处理中'},
              {id: '40', name: '申请完结'},
              {id: '60', name: '已完结'},
              {id: '45', name: '系统申请完结(贝贝网投诉)'}
            ]
          },
          {
            id: '2',
            name: '淘宝投诉',
            handleStateList: [
              {id: '', name: '全部'},
              {id: '30', name: '处理中'},
              {id: '40', name: '申请完结'},
              {id: '60', name: '已完结'},
              {id: '45', name: '系统申请完结'},
              {id: '80', name: '菜鸟已回复'}
            ]
          },
          {
            id: '3',
            name: '升级投诉',
            handleStateList: [
              {id: '', name: '全部'},
              {id: '30', name: '处理中'},
              {id: '40', name: '申请完结'},
              {id: '60', name: '已完结'},
              {id: '90', name: '已回复邮政'},
              {id: '100', name: '邮政已结案'}
            ]
          }],
        // 处理状态
        handleStateList: [{id: '', name: '全部'},
          {id: '30', name: '处理中'},
          {id: '40', name: '申请完结'},
          {id: '60', name: '已完结'},
          {id: '20', name: '等待审核'},
          {id: '45', name: '系统申请完结'},
          {id: '50', name: '已驳回'},
          {id: '70', name: '无效投诉'},
          {id: '80', name: '菜鸟已回复'},
          {id: '90', name: '已回复邮政'},
          {id: '100', name: '邮政已结案'}],
        // 投诉来源
        complaintSourceList: [],
        // 是否显示全部来源
        allSource: false,
        allStatus: false,
        dateCondition: {
          start: {
            startDate: '',
            endDate: ''
          },
          end: {
            startDate: '',
            endDate: ''
          }
        },
        parameters: {
          // 开始时间
          complaintTimeLower: '',
          // 结束时间
          complaintTimeUpper: '',
          // 0咨询 1投诉 2快件查询 3催件 4问题件上报//默认"投诉"
          businessType: '1',
          // 投诉类型id
          complaintType: '',
          // 处理状态id
          stateId: '30',
          // 投诉来源id
          sourceId: '',
          waybillNo: '',
          // pageNo: 1
          limit: 19,
          start: 0
        },
        startLimitMoment: moment('2015-01-01'),
        endLimitMoment: moment(moment(new Date()).format('YYYY-MM-DD')).add(1, 'd').add(-1, 'm'),
        dateChange: null,
        isShowClose: false
      };
    },
    created() {
/*
      this.isShowClose = appUtil.showClose();
*/
      appUtil.showClose().then((res) => {
        this.isShowClose = res;
      });
      /*let appParams = appUtil.getParameters();
      if (appParams.oddNum) {
        this.parameters.waybillNo = appParams.oddNum;
      }*/
      this.getAppComplainParams();
      let endMoment = this.endLimitMoment.clone();
      this.parameters.complaintTimeUpper = endMoment.format('YYYY-MM-DD HH:mm');
      this.dateCondition.end.endDate = endMoment.format('YYYY-MM-DD');
      this.dateCondition.start.endDate = endMoment.format('YYYY-MM-DD');
      endMoment.add(-4, 'd').add(1, 'm');
      this.parameters.complaintTimeLower = endMoment.format('YYYY-MM-DD HH:mm');
      this.dateCondition.end.startDate = this.startLimitMoment.format('YYYY-MM-DD');
      this.dateCondition.start.startDate = this.startLimitMoment.format('YYYY-MM-DD');
      // 初始化投诉来源列表
      this.getComplainSource();
      window.goToBack = () => {
        this.backClick();
      };
      // window.getQRScan = (code) => {
      //   // 若是批量上报，则支持扫面运单号自动上报
      //   this.parameters.waybillNo = code;
      // };
    },
    mounted() {
    },
    methods: {
      ...mapActions('complain', [
        'setSearchParmas'
      ]),
      changeType(type) {
        this.getComplainSource();
      },
      endDateChange(endDateStr) {
        let endMoment = moment(endDateStr, 'YYYY-MM-DD HH:mm');
        let startMoment = moment(this.parameters.complaintTimeLower, 'YYYY-MM-DD HH:mm');
        // 超过到当前时间则设置为当前时间
        if (endMoment.isAfter(this.endLimitMoment)) {
          endMoment = this.endLimitMoment.clone();
          console.log(endMoment.format('YYYY-MM-DD HH:mm:ss'));
          // 超过最小限制时间则为最小限制时间后7天
        } else if (!endMoment.isAfter(this.startLimitMoment)) {
          endMoment = this.startLimitMoment.clone().add(4, 'd').add(-1, 'm');
        }
        if (endMoment.isBefore(startMoment)) {
          startMoment = endMoment.clone().add(-4, 'd').add(1, 'm');
          if (startMoment.isBefore(this.startLimitMoment)) {
            startMoment = this.startLimitMoment;
          }
          // 相差31天以上
        } else if (endMoment.add(-31, 'd').isAfter(startMoment)) {
          startMoment = endMoment.add(1, 'm');
        }
        this.parameters.complaintTimeLower = startMoment.format('YYYY-MM-DD HH:mm');
        // this.parameters.complaintTimeUpper = endMoment.format('YYYY-MM-DD HH:mm');
      },
      startDateChange(startDateStr) {
        let startMoment = moment(startDateStr, 'YYYY-MM-DD HH:mm');
        let endMoment = moment(this.parameters.complaintTimeUpper, 'YYYY-MM-DD HH:mm');
        // 大于等于最大限制时间，设置最大限制时间前7天
        if (!startMoment.isBefore(this.endLimitMoment)) {
          startMoment = this.endLimitMoment.clone().add(-4, 'd').add(1, 'm');
        } else if (startMoment.isBefore(this.startLimitMoment)) {
          startMoment = this.startLimitMoment.clone();
        }
        if (startMoment.isAfter(endMoment)) {
          endMoment = startMoment.clone().add(4, 'd').add(-1, 'm');
          if (endMoment.isAfter(this.endLimitMoment)) {
            endMoment = this.endLimitMoment;
          }
        } else {
          // 相差31填以上
          if (startMoment.add(31, 'd').isBefore(endMoment)) {
            endMoment = startMoment.add(-1, 'm');
          }
        }
        // this.parameters.complaintTimeLower = startMoment.format('YYYY-MM-DD HH:mm');
        this.parameters.complaintTimeUpper = endMoment.format('YYYY-MM-DD HH:mm');
      },
      async searchSubmit() {
        if (this.parameters.waybillNo) {
          this.parameters.waybillNo = this.parameters.waybillNo.toUpperCase();
        }
        // 投诉
        if (this.parameters.businessType === '1') {
          let hashData = await this.ajaxList();
          if (!hashData) {
            this.$vux.alert.show({
              title: '错误',
              content: '无查询结果'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 3000);
          } else {
            this.setSearchParmas(JSON.parse(JSON.stringify(this.parameters)));
            this.$router.push({name: '投诉查询列表', params: this.parameters});
          }
        } else if (this.parameters.businessType === '2' || this.parameters.businessType === '0') {
          let dataList = await
            consultList({
              waybillNo: this.parameters.waybillNo,
              complaintTimeLower: this.parameters.complaintTimeLower,
              complaintTimeUpper: this.parameters.complaintTimeUpper,
              businessType: this.parameters.businessType,
              limit: 1
            });
          if (typeof (dataList.data) === 'undefined' || typeof (dataList.data.items) === 'undefined' || dataList.data.items <= 0) {
            this.$vux.alert.show({
              title: '对不起',
              content: '无查询结果'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 1000);
            return;
          }
          this.setSearchParmas(this.parameters);
          this.$router.push({name: '咨询快件查询列表', params: this.parameters});
        }
      },
      // 获取投诉来源
      async getComplainSource() {
        let sourceData = await getComplainSource({complaintType: this.parameters.complaintType});
        this.complaintSourceList = [];
        this.complaintSourceList.push({id: '', name: '全部'});
        this.complaintSourceList.push(...sourceData.data.items);
      },
      backClick() {
        appUtil.back();
      },
      popRootBack() {
        appUtil.goToRoot();
      },
      async ajaxList() {
        let startDate = '';
        if (this.parameters.complaintTimeLower) {
          startDate = moment(this.parameters.complaintTimeLower, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        }
        let endDate = '';
        if (this.parameters.complaintTimeUpper) {
          endDate = moment(this.parameters.complaintTimeUpper, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        }
        let getList = await complaintApiList({
          typeCode: this.parameters.businessType,
          waybillNo: this.parameters.waybillNo,
          complaintTimeBegin: startDate,
          complaintTimeEnd: endDate,
          // 投诉类型
          complaintType: this.parameters.complaintType,
          // 投诉来源
          complaintSourceId : this.parameters.sourceId,
          // 处理状态
          stateId : this.parameters.stateId,
          limit: 1,
          pageNo: 0
        });
        if (getList.data && getList.data.items && getList.data.items.length > 0) {
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
      },
      getQRScanapp() {
        // appUtil.qrScan();
        NA.qrScan((code) => {
          this.parameters.waybillNo = code;
        });
      },
      subscribe() {
        appUtil.subscribe(this.parameters.waybillNo)
      },
      async getAppComplainParams(){
        appUtil.getParameters().then((res) => {
          let appParams = res;
          if (appParams.oddNum) {
            this.parameters.waybillNo = appParams.oddNum;
          }
        });
      }
    },
    beforeRouteLeave(to, from, next) {
      // 设置下一个路由的 meta
      to.meta.keepAlive = false; // 让下个页面不缓存，即刷新
      next();
    },
    activated() {
      /* this.isShowClose = appUtil.showClose();*/
      appUtil.showClose().then((res) => {
        this.isShowClose = res;
      });
      window.goToBack = () => {
        this.backClick();
      };
    }
  };
</script>

<style lang="less" scoped>
  .weui-cell.noline:before {
    left: 7.5em;
  }

  .demo1-item {
    padding: 5px 0 !important;
    border-radius: 3px;
    font-size: 0.8em;
    text-align: center;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
  }

  .demo1-item-selected {
    background-color: #4080CA;
    color: #fff;
  }

  .vux-tap-active.demo1-item-selected:active {
    background-color: #4080CA;
  }

  .yto-p {
    padding: 0 12px;
    .vux-checker-box {
      display: flex;
      flex-wrap: wrap;
    }
    .vux-checker-item {
      flex: 1;
      min-width: 20% !important;
    }
    .yto-item {
      min-width: 31.43% !important;
      max-width: 31.43%;
      // padding: 5px 12px !important;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .yto-foot {
    position: absolute;
    bottom: 0;
    background-color: #e2e2e2;
    right: 0;
    left: 0;
  }

  .yto-btn-default {
    border-radius: 0 !important;
    color: #fff !important;
    border-color: #ccc !important;
    background-color: #ccc !important;
    &:not(.weui-btn_disabled):active {
      background-color: #bbb !important;
    }
    &:after {
      border: 0 !important;
    }
  }

  .yto-btn-primary {
    border-radius: 0 !important;
    border-color: #4080CA !important;
    background-color: #4080CA !important;
    &:not(.weui-btn_disabled):active {
      background-color: #00aeef !important;
    }
    &:after {
      border: 0 !important;
    }
  }

</style>
