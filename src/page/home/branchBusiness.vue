<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="0">
      <yto-panel :title="nowDate" style="margin-top: 0;">
        <div class="yto-hot">
          <h2>{{businessDate['揽件量当日'] || '--'}}<b>万票</b></h2>
          <span>揽件量</span>
        </div>
      </yto-panel>
      <yto-panel title="近30日揽件趋势图（万票）">
        <div slot="right" class="title-right">
          <yto-date v-model="date" :start-date="startDate" :end-date="endDate"></yto-date>
        </div>
        <yto-echart :data="taking" :options="polar1"></yto-echart>
      </yto-panel>
      <yto-panel title="揽件量同环比（万票）">
        <yto-grid :show-lr-borders="false" :cols="2">
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['本月累计'] || '--' }}</h3><span>本月累计</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['本月预计完成'] || '--'}}</h3><span>本月预计</span></div>
          </grid-item>
        </yto-grid>
        <yto-grid :show-lr-borders="false">
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['上月同期'] || '--'}}</h3><span>上月同期</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['环比'] || '--'}}</h3><span>环比</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['环比排名'] || '--'}}</h3><span>排名</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['去年同期'] || '--'}}</h3><span>去年同期</span></div>
          </grid-item>
          <grid-item>
            <div class="yto-grid"><h3>{{ businessDate['同比'] || '--'}}</h3><span>同比</span></div>
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
    Datetime,
    dateFormat,
    TransferDomDirective as TransferDom
  } from 'vux';
  import {FormatDate} from '../../common/dateFormat';
  import {queryReportDataAPI, queryBranchVolumeAPI} from '../../service/service';

  let newDate = new Date();
  newDate.setDate(newDate.getDate() - 1);
  const nowDate = dateFormat(newDate, 'MM月DD日');
  const endDate = FormatDate(new Date(), -1);
  const startDate = FormatDate(new Date('2016/01/01'));

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
        businessDate: [],
        taking: {},
        date: FormatDate(new Date(), -1),
        polar1: {
          yAxis: [{
            axisLabel: {
              formatter: '{value}万'
            }
          }],
          color: ['#1992ff', '#2fc35b']
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
        queryReportDataAPI(this.date).then(backJson => {
          let getData = backJson.data.tendcharts;
          this.chartData = backJson.data.tendcharts;
          console.log(JSON.stringify(getData));
          let xdata = [];
          let [ydata1, ydata2] = [[], []];
          getData.forEach(item => {
            if (item.name === '当日') {
              xdata.push(item.date);
              ydata1.push(item.value);
            } else {
              ydata2.push(item.value);
            }
          });
          this.taking = {
            legend: ['当日', '日均揽件'],
            xdata: xdata,
            ydata: [ydata1, ydata2]
          };
        }).finally(() => {
          this.$nextTick(function () {
            this.$vux.loading.hide();
          });
        });
      },
      ajaxCount() {
        queryBranchVolumeAPI(this.date).then(backJson => {
          this.businessDate = backJson.data.bdResponse;
        });
      },
      formatter(val) {
        return val + '万';
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

  .yto-hot {
    text-align: center;
    padding-bottom: 20px;
    h2 {
      line-height: inherit;
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

  .title-right {
    position: absolute;
    right: 12px;
    top: 15px;
  }
</style>
