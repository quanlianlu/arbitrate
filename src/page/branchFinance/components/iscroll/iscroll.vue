<template>
  <div class="iscroll">
    <scroller lock-x :use-pullup='true' @on-scroll-bottom="onScrollBottom" ref="scrollerBottom" :pullup-config="pullupDefaultConfig"
              :scroll-bottom-offst="200" :style="{height: height}">
      <div class="box2">
        <div v-for="(item, index) in data" :key="index">
          <slot :item="item"></slot>
        </div>
        <!--<load-more tip="loading"></load-more>-->
      </div>
    </scroller>
  </div>
</template>

<script>
  import {Scroller, LoadMore} from 'vux';

  export default {
    name: 'iscroll',
    components: {Scroller, LoadMore},
    props: {
      data: {
        type: Array
      },
      height: {
        type: String,
        default: 'calc(100vh - 150px)'
      },
    },
    data() {
      return {
        onFetching: false,
        pullupDefaultConfig: {
          content: '上拉加载更多',
          pullUpHeight: 60,
          height: 40,
          autoRefresh: false,
          downContent: '释放后加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...',
          clsPrefix: 'xs-plugin-pullup-'
        },
      };
    },
    watch: {
      data: {
        deep: true,
        handler(data) {
          this.setData();
        }
      }
    },
    methods: {
      onScrollBottom() {
        if (this.onFetching) {
          // do nothing
        } else {
          this.onFetching = true;
          this.$emit('getData');
        }
      },
      setData() {
        this.$nextTick(() => {
          this.$refs.scrollerBottom.reset();
        });
        this.onFetching = false;
      },
      init() {
        this.$nextTick(() => {
          this.$refs.scrollerBottom.reset({
            top: 0
          })
        })
      },
      endScroll() {
        this.$refs.scrollerBottom.disablePullup();
        // this.$refs.scrollerBottom.donePullup();
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  .box2 {
    .listBox{
      width: 90%;
      margin-left: 10%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 54px;
      border-bottom: 1px solid #F0F0F0;
      font-size: 14px;
      color: #333333;
      .listTime{
        color: #999999;
        width: 120px;
        text-align: right;
      }
      .listMoney{
        width: 100px;
        text-align: left;
      }
      .listName{
        /*margin-left: 10px;*/
        position: relative;
        width: 120px;
        /*overflow: hidden;*/
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .listName:before{
        content: '';
        width: 27px;
        height: 27px;
        background: url("../../../../assets/img/icon_xiangxi@2x.png");
        background-size: cover;
        display: inline-block;
        vertical-align: middle;
        position: absolute;
        top: -3px;
        left: -32px;
      }
    }

  }
</style>
