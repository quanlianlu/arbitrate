<template>
  <div class="yto-card">
    <div :class="{'yto-card-title': true, 'yto-card-tap': isLink}" @click="onClickHeader">
      <svg-icon :iconClass="icon" className="yto-icon"></svg-icon>
      {{title}}
    </div>
    <div class="yto-card-flex" v-if="data && data.length > 0">
      <div :class="index === data.length -1 ? '' : 'vux-1px-r'" v-for="(item, index) in data">
        <span>{{item.name}}</span>
        <h4 :style="[{color:item.color ? item.color : '#4080CA'},{textDecoration:item.textDecoration ? item.textDecoration: 'none'}]" @click="onClickData(item.name)" >
          {{ typeof(item[dataKey]) !== 'undefined' ? item[dataKey] : '--'}}</h4>
      </div>
    </div>
    <div class="yto-card-flex" v-else>
      <div style="min-height: 64px; line-height: 64px;">
        <inline-loading></inline-loading>
        <span style="vertical-align:middle;display:inline-block;font-size:14px;">&nbsp;&nbsp;加载中</span></div>
    </div>
  </div>
</template>

<script>
  import SvgIcon from '../SvgIcon/index.vue';
  import {InlineLoading} from 'vux';

  export default {
    components: {SvgIcon, InlineLoading},
    name: 'yto-card',
    props: {
      data: {
        type: Array
      },
      title: {
        type: String
      },
      name: {
        type: String
      },
      icon: {
        type: String,
        default: 'complain'
      },
      dataKey: {
        type: String,
        default: 'value'
      },
      isLink: Boolean,
      isWarning: Boolean,

    },
    data() {
      return {};
    },
    computed: {},
    created() {
    },
    methods: {
      onClickHeader() {
        if (!this.isLink) return false;
        this.$emit('on-click-header', this.title);
      },
      onClickData(val) {
        // console.log(this.isWarning);
        // return
        if (!this.isWarning) return false;
        console.log(val);
        this.$emit('onClickData',val)
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';

  .yto-card {
    margin: 5px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 1px rgba(133, 133, 133, 0.23);
    .yto-card-title {
      border-bottom: 1px solid #ddd;
      font-size: 12px;
      color: #4080CA;
      padding: 8px;
      line-height: normal;
      position: relative;
    }
    .yto-card-tap:after {
      content: " ";
      display: inline-block;
      height: 6px;
      width: 6px;
      border-width: 2px 2px 0 0;
      border-color: #c8c8cd;
      border-style: solid;
      transform: matrix(.71, .71, -.71, .71, 0, 0);
      position: absolute;
      top: 50%;
      margin-top: -4px;
      right: 12px;
    }
    .yto-icon {
      color: #4080CA;
      font-size: 14px;
      vertical-align: -3px;
    }
    .yto-card-flex {
      display: flex;
      padding: 15px 0;
      > div {
        flex: 1;
        text-align: center;
        span {
          font-size: 16px;
          color: #999;
        }
        h4 {
          font-size: 24px;
          padding-top: 10px;
          line-height: normal;
          font-weight: 500;
        }
      }
      .vux-1px-r:after {
        top: 5px;
        bottom: 5px;
      }
    }
  }
</style>
