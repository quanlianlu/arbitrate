// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import FastClick from 'fastclick';
import VueRouter from 'vue-router';
import App from './App';
import routes from './router/index';
import {AlertPlugin, ConfirmPlugin, LoadingPlugin, ToastPlugin, WechatPlugin} from 'vux';
import Yto from './components/index';

import store from './vuex';
import {nativeApp$} from './common/nativeAppUtil';
import {VChart, VLine, VArea, VBar, VPie, VPoint, VScale, VAxis, VGuide, VTooltip, VLegend} from 'vux';

import Icon from 'vue-svg-icon/Icon.vue';

import VueBetterCalendar from 'vue-better-calendar'
Vue.use(VueBetterCalendar)

Vue.component('icon', Icon);
Vue.use(VueRouter);
Vue.use(Yto);

const router = new VueRouter({
  routes

  /* scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      if (from.meta.keepAlive) {
        from.meta.savedPosition = document.body.scrollTop;
      }
      return { x: 0, y: to.meta.savedPosition || 0 };
    }
  } */
});


// plugins
Vue.use(ToastPlugin);
Vue.use(AlertPlugin);
Vue.use(ConfirmPlugin);
Vue.use(LoadingPlugin);
Vue.use(WechatPlugin);
Vue.component('v-chart', VChart);
Vue.component('v-line', VLine);
Vue.component('v-area', VArea);
Vue.component('v-bar', VBar);
Vue.component('v-pie', VPie);
Vue.component('v-point', VPoint);
Vue.component('v-scale', VScale);
Vue.component('v-axis', VAxis);
Vue.component('v-guide', VGuide);
Vue.component('v-tooltip', VTooltip);
Vue.component('v-legend', VLegend);

FastClick.attach(document.body);

Vue.config.productionTip = false;

if (module.hot) {
  module.hot.accept();
}
// simple history management
const history = window.sessionStorage;
history.clear();
let historyCount = history.getItem('count') * 1 || 0;
history.setItem('/', 0);

router.beforeEach(function (to, from, next) {
  store.commit('updateLoadingStatus', {isLoading: true});

  const toIndex = history.getItem(to.path);
  const fromIndex = history.getItem(from.path);

  if (toIndex) {
    if (!fromIndex || parseInt(toIndex, 10) > parseInt(fromIndex, 10) || (toIndex === '0' && fromIndex === '0')) {
      store.commit('updateDirection', {direction: 'forward'});
    } else {
      store.commit('updateDirection', {direction: 'reverse'});
    }
  } else {
    ++historyCount;
    history.setItem('count', historyCount);
    to.path !== '/' && history.setItem(to.path, historyCount);
    store.commit('updateDirection', {direction: 'forward'});
  }

  if (/\/http/.test(to.path)) {
    let url = to.path.split('http')[1];
    window.location.href = `http${url}`;
  } else {
    next();
  }
});

router.afterEach(function () {
  store.commit('updateLoadingStatus', {isLoading: false});
  /* if (process.env.NODE_ENV === 'production') {
    ga && ga('set', 'page', to.fullPath)
    ga && ga('send', 'pageview')
  } */
});

/* eslint-disable no-new */
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app-box');

nativeApp$();
