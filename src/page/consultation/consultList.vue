<template>
  <div style="height:100%;">
    <view-box ref="viewBox" :body-padding-bottom="showCheck ? '46px':'0'" body-padding-top="46px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" :left-options="{backText:''}" title="查询列表" @on-click-back="backClick">
        <a slot="right" v-show="!showLoading && !showEmpty && showBatch && parameters.type == 'deal'" class="header-right"
           v-on:click="showCheck = !showCheck">{{showCheck === false ? '批量操作' : '取消'}}</a>
      </x-header>
      <load-more v-show="showLoading" tip="正在加载"></load-more>
      <msg v-show="showEmpty" title="对不起" description="无查询结果" icon="info"></msg>
      <scroller v-show="!showEmpty && !showLoading" lock-x scrollbar-y :use-pullup="true"
                :height="showCheck ? '-92px':'-46px'" :pullup-config="resultList.length<10 ? pullupLessConfig : pullupConfig"
                ref="scroller" @on-pullup-loading="nextPage">
        <div>
          <group style="padding-bottom:10px; overflow: hidden;">
            <!--循环列表数据start-->
            <cell-box v-for="(item, index) in resultList" :key="index" is-link>
              <div class="yto-check" v-show="showCheck">
                <check-icon :value.sync="checkArray[index]" :key="index"></check-icon>
              </div>
              <div class="yto-info" v-on:click="toNext(item,index)">
                <div class="yto-title">
                  <div class="left">{{parameters.businessType == '0'?'咨询':parameters.businessType == '2'?'快件查询':'未知类别code'+parameters.businessType}}</div>
                </div>
                <div class="yto-content">
                  <div class="left">{{item.waybillNo}}</div>
                  <div class="right">{{item.registTime.substring(0,item.registTime.lastIndexOf('.'))}}</div>
                </div>
              </div>
            </cell-box>
            <!--循环列表数据end-->
          </group>
          <load-more :show-loading="false" v-show="showOver" tip="已经到底了"></load-more>
        </div>
      </scroller>
      <div class="yto-foot" slot="bottom" v-if="showCheck && parameters.type == 'deal'">
        <x-button :type="btnDisabled ? 'default':'primary'" :class="btnDisabled ? 'yto-btn-default':'yto-btn-primary'"
                  :disabled="btnDisabled" @click.native="popupShow = true">回复
        </x-button>
      </div>
    </view-box>
    <!-- 常用语窗口开始 -->
    <div v-transfer-dom>
      <popup v-model="templateShow" position="right" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="常用语选择"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="templateShow = false"></x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <radio title="title" :options="templateList" v-model="templateSelect"
                   @click.native="templateShow = false" @on-change="change"></radio>
          </group>
        </view-box>
      </popup>
    </div>
  </div>
