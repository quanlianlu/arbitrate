<template>
  <div class="summary">
    <x-header :left-options="{backText: ''}" class="summaryDataTime">
      <div @click="headTitile" class="headTitile">
        <datetime
          v-model="dataValue"
          @on-change="change"
          :title="dataTitle"
          format="YYYY-MM"
          :end-date="endDate"
          @on-confirm="onConfirm">
        </datetime>
      </div>

      <icon name="icon_6" slot="right" style="width: 19px;height: 19px;color: #ffffff" @click.native="dialogShow = true"></icon>
    </x-header>
    <div class="tabBox">
      <tab v-model="tabIndx" :line-width="2" custom-bar-width="20px">
        <tab-item selected>应付</tab-item>
        <tab-item>应收</tab-item>
      </tab>
      <swiper v-model="tabIndx" :show-dots="false" height="500px">
        <swiper-item>
          <div class="iswiper">
            <linkItem leftTitle="总应付" :rightTitle="totalcost" @click.native="gotoDetail('0')">
              <span slot="left" style="color: #999999">(共{{costCount}}笔)</span>
            </linkItem>
            <linkItem leftTitle="主要应付" :rightTitle="maincost" @click.native="gotoDetail('4')" :hasBorder='false'>
            </linkItem>
            <div class="tabSwiper">
              <button-tab v-model="tabSwiper">
                <button-tab-item @on-item-click="tabSwiperClick('time')">
                  <icon name="icon_zhanbi" :class="['icon_swiper', tabIcon === 'icon_zhanbi'? 'activeIcon':'']"></icon>
                  占比
                </button-tab-item>
                <button-tab-item @on-item-click="tabSwiperClick('icon_qushi')">
                  <icon name="icon_qushi" :class="['icon_swiper', tabIcon === 'icon_qushi'? 'activeIcon':'']"></icon>
                  趋势
                </button-tab-item>
              </button-tab>
              <div class="echartsBox">
                <yto-echart :data="taking" :options="polar1" v-show="tabSwiper === 0" height="200px"></yto-echart>
                <!--<yto-echart :data="handon" :options="polar2" v-show="tabSwiper === 0"></yto-echart>-->
                <div id="myChartbox" v-show="tabSwiper === 1" style="height: 200px;width: 375px;">

                </div>
              </div>
            </div>
            <linkItem leftTitle="其他应付" :rightTitle="othercost" borderDir="top" @click.native="gotoDetail('5')"
                      style="margin-top: 20px;">
            </linkItem>

          </div>
        </swiper-item>
        <swiper-item>
          <div class="iswiper">
            <linkItem leftTitle="总应收" :rightTitle="totalincome" @click.native="gotoDetail('1')">
              <span slot="left" style="color: #999999">(共{{incomeCount}}笔)</span>
            </linkItem>
            <linkItem v-for="(item, index) in linkBox" :leftTitle="item.businessType" :rightTitle="item.billAmountStr"
                      @click.native="gotoDetail(item.feeType)" :key="index"
                      :leftColor=" item.businessType === '派送费' ? '#F55C6B': ''"
                      :hasBorder="index === linkBox.length -1 ? false:true">
            </linkItem>

          </div>
        </swiper-item>
      </swiper>
    </div>
    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 14px">
          <div class="infoDetail" style="text-align: left">
            <p>默认当月全部应收/应付汇总，可选择时间图标按月份查询，最多查询当前时间T-1往前一年的数据（每日早上7:00更新）</p>
            <p>其它应付：总应付-主要应付</p>
            <p>其它收入：总应收</p>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
  import {XHeader, Datetime, Tab, TabItem, Swiper, SwiperItem, ButtonTab, ButtonTabItem, XDialog, TransferDomDirective as TransferDom,} from 'vux';
  import linkItem from '../components/linkItem';
  import echarts from 'echarts';
  import {getSummaryCost, getSummaryIncome} from '../../../service/service';
  import {mapState, mapGetters, mapMutations} from 'vuex';

  let iToday = new Date();
  let iY = iToday.getFullYear();
  let iM = iToday.getMonth() > 8 ? iToday.getMonth() + 1 : '0' + (iToday.getMonth() + 1);
  export default {
    name: "summary-detail",
    directives: {
      TransferDom
    },
    components: {XHeader, Datetime, Tab, TabItem, Swiper, SwiperItem, linkItem, ButtonTab, ButtonTabItem, XDialog},
    data() {
      return {
        dataValue: '',
        endDate: iY + '-' + iM + '-01',
        tabIndx: 0,
        tabSwiper: 0,
        tabIcon: 'icon_zhanbi',
        totalcost: '',
        costCount: '',
        maincost: '',
        othercost: '',
        totalincome: '',
        incomeCount: '',
        sendMoney: '',
        receiveMonry: '',
        othersMoney: '',
        taking: {},
        handon: {},
        linkBox: [],
        polar1: {
          color: ['#4080CA', '#F5865C', '#F8BE1F', '#00884A', '#49B25D', '#BDD25B', '#F5EB67'],
          grid: {bottom: 30, right: -10, top: 20},
          animation: true,
          tooltip: {
            trigger: 'item'
          },
          series: [
            {
              type: 'pie',
              radius: ['30%', '50%'],
              center: ['45%', '60%'],
              label: {
                normal: {
                  formatter: '  {b}  \n ¥{c} ',
                }

              }
            }
          ]
        },
        option: {
          color: ['#F8BE1F'],
          animation: true,

          tooltip: {
            trigger: 'item'
          },
          xAxis: {
            type: 'category',
            splitLine: {show: false},
            data: []
          },
          yAxis: {
            splitLine: {show: false},
            axisLine: {       //y轴
              show: false
            },
            axisTick: {       //y轴刻度线
              show: false
            },
            axisLabel: {       //y轴刻度线
              show: false
            },
            type: 'value'
          },
          series: [{
            data: [],
            type: 'bar',
            barWidth: 15,
            itemStyle: {
              normal: {
                label: {
                  show: true, // 开启显示
                  position: 'top', // 在上方显示
                  textStyle: { // 数值样式
                    color: '#999999',
                    fontSize: 10,
                    rotate: -90
                  }
                }
              }
            }
          }]
        },
        dialogShow: false
      };
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapGetters([
        'searchTime'
      ]),
      dataTitle() {
        let iBak = this.dataValue.split('-');
        console.log(iBak);
        return iBak[0] + '年' + iBak[1] + '月';
      }
    },
    created() {
      let month = this.$route.params.month || this.searchTime;
      let iType = this.$route.params.type;
      console.log('iType', iType);
      if (month) {
        this.dataValue = month;
      };
      if (iType === 1) {
        this.$nextTick(() =>{
          this.tabIndx = 1;
        });

      }
    },
    mounted() {
      this.dataValue = this.searchTime;
      this.endDate = iY + '-' + iM + '-01';
      this.echartBox = echarts.init(document.getElementById('myChartbox'));
      this.getSummaryCostApi();
      this.getSummaryIncomeApi();
    },
    methods: {
      ...mapMutations(['SetSearchTime']),
      headTitile() {
      },
      onConfirm() {
        console.log(this.dataValue);
        this.SetSearchTime(this.dataValue);

        this.getSummaryCostApi();
        this.getSummaryIncomeApi();
      },
      change() {
      },
      switchTabItem() {
      },
      tabSwiperClick(data) {
        this.tabIcon = data;
      },
      getSummaryCostApi() {
        let obj = {
          month: this.searchTime
        };
        getSummaryCost(obj).then(backJson => {
          // console.log(backJson)
          if (backJson.status === 0) {
            let data = backJson.data;
            this.totalcost = data.cost;
            this.costCount = data.costCount;
            this.maincost = data.deliveryCost;
            this.othercost = data.otherCost;
            // 渲染图表数据
            // 饼图
            this.polar1.series[0].data = [];
            for (let i = 0; i < backJson.data.proportion.data.length; i++) {
              this.polar1.series[0].data[i] = {};
              this.polar1.series[0].data[i].value = backJson.data.proportion.data[i];
              this.polar1.series[0].data[i].name = backJson.data.proportion.name[i];
            }
            let obj = {
              xdata: data.proportion.name,
              ydata: data.proportion.data
            };
            this.taking = obj;
            // 柱状图
            let iArr = backJson.data.trend.xdata.map(item => {
              return item + '月';
            });
            this.option.xAxis.data = iArr;
            this.option.series[0].data = backJson.data.trend.ydata;
            this.echartBox.setOption(this.option);
          }
        });
      },
      getSummaryIncomeApi() {
        let obj = {
          month: this.searchTime
        };
        getSummaryIncome(obj).then(backJson => {
          // console.log(backJson)
          if (backJson.status === 0) {
            let data = backJson.data;
            this.totalincome = data.income;
            this.incomeCount = data.incomeCount;
            this.linkBox = data.summaryIncome;
          }
        });
      },
      gotoDetail(data) {
        if (!!data) {
          this.$router.push({'name': 'summaryInfo', params: {accountType: data, month: this.searchTime}});
        }
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .summary {
    height: 100%;
    background-color: #fff;
    .summaryDataTime {
      position: relative;
      &:after {
        content: ' ';
        display: inline-block;
        position: absolute;
        top: 20px;
        right: 32%;
        width: 0;
        height: 0;
        z-index: 5; /*兼容ie8-*/
        border-bottom: 8px transparent dashed;
        border-left: 8px transparent dashed;
        border-right: 8px transparent dashed;
        border-top: 8px white solid;
        overflow: hidden;
      }
    }
    .headIcon {
      display: inline-block;
      width: 19px;
      height: 19px;
    }
    .headTitile {
      display: inline-block;
    }
    .arrow {
      display: inline-block;
    }
  }

  .iswiper {
    padding: 0 15px 15px;
    .activeIcon {
      color: #ffffff;
    }
    .tabSwiper {
      .echartsBox {
        margin-top: 20px;
      }
    }
    .icon_swiper {
      width: 14px;
      height: 14px;
    }
  }
</style>
