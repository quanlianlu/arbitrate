<template>
  <div class="main">
    <x-header :left-options="{backText: ''}">汇总
      <a slot="right" class="dataIcon" style="line-height: 0px">
        <datetime
          v-model="dataByMonth"
          format="YYYY-MM"
          @on-confirm="onConfirm"
          :end-date="endDate">
          <icon name="icon_5" class="icon_data"></icon>
        </datetime>
      </a>
    </x-header>
    <yto-panel :title="dataTitle" style="margin-top: 0;">
      <section>
        <grid :show-lr-borders="false" :show-vertical-dividers="false" class="turnBorder">
          <grid-item label="" class="totalStyle" @click.native="goToDetail(0)">
            <p class="cF55">应付</p>
            <p class="totalCost cF55">{{totalCost}}</p>
          </grid-item>
          <grid-item label="" class="totalStyle" @click.native="goToDetail(1)">
            <p>应收</p>
            <p class="totalIncome">{{totalIncome}}</p>
          </grid-item>
        </grid>
      </section>
      <section>
        <grid :show-lr-borders="false" :show-vertical-dividers="false" class="turnBorder">
          <grid-item label="" class="totalStyle">
            <p>发货成本</p>
            <p class="totalCost ">{{deliveryCost}}</p>
          </grid-item>
          <grid-item label=" " class="totalStyle">

          </grid-item>
        </grid>
        <div id="myChart" style="height:60vw;padding:0 16px 16px"></div>
      </section>
      <router-link :to="{name:'summaryDetail',params:{month: this.searchTime}}" class="summaryLink">
        <span>查看详情</span> &nbsp;
        <svg-icon icon-class="arrow_right" className="arrow_right"/>
      </router-link>
    </yto-panel>

  </div>

</template>

<script>
  import {XHeader, Grid, GridItem, Datetime} from 'vux';
  import {getSummary} from '../../../service/service';
  import {mapState, mapGetters, mapMutations} from 'vuex';
  let iToday = new Date();
  let iY = iToday.getFullYear();
  let iM = iToday.getMonth() > 8 ? iToday.getMonth() + 1 : '0' + (iToday.getMonth() + 1);

  let echarts = require('echarts/lib/echarts');
  require('echarts/lib/chart/pie');

  export default {
    name: 'Summary',
    components: {
      Grid,
      GridItem,
      XHeader,
      Datetime
    },
    data() {
      return {
        // getMonth: iM + '月实时账单',
        dataByMonth: iY + '-' + iM,
        endDate: iY + '-' + iM + '-01',
        totalIncome: '0.00',
        totalCost: '0.00',
        deliveryCost: '0.00',
        taking: {},
        idata: {},
        pieData: {
          color: ['#4080CA', '#F5865C', '#F8BE1F', '#00884A', '#49B25D', '#BDD25B', '#F5EB67'],
          tooltip: {
            trigger: 'item'
          },
          series: [
            {
              name: '访问来源',
              type: 'pie',
              radius: ['30%', '50%'],
              center: ['50%', '50%'],
              avoidLabelOverlap: true,
              label: {
                normal: {
                  formatter: function(val,) {
                    console.log(val);
                    let name = ''
                    if(val.data.name.length>5) {
                      if(val.data.name.slice(0,3) == '派送费') {
                        name =`${val.data.name.slice(0,3)}\n${val.data.name.slice(3)}\n¥${val.data.value}`
                      }else if(val.data.name.slice(0,4) == '平衡派费'){
                        name =`${val.data.name.slice(0,4)}\n${val.data.name.slice(4)}\n¥${val.data.value}`
                      }else{
                        name =` \n${val.data.name.slice(0,5)}\n${val.data.name.slice(5)}\n¥${val.data.value}`
                      }
                    }else{
                      name = `${val.data.name}\n¥${val.data.value}`
                    }
                    return name
                    
                  },
                },
              }
            }
          ]
        }
      };
    },
    methods: {
      ...mapMutations(['SetSearchTime']),
      drawLine() {
        this.myChart = echarts.init(document.getElementById('myChart'));
        this.myChart.setOption(this.pieData);
      },
      ajaxBack(idata) {
        getSummary({'month': idata}).then(backJson => {
          if (backJson.status === 0) {
            console.log(backJson);
            this.totalCost = backJson.data.cost;
            this.totalIncome = backJson.data.income;
            this.deliveryCost = backJson.data.deliveryCost;
            let dataList = [];
            this.idata = dataList;
            this.pieData.series[0].data = dataList;

            this.pieData.series[0].data = [];
            for (let i = 0; i < backJson.data.proportion.data.length; i++) {
              this.pieData.series[0].data[i] = {};
              this.pieData.series[0].data[i].value = backJson.data.proportion.data[i];
              this.pieData.series[0].data[i].name = backJson.data.proportion.name[i];
            }
            this.myChart.setOption(this.pieData);
          }
        });
      },
      onConfirm() {
        // console.log('current value', this.dataByMonth)
        this.ajaxBack(this.dataByMonth);
        this.myChart.setOption(this.pieData);
        console.log(this.SetSearchTime);
        // this.getMonth = this.dataByMonth.split("-")[1] + '月实时账单';
        this.SetSearchTime(this.dataByMonth);
      },
      goToDetail(data) {
        console.log(data);
        this.$router.push({name: 'summaryDetail', params: {type: data}});
      }
    },
    computed: {
      // 使用对象展开运算符将 getter 混入 computed 对象中
      ...mapGetters([
        'searchTime'
      ]),
      dataTitle() {
        if (this.searchTime) {
          return this.searchTime.split('-')[1] + '月实时账单';
        }
      }
    },
    created() {
      if (!this.searchTime) {
        this.SetSearchTime();
      }
    },
    mounted() {
      this.dataByMonth = this.searchTime;
      this.endDate = iY + '-' + iM + '-01';
      this.SetSearchTime(this.dataByMonth);
      console.log(this.endDate);
      this.drawLine();
      this.ajaxBack(this.dataByMonth);
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .main {
    height: 100%;
    color: #333;
    background-color: #fff;
    .dataIcon{
      position: absolute;
      top: -11px;
      right: 5%;
    }
    .icon_data {
      width: 18px;
      height: 18px;
      font-size: 36px;
      color: #fff;
    }
  }

  .turnBorder {
    border-top: 1px #BFBFBF dotted;
    border-bottom: none;
    border-left: none;
    border-right: none;

    margin: 0 16px;
    padding: 0 16px;

    text-align: left;

  }

  .totalStyle {
    color: #333;
  }

  .totalStyle:after {
    content: ' ';
    border: none;
  }

  .totalIncome {
    font-size: 20px;
  }

  .totalCost {
    font-size: 20px;
  }

  .cF55 {
    color: #F55C6B;
  }

  .summaryLink {
    display: block;
    margin: 0 16px;
    padding-top: 16px;
    color: #333;
    text-align: right;
    border-top: 1px #BFBFBF dotted;
    .arrow_right {
      font-size: 14px;

    }
  }


</style>
