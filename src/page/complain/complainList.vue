<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-top="46px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                :left-options="{backText:'',preventGoBack:true}" title="查询列表" @on-click-back="backClick">
      </x-header>
      <load-more v-show="showLoading" tip="正在加载"></load-more>
      <msg v-show="showEmpty" title="对不起" description="无查询结果" icon="info"></msg>
      <scroller v-show="!showEmpty && !showLoading" lock-x scrollbar-y :use-pullup="true"
                :height="'-46px'" :pullup-config="pullupConfig"
                ref="scroller" @on-pullup-loading="nextPage">
        <div>
          <group style="padding-bottom:10px; overflow: hidden;">
            <cell-box v-for="(item, index) in resultList" :key="index" is-link>
              <!-- id:'id123',waybillNo:'waybillNo123',complainType:'投诉类型1',complainTime:'2017-12-12 00:00:00',stateId:'处理状态45',sourceName:'投诉来源1',priorLevel:'优先级1',complainCount:'投诉次数2'-->
              <div class="yto-info" v-on:click="toNext(item,index)">
                <div class="yto-title">
                  <div class="left">
                    {{enumComplaintType[item.complaintType]}}
                    <span :class="item.priorLevel ==='1'?'':'red'">
                      {{item.complaintCount}}次{{item.priorLevel===1?'普通':'加急'}}
                    </span>
                  </div>
                  <div class="right">
                    {{exchangeState(item)}}
                  </div>
                </div>
                <div class="yto-content">
                  <div class="left">{{item.waybillNo}}</div>
                  <div class="right">{{item.complaintTime?item.complaintTime.replace('T',' '):''}}</div>
                </div>
                <div class="yto-footer">
                  <div class="left">{{item.bigProblemName}}</div>
                  <div class="right">{{item.sourceName}}</div>
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
  import {getComplainList, complaintApiList, c5ApiLogin} from '../../service/service';
  import moment from 'moment';
  import {ComplaintStatusEnum} from './complainConstantEnum';

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
      ...mapGetters('complain', ['getSearchParmas']),
      exchangeState: (complaint) => {
        return ComplaintStatusEnum[complaint.stateId];
      },
      // 详情页
      toNext(item, index) {
        item.currentOrgName = this.parameters.currentOrgName;
        item.currentOrgCode = this.parameters.currentOrgCode;
        item.index = index;
        this.$router.push({name: '投诉详情', params: {item: item, complainList: this.resultList}});
      },
      async nextPage() {
        this.parameters.start += this.parameters.limit;
        this.parameters.start += 1;
        this.parameters.pageNo += 1;
        await this.ajaxList();
        this.$refs.scroller.donePullup();
        if (this.getListJson.length < this.parameters.limit) { // unload plugin
          this.$refs.scroller.disablePullup();
          this.showOver = true;
        }
      },
      // 获取列表数据
      async ajaxList() {
        let startDate = '';
        if (this.parameters.complaintTimeLower) {
          startDate = moment(this.parameters.complaintTimeLower, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        }
        let endDate = '';
        if (this.parameters.complaintTimeUpper) {
          endDate = moment(this.parameters.complaintTimeUpper, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        }
        // 运单号字母小写转大写
        if (this.parameters.waybillNo) {
          this.parameters.waybillNo = this.parameters.waybillNo.toUpperCase();
        }
        let getList = await complaintApiList({
          typeCode: this.parameters.businessType,
          waybillNo: this.parameters.waybillNo,
          complaintTimeBegin: startDate,
          complaintTimeEnd: endDate,
          // 投诉类型
          complaintType: this.parameters.complaintType,
          // 投诉来源
          complaintSourceId : this.parameters.sourceId,
          // 处理状态
          stateId: this.parameters.stateId,
          limit: this.parameters.limit,
          pageNo: this.parameters.pageNo,
          start: this.parameters.start
        });
        this.getListJson = getList.data.items;
        this.resultList = this.resultList.concat(this.getListJson);
        this.showLoading = false;
        if (this.resultList.length <= 0) {
          this.showEmpty = true;
        }
        this.$nextTick(() => {
          if (this.getListJson.length < this.parameters.limit) { // unload plugin
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
      this.parameters = JSON.parse(JSON.stringify(this.getSearchParmas()));
      await this.ajaxList();
      window.goToBack = () => {
        this.backClick();
      };
    },
    data() {
      return {
        // 投诉类型
        enumComplaintType: {
          '1': '普通投诉',
          '2': '淘宝投诉',
          '3': '升级投诉'
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
        stationCode: ''
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
