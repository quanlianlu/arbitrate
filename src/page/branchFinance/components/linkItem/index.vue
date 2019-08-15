<template>
  <div :class="['box', hasBorder ? 'hasBorder':'', borderDir === 'top'? 'borderTop' : '']">
    <div class="iLeft" :style="{color: leftColor}">
      {{leftTitle}}
      <slot name="left"></slot>
    </div>
    <div class="iRight">
      {{rightTitle}}
      <icon name="arrow_right" scale="20"></icon>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "index",
    props: {
      leftTitle: {
        type: String
      },
      rightTitle: {
        type: String
      },
      hasBorder: {
        type: Boolean,
        default: true
      },
      borderDir: {
        type: String,
        default: 'bottom'
      },
      leftColor: {
        type: String,
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .box {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    color: #333333;
  }
  .hasBorder{
    border-bottom: 1px dotted #BFBFBF;
  }
  .borderTop{
    border-top: 1px dotted #BFBFBF!important;
    border-bottom: none;
  }
</style>
