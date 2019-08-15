<template>
  <div class="yto-panel">
    <div :class="{'yto-panel-title': true, 'yto-panel-tap': isLink}" @click="onClickHeader">
      {{title}}
      <slot name="right"></slot>
    </div>
    <div class="yto-panel-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'yto-panel',
    props: {
      data: {
        type: Array
      },
      title: {
        type: String
      },
      icon: {
        type: String,
        default: 'complain'
      },
      isLink: Boolean
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
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less" scoped>
  .yto-panel {
    margin-top: 10px;
    background: #fff;
    .yto-panel-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      padding: 18px 12px 18px 22px;
      line-height: normal;
      position: relative;
      &:before{
        content: '';
        position: absolute;
        top:20px;
        bottom: 20px;
        left: 12px;
        width: 3px;
        border-radius: 20%;
        background-color: #4080CA;
      }
    }
    .yto-panel-tap:after {
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
      color: #58C0F9;
      font-size: 14px;
      vertical-align: -3px;
    }
    .yto-panel-body {
      .vux-1px-r:after {
        top: 5px;
        bottom: 5px;
      }
    }
  }
</style>
