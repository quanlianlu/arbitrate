<template>
  <div style="height:100%; overflow: hidden">
    <transition :name="'vux-pop-' + (direction === 'forward' ? 'in' : 'out')">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
    </transition>
    <transition :name="'vux-pop-' + (direction === 'forward' ? 'in' : 'out')">
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </transition>
  </div>
</template>

<script>
  import {Drawer, ViewBox, XHeader} from 'vux';
  import {mapState, mapActions} from 'vuex';
  import {getToken} from './common/commonUtils';

  export default {
    name: 'app',
    components: {
      XHeader,
      ViewBox,
      Drawer
    },
    methods: {
      ...mapActions([
        'updateDemoPosition',
        'recordUserInfo'
      ])
    },
    created() {
      // let _this = this;
      let userToken = null;
      getToken().then((res) => {
        userToken = res;
      });
      this.$store.commit('recordUserInfo', userToken);
//      window.acceptTokenFromTheApp = function(usertoken) {
//        _this.$store.commit('recordUserInfo', usertoken);
//        alert(JSON.stringify(_this.$store.state));
//      };
    },
    computed: {
      ...mapState({
        direction: state => state.vux.direction,
        userToken: state => state.vux.userToken
      }),
      leftOptions() {
        return {
          showBack: this.$route.path !== '/',
          preventGoBack: this.$route.path === '/problemSearch',
          backText: ''
        };
      },
      headerTransition() {
        return this.direction === 'forward' ? 'vux-header-fade-in-right' : 'vux-header-fade-in-left';
      },
      title() {
        return this.$route.name;
      }
    }
  };
</script>

<style lang="less">
  @import 'assets/css/theme.less';
  @import 'assets/css/ytoCss.less';
  @import '~vux/src/styles/reset.less';

  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  body {
    background-color: #fbf9fe;
  }

  .vux-header {
    background-color: #4080CA !important;
  }

  .vux-header .vux-header-left .left-arrow::before {
    border-color: #fff !important;
  }

  .vux-pop-out-enter-active,
  .vux-pop-out-leave-active,
  .vux-pop-in-enter-active,
  .vux-pop-in-leave-active {
    will-change: transform;
    transition: all 500ms;
    height: 100%;
    top: 0;
    position: absolute;
    backface-visibility: hidden;
    perspective: 1000px;
    left: 0;
    right: 0;
  }

  .vux-pop-out-enter {
    opacity: 0;
    //transform: translate3d(-100%, 0, 0);
  }

  .vux-pop-out-leave-active {
    opacity: 0;
    //transform: translate3d(100%, 0, 0);
  }

  .vux-pop-in-enter {
    opacity: 0;
    //transform: translate3d(100%, 0, 0);
  }

  .vux-pop-in-leave-active {
    opacity: 0;
    //transform: translate3d(-100%, 0, 0);
  }
</style>
