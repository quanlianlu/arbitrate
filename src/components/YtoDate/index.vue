<template>
  <div class="yto-date">
    <datetime :value="value" class="yto-date-input" @on-change="change" v-bind="$attrs">
      {{value}}
      <div class="date-icon">
        <svg-icon icon-class="date"/>
      </div>
    </datetime>
  </div>
</template>

<script>
  import {
    Datetime,
    Group,
    XButton
  } from 'vux';

  export default {
    name: 'yto-date',
    components: {
      Datetime,
      Group,
      XButton
    },
    props: {
      value: {
        type: String,
        default: ''
      },
      data: {
        type: Array
      },
      cols: {
        type: Number,
        default: 3
      }
    },
    data() {
      return {
        date: '2018-03-22'
      };
    },
    computed: {},
    created() {
    },
    methods: {
      onClick(item) {
        this.$emit('on-click', item);
      },
      change(val) {
        this.$emit('input', val);
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less" scoped>
  .yto-date{
    border:1px solid #4080CA;
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    border-radius: 3px;
    .yto-date-input{
      display: block;
      padding:0 0 0 5px;
      line-height: 26px;
    }
    .date-icon{
      color: #fff;
      background: #4080CA;
      height: 26px;
      width: 26px;
      display: inline-block;
      text-align: center;
      line-height: 26px;
    }
  }
</style>
