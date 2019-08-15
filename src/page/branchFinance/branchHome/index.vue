<template>
  <div style="height:100%;" class="branchHome">
    <x-header :left-options="{preventGoBack:true,backText: ''}" @on-click-back="backClick">{{branchName}}
      <div class="info" slot="right">
        <icon name="icon_6" class="headerIcon" style="color: #ffffff" @click.native="headerQusClick"></icon>
        <icon name="icon_bill" class="headerIcon" @click.native="goToBill"></icon>
      </div>
    </x-header>
    <div class="iSwiper">
      <swiper v-model="iSwiperindex" height="180px" @on-index-change="swiperChange" dots-position="center">
        <swiper-item v-for="(item, index) in bannerBox" :key="index">
          <div class="tab-swiper vux-center">
            <div class="swiperBox">
              <div class="updateTime"><p>更新时间 {{dateTime}}</p></div>
              <p class="itemTitle">总账户余额</p>
              <div class="moneyBox">
                <p v-show="eyeOpen" @click="goToBill">{{orgTotalBalance}}</p>
                <p v-show="!eyeOpen" @click="goToBill">*******</p>
                <icon :name="icon_eye" :class="[icon_eye,'eyeIcon']" @click.native="eyeOpenClick"></icon>
              </div>
              <p v-show="index === 1 && eyeOpen" @click="goToBill">{{item.name}} {{orgAllBalance}}（元）</p>
              <p v-show="index === 0 && eyeOpen" @click="goToBill">{{item.name}} {{orgCodBalance}}（元）</p>
              <p v-show="index === 1 && !eyeOpen" @click="goToBill">{{item.name}} *******（元）</p>
              <p v-show="index === 0 && !eyeOpen" @click="goToBill">{{item.name}} *******（元）</p>
            </div>
          </div>
        </swiper-item>
      </swiper>
    </div>
    <div class="swiperFoot" @click="goToTotal">
      <div class="item" v-show="eyeOpen && iSwiperindex === 1">昨日应收 {{income}}</div>
      <div class="item" v-show="eyeOpen && iSwiperindex === 1">昨日应付 {{cost}}</div>
      <div class="item" v-show="!eyeOpen && iSwiperindex === 1">昨日应收 *******</div>
      <div class="item" v-show="!eyeOpen && iSwiperindex === 1">昨日应付 *******</div>
      <div class="item" v-show="eyeOpen && iSwiperindex === 0">昨日实收 {{realGet}}</div>
      <div class="item" v-show="eyeOpen && iSwiperindex === 0">昨日实付 {{realPay}}</div>
      <div class="item" v-show="!eyeOpen && iSwiperindex === 0">昨日实收 *******</div>
      <div class="item" v-show="!eyeOpen && iSwiperindex === 0">昨日实付 *******</div>
    </div>
    <div class="warning" v-show="iSwiperindex === 1">
      <p>预警金额：{{firstAlarmAmount}}元</p>
      <p>预警天数：{{alarmDays}}天</p>
      <p>预警次数：{{alarmCount}}次</p>
    </div>
    <div class="warning" v-show="iSwiperindex === 0">
      <p>预警金额：{{firstAlarmAmountCod}}元</p>
      <p>预警天数：{{alarmDaysCod}}天</p>
    </div>
    <div class="echartBox">
      <div class="firstFilter">
        <div v-for="(item, index) in firstFilterData"
             :key="index"
             @click="firstFilterClick(item)"
             :class="['list', firstFilter === item.itemValue ? 'activeClick': '']">
          <icon :name="item.iconName" :class="[item.iconName,'myIcon']"></icon>
          <p>{{item.itemName}}</p>
        </div>
      </div>
      <div class="secondFilter" v-if="firstFilter === '0000'">
        <div :class="['iItem', secondActiveItem === item ? 'active' : '']" v-for="(item, index) in secondFilterBox"
             :key="index" @click="secondFilterClick(item)">
          {{item.name}}
        </div>
      </div>
    </div>
    <yto-panel :title="indexTitle" style="margin-top: 0px">
      <div class="eBox" slot="right">
        <icon name="icon_6" class="echartBoxIcon" @click.native="headerQusInfoClick"></icon>
        <icon name="icon_5" class="echartBoxIcon" @click.native="timeType = true"></icon>
      </div>

      <div id="myChart" style="height: 220px;padding-bottom: 20px"></div>
      <!--<img src="../../../assets/img/wait.png" alt="" style="margin: 0 auto;display: inherit;">-->
    </yto-panel>
    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 12px">
          <div class="infoDetail" style="text-align: left" v-show="iSwiperindex === 1">
            <p>1.网点账户余额（实时）：网点账户当前余额及账户预警，取自金刚-结算管理-账务管理-应收账款账户查询管理Ⅱ</p>
            <p>总账户：综合账户余额+代收账户余额</p>
            <p>综合账户：<span style="color: red">分公司实收（提现）+分公司应收/应付</span></p>
            <p>昨日应收（T-1）：昨日网点所有应收费用</p>
            <p>昨日应付（T-1）：昨日网点所有应付费用</p>
            <p>2.账户预警（每日0:00更新）：网点账户预警情况，取自金刚-结算管理-账务管理-网点预警日志查询</p>
            <p>预警金额：金刚系统网点综合账户最低预存金额</p>
            <p>预警天数：金刚系统网点综合账户余额低于预警金额的累计天数</p>
            <p>预警次数：金刚系统网点综合账户余额低于预警金额后申请开通的预警次数</p>
            <p>3.时间：综合账户余额及预警最新更新时间</p>
          </div>
          <div class="infoDetail" style="text-align: left" v-show="iSwiperindex === 0">
            <p>1.网点账户余额（实时）：网点账户当前余额及账户预警，取自金刚-结算管理-账务管理-应收账款账户查询管理Ⅱ</p>
            <p>总账户：综合账户余额+代收账户余额</p>
            <p>代收账户：<span style="color: red">分公司实付（充值）+分公司应收/应付（代收货款）</span></p>
            <p>昨日实收（T-1）：昨日网点所有实收费用</p>
            <p>昨日实付（T-1）：昨日网点所有实付费用</p>
            <p>2.账户预警（每日0:00更新）：网点账户预警情况，取自金刚-结算管理-账务管理-网点预警日志查询</p>
            <p>预警金额：金刚系统网点代收账户最低预存金额</p>
            <p>预警天数：金刚系统网点代收账户余额低于预警金额的累计天数</p>
            <p>3.系统时间：始终显示代收账户余额及预警最新更新时间</p>
          </div>
        </div>
      </x-dialog>
    </div>
    <div v-transfer-dom>
      <x-dialog v-model="dialogShowInfo" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 12px">
          <div class="infoDetail" style="text-align: left;height: auto;max-height:80vh;overflow-y: scroll">
            <div v-show="firstFilter === '0000' && secondActiveItem === ''">
              <p>单票发货成本：（中转费+出港派费+建包费+出港操作费+面单费用）/揽件票数</p>
              <p>单公斤发货成本：（中转费+出港派费+建包费+出港操作费+面单费用）/揽件重量</p>
              <p>揽件票数：取自金刚-结算管理-网点账单管理-派送费（出港）结算管理-派送费出港账单查询（Ⅱ）中的揽件票数</p>
              <p>揽件重量：取自金刚-结算管理-网点账单管理-派送费（出港）结算管理-派送费出港账单查询（Ⅱ）中揽收重量</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="secondActiveItem.value === '0002'">
              <p>关键指标说明-单票/单公斤发货成本-中转费</p>
              <p>中转费：网点发货应付中转费，取自金刚-结算管理-账务管理-网点账目查询中费用类型中转费</p>
              <p>单票中转费：中转费/中转费一站式账单票数</p>
              <p>单公斤中转费：中转费/中转费一站式账单重量</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="secondActiveItem.value === '0158'">
              <p>关键指标说明-单票/单公斤发货成本-派送费（出港）</p>
