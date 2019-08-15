<template>
  <div>
    <view-box ref="viewBox" body-padding-bottom="0">
    <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"  title="title"></x-header>
    <group style="padding-top:0;">
    <cell-box v-for="(item, index) in lists" :key="index" :link="{name: '工单详情', params: { postData: index }}"  is-link>
      <div class="yto-left">
          <div class="yto-title">普通投诉<span>3次</span><span>加急</span></div>
          <div class="yto-content">00121241241313</div>
          <div class="yto-footer">虚假签收</div>
      </div>
      <div class="yto-right">
        <div class="yto-title">处理中</div>
        <div class="yto-content">满意度调研</div>
        <div class="yto-footer">2017-01-01 20:30:40</div>
      </div>
    </cell-box>
    </group>
    <load-more  :show-loading="pullUpConfig.showLoading" :tip="pullUpConfig.showLoading ? pullUpConfig.loadingContent : pullUpConfig.content"></load-more>
    </view-box>
  </div>
</template>
<script>
  import {Group, Radio, CellBox, LoadMore, Scroller, ViewBox, XHeader} from 'vux'
  import { mapState, mapActions } from 'vuex'
  // import {searchList} from '../../service/service'

  export default {
    components: {
      Group,
      Radio,
      CellBox,
      LoadMore,
      Scroller,
      ViewBox,
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
      let _this = this
      // let windowH = window.innerHeight - 64
      /* _this.box = document.querySelector('#vux_view_box_body')
      _this.box.addEventListener('scroll', function () {
        if (_this.box.scrollTop + windowH >= _this.box.scrollHeight) {
          _this.pullUp()
          // _this.showLoading = !_this.showLoading
        }
        _this.updateDemoPosition(_this.box.scrollTop)
      }, false) */
      _this.ajaxList()
    },
    data () {
      return {
        scrollNum: '',
        getListJson: null,
        type: '4',
        lists: [0, 1, 2, 3, 0, 1, 2, 3],
        status1: {
          pullDownStatus: 'default'
        },
        pullUpConfig: {
          content: '上拉加载更多',
          showLoading: false,
          loadingContent: '加载中...'
        },
        n2: 10,
        pullupConfig2: {
          content: '上拉加载更多',
          downContent: '松开进行加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...'
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .weui-cell_access.vux-cell-box:after{
    border: 0;
  }
  .yto-left{
    flex: 1;
    span{
     padding-left:10px;
      color: #eb0000;
    }
  }
  .yto-right{
    text-align: right;
    .yto-title{
      color: #eb0000;
      font-size:0.9em;
    }
  }
  .yto-title{padding-bottom:5px;}
  .yto-footer{ font-size:0.9em; color:#cecece;}
  .yto-content{color: #999; padding-bottom:5px;}
</style>
