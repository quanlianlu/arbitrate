import axios from 'axios';
import Vue from 'vue';
import {getToken} from '../common/commonUtils';
import {showTokenInvalidAlert} from '../common/commonUtils';
axios.defaults.timeout = 35000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
/*axios.defaults.headers.token = getToken();*/
/*生产环境后台服务*/
axios.defaults.baseURL = '/steward-api';
/*试点环境后台服务*/
/*axios.defaults.baseURL = '/steward-api-beta';*/
//请求拦截
axios.interceptors.request.use(
  config => {
    return getToken().then((res) => {
      config.headers = {
        token: res,
      };
      return config;
    }).catch((res) => {
      console.log(res);
    });
  }, error => {
    Message.error({
      message: '加载超时'
    });
    return Promise.reject(error)
  });
// 返回状态判断
axios.interceptors.response.use((res) => {
  if (res.data.status !== 0 && res.data.status !== -2) {
    Vue.$vux.alert.show({
      title: '出错了',
      content: res.data.message
    });
    return Promise.reject(res);
  }
  return res;
}, (error) => {
  if (error.response) {
    if (error.response.status === 404) {
      Vue.$vux.alert.show({
        title: '请求出错',
        content: '404,请求资源不存在'
      });
    } else if (error.response.status === 401) {
     /* Vue.$vux.alert.show({
        title: '出错了',
        content: '账户过期，请重新登录！',
        onHide() {
          console.log('账户过期，请重新登录！');
        }
      });*/
     try {
       showTokenInvalidAlert();
     } catch (e) {
       Vue.$vux.alert.show({
         title: '出错了',
         content: '账户过期，请重新登录！',
         onHide() {
           console.log('账户过期，请重新登录！');
         }
       });
     }
    }
  }
  return Promise.reject(error.response);
});

export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios.post(url, params)
      .then(response => {
        resolve(response.data);
      }, err => {
        reject(err);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, {params})
      .then(response => {
        resolve(response.data);
      }, err => {
        reject(err);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

