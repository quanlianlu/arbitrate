<template>
  <div style="height:100%;">
    <x-header
      slot="header"
      style="width:100%;position:absolute;left:0;top:0;z-index:100;"
      title="title"
    >
    </x-header>
    <view-box body-padding-bottom="0">
    <group label-width="4.5em" label-margin-right="2em" label-align="right" style="padding-top:0;">
      <cell title="运单号" :value="trackNum" value-align="left"></cell>
      <cell title="客户姓名" :value="customer" value-align="left"></cell>
      <cell title="客户电话" :value="tel" value-align="left"></cell>
      <cell title="业务类型" :value="serviceType" value-align="left"></cell>
      <cell title="咨询大类" :value="oneType" value-align="left"></cell>
      <cell title="咨询小类" :value="twoType" value-align="left"></cell>
      <cell title="始发组织" :value="firstOrg" value-align="left"></cell>
      <cell title="问题描述" :value="problemInfo" value-align="left" align-items="flex-start"></cell>
      <cell title="问题描述" :value="problemInfo" value-align="left" align-items="flex-start"></cell>
      <cell title="问题描述" :value="problemInfo" value-align="left" align-items="flex-start"></cell>
      <cell title="问题描述" :value="problemInfo" value-align="left" align-items="flex-start"></cell>
    </group>
    <div class="yto-foot" slot="bottom">
      <x-button type="primary" class="yto-btn-primary" @click.native="searchSubmit">回复</x-button>
    </div>
    </view-box>
  </div>
</template>
<script>
  import {Group, XButton, ViewBox, Cell, XHeader} from 'vux'
  import { mapState, mapActions } from 'vuex'
  // import {searchList} from '../../service/service'

  export default {
    components: {
      Group,
      XButton,
      ViewBox,
      Cell,
      XHeader
    },
    computed: {
      ...mapState({
        direction: state => state.vux.demoScrollTop,
        demoTop: state => state.vux.demoScrollTop
      })
    },
    methods: {
      ...mapActions([
        'updateDemoPosition'
      ]),
      onImgError (item, $event) {
        console.log(item, $event)
      },
      pullUp () {
        setTimeout(() => {
          this.pullUpConfig.showLoading = true
          this.lists.push('2')
        }, 200)
      },
      load2 () {
        setTimeout(() => {
          this.n2 += 10
          setTimeout(() => {
            this.$refs.demo2.donePullup()
          }, 100)
          if (this.n2 === 30) { // unload plugin
            setTimeout(() => {
              this.$refs.demo2.disablePullup()
            }, 100)
          }
        }, 2000)
      },
      async ajaxList () {
        // this.getListJson = await searchList("222", "2121");
       // if (this.getListJson.message !== 'true') {
        // this.$store.commit('RECORD_USERINFO', this.userAccount)
          // alert(this.$store.state.firstIn)
       // }
      }
    },
    created () {
    },
    data () {
      return {
        trackNum: '40124581455',
        customer: '张三',
        tel: '021-69777927',
        serviceType: '咨询',
        oneType: '大类',
        twoType: '小类',
        firstOrg: '上海徐泾',
        problemInfo: '手动阀随碟附送防守打法撒打发斯蒂芬是大法师帝国时代告诉过'
      }
    }
  }
</script>

<style lang="less" scoped>
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
