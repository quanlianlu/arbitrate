<template>
  <div id="branchBill">
    <view-box>
        <router-view></router-view>
    </view-box>
    <tabbar>
      <tabbar-item selected link="/billManage">
        <icon name="icon_fill" slot="icon" class="tabbarIcon"></icon>
        <span slot="label">账单</span>
      </tabbar-item>
      <tabbar-item link="/summary">
        <icon name="icon_all" slot="icon" class="tabbarIcon"></icon>
        <span slot="label">汇总</span>
      </tabbar-item>
    </tabbar>
  </div>
</template>

<script>
  import { XHeader, Tabbar, TabbarItem, ViewBox } from 'vux';
  export default {
    name: 'branchBill',
    components: {
      XHeader,
      Tabbar,
      TabbarItem,
      ViewBox
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';
  #branchBill {
      height: 100%;
    .tabbarIcon{
      height: 19px;
      width: 19px;
    }
  }
</style>
