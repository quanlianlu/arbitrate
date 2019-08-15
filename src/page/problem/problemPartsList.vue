<template>
  <div style="height:100%;">
    <view-box ref="viewBox" :body-padding-bottom="showCheck ? '46px':'0'" body-padding-top="46px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                :left-options="{backText:''}" title="查询列表">
        <a slot="right" v-show="!showLoading && !showEmpty && showBatch && parameters.type == 'deal'"
           class="header-right"
           v-on:click="showCheck = !showCheck">{{showCheck === false ? '批量操作' : '取消'}}</a>
      </x-header>
      <load-more v-show="showLoading" tip="正在加载"></load-more>
      <msg v-show="showEmpty" title="对不起" description="无查询结果" icon="info"></msg>
      <scroller v-show="!showEmpty && !showLoading" lock-x scrollbar-y :use-pullup="true"
                :height="showCheck ? '-92px':'-46px'"
                :pullup-config="getListJson.length<20 ? pullupLessConfig : pullupConfig"
                ref="scroller" @on-pullup-loading="nextPage">
        <div>
          <group style="padding-bottom:10px; overflow: hidden;">
            <cell-box v-for="(item, index) in problemPieceList" :key="index" is-link>
              <div class="yto-check" v-show="showCheck">
                <check-icon :value.sync="checkArray[index]" :key="index"></check-icon>
              </div>
              <div class="yto-info" v-on:click="toNext(item, index)">
                <div class="yto-title">
                  <div class="left">{{item.waybillNo}}</div>
                  <div class="right">
                    {{item.status == 'PD10' ? '未处理' : item.status == 'PD20' ? '处理中' : item.status == 'PD30' ? '处理完结' :
                    item.status == 'PD40' ? '取消问题件' : item.status}}
                  </div>
                  <!--PD10未处理，PD20处理中，PD30处理完结，PD40取消问题件-->
                </div>
                <div class="yto-content">
                  <div class="left">上报网点：{{item.orgName}}</div>
                  <!-- <div class="right">查看图片</div>-->
                </div>
                <div class="yto-footer">
                  <div class="left">问题种类：{{item.issueTypeName}}</div>
                  <div class="right">{{item.createTime}}</div>
                </div>
              </div>
            </cell-box>
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
    <!-- 批量回复窗口开始 -->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="问题件回复"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <cell title="常用语" value-align="left" @click.native="commonLanguage" :value="templateSelect"
                  is-link></cell>
            <x-textarea :max="200" v-model="dealContent" placeholder="知悉，如有问题再上报我司"></x-textarea>
            <x-input title="客户电话" placeholder="15位以内字符" :show-clear="false" v-model="replayParams.mobile" type="text"></x-input>
            <x-input title="收款账号" placeholder="" :show-clear="false" v-model="replayParams.account" type="text"></x-input>
            <cell-box>
              <check-icon :value.sync="isCheck">完结</check-icon>
            </cell-box>
          </group>
          <div class="yto-foot" slot="bottom">
            <x-button type="primary" class="yto-btn-primary" @click.native="batchReply">回复</x-button>
          </div>
        </view-box>
      </popup>
    </div>
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
  import {
    TransferDomDirective as TransferDom,
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
    XInput,
    Cell,
    Msg
  } from 'vux';
  import {mapState, mapActions, mapGetters} from 'vuex';
  import {problempiece, problempieceByWaybillNo, getIssueUsually, batchReply} from '../../service/service';
  import {waybillNoLowToUp} from '../../common/publicMethods';

  export default {
    directives: {
      TransferDom
    },
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
      XInput,
      Cell,
      Msg
    },
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
      ...mapGetters('problem', [
        'getSearchParmas'
      ]),
      ...mapActions([
        'updateDemoPosition',
        'updateProbleList',
        'updateFirstInPage'
      ]),
      change(value, label) {
        this.dealContent = label;
      },
      toNext(issue, index) {
        // 把type传到详情页面(query:仅查询/deal:处理)
        let item = {};
        item.businessType = this.parameters.type;
        // 把登录人网点code传到详情页面
        item.currentStationCode = this.parameters.stationCode;
        item.isWay = this.parameters.isWay;
        item.listNum = this.getListJson.length;
        item.index = index;
        item.issue = issue;
        this.$router.push({name: '问题件详情', params: {'item': item, 'getListJson': this.problemPieceList}});
      },
      onImgError() {
        this.showCheck = !this.showCheck;
      },
      async nextPage() { // 上拉加载
        this.parameters.pageIndex += 1;
        await this.ajaxList();
        this.$refs.scroller.donePullup();
        if (this.getListJson.length < 20) { // unload plugin
          this.$refs.scroller.disablePullup();
          this.showOver = true;
        }
      },
      async ajaxList() {
        let getList = null;
        if (this.parameters.isWay === true) { // 运单号查询
          // 运单号字母小写转大写
          this.parameters.waybillNo = waybillNoLowToUp(this.parameters.waybillNo);
          getList = await problempieceByWaybillNo({waybillNo: this.parameters.waybillNo});
          if (typeof (getList.data) === 'undefined' || typeof (getList.data.list) === 'undefined' || getList.data.list.length <= 0) {
            this.showLoading = false;
            this.showEmpty = true;
            return;
          }
          this.getListJson = getList.data.list;
        } else { // 条件查询
          getList = await problempiece(this.parameters);
          this.getListJson = getList.data.items;
        }
        this.problemPieceList = this.problemPieceList.concat(this.getListJson);
        this.showLoading = false;
        if (this.problemPieceList.length <= 0) {
          this.showEmpty = true;
        }
        this.$nextTick(() => {
          if (this.getListJson.length < this.parameters.pageSize) { // unload plugin
            this.$refs.scroller.donePullup();
            this.$refs.scroller.disablePullup();
            this.showOver = true;
          }
        });
      },
      async ajaxListBatch() { // 批量回复后刷新
        this.showCheck = false;
        this.parameters.pageIndex = 0;
        let getList = await problempiece(this.parameters);
        this.getListJson = getList.data.items;
        this.problemPieceList = this.getListJson;
        if (typeof this.problemPieceList === 'undefined' || this.problemPieceList.length <= 0) {
          this.showEmpty = true;
        }
      },
      async batchReply() { // 提交批量回复
        if (!!this.replayParams.mobile && this.replayParams.mobile.length > 15) {
          // 判断是否是手机号或者是座机号码
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '电话号码不可超过15位', timerFlag);
          return;
        }
        // 支付宝账号
        if (this.replayParams.account != null && this.replayParams.account.length > 25) {
          // 支付宝账号
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '账号字符长度不能超过25', timerFlag);
          return;
        }
        // popupShow = true;
        let dm = 'PD20';
        if (this.isCheck) {
          dm = 'PD30';
        }
        let selectlist = [];
        let flg = true;
        for (let x in this.checkArray) {
          if (this.checkArray[x] === true) {
            flg = false;
            let node = {
              mobile: this.replayParams.mobile,
              account: this.replayParams.account,
              issueId: this.problemPieceList[x].id,
              statusId: this.problemPieceList[x].statusId,

              lastDealOrgCode: this.problemPieceList[x].lastDealOrgCode,
              // dealContent: this.dealContent,
              dealContent: this.dealContent || '知悉，如有问题再上报我司',
              issueCreateTime: this.problemPieceList[x].createTime,
              dealMethod: dm,
              waybillNo: this.problemPieceList[x].waybillNo
            };
            selectlist.push(node);
          }
        }
        if (selectlist.length > 0) {
          this.methodBatchReply({list: selectlist});
        }
        if (flg) {
          this.$vux.alert.show({
            title: '提示',
            content: '请选择回复数据'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
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
      async methodBatchReply(objList) { // 批量回复
        let res = await batchReply(objList);
        this.$vux.alert.show({
          title: '提示',
          content: res.message
        });
        setTimeout(() => {
          this.$vux.alert.hide();
        }, 3000);
        this.popupShow = false;
        this.ajaxListBatch();
      },
      backClick() { // 返回上一页
        this.$router.go(-1);
      },
      reportWarnTimeOut(times) { // 封装弹框定时器
        let timerFlag = window.setTimeout(() => {
          this.$vux.alert.hide();
        }, times);
        return timerFlag;
      },
      reportWarnPart(title, content, timerFlag) {
        this.$vux.alert.show({
          title: title,
          content: content,
          onHide() {
            window.clearTimeout(timerFlag);
          }
        });
      }

    },
    data() {
      return {
        replayParams: {
          mobile: null,
          account: ''
        },
        scrollNum: '',
        getListJson: [],
        problemPieceList: [],
        type: '4', // ?
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
        dealContent: '',
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
    created() {
      // if (this.firstInPage) {
      let _this = this;
      let windowH = window.innerHeight - 64;
      _this.box = document.querySelector('#vux_view_box_body');
      _this.box.addEventListener('scroll', function () {
        if (_this.box.scrollTop + windowH >= _this.box.scrollHeight) {
          _this.pullUp();
        }
        _this.updateDemoPosition(_this.box.scrollTop);
      }, false);
      // this.parameters = this.$route.params;
      this.parameters = JSON.parse(JSON.stringify(this.getSearchParmas()));
      this.ajaxList();
      let proStatus = this.parameters.status;
      /* 状态为'处理中'或'未处理'且不是通过运单号查询到的才显示批量操作按钮 */
      if (typeof (proStatus) !== 'undefined' && (proStatus === 'PD10' || proStatus === 'PD20') && !this.parameters.isWay) {
        this.showBatch = true;
      }
      window.goToBack = () => {
        this.backClick();
      };
      // }
    },
    updated() {
      this.$nextTick(function () {
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
