<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" :body-padding-top="isShow?'46px':0">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="通缉件"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick" v-show="isShow">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>

      </x-header>

      <group label-width="4.2em" label-margin-right="1em" label-align="right" gutter="10px">

        <x-input type="text" title="运单号" placeholder="必填"
                 v-model="parameters.waybillNo"
                 :show-clear="false"
                 ref="waybillNo">
          <div slot="right">
            <!-- <x-icon type="ios-plus-outline" style="color:#09BB07" size="26" @click="addInput"></x-icon> -->
            <img class="code-img" style="display:inline-block" src="../../assets/img/saoyisao@2x.png"
                 v-on:click="getQRScanapp">
          </div>
        </x-input>
        <Datetime title="失效时间" placeholder="失效时间" v-model="parameters.expireTime" :start-date="nowTime"
                  value-text-align="left" format="YYYY-MM-DD HH:mm"></Datetime>
        <x-input title="联系电话" placeholder="必填" v-model="parameters.reportTel" @on-change="setPhone()"></x-input>

        <cell title="通缉类型" value-align="left">
          <checker v-model="parameters.compType" default-item-class="demo2-item"
                   selected-item-class="demo2-item-selected" type="radio" :radio-required="true">
            <checker-item :key="index" :value="item.key" v-for="(item, index) in compList">{{item.value}}
            </checker-item>
          </checker>
        </cell>


        <cell title="通缉范围" v-if="parameters.compType==='PART'" placeholder="必填" value-align="left" :is-link="true"
              v-model="parameters.sendOrgName"
              @click.native="popupShow = true"></cell>
        <x-textarea title="通缉描述" :show-counter="false" :rows="3"
                    v-model="parameters.describe" :max="1000"></x-textarea>
      </group>
      <check-icon :value.sync="needReport" type="plain">同时上报问题件</check-icon>
      <div style="padding:20px;">
        <x-button text="提交" type="primary" @click.native="submitConsult"></x-button>
      </div>

      <!--网点模糊匹配-->
      <div v-transfer-dom>
        <popup v-model="popupShow" position="right" width="100%">
          <view-box body-padding-bottom="0" body-padding-top="26px">
            <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="网点查询"
                      :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
            <group label-width="0em" label-margin-right="2em">
              <x-input title="" placeholder="输入网点名称或网点代码" text-align="center" v-model="searchText"
                       @on-change="getBranch"></x-input>
            </group>
            <group label-width="0em" label-margin-right="2em" title="已选组织">
              <cell-box @click.native="removeBranch(item)" v-for="(item, index) in parameters.scopes" :key="index">
                {{item.code}} {{item.name}}
              </cell-box>
            </group>
            <group label-width="0em" label-margin-right="2em" title="查询组织`">
              <cell-box @click.native="setBranch(item)" v-for="(item, index) in branchList" :key="index">
                {{item.code}} {{item.name}}
              </cell-box>
            </group>
          </view-box>
        </popup>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    Badge,
    Cell,
    CellBox,
    Checker,
    CheckerItem,
    Datetime,
    DatetimeRange,
    Flexbox,
    FlexboxItem,
    Group,
    Loading,
    Popup,
    Selector,
    Tab,
    TabItem,
    TransferDomDirective as TransferDom,
    ViewBox,
    XButton,
    XDialog,
    XHeader,
    XInput,
    XNumber,
    XTextarea,
    CheckIcon
  } from "vux";
  import {
    reportComp,
    issueTypeList,
    processInfomation,
    searchBranch,
    getUserInfo,
  } from "../../service/service";
  import {appUtil} from "../../common/commonUtils";
  import {FormatDate} from "../../common/dateFormat";
  import {constant} from "../../common/publicConstant";
  import {waybillNoLowToUp} from "../../common/publicMethods";
  import {NA} from "../../common/nativeAppUtil";

  export default {
    directives: {
      TransferDom
    },
    components: {
      Badge,
      XHeader,
      Group,
      Cell,
      XInput,
      ViewBox,
      Selector,
      Loading,
      XNumber,
      Checker,
      CheckerItem,
      XTextarea,
      XButton,
      CellBox,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime,
      Popup,
      Tab,
      TabItem,
      XDialog,
      CheckIcon
    },
    methods: {

      setBranch(item) {
        let codeStr = this.parameters.scopes.map(s => s.code).join(",");
        console.log(codeStr);
        let code = item.code;
        let name = item.name;
        if (codeStr.indexOf(code)===-1){
          this.parameters.scopes.push({
            code: code,
            name: name
          });
          let arr = this.parameters.scopes.map(s => s.name).join(",");
          this.parameters.sendOrgName = arr;
          console.log("选择网点的信息" + item.name);
        }

      },
      removeBranch(item) {
        this.parameters.scopes = this.parameters.scopes.filter(
          s => s.code !== item.code && s.name !== item.name
        );
        let arr = this.parameters.scopes.map(s => s.name).join(",");
        this.parameters.sendOrgName = arr;
      },
      async getBranch() {
        // 模糊匹配网点
        if (this.searchText === null || this.searchText === "") {
          return;
        }
        let vali = {stationName: this.searchText}; // 按网点名称查询
        var reg = /^(([0-9])|([1-9]([0-9]+)))$/;
        if (reg.test(this.searchText)) {
          vali = {stationCode: this.searchText}; // 若未纯数字则按网点code查询
        }
        let stationObj = await searchBranch(vali);
        this.branchList = stationObj.data.list;
      },
      reportWarnTimeOut(times) {
        // 封装弹框定时器
        let timerFlag = window.setTimeout(() => {
          this.$vux.alert.hide();
        }, times);
        return timerFlag;
      },
      reportWarnPart(title, content, timerFlag) {
        // 点击确定时删除指定定时器
        this.$vux.alert.show({
          title: title,
          content: content,
          onHide() {
            window.clearTimeout(timerFlag);
          }
        });
      },
      //弹出加载框
      showLoading() {
        this.$vux.loading.show({
          text: 'Loading'
        })
        /* setTimeout(() => {
           this.$vux.loading.hide()
         }, 1000)*/
      },

      async submitConsult() {
        let timerFlag = this.reportWarnTimeOut(3000);
        var reg = constant.waybillNoRegular();
        if (this.parameters.waybillNo === "") {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart("操作提示", "运单号不能为空", timerFlag);
          return;
        }
        if (
          this.parameters.waybillNo !== "" &&
          !reg.test(this.parameters.waybillNo)
        ) {
          this.reportWarnPart("操作提示", "运单号不正确，请重新填写", timerFlag);
          return;
        }
        // 运单号字母小写转大写
        this.parameters.waybillNo = waybillNoLowToUp(this.parameters.waybillNo);
        if (this.parameters.expireTime === "") {
          this.reportWarnPart("操作提示", "请选择失效时间", timerFlag);
          return;
        }
        if (this.parameters.compType === "") {
          this.reportWarnPart("操作提示", "请选择通缉类型", timerFlag);
          return;
        }

        if (this.parameters.reportTel === "") {
          this.reportWarnPart("操作提示", "请填写客户电话号码", timerFlag);

          return;
        } else if (
          !/^1(3|4|5|6|7|8)\d{9}$/.test(this.parameters.reportTel) &&
          !/^(\d{3,4}(-|\s))\d{7,8}((-|\s)\d{1,4})?$/.test(
            this.parameters.reportTel
          )
        ) {
          // 判断是否是手机号或者是座机号码
          this.reportWarnPart(
            "操作提示",
            "电话号码格式不正确，手机号或座机（格式：021-69773588）",
            timerFlag
          );
          return;
        }
        if (
          this.parameters.compType === "PART" &&
          this.parameters.scopes.length < 1
        ) {
          this.reportWarnPart(
            "操作提示",
            "当通缉类型为‘部分通缉’时，请选择‘通辑范围’",
            timerFlag
          );
          return;
        }
        if (this.parameters.describe === "") {
          this.reportWarnPart("操作提示", "通缉描述不能为空", timerFlag);
          return;
        }

        // 表单提交
        this.showLoading();

        let obj = {
          waybillNo: this.parameters.waybillNo, //运单号
          wantedType: this.parameters.compType, //通辑类型
          wantedScope: this.parameters.scopes, //通缉范围
          wantedDesc: this.parameters.describe, //通缉描述
          expireTime: this.parameters.expireTime + ":00", //失效时间
          claimTel: this.parameters.reportTel //上报电话
        };

        let s = JSON.stringify(obj);
/*
        console.log(s);
*/
        let res = reportComp(s);
        this.$vux.loading.hide();
        res.then(rm => {
          if (rm.status === 0) {
            this.reportWarnPart("操作提示", "通辑件上报成功", timerFlag);
            if (this.needReport) {
              this.$router.push({
                path: "/problem/problemPartsReport",
                query: {
                  bigType: "17",
                  smallType: "2",
                  waybillNo: this.parameters.waybillNo,
                  describe: this.parameters.describe
                }
              });
            }
            this.parameters = {
              waybillNo: "", // 运单号
              compType: "ALL", //通辑类型
              scopes: [], //通缉范围
              describe: "通缉/退回", //通缉描述
              reportTel: localStorage.getItem(this.userCode + 'reportTel'), //上报电话
              expireTime: this.expTimeMethod(new Date()), //失效时间
              sendOrgName: "" //页面显示的已选网点
            };
            this.nowTab = "consult";
            this.searchText = ""; // 查询网点条件
            this.showType = true;
            this.showPopup = false;
            this.popupShow = false; // 网点模糊匹配页面show字段
            this.defaultList = 0;
            this.isShow = true;
          } else {
            this.reportWarnPart("操作提示", rm.message, timerFlag);
          }

        })


      },

      backClick() {
        appUtil.back();
      },
      popRootBack() {
        appUtil.goToRoot();
      },

      pushVC() {
        this.showScrollBox = false;
        appUtil.pushVCName("SearchOddNumViewController", {
          oddNum: this.parameters.waybillNo
        });
      },

      getQRScanapp() {
        // appUtil.qrScan();
        NA.qrScan(code => {
          this.parameters.waybillNo = code;
        });
      },

      async getAppParams() {
        appUtil.getParameters().then(res => {
          let appParams = res;
          if (appParams.oddNum) {
            this.parameters.waybillNo = appParams.oddNum;
          }
        });
      },
      async getShowHead() {
        appUtil.showHead().then(res => {
          this.isShow = res;
        });
      },
      async setPhone() {
        if (
          /^1(3|4|5|6|7|8)\d{9}$/.test(this.parameters.reportTel) || /^(\d{3,4}(-|\s))\d{7,8}((-|\s)\d{1,4})?$/.test(this.parameters.reportTel)
        ) {
          localStorage.setItem(this.userCode + 'reportTel', this.parameters.reportTel);
        }
      },
      async loadUser() {
        let userInfo = await getUserInfo({});
        let userCode = userInfo.data.userCode;
/*
        console.log("初始化登陆用户是：" + userCode);
*/
        return userCode;

      },
      expTimeMethod(time){
        //设置时间失效时间
        let hour = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
        let minute = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
        return FormatDate(time, 7) + " " + hour + ":" + minute;
      }
    },
    data() {
      return {
        parameters: {
          waybillNo: "",
          sendOrgName: "",
          reportTel: localStorage.getItem(this.userCode + 'reportTel'),
          compType: "ALL", //选择的通缉类型
          bigProblemName: "请选择咨询大类",
          smallProblemId: "-1", // 小类ID
          scopes: [],
          describe: "" //通缉描述
        },
        compList: [
          {key: "ALL", value: "全网通缉"},
          {key: "PART", value: "部分通缉"},
          {key: "INTERNAL", value: "站内通缉"}
        ], // 通缉种类
        nowTime: "",//当前时间，用于设定失效时间最小值
        nowTab: "consult", // 当前业务页面>consult:咨询//expressSearch:快件查询
        searchText: "", // 查询网点条件
        showType: true,
        showPopup: false,
        popupShow: false, // 网点模糊匹配页面show字段
        branchList: [], // 网点列表
        listRouter: ["one", "two", "three"],
        defaultList: 0,
        isShow: true,
        isShowClose: false,
        showScrollBox: false,
        needReport: false, //同时上报问题件
        userCode: '',
        dialogCss: {
          width: "120px",
          margin: "0",
          // 'transform': 'translate(0, 0)',
          left: "auto",
          top: "47px",
          right: "3px",
          "padding-top": "5px",
          "background-color": "transparent",
          overflow: "hidden"
        }
      }
    },


    created() {
      this.getAppParams();
      if (this.parameters.waybillNo) {
        this.waybillNoChange();
      }
      window.goToBack = () => {
        this.backClick();
      };
      this.userCode = this.loadUser();
      //设置时间失效时间
      let time = new Date();
      this.nowTime = FormatDate(time);
      this.parameters.expireTime = this.expTimeMethod(time);
      console.log(this.nowTime);
      this.parameters.reportTel = localStorage.getItem(this.userCode + 'reportTel');
      this.parameters.describe = "通缉/退回";
    },


    activated() {
      window.goToBack = () => {
        this.backClick();
      };
    }
  };
</script>
<style scoped>
  .yto-box {
    padding-top: 20px;
    padding-left: 20px;
  }

  .popup {
    padding-bottom: 15px;
    height: 350px;
    overflow-y: scroll;
  }

  .demo1-item {
    padding: 5px 0 !important;
    border-radius: 3px;
    width: 100px;
    text-align: center;
    background-color: #efefef;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
  }

  .demo1-item-selected {
    background-color: #4080CA;
    color: #fff;
  }

  .demo2-item {
    padding: 3px 12px !important;
    border-radius: 3px;
    text-align: center;
    font-size: 0.8em;
    background-color: #efefef;
    border: 0 !important;
    margin: 0 3px !important;
  }

  .demo2-item-selected {
    background-color: #4080CA;
    color: #fff;
  }
</style>
