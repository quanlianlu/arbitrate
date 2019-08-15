<template>
  <div style="height:100%;">
    <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="无着件上报"
              :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
    </x-header>
    <view-box ref="viewBox" body-padding-bottom="46px" body-padding-top="26px">
      <group label-width="4.5em" label-margin-right="2em" label-align="right">
        <popup-picker ref="pickType" title="物品类型" placeholder="请选择" :data="typeList" show-name :columns="1" v-model="parameters.type"
                      value-text-align="left"></popup-picker>
       <!-- <popup-picker title="物品规格" placeholder="请选择" :data="standardList" v-model="parameters.standard"
                      value-text-align="left"></popup-picker>-->
        <x-input title="物品重量" v-model="parameters.weight" keyboard="tel" placeholder="请输入重量"><span
          slot="right">KG</span></x-input>
        <x-input title="物品数量" v-model="parameters.number" keyboard="number" placeholder="请输入数量"></x-input>
        <x-input title="上报电话" v-model="parameters.telephone">
          <x-button class="config-btn" slot="right" @click.native="telConfShow=true" mini>配置</x-button>
        </x-input>
        <x-textarea title="物品描述" :max="200" v-model="parameters.description"
                    placeholder="请输入物品描述，尽量体现物品特征"></x-textarea>
      </group>
      <div class="upimg-box">
        <div class="img-box">
          <div v-for="(item,index) in getImage" :key="index" v-on:click="getImage.splice(index, 1)">
            <span><img :src="'data:image/jpeg;base64,'+item"/></span>
            <icon type="clear" class="clear"></icon>
          </div>
        </div>
        <div class="upimg-btn" v-on:click="toPicture" v-show="getImage.length < 5">+ 点击添加图片</div>
      </div>
      <div style="padding:18px 20px;">
        <x-button type="primary" @click.native="reportSubmit" :disabled="reportFlag">上报</x-button>
      </div>

      <div v-transfer-dom>
        <x-dialog v-model="telConfShow" class="custom-dialog">
          <p class="dialog-title">上报电话配置</p>
          <div class="dialog-content">
            <x-input placeholder="请输入电话" v-model="tel" :max="12" :show-clear="false" text-align="center"
                     placeholder-align="center"></x-input>
          </div>
          <div class="dialog-footer">
            <a class="btn gray" @click="telConfShow=false;">取消</a>
            <a class="btn blue" @click="telSub">保存</a>
          </div>
        </x-dialog>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    XDialog,
    PopupPicker,
    Cell,
    CellBox,
    Checker,
    CheckerItem,
    Datetime,
    DatetimeRange,
    Flexbox,
    FlexboxItem,
    Group,
    Icon,
    LoadMore,
    Popup,
    Radio,
    Selector,
    Sticky,
    Tab,
    Tabbar,
    TabbarItem,
    TabItem,
    TransferDomDirective as TransferDom,
    ViewBox,
    XButton,
    XHeader,
    XInput,
    XNumber,
    XTextarea
  } from 'vux';
  import {
    mobileConfig,
    headLessPackageReport,
    headLessPackageType
  } from '../../service/service';
  import {appUtil} from '../../common/commonUtils';

  export default {
    directives: {
      TransferDom
    },
    components: {
      XDialog,
      PopupPicker,
      XHeader,
      Group,
      Cell,
      XInput,
      ViewBox,
      Selector,
      XNumber,
      Checker,
      CheckerItem,
      XTextarea,
      XButton,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime,
      Popup,
      Tab,
      TabItem,
      CellBox,
      Icon,
      Sticky,
      LoadMore,
      Tabbar,
      TabbarItem,
      Radio
    },
    data() {
      return {
        id: '',
        tel: '',
        typeList: [], // 类型列表
        standardList: [['规格1', '规格2', '规格3', '规格4', '规格5', '规格6']], // 规格列表
        reportFlag: false, // 点击一次上报后按钮变成不可用，等提交结束后恢复可用
        telConfShow: false,
        getImage: [],
        telephoneSign: '',//是否已配置电话
        parameters: {
          type: [],
          standard: [],
          weight: '',
          number: 1,
          telephone: '',
          description: ''
        }
      };
    },
    created() {
      this.getType();// 获取物品类型列表
      this.configMobile({});// 当参数为空时查询当前上报电话
      window.getPicture = (code, size) => {
        this.getImage.push(code);
      };
      window.goToBack = () => {
        this.backClick();
      };
      appUtil.showClose().then((res) => {
        this.isShowClose = res;
      });
    },
    computed: {
    },
    methods: {
      // 获取物品类型
      async getType() {
        let type = await headLessPackageType();
        let list = type.data.items;
        list.forEach((item, i) => {
          this.typeList.push({
            name: item.name,
            value: item.id
          });
        }, this);
      },
      // 提交上报电话
      async telSub() {
        let params = {};
        if (this.telephoneSign === '') {
          params.isInsert = 1;
          params.callPhone = this.tel;
        } else {
          params.isUpdate = 1;
          params.callPhone = this.tel;
          params.id = this.id;
        }
        const backMessage = await mobileConfig(params);
        let timerFlag = this.reportWarnTimeOut(3000);
        if (backMessage.message === 'success') {
          this.reportWarnPart('操作提示', '配置电话成功！', timerFlag);
          this.telConfShow = false;
          this.parameters.telephone = this.tel;
        } else {
          this.reportWarnPart('操作提示', '配置电话失败！', timerFlag);
        }
      },
      // 配置电话
      async configMobile(params) {
        let mobileData = await mobileConfig(params);
        if(mobileData.data && mobileData.data.callPhone) {
          this.telephoneSign = mobileData.data.callPhone;
          this.tel = this.parameters.telephone = mobileData.data.callPhone;
          this.id = mobileData.data.id;
        }
      },
      // 提示定时器
      reportWarnTimeOut(times) {
        let timerFlag = window.setTimeout(() => {
          this.$vux.alert.hide();
        }, times);
        return timerFlag;
      },
      // 提示框
      reportWarnPart(title, content, timerFlag) {
        this.$vux.alert.show({
          title: title,
          content: content,
          onHide() {
            window.clearTimeout(timerFlag);
          }
        });
      },
      // 提交上报信息
      async reportSubmit() {
        var params = this.parameters;
        // 类型是否选择
        if (params.type.length === 0) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请选择物品类型！', timerFlag);
          return;
        }
        // 重量校验在0.01-100KG之间
        if (!/^(0\.[1-9]|0\.\d[1-9]|[1-9]\d?(\.\d{1,2})?|100)$/.test(params.weight)) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请输入0.01-100间数字！', timerFlag);
          return;
        }
        // 数量在1-100之间
        if (!/^(100|[1-9]\d|[1-9])$/.test(params.number)) {
          let timerFlag = this.reportWarnTimeOut(3000);;
          this.reportWarnPart('操作提示', '请输入1-100间整数！', timerFlag);
          return;
        }
        // 上报电话没有时需要配置
        if (params.telephone === '' || params.telephone.length < 11) {
          let timerFlag = this.reportWarnTimeOut(3000)
          this.reportWarnPart('操作提示', '请配置正确的上报电话！', timerFlag);
          return;
        }
        // 物品描述不能为空
        if (params.description === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请填写物品描述信息！', timerFlag);
          return;
        }
        // 物品描述不能使用特殊符号
        if (this.isEmojiCharacter(params.description) && params.description.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g) != null) { // 过滤emoji表情
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请不要使用特殊符号', timerFlag);
          return;
        }
        // 图片至少需要添加一张
        if (this.getImage.length === 0) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '至少添加一张图片！', timerFlag);
          return;
        } else {
          // 图片不能大于2M
          // function checkImageSize(val, i) {
          //   var equalIndex = val.indexOf('=');
          //   if(val.indexOf('=') > 0) {
          //     val = val.substring(0, equalIndex);
          //   }
          //   var strLength = val.length;
          //   var fileLength = parseInt(strLength-(strLength/8)*2);// 图片的字节数
          //   return fileLength <= 1024 * 1024 * 2;
          // }
          // if(!this.getImage.every(checkImageSize)) {
          //   let timerFlag = this.reportWarnTimeOut(3000);
          //   this.reportWarnPart('操作提示', '每张图片大小不能超过2M！', timerFlag);
          //   return;
          // }
        }
        // 上报得参数
        let sendParams = {
          pics: this.getImage, // 图片列表
          itemCharacter: this.parameters.description, // 物品描述
          qty: this.parameters.number, // 物品数量
          reportTelephone: this.parameters.telephone, // 上报人电话
          weight: this.parameters.weight, // 物品重量
          typeName: this.$refs.pickType.getNameValues(), // 物品类型名称
          typeId: this.parameters.type[0] // 物品类型Id
        };
        this.reportFlag = true;
        // 调用上报接口
        let backMessage = await headLessPackageReport(sendParams);
        let timerFlag = this.reportWarnTimeOut(3000);
        this.reportFlag = false;
        // 成功或是失败的弹出提示
        if (backMessage.message === 'success') {
          this.getImage = [];
          this.parameters.weight = '';
          this.parameters.type = [];
          // this.parameters.telephone = '';
          this.parameters.description = '';
          this.parameters.number = '';
          this.reportWarnPart('操作提示', '上报成功！', timerFlag);
        } else {
          this.reportWarnPart('操作提示', '上报失败，请稍后再试！', timerFlag);
        }
      },
      // 返回
      backClick() {
        appUtil.back();
      },
      // 添加图片
      toPicture() {
        // 图片控制在最多5张
        let num = 5 - this.getImage.length;
        appUtil.newChoosePic(num, 2048);
      },
      // 是否为emoji图标
      isEmojiCharacter(substring) {
        for (let i = 0; i < substring.length; i++) {
          let hs = substring.charCodeAt(i);
          if (hs >= 0xd800 && hs <= 0xdbff) {
            if (substring.length > 1) {
              let ls = substring.charCodeAt(i + 1);
              let uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
              if (uc >= 0x1d000 && uc <= 0x1f77f) {
                return true;
              }
            }
          } else if (substring.length > 1) {
            let ls = substring.charCodeAt(i + 1);
            if (ls == 0x20e3) {
              return true;
            }
          } else {
            if (hs >= 0x2100 && hs <= 0x27ff) {
              return true;
            } else if (hs >= 0x2B05 && hs <= 0x2b07) {
              return true;
            } else if (hs >= 0x2934 && hs <= 0x2935) {
              return true;
            } else if (hs >= 0x3297 && hs <= 0x3299) {
              return true;
            } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
              || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
              || hs == 0x2b50) {
              return true;
            }
          }
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .weui-cell.noline:before {
    left: 7.5em;
  }

  .popup {
    padding-bottom: 15px;
    height: 350px;
    overflow-y: scroll;
  }

  .upimg-box {
    padding-top: 10px;
    .upimg-btn {
      background-color: #fff;
      text-align: center;
      color: #666;
      padding: 20px 0;
      margin: 0 10px;
    }
  }

  .demo1-item {
    padding: 5px 0 !important;
    border-radius: 3px;
    font-size: 0.8em;
    text-align: center;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
  }

  .img-box {
    overflow: hidden;
    div {
      width: 33%;
      float: left;
      position: relative;
      overflow: hidden;
      span {
        display: block;
        height: 50px;
        border: 1px solid #ccc;
        overflow: hidden;
        margin: 10px;
      }
      .clear {
        position: absolute;
        right: 0;
        top: 3px;
        color: #ff0000;
        font-size: 20px;
      }
      img {
        width: 100%;
      }
    }
  }

  .demo1-item-selected {
    background-color: #4080CA;
    color: #fff;
  }

  .vux-tap-active.demo1-item-selected:active {
    background-color: #4080CA;
  }

  .yto-p {
    padding: 0 12px;
    .vux-checker-box {
      display: flex;
      flex-wrap: wrap;
    }
    .vux-checker-item {
      flex: 1;
      min-width: 20% !important;
    }
  }

  .yto-foot {
    position: absolute;
    bottom: 0;
    background-color: #e2e2e2;
    right: 0;
    left: 0;
  }

  .yto-btn-default {
    border-radius: 0 !important;
    color: #fff !important;
    border-color: #ccc !important;
    background-color: #ccc !important;
    &:not(.weui-btn_disabled):active {
      background-color: #bbb !important;
    }
    &:after {
      border: 0 !important;
    }
  }

  .unLock {
    background: url("../../assets/img/unlock.png") 0 0 no-repeat;
    width: 22px;
    height: 22px;
  }

  .lock {
    background: url("../../assets/img/lock.png") 0 0 no-repeat;
  }

  .yto-btn-primary {
    border-radius: 0 !important;
    border-color: #4080CA !important;
    background-color: #4080CA !important;
    &:not(.weui-btn_disabled):active {
      background-color: #00aeef !important;
    }
    &:after {
      border: 0 !important;
    }
  }

  /*.weui-cell:before {*/
    /*border-color: #fff;*/
  /*}*/

  .weui-tabbar__item.weui-bar__item_on .tabar-a {
    color: #00AEEF;
  }

  .config-btn {
    background-color: #aaa;
    border: none;
    border-radius: unset;
    &:after {
      border: none;
      border-radius: unset;
    }
  }

  .custom-dialog {
    .dialog-title {
      line-height: 44px;
      font-size: 16px;
      background-color: #4080CA;
      color: #fff;
    }
    .dialog-content {
      padding: 20px 30px;
      .vux-x-input {
        border-bottom: 1px solid black;
      }
    }
    .dialog-footer {
      display: flex;
      .btn {
        flex: 1;
        line-height: 44px;
        font-size: 16px;
        &:active {
          color: rgba(255, 255, 255, 0.6);
        }
        &.blue {
          color: #fff;
          background-color: #4080CA;
        }
        &.gray {
          color: #fff;
          background-color: #aaa;
        }
      }
    }
  }
</style>
