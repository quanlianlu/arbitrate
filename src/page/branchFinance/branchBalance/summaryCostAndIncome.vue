<template>
  <div class="summary summaryScroll">
    <x-header :left-options="{backText: ''}">
      <p>应付/应收汇总</p>
      <icon name="icon_6" slot="right" style="width: 19px;height: 19px;color: #ffffff" @click.native="dialogShow = true"></icon>
    </x-header>
    <div class="tabBox iswiper">
      <button-tab v-model="tabSwiper">
        <button-tab-item @on-item-click="getSummaryshouldringChartApi()">
          应付
        </button-tab-item>
        <button-tab-item @on-item-click="getSummaryshouldringChartApi()">
          应收
        </button-tab-item>
      </button-tab>
      <div class="echartsBox" v-show="pieHasData">
        <yto-echart :data="takingCost" :options="polar1" v-show="tabSwiper === 0" height="220px"></yto-echart>
        <yto-echart :data="takingIncome" :options="polar1" v-show="tabSwiper === 1" height="220px"></yto-echart>
      </div>
      <div class="echartsBox" v-show="!pieHasData">
        <p class="noDate">暂无数据</p>
      </div>
    </div>
    <div style="margin-bottom: 40px">
      <yto-panel title="应付／应收汇总趋势图">
        <div id="iChart" style=" height: 260px;width: 100%;"></div>
      </yto-panel>
    </div>
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
  import { XHeader,ButtonTab, ButtonTabItem, XDialog, TransferDomDirective as TransferDom} from 'vux';
  import {getSummaryshouldringChart, getSummaryshouldline} from '../../../service/service';
  import echarts from 'echarts';
  var pieData = [];
  export default {
    name: "summary-detail",
    components: {XHeader,ButtonTab, ButtonTabItem, XDialog},
    directives: {
      TransferDom
    },
    data() {
      return {
        dialogShow: false,
        tabSwiper: 0,
        moveItem: '',
        takingCost: {},
        takingIncome: {},
        pieHasData: true,
        polar1:  {
          animation: true,
          color: ['#4080CA', '#F5865C', '#F8BE1F', '#BDD25B','#00884A','#F5EB67','#49B25D'],
          grid: {show: true, borderWidth: '0', bottom: 30, right: 0, top: -20},
          tooltip: {
            trigger: 'item',
            show: true
          },
          legend:
            {
              show: true,
              top: '128',
              left: 0,
              itemWidth: 8,
              itemHeight: 8,
              data: [],
              formatter: function (params) {
                console.log(params);
                for (let i = 0; i < option.series[0].data.length; i++) {
                  if (option.series[0].data[i].name == params) {
                    return params +":"+ option.series[0].data[i].value+"起";
                  }
                }
              }
            },
          graphic: [{
            type: 'text',
            left: 'center',
            top: '24%',
            style: {
              text: '88888.00',
              fill: '#333333',
              fontSize: '16',
            }
          }, {
            type: 'text',
            left: 'center',
            top: '34%',
            style: {
              text: '总应付',
              fill: '#999999',
              fontSize: '12'
            }
          }],
          series: [
            {
              type:'pie',
              radius: ['40%', '55%'],
              center: ['50%', '30%'],
              avoidLabelOverlap: true,
              label: {
                normal: {
                  show: false,
                  formatter: '  {b}  \n ¥{c} ',
                },
                emphasis: {
                  show: false,
                  textStyle: {
                    fontSize: '14',
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data:[]
            }
          ]
        },
        lineData: {
          color: ['#F8BE1F', '#4080CA'],
          grid: {show: 'true', borderWidth: '0', left: 50},
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            right:'10%',
            icon:'rect',
            data:['应付','应收'],
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
              interval: 0,
              rotate:"0",
              fontSize : 8
              // formatter:function(value)
              // {
              //   return value.split("/").join("\n");
              // }
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
          dataZoom: [
            {
              type: 'inside',
              start: 50,
              end: 100
            }
          ],
          series: [
            {
              name:'应付',
              type:'line',
              stack: '总量',
              lineStyle: {
                normal: {
                  width:1
                }
              },
              data:[]
            },
            {
              name:'应收',
              type:'line',
              stack: '总量',
              lineStyle: {
                normal: {
                  width:1
                }
              },
              data:[]
            },

          ]
        },
      }
    },
    mounted(){
      //线型图
      this.iChart = echarts.init(document.getElementById('iChart'));
      this.iChart.setOption(this.lineData);
      let iChart = this.iChart;
      let self = this;
      iChart.getZr().on('mouseup',function (params) {
        var pointInPixel= [params.offsetX, params.offsetY];
        if (iChart.containPixel('grid',pointInPixel)) {
          /*此处添加具体执行代码*/
          let pointInGrid=iChart.convertFromPixel({seriesIndex:0},pointInPixel);
          //X轴序号
          let xIndex=pointInGrid[0];
          //获取当前图表的option
          let op=iChart.getOption();
          //获得图表中我们想要的数据
          if (op.xAxis[0].data[xIndex] === this.moveItem) {
            return false;
          }
          self.moveItem = op.xAxis[0].data[xIndex];
          console.log(self.moveItem )
          self.getSummaryshouldringChartApi(self.moveItem)
        }
      });
      this.getSummaryshouldlineApi();

    },
    methods: {
      getSummaryshouldringChartApi(data) {
        let time = this.moveItem;
        this.pieHasData = true;
        let data1 = data === undefined ? time : data;
        let obj = {
          billType: this.tabSwiper,
          date: data1
        };
        getSummaryshouldringChart(obj).then(backJson => {
          // console.log(backJson)
          if (backJson.status === 0) {
            let data = backJson.data;
            if (data.data.length === 0) {
              this.pieHasData = false;
              return
            } else {
              this.pieHasData = true;
            }
            let iArr = [];
            let seriesbj;
            for (let i = 0; i < backJson.data.data.length; i++) {
              seriesbj = {
                value: data.data[i].billAmount,
                name: data.data[i].feeName
              };
              iArr.push(seriesbj);
            }
            this.polar1.series[0].data = iArr;
            pieData = iArr;
            let legendObj = {
              data: data.legend,
              formatter: function (params) {
                for (let i = 0; i < iArr.length; i++) {
                  if (iArr[i].name == params) {
                    return params +" "+ iArr[i].value;
                  }
                }
              }
            };
            let obj = {
              legend: Object.assign(this.polar1.legend, legendObj),
              xdata: data.legend,
              ydata:iArr
            };
            console.log(this.polar1.legend);
            if (this.tabSwiper === 0 ) {
              this.takingCost = obj;
              this.polar1.graphic[0].style.text = data.total;
              this.polar1.graphic[1].style.text = '总应付';
            } else {
              this.takingIncome = obj;
              this.polar1.graphic[0].style.text = data.total;
              this.polar1.graphic[1].style.text = '总应收';
            }
          }
        });
      },
      getSummaryshouldlineApi() {
        getSummaryshouldline().then(backJson => {
          console.log(backJson);
          if (backJson.status === 0) {
            let data = backJson.data.line;
            this.lineData.legend.data = data.legend;
            this.lineData.xAxis.data = data.xdata;
            this.lineData.xAxis.axisLabel.interval = 176;
            this.lineData.series[0].name = data.legend[0];
            this.lineData.series[1].name = data.legend[1];
            this.lineData.series[0].data = data.ydata[0];
            this.lineData.series[1].data = data.ydata[1];
            let lastTime = data.xdata[data.xdata.length -1];
            this.moveItem = lastTime
            this.getSummaryshouldringChartApi(lastTime);
            this.iChart.setOption(this.lineData);
          }
        });
      },
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .summary{
    background-color: #ffffff;
    height: 100%;
    .tabBox{
      padding: 24px 15px 0 15px;
    }
    .echartsBox {
      margin-top: 20px;
      .noDate{
        min-height: 200px;
        text-align: center;
        line-height: 200px;
      }
    }
  }
  .summaryScroll{
    overflow-y: scroll;
  }
</style>
