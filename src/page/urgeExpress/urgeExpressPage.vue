<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-top="46px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                :left-options="{backText:'',preventGoBack:true}" title="催件查询" @on-click-back="backClick">
      </x-header>
      <load-more v-show="showLoading" tip="正在加载..."></load-more>
      <msg v-show="showEmpty" title="对不起" description="无查询结果" icon="info"></msg>
      <scroller v-show="!showEmpty && !showLoading" lock-x scrollbar-y :use-pullup="true"
                :height="'-46px'" :pullup-config="pullupConfig"
                ref="scroller" @on-pullup-loading="nextPage">
        <div>
          <group style="padding-bottom:10px; overflow: hidden;">
            <cell-box v-for="(item, index) in resultList" :key="index" is-link>
              <!-- id:'id123',waybillNo:'waybillNo123',complainType:'投诉类型1',complainTime:'2017-12-12 00:00:00',stateId:'处理状态45',sourceName:'投诉来源1',priorLevel:'优先级1',complainCount:'投诉次数2'-->
              <div class="yto-info" v-on:click="toDetail(item)">
                <!--title -->
                <div class="yto-title">
                  <div class="left" v-if="item.microMessageSource == '菜鸟平台催件'">菜鸟催件</div>
                  <div class="left" v-else-if="item.microMessageSource =='菜鸟平台物流举证'">菜鸟物流举证</div>
                  <div class="left" v-else="item.microMessageSource =='普通催件'">普通催件</div>
                  <div class="right red">{{stateIdList[item.stateId]}}</div>
                </div>
                <!--content-->
                <div class="yto-content">
                  <div v-if="item.checkingType == '0' " class="left">{{item.wayBillNo}}</div>
                  <div v-if="item.checkingType == '1' " class="left">{{item.orderNo}}</div>
                  <div class="right">{{item.complaintTime ? item.complaintTime.replace('T', ' ') : ''}}</div>
                </div>
                <!--footer-->
                <div class="yto-footer">
                  <div class="left">{{item.prescription}}</div>
                </div>
              </div>
            </cell-box>
          </group>
          <load-more :show-loading="false" v-show="showOver" tip="已经到底了"></load-more>
        </div>
      </scroller>
    </view-box>
  </div>
</template>
<script>
  import {
    Group,
    Radio,
    CellBox,
    LoadMore,
    Scroller,
    ViewBox,
    XHeader,
    CheckIcon,
    Checklist,
    XButton,
    Popup,
    XTextarea,
    Cell,
    Msg
  } from 'vux';
  import {mapGetters} from 'vuex';
  import moment from 'moment';
  import {getUrgeExpressPage} from '../../service/service';

  export default {
    components: {
      Group,
      Radio,
      CellBox,
      LoadMore,
      Scroller,
      ViewBox,
      XHeader,
      CheckIcon,
      Checklist,
      XButton,
      Popup,
      XTextarea,
      Cell,
      Msg
    },
    computed: {},
    methods: {
      ...mapGetters('urgeExpress', ['getUrgeSearchParameters']),
      /*
      exchangeState: (urgeExpress) => {
        return ComplaintStatusEnum[complaint.stateId];
      },
      */
      // 详情页
      toDetail(item) {
        this.$router.push({name: '催件详情', params: {id: item.id, wayBillNo: item.wayBillNo}});
      },
      // 下一页数据
      async nextPage() {
        this.parameters.pageNo = parseInt(this.parameters.pageNo) + parseInt(1);
        this.ajaxList();
        this.$refs.scroller.donePullup();
        if (this.getListJson.length < 20) { // unload plugin
          this.$refs.scroller.disablePullup();
          this.showOver = true;
        }
      },
      // 获取列表数据
      async ajaxList() {
        let startDate = '';
        if (this.parameters.complaintTimeLower) {
          startDate = moment(this.parameters.complaintTimeLower, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        }
        let endDate = '';
        if (this.parameters.complaintTimeUpper) {
          endDate = moment(this.parameters.complaintTimeUpper, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        }
        // 运单号字母小写转大写
        if (this.parameters.waybillNo) {
          this.parameters.waybillNo = this.parameters.waybillNo.toUpperCase();
        }

        let getList = await getUrgeExpressPage({
          orderNo: this.parameters.orderNo,
          wayBillNo: this.parameters.wayBillNo,
          complaintTimeLower: startDate,
          complaintTimeUpper: endDate,
          // 催件类型  0:运单催件, 1:订单催件
          checkingType: this.parameters.checkingType,
          // 催件来源
          microMessageSource: this.parameters.microMessageSource.toString(),
          // 处理状态: --1全部 --2正在处理  --3完结  。  123全部处理中已完结  30 35 60
          stateId: this.parameters.stateId,
          // 页码
          pageNo: this.parameters.pageNo,
          limit: this.parameters.limit,
          start: this.parameters.start
        });
        this.getListJson = getList.data.items;
        this.resultList = this.resultList.concat(this.getListJson);

        if (this.resultList.length > 0) {
          this.showLoading = false;
          this.showEmpty = false;
        } else {
          this.showLoading = false;
          this.showEmpty = true;
        }
        // 条数小于默认20 条时则显示 没有了
        this.$nextTick(() => {
          if (this.getListJson.length < 20) { // unload plugin
            this.$refs.scroller.donePullup();
            this.$refs.scroller.disablePullup();
            this.showOver = true;
          }
        });
      },
      backClick() {
        this.$router.go(-1);
      }
    },
    async created() {
      this.parameters = JSON.parse(JSON.stringify(this.getUrgeSearchParameters()));
      await this.ajaxList();
      window.goToBack = () => {
        this.backClick();
      };
    },
    data() {
      return {
        stateIdList: {
          '30': '处理中',
          '35': '已回复菜鸟',
          '60': '已完结'
        },
        scrollNum: '',
        getListJson: [],
        resultList: [],
        showOver: false,
        pullupConfig: {
          pullUpHeight: 200,
          height: 50,
          content: '上拉加载更多',
          downContent: '松开进行加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...'
        },
        parameters: null,
        showEmpty: false,
        showLoading: true,
        // 当前人网点code
        stationCode: '',
        item: null
      };
    }
  };
</script>

<style lang="less" scoped>
  .weui-cell_access.vux-cell-box:after {
    border: 0;
  }

  .yto-check {
    padding-right: 5px;
  }

  .yto-left {
    flex: 1;
    span {
      padding-left: 10px;
      color: #eb0000;
    }
  }

  .yto-info {
    flex: 2;
  }

  .left {
    text-align: left;
    max-width: 320px;
    flex: 1;
    padding-right: 5px;
  }

  .right {
    text-align: right;
  }

  .yto-title {
    font-size: 0.9em;
    overflow: hidden;
    padding-bottom: 5px;
    display: flex;
    color: #000;
    .right {
      color: #eb0000;
    }
    .red {
      color: #ff0000;
    }
  }

  .yto-footer {
    font-size: 0.8em;
    overflow: hidden;
    display: flex;
    .right {
      color: #999;
    }
  }

  .yto-content {
    color: #999;
    font-size: 0.8em;
    padding-bottom: 5px;
    overflow: hidden;
    display: flex;
    .right {

    }
  }

  .header-right {
    color: #fff !important;
    font-size: 1.2em;
  }
</style>
