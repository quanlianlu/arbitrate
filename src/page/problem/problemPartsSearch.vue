<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="26px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                v-if="parameters.type == 'query'" title="问题件查询"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="parameters.type == 'query' && isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
        <a slot="right" @click="subscribe" v-if="isSelect === false">
          <img src="../../assets/img/ding.png">
        </a>
      </x-header>
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                v-if="parameters.type == 'deal'" title="问题件处理"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="parameters.type == 'deal' && isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
        <a slot="right" @click="subscribe" v-if="isSelect === false">
          <img src="../../assets/img/ding.png">
        </a>
      </x-header>

      <div v-if="isSelect === true">
        <group label-width="4.5em" label-margin-right="2em" label-align="right">
          <Datetime title="查询时间" placeholder="开始时间" v-model="parameters.beginTime" start-date="2017-01-01"
                    :end-date="endDate" value-text-align="left" format="YYYY-MM-DD" year-row="{value}年"
                    month-row="{value}月" day-row="{value}日" @on-change="changeDate('start')"></Datetime>
          <!--format="YYYY-MM-DD HH:mm" hour-row="{value}点" minute-row="{value}分"-->
          <Datetime title="" placeholder="结束时间" v-model="parameters.endTime"
                    :start-date="parameters.beginTime.substring(0, 10)" :end-date="endDate" value-text-align="left"
                    format="YYYY-MM-DD" year-row="{value}年" month-row="{value}月" day-row="{value}日"
                    @on-change="changeDate('end')"></Datetime>
          <!--format="YYYY-MM-DD HH:mm" hour-row="{value}点" minute-row="{value}分"-->
          <cell title=""></cell>
          <p class="yto-p" style="padding-top:10px">
            <checker v-model="parameters.status" @on-change="" default-item-class="demo1-item"
                     selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
              <checker-item :value="item.id" v-for="(item, index) in serviceList" :key="index">{{item.name}}
              </checker-item>
            </checker>
          </p>
        </group>
        <group title="" label-width="4.5em" label-margin-right="2em" label-align="right"
               v-show="parameters.type == 'query'">
          <cell title="发布网点" :value="stationName" value-align="left"></cell>
          <!--@click.native="popupShow = true" is-link-->
          <!--<x-textarea title="问题描述" placeholder="请填写详细信息" :show-counter="false" :rows="3"></x-textarea>-->
        </group>
      </div>
      <div v-if="isSelect === false">
        <group label-width="4.5em" label-margin-right="2em" label-align="right">
          <x-input type="text" title="运单号" placeholder="必填" v-model="parameters.waybillNo" :show-clear="false">
            <img slot="right" v-on:click="getQRScan" class="code-img" src="../../assets/img/saoyisao@2x.png">
          </x-input>
        </group>
      </div>
      <div style="padding:40px 20px;">
        <x-button type="primary" @click.native="searchSubmit">查询</x-button>
      </div>
    </view-box>
    <tabbar>
      <tabbar-item :selected="isSelect" @on-item-click="isSelect = true">
        <img slot="icon" src="../../assets/img/zuhe_nor@2x.png">
        <img slot="icon-active" src="../../assets/img/zuhe@2x.png">
        <span slot="label" class="tabar-a">组合查询</span>
      </tabbar-item>
      <tabbar-item :selected="!isSelect" @on-item-click="isSelect = false">
        <img slot="icon" class="tabbar-img" src="../../assets/img/danhao_nor@2x.png">
        <img slot="icon-active" src="../../assets/img/danhao@2x.png">
        <span slot="label" class="tabar-a">单号查询</span>
      </tabbar-item>
    </tabbar>
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
    Tabbar,
    TabbarItem,
    TransferDomDirective as TransferDom,
    ViewBox,
    XButton,
    XHeader,
    XInput,
    XNumber,
    XTextarea
  } from 'vux';
  import {getUserInfo, problempiece, problempieceByWaybillNo, searchBranch} from '../../service/service';
  import moment from 'moment';
  import {appUtil} from '../../common/commonUtils';
  import {mapActions} from 'vuex';
  import {waybillNoLowToUp} from '../../common/publicMethods';
  import {NA} from '../../common/nativeAppUtil';

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
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Datetime,
      Tabbar,
      TabbarItem,
      Popup,
      CellBox
    },
    data() {
      return {
        serviceList: [
          {id: 'PD10', name: '未处理'},
          {id: 'PD20', name: '处理中'},
          {id: 'PD30', name: '处理完成'},
          {id: 'PD40', name: '已撤销'}
        ],
        endDate: '',
        isSelect: true,
        popupShow: false,
        parameters: {
          isWay: false,
          beginTime: '',
          endTime: '',
          type: 'query', // query:问题件查询/deal:问题件处理(默认为查询)
          status: 'PD10', // 默认"未处理"
          waybillNo: '', // 1111
          pageIndex: 0,
          pageSize: 20,
          stationCode: '' // 当前人网点code
        },
        searchText: '',
        branchList: null,
        stationName: '',
        isShowClose: false
      };
    },
    created() {
     /* this.isShowClose = appUtil.showClose();*/
      appUtil.showClose().then((res) => {
        this.isShowClose = res;
      });
      let nowTime = moment(new Date());
      let modifyTime = moment(new Date());
      this.endDate = nowTime.format('YYYY-MM-DD');
      this.parameters.endTime = nowTime.format('YYYY-MM-DD');
      modifyTime.add(-3, 'd');
      this.parameters.beginTime = modifyTime.format('YYYY-MM-DD');
      this.parameters.type = this.$route.params.type;
      this.parameters.waybillNo = this.$route.query['waybillNo'];
      this.getUser();
      if (this.parameters.waybillNo) {
        this.isSelect = false;
      /*  this.searchSubmit();*/
      }
      // 废弃，保留为了兼容老版本
      // window.getQRScan = (code) => {
      //   this.parameters.waybillNo = code;
      // };
      window.goToBack = () => {
        this.backClick();
      };
    },
    activated() {
      this.isShowClose = appUtil.showClose();
      window.goToBack = () => {
        this.backClick();
      };
    },
    methods: {
      // 日期选择
      ...mapActions('problem', [
        'setSearchParmas'
      ]),
      changeDate(type) {
        let date1 = moment(this.parameters.beginTime);
        let date2 = moment(this.parameters.endTime);
        let dif = date2 - date1;
        if (type === 'start') {
          if (dif < 0) {
            this.parameters.endTime = this.parameters.beginTime;
          } else if ((dif / 86400000) > 3) {
            date1.add(3, 'd');
            this.parameters.endTime = date1.format('YYYY-MM-DD');
          }
        } else if (type === 'end') {
          if (dif < 0) {
            this.parameters.beginTime = this.parameters.endTime;
          } else if ((dif / 86400000) > 3) {
            date2.add(-3, 'd');
            this.parameters.beginTime = date2.format('YYYY-MM-DD');
          }
        }
      },
      async searchSubmit() {
        let beginTime = moment(this.parameters.beginTime);
        let endTime = moment(this.parameters.endTime);

        this.parameters.isWay = false;
        if (this.isSelect === true) { // 条件查询
          this.parameters.waybillNo = '';
          if (beginTime.format('MM') !== endTime.format('MM')) {
            this.$vux.alert.show({
              title: '注意',
              content: '暂不支持跨月份查询'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 3000);
            return;
          }
          // 校验是否有数据
          let getList = await problempiece(this.parameters);
          if (typeof (getList.data) === 'undefined' || typeof (getList.data.items) === 'undefined' || getList.data.items.length <= 0) {
            this.$vux.alert.show({
              title: '对不起',
              content: '无查询结果'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 1000);
            return;
          }
        } else { // 运单号查询
          this.parameters.isWay = true;
          if (!this.parameters.waybillNo || this.parameters.waybillNo === '') {
            this.$vux.alert.show({
              title: '注意',
              content: '请填写运单号'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 3000);
            return;
          }
          // 运单号字母小写转大写
          this.parameters.waybillNo = waybillNoLowToUp(this.parameters.waybillNo);
          // 校验是否有数据
          let getList = await problempieceByWaybillNo({waybillNo: this.parameters.waybillNo});
          if (typeof (getList.data) === 'undefined' || typeof (getList.data.list) === 'undefined' || getList.data.list.length <= 0) {
            this.$vux.alert.show({
              title: '对不起',
              content: '无查询结果'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 1000);
            return;
          }
        }
        this.setSearchParmas(this.parameters);
        this.$router.push({name: '问题件列表', params: this.parameters});
      },
      backClick() { // 返回上一页
        appUtil.back();
      },
      setBranch() {
        this.parameters.type = '';
        this.popupShow = false;
      },
      async getBranch() {
        if (this.searchText == null || this.searchText == null) {
          return;
        }
        let vali = {stationName: this.searchText};
        var reg = /^(([0-9])|([1-9]([0-9]+)))$/;
        if (reg.test(this.searchText)) {
          vali = {stationCode: this.searchText};
        }
        this.branchList = await searchBranch(vali);
      },
      async getUser() {
        let obj = await getUserInfo({});
        this.stationName = obj.data.stationName;
        this.parameters.stationCode = obj.data.stationCode;
      },
      getQRScan() {
        // appUtil.qrScan();
        NA.qrScan((code) => {
          this.parameters.waybillNo = code;
        });
      },
      subscribe() {
        appUtil.subscribe(this.parameters.waybillNo)
      }
    },
    popRootBack() { // 关闭页面
      appUtil.goToRoot();
    }
  };
</script>

<style lang="less" scoped>
  .weui-cell.noline:before {
    left: 7.5em;
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
    color: #4080CA;
  }

</style>
