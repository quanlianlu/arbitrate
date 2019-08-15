<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" :body-padding-top="isShow?'46px':0">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="登记咨询"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick" v-show="isShow">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
      </x-header>
      <group label-width="4.5em" label-margin-right="2em" label-align="right" gutter="10px">

        <x-input title="客户姓名" placeholder="必填" v-model="parameters.customerName" ref="customerName"></x-input>

        <cell title="客户性别" value-align="left">
          <checker v-model="parameters.customerSex" default-item-class="demo2-item"
                   selected-item-class="demo2-item-selected" type="radio" :radio-required="true">
            <checker-item :key="index" :value="item.key" v-for="(item, index) in sexList">{{item.value}}
            </checker-item>
          </checker>
        </cell>
        <x-input title="客户电话" placeholder="必填" v-model="parameters.customerMobile"></x-input>
        <cell title="咨询大类" :value="parameters.bigProblemName" value-align="left"
              @click.native="showType = true;showPopup = (nowTab=='consult')" :is-link="nowTab=='consult'"></cell>

        <cell title="咨询小类" class="noline" :value="parameters.smallProblemName"
              value-align="left" @click.native="showType = false;showPopup = (nowTab=='consult')"
              :is-link="nowTab=='consult'"></cell>

        <x-textarea title="咨询内容" :show-counter="false" :rows="3"
                    v-model="parameters.remarkContent"></x-textarea>
      </group>
      <div style="padding:20px;">
        <x-button text="提交" type="primary" @click.native="submitConsult"></x-button>
      </div>
      <!--问题大小类弹出框-->
      <div v-transfer-dom>
        <popup v-model="showPopup">
          <div>
            <tab>
              <tab-item :selected="showType" @on-item-click="showType = true">大类</tab-item>
              <tab-item :selected="!showType" @on-item-click="showType = false">小类</tab-item>
            </tab>
          </div>
          <div class="popup">
            <group v-show="showType">
              <cell-box @click.native="selectBig(item)" v-for="(item, index) in bigProblemList" :key="index">
                {{item.problemName}}
              </cell-box>
            </group>
            <group v-show="!showType">
              <cell-box @click.native="selectSmall(item)" v-for="(item, index) in smallProblemList"
                        :key="index">
                {{item.problemName}}
              </cell-box>
            </group>
          </div>
        </popup>
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
    XTextarea
  } from 'vux';
  import {consultInsertApi, getBigproblemList, getSmallproblemList} from '../../service/service';
  import {appUtil} from '../../common/commonUtils';

  export default {
    directives: {
      TransferDom
    },
    components: {
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
      CellBox,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime,
      Popup,
      Tab,
      TabItem,
      XDialog
    },
    methods: {
      //小类
      async getSmallproblemList (){
        let params = {};
        if (this.parameters.bigProblemId != null){
          params.bigProblemId = this.parameters.bigProblemId;
          let stationObj = await getSmallproblemList(params);
          if (stationObj.status === 0 ){
            this.smallProblemList = stationObj.data.items;
          } else {
            let timerFlag = this.reportWarnTimeOut(3000);
            this.reportWarnPart('操作提示', '获取咨询小类异常', timerFlag);
            return;
          }
        } else{
        }
      },
      //大类
      async getBigproblemList (){
        let params = {};
        params.typeCode = '0';
        let stationObj = await getBigproblemList(params);
        console.log(JSON.stringify(stationObj));

        if (stationObj.status === 0 ){
          this.bigProblemList = stationObj.data.items;
        } else {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '获取咨询大类异常', timerFlag);
          return;
        }
      },
      reportWarnTimeOut(times) { // 封装弹框定时器
        let timerFlag = window.setTimeout(() => {
          this.$vux.alert.hide();
        }, times);
        return timerFlag;
      },
      reportWarnPart(title, content, timerFlag) { // 点击确定时删除指定定时器
        this.$vux.alert.show({
          title: title,
          content: content,
          onHide() {
            window.clearTimeout(timerFlag);
          }
        });
      },
      async submitConsult() { // 表单提交
        this.getShowHead();
        if (this.parameters.customerName === '') {
          this.$vux.alert.show({
            title: '操作提示',
            content: '请填写客户姓名'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        if (this.parameters.remarkContent === '') {
          this.$vux.alert.show({
            title: '操作提示',
            content: '请填写咨询内容'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        if (this.parameters.customerSex === '') {
          this.$vux.alert.show({
            title: '操作提示',
            content: '请选择性别'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        if (this.parameters.bigProblemId === '-1') {
          this.$vux.alert.show({
            title: '操作提示',
            content: '请选择咨询大类'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        if (this.parameters.bigProblemId !== '-1' && this.parameters.smallProblemId === '-1') {
          this.$vux.alert.show({
            title: '操作提示',
            content: '请选择咨询小类'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        if (this.parameters.customerMobile === '') {
          this.$vux.alert.show({
            title: '操作提示',
            content: '请填写客户电话号码'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        } else if (!(/^1(3|4|5|6|7|8)\d{9}$/.test(this.parameters.customerMobile)) && !(/^(\d{3,4}(-|\s))\d{7,8}((-|\s)\d{1,4})?$/.test(this.parameters.customerMobile))) {
          // 判断是否是手机号或者是座机号码
          this.$vux.alert.show({
            title: '操作提示',
            content: '电话号码格式不正确，手机号或座机（格式：021-69773588）'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        let res = await consultInsertApi(this.parameters);
        if (res.status === 0) {
          this.getShowHead();
          this.$vux.alert.show({
            title: '提示',
            content: '提交成功'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          this.parameters = {
            customerName: '',
            customerMobile: '',
            customerSex: '1',
            bigProblemId: '-1',
            bigProblemName: '请选择问题大类',
            smallProblemId: '-1',
            smallProblemName: '请选择问题小类',
            remarkContent: '咨询'
          };
          this.currentBigNode = {}; // 当前选择的大类节点
          this.searchText = ''; // 查询网点条件
          this.showType = true;
          this.showPopup = false;
          this.popupShow = false; // 网点模糊匹配页面show字段
          this.branchList = []; // 网点列表
          this.defaultList = 0;
          this.isShow = true;
        }
      },
      selectBig(item) {
        this.showType = false;
        this.currentBigNode = item;
        this.parameters.bigProblemId = item.id;
        this.parameters.bigProblemName = item.problemName;
        this.getSmallproblemList();
      },
      selectSmall(item) {
        this.parameters.smallProblemId = item.id;
        this.parameters.smallProblemName = item.problemName;
        this.showPopup = false;
      },
      backClick() {
        appUtil.back();
      },
      popRootBack() {
        appUtil.goToRoot();
      },
      pushVCShow() {
        this.showScrollBox = true;
      },
      pushVC() {
        this.showScrollBox = false;
        appUtil.pushVCName('SearchOddNumViewController', {oddNum: this.parameters.waybillNo});
      },
    async getShowHead(){
      appUtil.showHead().then((res) => {
        this.isShow = res;
      });
    },
    async orderMethods() {
      this.getShowHead();
      appUtil.showClose().then((res) => {
        this.isShowClose = res;
      });
    },
    },
    data() {
      return {
        parameters: {
          customerName: '',
          customerMobile: '',
          customerSex: '1',
          bigProblemId: '-1', // 大类ID
          bigProblemName: '请选择咨询大类',
          smallProblemId: '-1', // 小类ID
          smallProblemName: '请选择咨询小类',
          remarkContent: '咨询'
        },
        sexList: [
          {key: '1', value: '先生'},
          {key: '2', value: '女士'}
        ],
        nowTab: 'consult', // 当前业务页面>consult:咨询//expressSearch:快件查询
        issueTypeJson_0: [], // 咨询>问题大小类数据
        issueTypeJson_2: [], // 快件>问题大小类数据
        currentBigNode: {}, // 当前选择的大类节点
        searchText: '', // 查询网点条件
        showType: true,
        showPopup: false,
        popupShow: false, // 网点模糊匹配页面show字段
        branchList: [], // 网点列表
        listRouter: ['one', 'two', 'three'],
        defaultList: 0,
        isShow: true,
        isShowClose: false,
        showScrollBox: false,
        dialogCss: {
          'width': '120px',
          'margin':'0',
          // 'transform': 'translate(0, 0)',
          'left': 'auto',
          'top': '47px',
          'right': '3px',
          'padding-top': '5px',
          'background-color': 'transparent',
          'overflow':'hidden'
        },
        bigProblemList: [],
        smallProblemList: []
      };
    },
    created() {
      this.orderMethods();
      this.getBigproblemList();
      window.goToBack = () => {
        this.backClick();
      };

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
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
  }

  .demo1-item-selected {
    background-color: #4080CA;
    color: #fff;
  }

  .demo2-item {
    padding: 3px 15px !important;
    border-radius: 3px;
    text-align: center;
    font-size: 0.8em;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px !important;
  }

  .demo2-item-selected {
    background-color: #4080CA;
    color: #fff;
  }
</style>