<!--
              <p>扶持派送费（出港）：发件网点应支付给派送网点的扶持派送费（出港），取自金刚-结算管理-账务管理-网点账目查询中费用类型扶持派送费（出港）</p>
-->
              <p>派送费（出港）：取自金刚-结算管理-账务管理-网点账目查询费用类型派送费（出港）</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="secondActiveItem.value === '0102'">
              <p>关键指标说明-单票/单公斤发货成本-面单费用</p>
              <p>面单费：根据网点发件使用面单自动计算（面单单价*发件票数），取揽件票数对应产生的面单成本，并非购入时面单扣款金额（其中电子类的面单每票会加上热敏纸费用0.11元）</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="secondActiveItem.value === '0114'">
              <p>关键指标说明-单票/单公斤发货成本-建包费</p>
              <p>建包费：中心给网点建包网点应付建包费用，金刚-结算管理-账务管理-网点账目查询建包费</p>
              <p>单票建包费：建包费/建包费账单票数</p>
              <p>单公斤建包费：建包费/建包费账单重量</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="secondActiveItem.value === '0019'">
              <p>关键指标说明-单票/单公斤发货成本-出港操作费</p>
              <p>出港操作费：发往特殊区域网点应支付的费用，取自金刚-结算管理-账务管理-网点账目查询出港操作费</p>
              <p>单票出港操作费：出港操作费/出港操作费账单票数</p>
              <p>单公斤建包费：出港操作费/出港操作费账单重量</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="secondActiveItem.value === '0036'">
              <p>关键指标说明-单票/单公斤发货成本</p>
            <!--  <p>差额派送费：网点发件应支付的派件费（不含物料派费）和超重费，取自金刚-结算管理-账务管理-网点账目查询差额派送费</p>
              <p>单票差额派送费：差额派送费/差额派送费账单票数</p>
              <p>单公斤差额派送费：差额派送费/差额派送费账单重量</p>-->
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="firstFilter === '0050'">
              <p>关键指标说明-单票派费收入</p>
              <p>签收票数：取自金刚-结算管理-网点账单管理-派送费（进港）结算管理-派送费进港账单查询（Ⅱ）中签收票数</p>
              <p>派送费（进港）：取自金刚-结算管理-账务管理-网点账目查询费用类型派送费（进港）</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="firstFilter === '0004'">
              <p>关键指标说明-网点补贴</p>
              <p>网点补贴：金刚上账给网点的补贴费用,取自金刚-结算管理-账务管理-网点账目查询费用类型网点补贴</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
            <div v-show="firstFilter === '0022'">
              <p>关键指标说明-奖罚款</p>
              <p>奖罚款：取自金刚-账目查询-费用类型奖罚款</p>
              <p>指标奖罚款：取自金刚-账目查询-费用类型指标奖罚款</p>
              <p>更新时间：每日早上7:00更新T-1数据</p>
            </div>
          </div>
        </div>
      </x-dialog>
    </div>
    <!--日期选择弹出层-->
    <div v-transfer-dom class="timeType">
      <popup v-model="timeType" height="380px" style="background-color: #ffffff">
        <div class="popup0">
          <div class="btnBox">
            <p class="cancle" @click="timeType = false">取消</p>
            <p class="okbtn" @click="okbtn">确定</p>
          </div>
          <button-tab v-model="tabIndex" style="padding: 20px">
            <button-tab-item @on-item-click="changetimeType">按月选择</button-tab-item>
            <button-tab-item @on-item-click="changetimeType">按日选择</button-tab-item>

          </button-tab>
          <datetime-view v-model="searchTime" ref="datetime" format="YYYY-MM" :end-date="endDate"
                         v-show="tabIndex === 0"></datetime-view>
          <datetime-view v-model="searchTime" ref="datetime" format="YYYY-MM-DD" :end-date="endDate"
                         v-show="tabIndex === 1"></datetime-view>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {
    Swiper,
    SwiperItem,
    XDialog,
    TransferDomDirective as TransferDom,
    XHeader,
    Popup,
    DatetimeView,
    ButtonTab,
    ButtonTabItem
  } from 'vux';
  import {balanceApi, getUserInfo, balanceIndexApi, balanceChartsApi} from '../../../service/service';
  import {mapState, mapGetters, mapMutations} from 'vuex';
  import {appUtil} from '../../../common/commonUtils';

  let echarts = require('echarts/lib/echarts');
  let iToday = new Date();
  iToday = new Date(iToday.getTime() - 1000 * 60 * 60 * 24);
  let iY = iToday.getFullYear();
  let iM = iToday.getMonth() > 8 ? iToday.getMonth() + 1 : '0' + (iToday.getMonth() + 1);
  let iD = iToday.getDate() > 8 ? iToday.getDate() : '0' + (iToday.getDate());
  ;
  export default {
    name: "index",
    directives: {
      TransferDom
    },
    components: {Swiper, SwiperItem, XDialog, XHeader, Popup, DatetimeView, ButtonTab, ButtonTabItem},
    data() {
      return {
        isMonth: true,
        endDate: iY + '-' + iM + '-' + iD,
        dateTime: '',
        branchName: '',
        orgAllBalance: '--',
        orgCodBalance: '--',
        orgTotalBalance: '--',
        iSwiperindex: 0,
        icon_eye: 'icon_eye',
        bannerBox: [
          {name: '代收账户余额'}, {name: '综合账户余额'}
        ],
        firstFilterData: [
          {itemName: '单票／公斤发货成本', iconName: 'icon_money', itemValue: '0000'},
          {itemName: '单票派费收入', iconName: 'icon_2', itemValue: '0050'},
          {itemName: '网点补贴', iconName: 'icon_3', itemValue: '0004'},
          {itemName: '奖罚款', iconName: 'icon_4', itemValue: '0022'}
        ],
        firstFilter: '0000',
        secondFilterBox: [
          {name: '中转费', value: '0002'}, {name: '派送费(出港)', value: '0158'}, {name: '面单费用', value: '0102'},
          {name: '建包费', value: '0114'}, {name: '出港操作费', value: '0019'}],
        secondActiveItem: '',
        indexTitle: '查询月  ' + iY + '-' + iM,
        dialogShow: false,
        dialogShowInfo: false,
        alarmCount: '--',
        alarmDays: '--',
        alarmDaysCod: '--',
        firstAlarmAmount: '--',
        firstAlarmAmountCod: '--',
        cost: '--',
        income: '--',
        realPay: '--',
        realGet: '--',
        timeType: false,
        searchTime: iY + '-' + iM,
        format: 'YYYY-MM-DD',
        tabIndex: 0,
        searchType: 'month',
        lineData: {
          color: ['#4080CA', '#F8BE1F', '#49B25D'],
          tooltip: {
            trigger: 'axis'
          },
          grid: {left: 50, right: 50},
          legend: {
            right: '10%',
            icon: 'rect',
            data: [],
            itemWidth: 18,
            itemHeight: 2,

          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLine: {
              show: false
            },
            axisLabel: {
              color: '#666',
              interval: '',

            },
            axisTick: {
              show: false
            },

            splitLine: {
              lineStyle: {
                color: '#E4E4E4'
              }
            }
          },
          yAxis: [
            {
              // show : false,
              name: '',
              type: 'value',

              axisLine: {
                show: false
              },
              axisLabel: {
                color: '#666',
                formatter: function (value, index) {
                  if (value >= 1000 && value < 10000) {
                    value = value / 1000 + "千";
                  } else if (value >= 10000 && value < 1000000) {
                    value = value / 10000 + "万";
                  } else if (value >= 1000000) {
                    value = value / 1000000 + "百万";
                  } else if (value <= -1000 && value > -10000) {
                    value = value / 1000 + "千";
                  } else if (value <= -10000 && value > -1000000) {
                    value = value / 10000 + "万";
                  } else if (value <= -1000000) {
                    value = value / 1000000 + "百万";
                  }
                  return value;
                }
              },
              axisTick: {
                show: false
              },
              splitLine: {
                // show: false,
                lineStyle: {
                  color: '#E4E4E4'
                }
              }
            },
            {
              // show : false,
              name: '',
              type: 'value',
              axisLine: {
                show: false
              },
              axisLabel: {
                color: '#666',
                formatter: function (value, index) {
                  if (value >= 1000 && value < 10000) {
                    value = value / 1000 + "千";
                  } else if (value >= 10000 && value < 1000000) {
                    value = value / 10000 + "万";
                  } else if (value >= 1000000) {
                    value = value / 1000000 + "百万";
                  } else if (value <= -1000 && value > -10000) {
                    value = value / 1000 + "千";
                  } else if (value <= -10000 && value > -1000000) {
                    value = value / 10000 + "万";
                  } else if (value <= -1000000) {
                    value = value / 1000000 + "百万";
                  }
                  return value;
                }
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false,
                // lineStyle: {
                //   color: '#E4E4E4'
                // }
              }
            }
          ],
          series: [
            {
              name: 'a',
              type: 'line',
              data: []
            },
            {
              name: 'b',
              type: 'line',
              yAxisIndex: 1,
              data: []
            },
            {
              name: 'c',
              type: 'line',
              yAxisIndex: 1,
              data: []
            },
          ]
        }
      };
    },
    computed: {
      ...mapState({
        eyeOpen: state => state.branch.eyeOpen
      }),
    },
    created() {
      this.getBalance();
      this.getUserInfoApi();
      this.balanceIndex();
      window.goToBack = () => {
        this.backClick();
      };
      console.log(this.endDate);
    },
    mounted() {
      this.drawLine();
      this.getCharts(this.searchTime, this.firstFilter);
    },
    methods: {
      ...mapMutations(['SetEyeOpen']),
      getUserInfoApi() {
        getUserInfo().then(backJson => {
          if (backJson.status === 0) {
            this.branchName = backJson.data.stationName;
          }
        });
      },
      backClick() {
        appUtil.back();
//        appUtil.goToRoot();
      },
      popRootBack() {
        appUtil.goToRoot();
      },
      goToBill() {
        // let accountType = this.iSwiperindex === 0 ? '6' : '7';
        // this.$router.push({name: 'billManage', params: {accountType: accountType, startTime: '', endTime: '', month: ''}})
        if (this.iSwiperindex === 1) {
          // 跳转综合账户账单
          this.$router.push({name: 'billManage', params: {accountType: '6', startTime: '', endTime: '', month: ''}});
        } else {
          // 跳转代收账户账单
          this.$router.push({
            name: 'swiperBillManage',
            params: {accountType: '7', startTime: '', endTime: '', month: ''}
          });
        }
      },
      getBalance() {
        balanceApi().then(backJson => {
          console.log(backJson);
          if (backJson.status === 0) {
            this.dateTime = backJson.data.dateTime;
            this.orgAllBalance = backJson.data.orgAllBalance || '--';
            this.orgCodBalance = backJson.data.orgCodBalance || '--';
            this.orgTotalBalance = backJson.data.orgTotalBalance || '--';
          }
        });
      },
      balanceIndex() {
        balanceIndexApi().then(backJson => {
          if (backJson.status === 0) {
            this.realGet = backJson.data.realGet || '--';
            this.realPay = backJson.data.realPay || '--';
            this.income = backJson.data.income || '--';
            this.cost = backJson.data.cost || '--';
            this.alarmCount = backJson.data.alarmInfoZh == undefined ? '--' : backJson.data.alarmInfoZh.alarmCount;
            this.alarmDays = backJson.data.alarmInfoZh == undefined ? '--' : backJson.data.alarmInfoZh.alarmDays;
            this.firstAlarmAmount = backJson.data.alarmInfoZh == undefined ? '--' : backJson.data.alarmInfoZh.firstAlarmAmount;
            this.alarmDaysCod = backJson.data.alarmInfoCod == undefined ? '--' : backJson.data.alarmInfoCod.alarmDays;
            this.firstAlarmAmountCod = backJson.data.alarmInfoCod == undefined ? '--' : backJson.data.alarmInfoCod.firstAlarmAmount;
          }
        });
      },
      headerQusClick() {
        this.dialogShow = true;
      },
      headerQusInfoClick() {
        this.dialogShowInfo = true;
      },
      eyeOpenClick() {
        this.icon_eye = !this.eyeOpen ? 'icon_eye' : 'icon_eye_close';
        this.SetEyeOpen();
      },
      swiperChange() {
        this.getBalance();
        this.balanceIndex();
      },
      okbtn() {
        this.timeType = false;
        this.indexTitle = this.tabIndex === 0 ? '查询月   ' + this.searchTime : '查询日   ' + this.searchTime;
        this.iType = this.tabIndex === 0 ? 'month' : 'date';
        if (this.secondActiveItem === '') {
          this.getCharts(this.searchTime, this.firstFilter);
        } else {
          this.getCharts(this.searchTime, this.secondActiveItem.value);
        }
      },
      drawLine() {
        this.myChart = echarts.init(document.getElementById('myChart'));
        this.myChart.setOption(this.lineData);
      },
      firstFilterClick(item) {
        this.firstFilter = item.itemValue;
        this.lineData.color = ['#4080CA', '#F8BE1F', '#49B25D'];
        this.getCharts(this.searchTime, this.firstFilter);
        this.secondActiveItem = '';

      },
      secondFilterClick(data) {
        // console.log(data);
        this.secondActiveItem = this.secondActiveItem === data ? '' : data;
        if (this.secondActiveItem === '') {

          this.getCharts(this.searchTime, this.firstFilter);
        } else {
          this.getCharts(this.searchTime, this.secondActiveItem.value);
        }
      },

      getCharts(idate, icode) {
        this.lineData.legend.data = [];
        this.lineData.xAxis.data = [];
        this.lineData.xAxis.axisLabel.interval = "";
        this.lineData.series.data = [];
        this.lineData.series.name = '';
        this.myChart.setOption(this.lineData);
        let itype = this.tabIndex === 0 ? 'month' : 'date';
        balanceChartsApi({[itype]: idate, 'feeType': icode}).then(backJson => {
          this.lineData.legend.data = backJson.data.legend;
          this.lineData.xAxis.data = backJson.data.xdata;
          this.lineData.xAxis.axisLabel.interval = backJson.data.xdata.length - 2;
          for (let i = 0; i < backJson.data.ydata.length; i++) {
            this.lineData.series[i].data = backJson.data.ydata[i];
            this.lineData.series[i].name = backJson.data.legend[i];
            this.myChart.setOption(this.lineData);
          }

        });
      },
      goToTotal() {
        if (this.iSwiperindex === 0) {
          this.$router.push({path: '/summaryReal'});
        } else {
          this.$router.push({path: '/summaryCostAndIncome'});
        }
      },
      changetimeType() {
        if (this.tabIndex === 0) {
          this.searchTime = this.searchTime.substring(0, 7);
        } else {
          if (this.searchTime.length === 10) {
            return;
          }
          this.searchTime = this.searchTime + '-' + '01';
        }
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .branchHome {
    font-family: PingFangSC-Medium;
    overflow-x: hidden;
    overflow-y: scroll;
    .headerIcon {
      width: 15px;
      height: 15px;
      margin-right: 10px;
    }
    background-color: #ffffff;
    .iHeader {
      height: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ffffff;
      .leftHeader {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
      .branchName {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        text-align: center;
        margin-right: 10px;
        max-width: 200px;
      }
      .updateTime {
        font-size: 13px;
        display: flex;
        align-items: flex-end;
      }
      .info {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
    }
    .iSwiper {
      background: #4080CA;
      .tab-swiper {
        height: 180px;
        background: #4080CA;
        .swiperBox {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          color: #ffffff;
          .updateTime {
            margin-bottom: 15px;
            font-size: 13px;
          }
          .itemTitle {
            font-size: 16px;
          }
          .moneyBox {
            font-size: 36px;
            position: relative;
            min-width: 100px;
            min-height: 60px;
            .eyeIcon {
              font-size: 33px;
              position: absolute;
              top: 15px;
              right: -60px;
              width: 33px;
              height: 33px;
            }
          }
        }
      }
    }
    .swiperFoot {
      height: 40px;
      background: linear-gradient(128deg, rgb(18, 152, 202) 0%, rgb(39, 135, 249) 43%, rgb(36, 137, 233) 100%, rgb(52, 87, 255) 100%);
      display: flex;
      & .item {
        width: 50%;
        text-align: center;
        line-height: 40px;
        color: #ffffff;
        font-size: 14px;
      }
    }
    .warning {
      padding: 0 15px;
      height: 37px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      font-size: 12px;
      color: #FE363E;
      background-color: #F5F5F5;
    }
    .echartBox {
      padding: 0 15px;
      .firstFilter {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .list {
          margin: 20px 0 15px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 10px;
          color: #999999;
          width: 25%;
          p {
            width: 100%;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .myIcon {
            width: 27px;
            height: 27px;
          }
        }
        .activeClick {
          color: #4080CA;
          .myIcon {
            color: #4080CA;
          }
        }
      }
      .secondFilter {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        .iItem {
          width: 31%;
          height: 28px;
          line-height: 28px;
          text-align: center;
          background: rgba(246, 246, 246, 1);
          border-radius: 2px;
          color: #666;
          font-size: 12px;
          margin: 5px 0;
        }
        .active {
          background-color: #4080CA;
          color: #ffffff;
        }
      }
      .secondFilter:after{
        content: '';
        width: 30%;
        border:1px solid transparent;
      }
      .iEcharts {
        .echartHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #333333;
          font-size: 15px;
          .searchData {
            text-indent: 10px;
            border-left: 2px solid #4080CA;
          }
        }
      }
    }
    .eBox {
      display: inline-block;
      float: right;
      .echartBoxIcon {
        display: inline-block;
        margin-left: 10px;
        height: 16px;
        width: 16px;
      }
    }
  }

  .timeType {
    .btnBox {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      border-bottom: 1px solid #eeeeee;
      p {
        width: 50px;
        text-align: center;
      }
      .cancle {
        color: #999999;
      }
      .okbtn {
        color: #4080CA;
      }
    }
  }
</style>
