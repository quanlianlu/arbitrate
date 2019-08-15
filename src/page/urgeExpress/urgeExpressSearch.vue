<template>
  <!--
        作者：lixiang
        时间：2018-03-28
        描述：催件查询;
    -->
  <div style="height: 100%;">
    <view-box ref="viewBox" body-padding-bottom="0" :body-padding-top="isShow?'46px':0">
      <!--标题-->
      <x-header slot="header" style="width: 100%;position: absolute;left: 0;top: 0;z-index: 100;" title="网点催件查询"
                :left-options="{preventGoBack: true, backText: ''}" @on-click-back="backClick" v-show="isShow">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
        <div v-if="parameters.checkingType == '0'" slot="right" @click="subscribe">
          <img src="../../assets/img/ding.png">
        </div>
      </x-header>
      <!-- 订单催件，运单催件 button-->
      <div class="yto-box">
        <checker v-model="checkingTypeDefault" type="radio" :radio-required="true" default-item-class="demo1-item"
                 selected-item-class="demo1-item-selected">
          <checker-item v-for="(item, index) in checkingTypeList" :key="index" :value="item.key"
                        @click.native="switchTab(item.key);">{{item.value}}
          </checker-item>
        </checker>
      </div>
      <!--输入框-->
      <group label-width="4.5em" label-margin-right="2em" label-align="right" gutter="10px">
        <x-input :show-clear="false" type="text" title="运<i class='vux-blank-half' ></i>单<i class='vux-blank-half' ></i>号"
                 v-if="parameters.checkingType != '1'" v-model="parameters.wayBillNo" @on-change="wayBillNoChange()">
          <img slot="right" class="code-img" src="../../assets/img/saoyisao@2x.png" v-on:click="getQRScanapp">
        </x-input>
        <x-input :show-clear="false" type="text" title="订<i class='vux-blank-half' ></i>单<i class='vux-blank-half' ></i>号"
                 v-if="parameters.checkingType != '0'" v-model="parameters.orderNo" @on-change="orderNoChange()"
        ></x-input>
        <!--处理状态-->
        <cell value-align="left" class="yto-p">
          <checker v-model="parameters.stateId" default-item-class="demo1-item"
                   selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
            <checker-item :key="index" :value="item.key" v-for="(item, index) in stateIdList" :span="1/3">{{item.value}}
            </checker-item>
          </checker>
        </cell>
        <!--查询时间-->
        <Datetime title="查询时间" v-model="parameters.complaintTimeLower" placeholder="开始时间"
                  value-text-align="left" :start-date="dateCondition.start.startDate"
                  :end-date="dateCondition.start.endDate"
                  format="YYYY-MM-DD HH:mm" year-row="{value}年" month-row="{value}月" day-row="{value}日"
                  hour-row="{value}时" minute-row="{value}分"
                  @on-change="startDateChange"></Datetime>
        <Datetime title="" v-model="parameters.complaintTimeUpper" placeholder="结束时间" value-text-align="left"
                  :start-date="dateCondition.end.startDate"
                  :end-date="dateCondition.end.endDate" format="YYYY-MM-DD HH:mm" year-row="{value}年"
                  month-row="{value}月" day-row="{value}日" hour-row="{value}时" minute-row="{value}分"
                  @on-change="endDateChange"></Datetime>
        <popup-picker v-if="parameters.checkingType != '1'" title="催件来源" :data="microMessageSourceList"
                      v-model="parameters.microMessageSource" value-text-align="left"></popup-picker>
      </group>
      <!--底部按钮-->
      <div class="yto-foot" slot="bottom">
        <flexbox>
          <flexbox-item>
            <x-button type="default" @click.native="callOf()" class="yto-btn-default">重置</x-button>
          </flexbox-item>
          <flexbox-item style="margin-left:0;">
            <x-button type="primary" class="yto-btn-primary" @click.native="submit()">查询</x-button>
          </flexbox-item>
        </flexbox>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    PopupPicker,
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
    CellBox,
    DatetimeRange,
    Flexbox,
    FlexboxItem,
    Datetime,
    Popup,
    Tab,
    TabItem,
    XDialog,
    dateFormat,
    TransferDomDirective
  } from 'vux';
  import moment from 'moment';
  import {getUrgeExpressPage} from '../../service/service';
  import {appUtil} from '../../common/commonUtils';
  import {mapActions} from 'vuex';
  import {NA} from '../../common/nativeAppUtil';

  export default {
    directives: {
      TransferDomDirective
    },
    components: {
      PopupPicker,
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
      CellBox,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime,
      Popup,
      Tab,
      TabItem,
      XDialog,
      dateFormat
    },
    methods: {
      // 扫描运单查询
      getQRScanapp() {
        // appUtil.qrScan();
        NA.qrScan((code) => {
          this.parameters.wayBillNo = code;
        });
      },
      // 添加订阅按钮
      subscribe() {
        appUtil.subscribe(this.parameters.wayBillNo);
      },
      // 引入urgeExpress.js
      ...mapActions('urgeExpress', ['setUrgeSearchParameters']),
      // 清空表单数据并重置按钮位置
      callOf() {
        this.parameters.orderNo = null;
        this.parameters.wayBillNo = null;
        this.parameters.checkingType = '0';
        this.checkingTypeDefault = '0';
        this.parameters.microMessageSource = ['全部'];
        this.parameters.stateId = '1';

        let endMoment = this.endLimitMoment.clone();
        this.parameters.complaintTimeUpper = endMoment.format('YYYY-MM-DD HH:mm');
        this.dateCondition.end.endDate = endMoment.format('YYYY-MM-DD');
        this.dateCondition.start.endDate = endMoment.format('YYYY-MM-DD');
        endMoment.add(-4, 'd').add(1, 'm');
        this.parameters.complaintTimeLower = endMoment.format('YYYY-MM-DD HH:mm');
        this.dateCondition.end.startDate = this.startLimitMoment.format('YYYY-MM-DD');
        this.dateCondition.start.startDate = this.startLimitMoment.format('YYYY-MM-DD');
      },
      async switchTab(val) {
        this.parameters.checkingType = val;
      },
      async wayBillNoChange() {
        // 运单号小写变大写
        var str = this.parameters.wayBillNo;
        if (str !== '' && str != null) {
          this.parameters.wayBillNo = this.parameters.wayBillNo.toUpperCase();
        }
      },
      async orderNoChange() {
        var str = this.parameters.orderNo;
        if (str !== '' && str != null) {
          this.parameters.orderNo = this.parameters.orderNo.toUpperCase();
        }
      },
      // 控制时间改变
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
        this.parameters.complaintTimeUpper = endMoment.format('YYYY-MM-DD HH:mm');
      },
      async submit() {
        // 运单订单转化为大写
        if (this.parameters.wayBillNo) {
          this.parameters.wayBillNo = this.parameters.wayBillNo.toUpperCase();
        }
        if (this.parameters.orderNo) {
          this.parameters.orderNo = this.parameters.orderNo.toUpperCase();
        }
        // 调用发送请求
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
          // 转化为Json
          this.setUrgeSearchParameters(JSON.parse(JSON.stringify(this.parameters)));
          // router转发
          this.$router.push({name: '催件查询列表', params: this.parameters});
        }
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
        let getList = await getUrgeExpressPage({
          // 催件类型  0  1
          checkingType: this.parameters.checkingType,
          // 运单号
          wayBillNo: this.parameters.wayBillNo,
          // 订单号
          orderNo: this.parameters.orderNo,
          // 处理状态   1  2  3
          stateId: this.parameters.stateId,
          // 时间下限
          complaintTimeLower: startDate,
          // 时间上限
          complaintTimeUpper: endDate,
          // 催件来源 ：全部  菜鸟催件  非菜鸟催件
          microMessageSource: this.parameters.microMessageSource.toString(),
          limit: 1,
          start: 0,
          pageNo: 1
        });
        if (getList.data && getList.data.items && getList.data.items.length > 0) {
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
      },
      pushVC() {
        this.showScrollBox = false;
        appUtil.pushVCName('SearchOddNumViewController', {
          oddNum: this.parameters.wayBillNo
        });
      },
     async getAppParams(){
      appUtil.getParameters().then((res) => {
        if (res.oddNum) {
          this.parameters.wayBillNo = res.oddNum;
        }
      });
    }
    },
    data() {
      return {
        microMessageSourceList: [['全部', '普通催件', '菜鸟催件', '菜鸟物流举证']],
        checkingTypeDefault: '0',
        startLimitMoment: moment('2016-01-01'),
        endLimitMoment: moment(moment(new Date()).format('YYYY-MM-DD')).add(1, 'd').add(-1, 'm'),
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
          pageNo: '1',
          // 催件类型  0:运单催件, 1:订单催件
          checkingType: '0',
          // 运单号
          wayBillNo: null,
          // 订单号
          orderNo: null,
          // 处理状态: 1全部  2 处理中 3  已完结
          stateId: '1',
          // 时间下限
          complaintTimeLower: '',
          // 时间上限
          complaintTimeUpper: '',
          // 催件来源
          microMessageSource: ['全部']
        },
        stateIdList: [{
          key: '1',
          value: '全部'
        }, {
          key: '2',
          value: '处理中'
        }, {
          key: '3',
          value: '已完结'
        }
        ],
        // 选择订单查询Or运单查询
        checkingTypeList: [{
          key: '0',
          value: '运单催件'
        }, {
          key: '1',
          value: '订单催件'
        }],
        // 当前业务页面>consult:咨询  expressSearch:快件查询
        nowTab: 'consult',
        // 查询网点条件
        searchText: '',
        showType: true,
        showPopup: false,
        // 网点列表
        branchList: [],
        listRouter: ['one', 'two', 'three'],
        defaultList: 0,
        isShow: true,
        isShowClose: false,
        showScrollBox: false
      };
    },
    created() {
      let endMoment = this.endLimitMoment.clone();
      this.parameters.complaintTimeUpper = endMoment.format('YYYY-MM-DD HH:mm');
      this.dateCondition.end.endDate = endMoment.format('YYYY-MM-DD');
      this.dateCondition.start.endDate = endMoment.format('YYYY-MM-DD');
      endMoment.add(-4, 'd').add(1, 'm');
      this.parameters.complaintTimeLower = endMoment.format('YYYY-MM-DD HH:mm');
      this.dateCondition.end.startDate = this.startLimitMoment.format('YYYY-MM-DD');
      this.dateCondition.start.startDate = this.startLimitMoment.format('YYYY-MM-DD');

     /* let appParams = appUtil.getParameters();
      if (appParams.oddNum) {
        this.parameters.wayBillNo = appParams.oddNum;
        this.wayBillNoChange();
      }*/
     this.getAppParams();
      if (this.parameters.wayBillNo) {
        this.wayBillNoChange();
      }
      window.goToBack = () => {
        this.backClick();
      };
    },
    activated() {
      window.goToBack = () => {
        this.backClick();
      };
    }
  };
</script>

<style lang="less" scoped>
  .yto-box {
    padding-top: 20px;
    padding-left: 20px;
  }

  .yto-p {
    .vux-checker-box {
      display: flex;
      flex-wrap: wrap;
    }
    .vux-checker-item {
      flex: 1;
    }
    .yto-item {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .popup {
    padding-bottom: 15px;
    height: 350px;
    overflow-y: scroll;
  }

  .demo1-item {
    padding: 5px 0 !important;
    border-radius: 3px;
    width: 100px;
    text-align: center;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
  }

  .demo1-item-selected {
    background-color: #4080CA;
    color: #fff;
  }

  .demo2-item {
    padding: 3px 15px !important;
    border-radius: 3px;
    text-align: center;
    font-size: 0.8em;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px !important;
  }

  .demo2-item-selected {
    background-color: #4080CA;
    color: #fff;
  }

</style>
