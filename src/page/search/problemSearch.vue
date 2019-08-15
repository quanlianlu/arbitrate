<template>
  <div style="height:100%;">
    <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title=""></x-header>
    <view-box ref="viewBox" body-padding-bottom="0">
    <group label-width="4.5em" label-margin-right="2em" label-align="right">
      <x-input title="运<i class='vux-blank-half'></i>单<i class='vux-blank-half'></i>号" placeholder="选填"></x-input>
      <Datetime title="查询时间" placeholder="开始时间" start-date="2017-01-01" end-date="2017-02-02" value-text-align="left"></Datetime>
      <Datetime title="" placeholder="结束时间" start-date="2017-01-01" end-date="2017-02-02" value-text-align="left" class="noline"></Datetime>
    </group>
    <group title="业务类型" label-width="4.5em" label-margin-right="2em" label-align="right" style="padding-bottom:100px;">
      <p class="yto-p" style="padding-top:10px">
        <checker v-model="ListIndex" default-item-class="demo1-item" selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
          <checker-item :key="index" :value="index" v-for="(item, index) in serviceList">{{item}}</checker-item>
        </checker>
      </p>
      <div v-if="ListIndex === 0">
      <cell title="投诉类型" value-align="left"></cell>
      <p class="yto-p">
        <checker :value="0" default-item-class="demo1-item" selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
          <checker-item :key="index" :value="index" v-for="(item, index) in complaintTypeList">{{item}}</checker-item>
        </checker>
      </p>
      <cell title="处理状态" value-align="left"></cell>
      <p class="yto-p">
        <checker :value="0" default-item-class="demo1-item" selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
          <checker-item :key="index" :value="index" v-for="(item, index) in handleStateList">{{item}}</checker-item>
        </checker>
      </p>
      <cell title="投诉来源" value-align="left"></cell>
      <p class="yto-p">
        <checker :value="0" default-item-class="demo1-item" selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
          <checker-item :key="index" :value="index" v-for="(item, index) in complaintSourceList">{{item}}</checker-item>
        </checker>
      </p>
      </div>
    </group>

    <div class="yto-foot" slot="bottom">
      <flexbox>
      <flexbox-item>
        <x-button type="default" class="yto-btn-default">重置</x-button>
      </flexbox-item>
      <flexbox-item style="margin-left:0;">
        <x-button type="primary" class="yto-btn-primary" @click.native="searchSubmit">查询</x-button>
      </flexbox-item>
      </flexbox>
    </div>
    </view-box>
  </div>
</template>

<script>
  import {XHeader, Group, Cell, XInput, ViewBox, Selector, XNumber, Checker, CheckerItem, XTextarea, XButton, DatetimeRange, Flexbox, FlexboxItem, Datetime} from 'vux'
  export default {
    components: {
      XHeader,
      Group,
      Cell,
      XInput,
      ViewBox,
      Selector,
      XNumber,
      Checker,
      CheckerItem,
      XTextarea,
      XButton,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime
    },
    data () {
      return {
        serviceList: ['投诉', '咨询', '快件查询', '问题件上报'],
        complaintTypeList: ['全部', '普通投诉', '淘宝投诉', '升级投诉'],
        handleStateList: ['全部', '未处理', '处理中', '申请完结', '已完结', '系统申请完结', '菜鸟已回复'],
        complaintSourceList: ['全部', '电话', '微信', '满意度调研', '快运', '语音留言', 'B网', '贝贝网', '在线客服', '支付宝', '圆通会员', '圆通官网'],
        ListIndex: 0
      }
    },
    methods: {
      searchSubmit () {
        this.$router.push({name: '投诉查询列表', params: { postData: 123 }})
      }
    }
  }
</script>

<style lang="less" scoped>
  .weui-cell.noline:before{
    left: 7.5em;
  }
  .demo1-item {
    padding: 5px 0 !important;
    border-radius: 3px;
    font-size: 0.8em;
    text-align: center;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
  }
  .demo1-item-selected {
    background-color: #4080CA;
    color:#fff;
  }
  .vux-tap-active.demo1-item-selected:active{
    background-color: #4080CA;
  }
  .yto-p {
    padding: 0 12px;
    .vux-checker-box {
      display: flex;
      flex-wrap: wrap;
    }
    .vux-checker-item {
      flex: 1;
      min-width:20% !important;
    }
  }

  .yto-foot{position:absolute; bottom: 0; background-color: #e2e2e2; right:0; left: 0;}

  .yto-btn-default {
    border-radius:0 !important;
    color:#fff !important;
    border-color: #ccc !important;
    background-color: #ccc !important;
    &:not(.weui-btn_disabled):active {
      background-color:#bbb !important;
    }
    &:after {
      border:0 !important;
    }
  }
  .yto-btn-primary {
    border-radius:0 !important;
    border-color: #4080CA !important;
    background-color: #4080CA !important;
  &:not(.weui-btn_disabled):active {
     background-color:#00aeef !important;
   }
    &:after {
      border:0 !important;
    }
  }
</style>
