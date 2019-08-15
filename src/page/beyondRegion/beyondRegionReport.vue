<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="46px" body-padding-top="26px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="超区件上报"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
        <a slot="right" @click="subscribe">
          <img src="../../assets/img/ding.png">
        </a>
      </x-header>
      <group label-width="4.5em" label-margin-right="2em" label-align="right">
        <x-input title="运单号:" placeholder="必填" :show-clear="false" v-model="parameters.waybillNo"
                 @on-blur="getOverrangeWaybillSearch" type="text">
          <img slot="right" class="code-img" src="../../assets/img/saoyisao@2x.png" v-on:click="getQRScanapp">
        </x-input>
        <div v-if="flag">
          <cell title="重量">{{parameters.destWeight}}KG</cell>
          <cell title="金额">{{parameters.destAmt}}元</cell>
        </div>
        <cell title="转件方式:" value-align="left">
          <div class="yto-div">
            <checker v-model="parameters.venderCode" default-item-class="demo1-item yto-item"
                     selected-item-class="demo1-item-selected" type="radio" :radio-required="true"  @on-change="overrangePoint">
              <checker-item v-for="(item, index) in handleStateList" :key="index" :value="item.id">
                {{item.name}}
              </checker-item>
            </checker>
          </div>
        </cell>
        <popup-picker title="超区点:" placeholder="请选择" :data="pointOptionList" v-model="parameters.pointOptions"
                      value-text-align="right" @click.native = "findOverrangePoint" @on-hide="overPiontHide" :disabled="overPonintStatus"></popup-picker>
        <x-address @on-hide="logHide" @on-show="logShow" title="所属区域:" v-model="addressList" :list="addressData" @on-shadow-change="onShadowChange" placeholder="请选择"  :show.sync="showAddress"></x-address>
        <x-textarea title="详细地址:" placeholder="请输入详细地址" :show-clear="false" v-model="parameters.receiverAddr"  type="text" :max="200">
        </x-textarea>
        <x-textarea title="超区描述:" :max="1000" v-model="parameters.destContent"
                    placeholder="请输入超区描述"></x-textarea>
      </group>
      <div style="padding:18px 20px;">
        <x-button type="primary" @click.native="reportSubmit" :disabled="reportFlag">确认上报</x-button>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
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
    XTextarea,
    XAddress,
    ChinaAddressV4Data,
    Value2nameFilter as value2name,
    PopupPicker,
    Picker
  } from "vux";
  import {
    getDistrict,
    getOverrangeWaybillSearch,
    findOverrangePoint,
    saveExpuzInfo,
    searchUnpointAmtAndDesc
  } from "../../service/service";
  import { appUtil } from "../../common/commonUtils";
  import { constant } from "../../common/publicConstant";
  import { waybillNoLowToUp } from "../../common/publicMethods";
  import { NA } from "../../common/nativeAppUtil";
  import { log } from "util";
  import { arch } from "os";
  export default {
    directives: {
      TransferDom
    },
    components: {
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
      ViewBox,
      XButton,
      XHeader,
      XInput,
      XNumber,
      XTextarea,
      XAddress,
      ChinaAddressV4Data,
      PopupPicker,
      Picker
    },
    data() {
      return {
        title: "所属区域:",
        addressList: [],
        addressData: [],
        expuzInfo: [],
        pointOptionList: [],
        showAddress: false,
        isShowClose: false,
        overPonintStatus: false,
        count : 1,
        parameters: {
          waybillNo: "",
          destAmt: "0",
          destWeight: "0",
          receiverAddr: "",
          receiverCityCode: "",
          receiverProvCode: "",
          receiverCityName: "",
          receiverProName: "",
          receiverTownName: "",
          receiverTownCode: "",
          pointOptions: [],
          venderCode: "IC000022",
          destContent: '',
          uzPoint: '',
          uzPointId:''
        },
        reportFlag: false, // 上报标识，点击上报后按钮变灰
        handleStateList: [
          { id: "IC000022", name: "有偿派送" },
          { id: "IC000021", name: "EMS" }
        ],
        flag:false //是否显示重量及金额
      };
    },
    created() {
      this.getDistrcict();
      window.goToBack = () => {
        this.backClick();
      };
    },
    methods: {
      doShowAddress() {
        this.showAddress = true;
        setTimeout(() => {
          this.showAddress = false;
        }, 2000);
      },
      onShadowChange(ids, names) {
        if(this.count == 1){
          /*this.addressList = ids;*/
          this.count++;
        }
        this.parameters.receiverProvName = names[0];
        this.parameters.receiverCityName = names[1];
        this.parameters.receiverTownName= names[2];
        this.parameters.receiverProvCode = ids[0];
        this.parameters.receiverCityCode = ids[1];
        this.parameters.receiverTownCode = ids[2];
      },
      getName(value) {
        return value2name(value, ChinaAddressV4Data);
      },
      async overPiontHide(status) {
        if (status) {
          let val = this.parameters.pointOptions;
          let key = "";
          let array = this.pointOptionList[0];
          if (JSON.stringify(array) !== '[]'){
            for (let i = 0; i < array.length; i++) {
              if (array[i].name == val) {
                key = array[i].key;
                this.parameters.uzPoint = array[i].name;
                break;
              }
            }
          }
          let params = {};
          this.parameters.destContent = '';
          this.parameters.destAmt = 0;
          params.destWeight = this.parameters.destWeight;
          params.uzPointId = key;
          params.cityCode = this.parameters.receiverCityCode;
          params.provCode = this.parameters.receiverProvCode;
          params.townCode = this.parameters.receiverTownCode;
          params.venderCode = this.parameters.venderCode;
          //  this.destAmt
          const data = await searchUnpointAmtAndDesc(params);
          this.parameters.destAmt = data.data.destAmt;
          this.parameters.destContent = data.data.standardSpeech;
          this.parameters.uzPointId = key;
        }
      },
      logHide(status) {
        if (status) {
          this.findOverrangePoint();
        }
      },
      logShow(str) {
        console.log("on-show");
      },
      backClick() {
        appUtil.back();
      },
      popRootBack() {
        appUtil.goToRoot();
      },
      subscribe() {
        appUtil.subscribe(this.parameters.waybillNo);
      },
      getQRScanapp() {
        // appUtil.qrScan();
        NA.qrScan(code => {
          // 若是批量上报，则支持扫面运单号自动上报
          this.parameters.waybillNo = code;
          // 因为查询接收组织和问题件上报是异步请求，所以两个方法不能写一起，只能通过标识判断
          if (!this.isSingle) {
            this.batchReport = true;
          } else {
            this.batchReport = false;
          }
          this.getOverrangeWaybillSearch();
        });
      },
      getDistrcict() {
        if (
          localStorage.addressData != undefined &&
          localStorage.addressData != "undefined" &&
          localStorage.addressData.length > 100
        ) {
          let data = JSON.parse(localStorage.addressData);
          let nowTime = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
          if (data.updateTime < nowTime) {
            this.dnyGetDistrict();
          } else {
            this.addressData = data.data;
          }
        } else {
          this.dnyGetDistrict();
        }
      },
      async dnyGetDistrict() {
        let params = {};
        params.parentId = "1086";
        const districtList = await getDistrict(params);
        for (let i = 0; i < districtList.data.length; i++) {
          if (districtList.data[i].parent === "086")
            delete districtList.data[i].parent;
        }
        //澳门特殊处理
        districtList.data.push({name: "",parent: "00853",value:null});
        this.addressData = districtList.data;
        let data = {};
        data.data = this.addressData;
        data.updateTime = new Date().getTime();
        localStorage.setItem("addressData", JSON.stringify(data));
      },
      /**
       * 根据运单号自动带出省、市、区县、详细地址、重量
       * @returns {Promise<void>}
       */
      async getOverrangeWaybillSearch() {
        if (this.parameters.waybillNo !== '') {
          //  获取订单信息
          let params = {};
          this.addressList = [];
          this.parameters.pointOptions = [];
          this.parameters.receiverAddr = "";
          this.parameters.destAmt = "0";
          this.parameters.destContent = "";
          this.parameters.destWeight = "0";
          params.waybillNo = this.parameters.waybillNo;
          params.venderCode = this.parameters.venderCode;
          let expuzInfo = await getOverrangeWaybillSearch(params);
          this.expuzInfo = expuzInfo.data;
          if (this.expuzInfo.address !== ''){
            this.parameters.receiverAddr = this.expuzInfo.address;
          }
          if (this.expuzInfo.destAmt !== ''){
            this.parameters.destAmt = this.expuzInfo.destAmt;
          }
          if (this.expuzInfo.destWeight !== ''){
            this.parameters.destWeight = this.expuzInfo.destWeight;
          }
          if (this.expuzInfo.provName !== ''){
            this.parameters.receiverProName = this.expuzInfo.provName;
          }
          if (this.expuzInfo.cityName !== ''){
            this.parameters.receiverCityName = this.expuzInfo.cityName;
          }
          if (this.expuzInfo.townName !== ''){
            this.parameters.receiverTownName = this.expuzInfo.townName;
          }
          if ( this.expuzInfo.provCode !== '') {
            this.parameters.receiverProvCode = this.expuzInfo.provCode;
          }
          if (this.expuzInfo.cityCode !== ''){
            this.parameters.receiverCityCode = this.expuzInfo.cityCode;
          }
          if (this.expuzInfo.townCode !== ''){
            this.parameters.receiverTownCode = this.expuzInfo.townCode;
          }
          let array =  this.expuzInfo.pointOptions;
          if (array.length !== 0) {
            //增加name属性，供展示使用
            for (let i = 0; i < array.length; i++) {
              array[i].name = array[i].value;
            }
            this.pointOptionList = [array];
          } else {
            this.pointOptionList = [];
          }
          this.addressList.push(
            this.parameters.receiverProvCode,
            this.parameters.receiverCityCode,
            this.parameters.receiverTownCode
          );
          if (this.expuzInfo.uzPointId !== ''){
            this.parameters.uzPointId = this.expuzInfo.uzPointId;
          }
          if (this.expuzInfo.uzPoint !== ''){
            this.parameters.uzPoint = this.expuzInfo.uzPoint;
            this.parameters.pointOptions.push(this.expuzInfo.uzPoint);
          }
          /*  //获取超区点信息
            this.findOverrangePoint();*/
          this.parameters.destContent = this.expuzInfo.standardSpeech;
          this.flag = true;
        }
      },
      /**
       * 获取超区点下拉列.
       * @returns {Promise<void>}
       */
      async findOverrangePoint() {
        let params = {};
        this.parameters.destContent = '';
        this.parameters.destAmt = '0';
        this.parameters.uzPoint = '';
        this.parameters.uzPointId = '';
        this.parameters.pointOptions = [];
        params.venderCode = this.parameters.venderCode;
        params.townCode = this.parameters.receiverTownCode;
        let overrangePoint = await findOverrangePoint(params);
        let array = overrangePoint.data.pointOptions;
        if (JSON.stringify(array) !== '[]'){
          //增加name属性，供展示使用
          for (let i = 0; i < array.length; i++) {
            array[i].name = array[i].value;
          }
          this.pointOptionList = [array];
        } else {
          this.pointOptionList = [];
          this.parameters.pointOptions = [];
        }
      },
      /**
       * 转换方式变化获取超区点下拉列.
       * @returns {Promise<void>}
       */
      async overrangePoint() {
        let params = {};
        this.parameters.destContent = '';
        this.parameters.destAmt = '0';
        this.pointOptionList = [];
        this.parameters.pointOptions = [];
        params.venderCode = this.parameters.venderCode;
        params.townCode = this.parameters.receiverTownCode;
        let overrangePoint = await findOverrangePoint(params);
        let array = overrangePoint.data.pointOptions;
        if (JSON.stringify(array) !== '[]'){
          //增加name属性，供展示使用
          for (let i = 0; i < array.length; i++) {
            array[i].name = array[i].value;
          }
          this.pointOptionList = [array];
        }
      },
      // 超区件上报错误提示定时器
      expuzWarnTimeOut(times) {
        let timerFlag = window.setTimeout(() => {
          this.$vux.alert.hide();
        }, times);
        return timerFlag;
      },
      // 超区件上报提示框
      expuzWarnPart(title, content, timerFlag) {
        this.$vux.alert.show({
          title: title,
          content: content,
          onHide() {
            window.clearTimeout(timerFlag);
          }
        });
      },
      /**
       * 超区件上报
       * @returns {Promise<void>}
       */
      async reportSubmit() {
        var params = this.parameters;
        /** 上报超区件判断校验运单号 */
        /** 上报超区件判断运单号是否为空 */
        if (this.parameters.waybillNo === "") {
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", "请填写运单号", timerFlag);
          return;
        }
        // 运单号字母小写转大写
        this.parameters.waybillNo = waybillNoLowToUp(this.parameters.waybillNo);
        /** ^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$|^[6-9][0-9]{17}$|^[DD]{2}[8-9][0-9]{15}$|^[Y][0-9]{12}$ */
        /** 正则表达式判断运单号 */
        var reg = constant.waybillNoRegular();
        if (!reg.test(this.parameters.waybillNo)) {
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", "运单号不正确，请重新填写", timerFlag);
          return;
        }
        if (this.parameters.pointOptions.length === 0){
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", "请选择超区点", timerFlag);
          return;
        }
        if (this.parameters.receiverAddr === ''){
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", "请填写详细地址", timerFlag);
          return;
        }
        if (this.parameters.destContent === ''){
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", "请填写超区件描述", timerFlag);
          return;
        }
        let result = await saveExpuzInfo(JSON.stringify(this.parameters));
        this.reportFlag = false;
        if (result.data.bdResponse.status === 0) {
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", "上报成功", timerFlag);
          this.parameters.waybillNo = '';
          this.parameters.destAmt = '0';
          this.parameters.destWeight = '0';
          this.parameters.receiverAddr = '';
          this.parameters.receiverCityCode = '';
          this.parameters.receiverProvCode = '';
          this.parameters.receiverCityName = '';
          this.parameters.receiverProName = '';
          this.parameters.receiverTownName = '';
          this.parameters.receiverTownCode = '';
          this.parameters.pointOptions = '';
          this.parameters.destContent = '';
          this.parameters.uzPoint = '';
          this.parameters.uzPointId = '';
          this.addressList = [];
          this.flag = false;
        } else {
          let timerFlag = this.expuzWarnTimeOut(3000);
          this.expuzWarnPart("操作提示", result.data.bdResponse.message ,timerFlag);
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
    background-color: #efefef;
    border: 0 !important;
    // margin: 0 3px 8px 3px !important;
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

  .yto-div {
    padding: 0;
    margin: 0;
    .vux-checker-box {
      display: flex;
      align-items: center;
      // flex-wrap: wrap;
    }
    .vux-checker-item {
      // flex: 1;
      margin-right: 10%;
      min-width: 30%;
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
  .weui-tabbar__item.weui-bar__item_on .tabar-a {
    color: #00aeef;
  }

  .pushxz {
    width: 10em;
    margin-right: 2em;
    text-align: right;
    margin-top: 5px;
  }
</style>>
