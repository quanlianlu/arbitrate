export const setupWebViewJavascriptBridge = (callback) => {
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
  var WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(function () {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
};
/**
 * 获取登录用户的key
 * @returns {*}
 */
export const getToken = () => {
  let token = null;
  if (process.env.NODE_ENV === 'development') {
    token = process.env.TOKEN;
    return Promise.resolve (token);
  }
  if (!token) {
    if (window && window.app) {
      token = window.app.getToken();
      return Promise.resolve (token);
    } else {
        return new Promise(function(resolve, reject) {
            //异步请求
          setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler('getToken', null, function (responseData) {
                resolve(responseData);
            });
          });
        });
    }
  }
};
export const getFileUrl = (fileId) => {
  return '/steward-api/attachment/getFile?picId=' + fileId;
};

export const appUtil = {
  getParameters: () => {
    let param = {};
    let paramStr = null;
    if (window && window.app) {
      try {
        paramStr = window.app.getParameters();
      } catch (e) {
        console.error('获取原生参数出错：' + JSON.stringify(e));
        return Promise.reject(JSON.stringify(e));
      }
      if (paramStr) {
        try {
          param = JSON.parse(paramStr);
        } catch (e) {
          console.error(JSON.stringify(e));
          return Promise.reject(JSON.stringify(e));
        }
      }
      return Promise.resolve(param);
    } else {
      return new Promise(function(resolve, reject) {
        try {
          setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler('getParameters', null, function (responseData) {
              if (responseData) {
                param = JSON.parse(responseData);
                resolve(param);
              }
            });
          });
        } catch (e) {
          reject(JSON.stringify(e));
          console.error(JSON.stringify(e));
        }
      });
    }
  },
  showHead: () => {
    let show = true;
    if (window && window.app) {
      let appShow = window.app.navigationBarHidden();
      if (appShow) {
        show = !appShow;
      }
      return Promise.resolve(show);
    } else {
      return new Promise(function(resolve, reject) {
        try {
          //异步请求
          setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler('navigationBarHidden', null, function (responseData) {
              let appShow = responseData;
              if (appShow) {
                show = !appShow;
                resolve(show);
              }
            });
          });
        } catch (e) {
          console.error('获取原生参数出错：' + JSON.stringify(e));
          reject(JSON.stringify(e));
        }
      });
    }
  },
  showClose: () => {
    let show = false;
    if (window && window.app) {
      let appClose = window.app.getShowClose();
      if (appClose && appClose === true) {
        show = true;
      }
      return Promise.resolve(show);
    } else {
      return new Promise(function(resolve, reject) {
        try {
          //异步请求
          setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler('getShowClose', null, function (responseData) {
              if (responseData) {
                resolve(responseData);
              }
            });
          });
        } catch (e) {
          console.error('获取原生参数出错：' + JSON.stringify(e));
          reject(JSON.stringify(e));
        }
      });
    }
  },
  pushVCName: (name, param) => {
    if (window && window.app) {
      window.app.pushVCName(name, JSON.stringify(param));
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('pushVCName', {'name': name, 'param': JSON.stringify(param)});
      });
    }
  },
  back: () => {
    if (window && window.app) {
      window.app.backClick();
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('backClick');
      });
    }
  },
  goToRoot: () => {
    if (window && window.app) {
      window.app.popRootClick();
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('popRootClick');
      });
    }
  },
  qrScan: () => {
    if (window && window.app) {
      window.app.QRScan();
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('QRScan');
      });
    }
  },
  choosePic: (size) => {
    if (window && window.app) {
      window.app.picture(size);
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('picture', {'size': size});
      });
    }
  },
  newChoosePic: (size, megabyte) => {
    if (window && window.app) {
      window.app.pictureImageKBytes(size, megabyte);
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('pictureImageKBytes', {'size': size, 'fImageKBytes' : megabyte});
      });
    }
  },
  goToTell: (phoneNum) => {
    if (window && window.app) {
      window.app.getPhoneNumber(phoneNum);
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('getPhoneNumber', {'phoneNum': phoneNum});
      });
    }
  },
  subscribe: (waybillNo) => {
    if (window && window.app) {
      window.app.addSubscribeClickWithWaybillNo(waybillNo);
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('addSubscribeClickWithWaybillNo', {'waybillNo': waybillNo});
      });
    }
  },
  showWaybillSidebarWithWaybillNo: (waybillNo) =>{
    if (window && window.app) {
      window.app.showWaybillSidebarWithWaybillNo(waybillNo);
    } else {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('showWaybillSidebarWithWaybillNo', {'waybillNo': waybillNo});
      });
    }
  }
};
export const showTokenInvalidAlert = () =>{
  if (window && window.app) {
    window.app.showTokenInvalidAlert();
  } else {
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler('showTokenInvalidAlert');
    });
  }
};
