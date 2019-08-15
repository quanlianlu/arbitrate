<template>
  <chart ref="chart" v-bind="$attrs"
         :init-options="initOptions"
         :options="echartOption"
         :style="{width:width, height: height}"
         @click="ertClick"
         auto-resize></chart>
</template>

<script>
  import deepAssign from './deepAssign';
  import ECharts from 'vue-echarts/components/ECharts';
  import 'echarts';

  function isAarry(val) {
    return Object.prototype.toString.call(val) === '[object Array]';
  };

  function getType(val) {
    if (typeof (val.series[0].type) === 'undefined') {
      return '';
    } else {
      return val.series[0].type;
    }
  };

  const cssOption = {
    color: ['#4080CA', '#FFC74E'],
    animation: false,
    grid: [{top: 25, bottom: 40, left: 60, right: 20}],
    legend: {show: true, top: 0, right: 20, data: []},
    tooltip: {
      show: true,
      trigger: 'axis',
      triggerOn: 'click'
    },
    xAxis: [{
      type: 'category',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#666',
        interval: 0
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#E4E4E4'
        }
      }
    }],
    yAxis: [{
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
        lineStyle: {
          color: '#E4E4E4'
        }
      }
    }],
    series: [{
      type: 'line',
      symbol: 'circle',
      smooth: true,
      showSymbol: false,
      //   silent: true,
      legendHoverLink: false
    }]
  };
  export default {
    name: 'yto-echart',
    components: {
      chart: ECharts
    },
    props: {
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '160px'
      },
      options: {
        type: Object,
        default: function() {
          return {};
        }
      },
      data: {
        type: Object,
        default: function() {
          return {};
        }
      },
      dataKey: {
        type: String,
        default: 'data'
      }
    },
    data() {
      return {
        initOptions: {
          renderer: 'svg'
        },
        echartOption: {}
      };
    },
    watch: {
      data: {
        deep: true,
        handler() {
          this.initChart();
        }
      }
    },
    mounted() {
    },
    created() {
    },
    methods: {
      ertClick(params) {
        console.log(params);
      },
      initChart() {
        // console.log(JSON.stringify(this.options));
        let copyOption = JSON.parse(JSON.stringify(this.options));
        let copyCssOption = JSON.parse(JSON.stringify(cssOption));
        // this.defaultOption = this.$options.defaultOption;
        let newOption = deepAssign(copyCssOption, copyOption);
//        console.log(JSON.stringify(newOption));
        switch (getType(newOption)) {
          case 'line':
            this.setLineOrBar(newOption);
            break;
          case 'bar':
            this.setLineOrBar(newOption);
            break;
          case 'pie':
            this.setPie(newOption);
            break;
          default:
            this.setLineOrBar(newOption);
        }
      },
      setLineOrBar(newOption) {
        let xdata = this.data['x' + this.dataKey];
        let ydata = this.data['y' + this.dataKey];
        if (this.data && xdata && ydata && xdata.length > 0 && ydata.length > 0) {
          // console.log(JSON.stringify(newOption));
          if (this.data.legend) {
            newOption.legend.data = this.data.legend;
            this.data.legend.forEach((item, index) => {
              if (typeof (newOption.series[index]) === 'undefined') {
                newOption.series.push({
                  name: item,
                  type: 'line',
                  data: ydata[index]
                });
              } else {
                newOption.series[index].name = item;
                newOption.series[index].type = newOption.series[index].type ? newOption.series[index].type : 'line';
                newOption.series[index].data = isAarry(ydata[index]) ? ydata[index] : ydata;
              }
            });
          }
          if (isAarry(xdata[0])) {
            xdata.forEach((item, index) => {
              if (!newOption.xAxis[index]) {
                newOption.xAxis.push({
                  data: xdata[index]
                });
              } else {
                newOption.xAxis[index].data = xdata[index];
              }
            });
          } else {
            if (isAarry(newOption.xAxis)) {
              newOption.xAxis[0].data = xdata;
            } else {
              newOption.xAxis.data = xdata;
            }
          }
          // console.log(JSON.stringify(newOption));
          this.echartOption = newOption;
          this.loadEchart = true;
        } else {
          this.loadEchart = false;
        }
      },
      setPie(newOption) {
        // let xdata = this.data['x' + this.dataKey];
        let ydata = this.data['y' + this.dataKey];
        if (this.data && ydata && ydata.length > 0) {
          if (this.data.legend) {
            // newOption.legend.data = this.data.legend;  老版封装
            newOption.legend = this.data.legend;  // 添加 formatter 自定义
            if (isAarry(ydata[0])) {
              ydata.forEach((item, index) => {
                if (typeof (newOption.series[index]) === 'undefined') {
                  newOption.series.push({
                    name: '图表',
                    type: 'pie',
                    data: ydata[index]
                  });
                  // console.log(JSON.stringify(newOption));
                } else {
                  newOption.series[index].name = '图表';
                  newOption.series[index].type = 'pie';
                  newOption.series[index].data = ydata[index];
                  // console.log(JSON.stringify(newOption));
                }
              });
            } else {
              newOption.series[0].type = 'pie';
              newOption.series[0].data = ydata;
            }
          }
          this.echartOption = newOption;
          this.loadEchart = true;
        } else {
          this.loadEchart = false;
        }
      }
    }
  };
</script>
