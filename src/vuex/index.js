import Vue from 'vue';
import Vuex from 'vuex';

import complain from './modules/complain';
import problem from './modules/problem';
import urgeExpress from './modules/urgeExpress';
import branch from './modules/branch';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

let store = new Vuex.Store({
  modules: {
    complain, problem,urgeExpress, branch
  },
  strict: debug
});

store.registerModule('vux', {
  state: {
    demoScrollTop: 0,
    isLoading: false,
    direction: 'forward',
    userToken: '',
    probleList: null,
    firstInPage: true
  },
  mutations: {
    updateDemoPosition(state, top) {
      state.demoScrollTop = top;
    },
    updateLoadingStatus(state, payload) {
      state.isLoading = payload.isLoading;
    },
    updateDirection(state, payload) {
      state.direction = payload.direction;
    },
    recordUserInfo(state, info) {
      state.userToken = info;
      // window.localStorage.setItem('userToken', state.userToken);
    },
    updateProbleList(state, list) {
      state.probleList = list;
    },
    updateFirstInPage(state, info) {
      state.firstInPage = info;
    }
  },
  actions: {
    updateDemoPosition({commit}, top) {
      commit({type: 'updateDemoPosition', top});
    },
    recordUserInfo({commit}, info) {
      commit({type: 'recordUserInfo', info});
    },
    updateProbleList({commit}, list) {
      commit({type: 'updateProbleList', list});
    },
    updateFirstInPage({commit}, info) {
      commit({type: 'updateFirstInPage', info});
    }
  }
});
export default store;
