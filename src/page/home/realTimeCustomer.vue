<template>
  <view-box body-padding-bottom="0" body-padding-top="46px">
    <x-header
      slot="header"
      style="width:100%;position:absolute;left:0;top:0;z-index:100;"
      title="客服投诉"
      :left-options="{backText:''}">
    </x-header>
    <sticky scroll-box="vux_view_box_body" :offset="0">
      <tab>
        <tab-item selected @on-item-click="onItemClick">日</tab-item>
        <tab-item @on-item-click="onItemClick">周</tab-item>
        <tab-item @on-item-click="onItemClick">月</tab-item>
      </tab>
    </sticky>
    <yto-panel title="" style="margin-top: 0;">
      <div class="yto-hot">
        <h2>{{handon ? handon : '--'}}</h2>
        <span>派件量</span>
      </div>
      <yto-grid :data="complaintIndex" :show-lr-borders="false"></yto-grid>
    </yto-panel>
    <yto-panel title="普通投诉趋势图">
      <yto-echart :data="normalTrend" :options="polar"></yto-echart>
    </yto-panel>
    <yto-panel title="菜鸟投诉趋势图">
      <yto-echart :data="cainiaoTrend" :options="polar"></yto-echart>
    </yto-panel>
    <yto-panel title="升级投诉趋势图">
      <yto-echart :data="upgradeTrend" :options="polar"></yto-echart>
    </yto-panel>
  </view-box>
</template>

<script>
  import {
    Tab,
    TabItem,
    XHeader,
    ViewBox,
    Flexbox,
    FlexboxItem,
    Sticky,
    TransferDomDirective as TransferDom
  } from 'vux';
  import {complaintChartAPI} from '../../service/service';

  export default {
    directives: {
      TransferDom
    },
    components: {
      Tab,
      TabItem,
      XHeader,
      ViewBox,
      Flexbox,
      FlexboxItem,
      Sticky
    },
    methods: {
      onItemClick(index) {
        this.addComplaint(index);
      },
      ajaxBack() {
        this.$vux.loading.show({
          text: '加载中'
        });
        complaintChartAPI().then(backJson => {
          let {bdResponse} = backJson.data;
          this.complaint = [bdResponse.dailyComplaint, bdResponse.weeklyComplaint, bdResponse.monthlyComplaint];
          this.addComplaint(0);
        }).finally(() => {
          this.$nextTick(function() {
            this.$vux.loading.hide();
          });
        });
      },
      addComplaint(index) {
        this.handon = this.complaint[index].handon;
        this.complaintIndex = this.complaint[index].complaintIndex;
        this.cainiaoTrend = this.complaint[index].cainiaoTrend;
        this.normalTrend = this.complaint[index].normalTrend;
        this.upgradeTrend = this.complaint[index].upgradeTrend;
        this.complaintIndex[3].format = '‰';
        this.complaintIndex[4].format = '‰';
        this.complaintIndex[5].format = '‰';
      }
    },
    data() {
      return {
        complaint: [],
        handon: '--',
        complaintIndex: [],
        cainiaoTrend: {},
        normalTrend: {},
        upgradeTrend: {},
        polar: {
          grid: [{right: 60}],
          yAxis: [{
            type: 'value'
          }, {
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              color: '#666'
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            }
          }],
          series: [{
            yAxisIndex: 0,
            type: 'bar'
          }, {
            yAxisIndex: 1,
            type: 'line',
            smooth: true
          }]
        }
      };
    },
    created() {
      this.ajaxBack();
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
      line-height: normal;
      font-size: 28px;
      color: #4080CA;
    }
    span {
      font-size: 12px;
      color: #666;
    }
  }
</style>
