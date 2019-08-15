<template>
  <div class="main">
    <x-header :left-options="{backText: ''}">实付/实收汇总<a slot="right">
      <svg-icon icon-class="icon_question" className="icon_question" @click.native="dialogShow = true"/></a></x-header>

    <yto-panel title="实付／实收汇总趋势图" style="margin-top: 0;">
      <div id="myChart1" style="height: 300px;padding-left: 16px"></div>
    </yto-panel>
    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 14px">
          <div class="infoDetail" style="text-align: left">
            <p>更新时间：每日早上7:00更新T-1数据，默认当前时间T-1往前一年的数据</p>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
import {  XHeader ,XDialog, TransferDomDirective as TransferDom} from 'vux'
import {realLineApi} from '../../../service/service';

let echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');

export default {
  name: 'summaryReal',
  directives: {
    TransferDom
  },
  components: {
    XHeader,
    XDialog
  },
  data(){
    return{
      dataLine:{},
      dialogShow: false,
      optionsLine: {
        color: ['#F8BE1F', '#4080CA'],
        tooltip: {
          trigger: 'axis'
        },
        grid:{
          y:30,
        },
        legend: {
          right:'10%',
          icon:'rect',
          data:  ["实收", "实付"],
          itemWidth: 18,
          itemHeight:2,

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
            // rotate:20
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
        yAxis: {
          // show : false,
          type: 'value',
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#666',
            margin: 2,
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
            lineStyle: {
              color: '#E4E4E4'
            }
          }
        },
        series: [
          {
            name:'实收',
            type:'line',
            stack: '实收总量',
            data:[]
          },
          {
            name:'实付',
            type:'line',
            stack: '实付总量',
            data:[]
          },

        ]
      },
    }
  },
  methods:{
    drawLine() {
      this.myChart = echarts.init(document.getElementById('myChart1'));
      this.myChart.setOption(this.optionsLine);
    },
    ajaxBack() {
      realLineApi().then(backJson => {
        console.log(backJson);
        if (backJson.status === 0) {
          this.optionsLine.xAxis.data=backJson.data.line.xdata;
          this.optionsLine.xAxis.axisLabel.interval=backJson.data.line.xdata.length-2;
          this.optionsLine.series[0].data=backJson.data.line.ydata[0];
          this.optionsLine.series[1].data=backJson.data.line.ydata[1];
          this.myChart.setOption(this.optionsLine);
        }
      });
    }
  },
  created(){

  },
  mounted(){
    this.drawLine();
    this.ajaxBack();
  }
};
</script>

<style scoped>
.main{
  height: 100%;
  background-color: #fff;
}

.icon_question {
  font-size: 18px;

}
</style>