</template>
<script>
  import {TransferDomDirective as TransferDom,Group, Radio, CellBox, LoadMore, Scroller, ViewBox, XHeader, CheckIcon, Checklist, XButton, Popup, XTextarea, Cell, Msg} from 'vux';
  import {mapState, mapActions, mapGetters} from 'vuex';
  import {getIssueUsually, consultList} from '../../service/service';

  export default {
    directives: {
      TransferDom
    },
    components: {Group, Radio, CellBox, LoadMore, Scroller, ViewBox, XHeader, CheckIcon, Checklist, XButton, Popup, XTextarea, Cell, Msg},
    computed: {
      ...mapState({
        demoScrollTop: state => state.vux.demoScrollTop,
        probleList: state => state.vux.probleList,
        firstInPage: state => state.vux.firstInPage
      }),
      btnDisabled() {
        if (this.checkArray.length === 0) {
          return true;
        } else {
          let isTrueArray = this.checkArray.filter((item) => {
            return item === true;
          });
          return isTrueArray.length === 0;
        }
      }
    },
    methods: {
      ...mapActions([
        'updateDemoPosition',
        'updateProbleList',
        'updateFirstInPage'
      ]),
      change(value, label) {
        this.dealContent = label;
      },
      backClick() { // 返回上一页
        this.$router.go(-1);
      },
      toNext(item, index) { // 详情页
        item.index = index;
        this.$router.push({name: '咨询快件网点投诉详情', params: {item: item, consultList: this.resultList}});
      },
      onImgError() {
        this.showCheck = !this.showCheck;
      },
      pullUp() {
        setTimeout(() => {
          this.pullUpConfig.showLoading = true;
          this.lists.push('2');
        }, 200);
      },
      async ajaxList() { // 获取列表数据
        // 运单号字母小写转大写
        if (this.parameters.waybillNo) {
          this.parameters.waybillNo = this.parameters.waybillNo.toUpperCase();
        }
        let getList = await consultList({
          waybillNo: this.parameters.waybillNo,
          complaintTimeLower: this.parameters.complaintTimeLower, // this.parameters.complaintTimeLower,'2017-12-01 00:00:00'//开始时间
          complaintTimeUpper: this.parameters.complaintTimeUpper, // this.parameters.complaintTimeUpper,//结束时间
          businessType: this.parameters.businessType, // 0咨询 1投诉 2快件查询 3催件 4问题件上报//默认"投诉"
          limit: this.parameters.limit,
          pageNo: this.parameters.pageNo
        });
        if (typeof (getList.data.items) !== 'undefined') {
          this.getListJson = getList.data.items;
          this.resultList = this.resultList.concat(this.getListJson);
          if (this.resultList.length > 0) {
            this.showLoading = false;
            this.showEmpty = false;
          } else {
            this.showLoading = false;
            this.showEmpty = true;
          }
        }
        this.$nextTick(() => {
          if (this.getListJson.length < this.parameters.limit) { // unload plugin
            this.$refs.scroller.donePullup();
            this.$refs.scroller.disablePullup();
            this.showOver = true;
          }
        });
      },
      async nextPage() { // 下一页
        this.parameters.pageNo += 1;
        await this.ajaxList();
        this.$refs.scroller.donePullup();
        if (this.getListJson.length < 10) { // unload plugin
          this.$refs.scroller.disablePullup();
          this.showOver = true;
        }
      },
      async commonLanguage() { // 常用语
        let res = await getIssueUsually({
          pageNo: null,
          limit: null,
          start: null
        });
        this.templateList = [];
        let temList = res.data.list;
        for (let x in temList) {
          this.templateList.push({value: temList[x].templateContent, key: temList[x].templateType});
        }
        this.templateShow = true;
      },
      ...mapGetters('complain', [
        'getSearchParmas'
      ])
    },
    created() {
      // if (this.firstInPage) {
      let _this = this;
      let windowH = window.innerHeight - 64;
      _this.box = document.querySelector('#vux_view_box_body');
      _this.box.addEventListener('scroll', function() {
        if (_this.box.scrollTop + windowH >= _this.box.scrollHeight) {
          _this.pullUp();
        }
        _this.updateDemoPosition(_this.box.scrollTop);
      }, false);
      // this.parameters = this.$route.params;
      this.parameters = JSON.parse(JSON.stringify(this.getSearchParmas()));
      if (this.parameters.businessType !== '' && this.parameters.businessType != null && typeof this.parameters.businessType !== 'undefined') {
        this.ajaxList();
      }
      window.goToBack = () => {
        this.backClick();
      };
    },
    data() {
      return {
        scrollNum: '',
        getListJson: [],
        resultList: [],
        type: '4',
        lists: [0, 1, 2, 3, 0, 1, 2, 3],
        status1: {
          pullDownStatus: 'default'
        },
        n2: 10,
        showOver: false,
        pullupLessConfig: {
          content: '',
          downContent: '',
          upContent: '',
          loadingContent: ''
        },
        pullupConfig: {
          content: '上拉加载更多',
          downContent: '松开进行加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...'
        },
        parameters: null,
        checkArray: [],
        showCheck: false,
        dealContent: '知悉，如有问题再上报我司',
        isCheck: false,
        popupShow: false,
        templateShow: false,
        templateList: [],
        templateSelect: '',
        showEmpty: false,
        showLoading: true,
        showBatch: false,
        stationCode: '' // 当前人网点code
      };
    },
    updated() {
      this.$nextTick(function() {
        document.querySelector('#vux_view_box_body').scrollTop = this.demoScrollTop;
      });
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
    color: #999;
    .right {
      color: #eb0000;
    }
  }

  .yto-footer {
    font-size: 0.8em;
    overflow: hidden;
    display: flex;
    .right {
      color: #cecece;
    }
  }

  .yto-content {
    color: #999;
    font-size: 0.8em;
    padding-bottom: 5px;
    overflow: hidden;
    display: flex;
    .right {
      color: #4080CA;
    }
  }

  .header-right {
    color: #fff !important;
    font-size: 1.2em;
  }
</style>
