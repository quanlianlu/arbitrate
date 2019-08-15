<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="46px">
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"
        title="实时业务量"
        :left-options="{backText:''}">
      </x-header>
      <yto-panel title="实时指标" style="margin-top: 0;">
        <yto-grid :data="businessDate" :show-lr-borders="false"></yto-grid>
      </yto-panel>
      <yto-panel title="今日实时趋势图">
        <yto-echart :data="taking" :options="polar1"></yto-echart>
        <yto-echart :data="handon" :options="polar2"></yto-echart>
        <yto-echart :data="signature" :options="polar3"></yto-echart>
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
    TransferDomDirective as TransferDom
  } from 'vux';
  import {businessChartAPI} from '../../service/service';

  export default {
    directives: {
      TransferDom
    },
    components: {
      XHeader,
      ViewBox,
      Flexbox,
      FlexboxItem
    },
    data() {
      return {
        businessDate: [{name: '揽收量'}, {name: '派送量'}, {name: '签收量'}],
        signature: {},
        taking: {},
        handon: {},
        polar1: {
          color: '#FFC74E',
          tooltip: {
            formatter: '{b0}点<br/>揽收量: {c0}'
          }
        },
        polar2: {
          tooltip: {
            formatter: '{b0}点<br/>派送量: {c0}'
          }
        },
        polar3: {
          color: '#FFC74E',
          tooltip: {
            formatter: '{b0}点<br/>签收量: {c0}'
          }
        }
      };
    },
    methods: {
      ajaxBack() {
        this.$vux.loading.show({
          text: '加载中'
        });
        businessChartAPI().then(backJson => {
          let {bdResponse} = backJson.data;
//          this.businessDate = bdResponse.business;
          this.businessDate[0].type = 'yellow';
          this.businessDate[2].type = 'yellow';
          this.signature = bdResponse.signature;
          this.handon = bdResponse.handon;
          this.taking = bdResponse.taking;
        }).finally(() => {
          this.$nextTick(function() {
            this.$vux.loading.hide();
          });
        });
      }
    },
    created() {
      if (this.$route.params.length) {
        this.businessDate = this.$route.params;
      }
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

  .grid-center {
    display: block;
    text-align: center;
    color: #666;
  }
</style>
