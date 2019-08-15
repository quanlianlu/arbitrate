<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="0">
      <yto-panel :title="nowDate" style="margin-top: 0;">
        <div class="yto-hot">
          <h2>{{ businessDate['当日电子面单'] || '--' }}<b>万票</b></h2>
          <span>电子面单使用量</span>
        </div><div class="yto-hot">
          <h2>{{ businessDate['当日使用率']}}<b>%</b></h2>
          <span>电子面单使用率</span>
        </div>
      </yto-panel>
      <yto-panel title="近30日电子面单使用率">
        <div slot="right" class="title-right">
          <yto-date v-model="date" :start-date="startDate" :end-date="endDate"></yto-date>
        </div>
        <yto-echart :data="taking" :options="polar1"></yto-echart>
      </yto-panel>
      <yto-panel title="电子面单使用率同环比">
        <yto-grid :show-lr-borders="false" :cols="2">
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['当月电子面单'] || '--' }}</h3><span>本月累计</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['当月使用率']}}%</h3><span>使用率</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['当月使用率排名'] || '--'}}</h3><span>排名</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['使用率环比']}}%</h3><span>环比</span></div>
          </grid-item>
        </yto-grid>
      </yto-panel>
      <yto-panel title="电子面单使用量同环比（万票）">
        <yto-grid :show-lr-borders="false">
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['上月同期'] || '--' }}</h3><span>上月同期</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['环比'] || '--'}}%</h3><span>环比</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['环比排名'] || '--'}}</h3><span>排名</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['去年同期'] || '--' }}</h3><span>去年同期</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['同比'] || '--'}}%</h3><span>同比</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['同比排名'] || '--'}}</h3><span>排名</span></div>
          </grid-item>
        </yto-grid>
      </yto-panel>
    </view-box>
  </div>
</template>

<script>
  import {
    XHeader,
    ViewBox,
    Flexbox,
    FlexboxItem,
    Grid,
    GridItem,
    dateFormat,
    Datetime,
    TransferDomDirective as TransferDom
  } from 'vux';
  import {FormatDate} from '../../common/dateFormat';
  import {querySurfaceTrendAPI, querySurfaceUseRateAPI} from '../../service/service';

  let newDate = new Date();
  newDate.setDate(newDate.getDate() - 1);
  const nowDate = dateFormat(newDate, 'MM月DD日');
  const endDate = FormatDate(new Date(), -1);
  const startDate = FormatDate(new Date('2016/01/01'));

  function getRate(val) {
    if (typeof val === 'number') {
      return parseFloat((val * 100).toFixed(2));
    } else {
      return '--';
    }
  }

  export default {
    directives: {
      TransferDom
    },
    components: {
      XHeader,
      ViewBox,
      Flexbox,
      FlexboxItem,
      Grid,
      GridItem,
      Datetime
    },
    data() {
      return {
        nowDate,
        endDate,
        startDate,
        chartData: [],
        businessDate: [{name: '揽收量'}, {name: '派送量'}, {name: '签收量'}],
        date: FormatDate(new Date(), -1),
        taking: {},
        polar1: {
          color: ['#1992ff', '#2fc35b'],
          xAxis: [{
            axisLabel: {
              formatter: function (value) {
                let date = value.split('/');
                return date[1] + '-' + date[2];
              }
            }
          }],
          yAxis: [{
            min: 'dataMin',
            max: 100,
            axisLabel: {
              formatter: '{value}%'
            }
          }],
          tooltip: {
            formatter: '{b0}<br/>使用率: {c0}%'
          }
        }
      };
    },
    watch: {
      date() {
        this.ajaxBack();
      }
    },
    methods: {
      ajaxBack() {
        this.$vux.loading.show({
          text: '加载中'
        });
        querySurfaceTrendAPI(this.date).then(backJson => {
          let getData = backJson.data.bdResponse;
          this.taking = {
            legend: ['使用率'],
            xdata: getData.map(item => item[0]),
            ydata: getData.map(item => getRate(item[1]))
          };
        }).finally(() => {
          this.$nextTick(function () {
            this.$vux.loading.hide();
          });
        });
      },
      ajaxCount() {
        querySurfaceUseRateAPI(this.date).then(backJson => {
          this.businessDate = backJson.data.bdResponse;
          this.businessDate['当日使用率'] = getRate(this.businessDate['当日使用率']);
          this.businessDate['当月使用率'] = getRate(this.businessDate['当月使用率']);
          this.businessDate['使用率环比'] = getRate(this.businessDate['使用率环比']);
          let huanbi = (this.businessDate['当月电子面单'] / this.businessDate['上月同期']) - 1;
          let tongbi = (this.businessDate['当月电子面单'] / this.businessDate['去年同期']) - 1;
          this.businessDate['环比'] = getRate(huanbi);
          this.businessDate['同比'] = getRate(tongbi);
        });
      },
      formatter(val) {
        return val + '%';
      }
    },
    created() {
      if (this.$route.params.length) {
        this.businessDate = this.$route.params;
      }
      this.ajaxBack();
      this.ajaxCount();
    },
    activated() {
      window.goToBack = () => {
        this.backClick();
      };
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';

  .yto-grid {
    padding-left: 16px;
    position: relative;
    text-align: center;
    > h3 {
      font-size: 20px;
      color: #333;
      line-height: normal;
      font-weight: 600;
    }
    > span {
      font-size: 12px;
      color: #666;
    }
  }

  .yto-hot {
    text-align: center;
    padding-bottom: 20px;
    display: inline-block;
    width: 50%;
    h2 {
      line-height: normal;
      font-size: 28px;
      color: #4080CA;
      b {
        font-size: 12px;
      }
    }
    span {
      font-size: 12px;
      color: #666;
    }
  }

  .title-right {
    position: absolute;
    right: 12px;
    top: 15px;
  }
</style>
