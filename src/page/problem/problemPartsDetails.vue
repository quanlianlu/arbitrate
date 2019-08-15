<template>
  <div style="height:100%;">
    <div class="yto-codeInfo" v-on:click="sendShow = true" @click="showWaybillSidebarWithWaybillNo"> </div>
    <view-box body-padding-bottom="46px" body-padding-top="46px">
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"
        title="问题件详情"
        :left-options="{backText:''}"
        @on-click-back="backClick"
      >
        <a slot="right" @click="subscribe">
          <img src="../../assets/img/ding.png">
        </a>
      </x-header>
      <div id="yto-wrap" style="transform: translate3d(0px, 0px, 0px); transition: all 300ms ease 0s;">
        <group label-width="4.5em" label-margin-right="2em" label-align="right" style="width: 100%;">
          <cell title="运单号" :value="issueDetail.waybillNo" value-align="left"></cell>
          <cell title="上报网点" :value="issueDetail.orgName" value-align="left"></cell>
          <cell title="上报人" :value="issueDetail.createUserName" value-align="left"></cell>
          <cell title="接收网点" :value="issueDetail.recOrgName" value-align="left"></cell>
          <!--<cell title="揽收网点" :value="issueDetail" value-align="left"></cell>-->
          <cell title="状态" :value="handleStatus" value-align="left"></cell>
          <cell title="上报时间" :value="issueDetail.createTime" value-align="left"></cell>
          <cell title="问题种类" :value="issueDetail.issueTypeName" value-align="left" align-items="flex-start"></cell>
          <cell title="问题描述" :value="issueDetail.issueDesc" value-align="left" align-items="flex-start"></cell>
          <cell title="客户电话" value-align="left" align-items="flex-start">
            <div>
              <label>{{mobile}} <br> {{mobile2}} <br> {{mobile3}} <br>{{mobile4}}</label>
              <a v-if="!mobileShow && (!!issueDetail.mobile || !!issueDetail.mobile2 || !!issueDetail.mobile3 || !!issueDetail.mobile4)" @click="showMobile()"
                 style="margin-left: 16px;color: #4080CA">查看</a>
            </div>
          </cell>
          <cell title="收款账号" :value="issueDetail.account" value-align="left"></cell>
          <cell title="图片信息" value-align="left" align-items="flex-start" v-if="list.length > 0"></cell>
          <div class="upimg-box" v-if="list.length > 0">
            <!--图片显示start-->
            <!--<cell>-->
            <div class="img-box">
              <img class="previewer-demo-img" v-for="(item, index) in list" :key="index" :src="item.src" width="85px"
                   height="50px"
                   @click="shows(index)">
              <div v-transfer-dom>
                <previewer :list="list" ref="previewer" :options="options"></previewer>
              </div>
            </div>
            <!--</cell>-->
            <!--图片显示end-->
          </div>
        </group>
        <div class="reply-title" v-show="replyList.length > 0">回复记录</div>
        <group label-width="4.5em" label-margin-right="2em" label-align="right"
               v-for="(item,index) in replyList" :key="index" gutter="10px" style="width: 100%;">
          <cell title="回复网点" :value="item.createOrgName" value-align="left"></cell>
          <cell title="回复人" :value="item.createUserName" value-align="left"></cell>
          <cell title="回复时间" :value="item.createTime" value-align="left"></cell>
          <cell title="回复内容" :value="item.dealContent" value-align="left"></cell>
          <cell title="客户电话"  value-align="left"><!--:value="item.dealContent"-->
            <div>
              <label>{{item.mobile ? '******' : null}}</label>
              <a v-if="!mobileShow && !!item.mobile" @click="showMobilPic(item.mobilesPic)" style="margin-left: 16px;color: #4080CA">查看</a>
            </div>
          </cell>
          <cell title="收款账号" :value="item.account" value-align="left"></cell>
        </group>
        <!--</swiper-item>
      </swiper>-->
      </div>
      <div v-transfer-dom>
        <previewer :list="list" ref="previewer" :options="options"></previewer>
      </div>
      <!--<div class="yto-foot" slot="bottom">-->
      <div class="yto-foot" slot="bottom"
           v-if="(handleStatus=='未处理' || handleStatus=='处理中') && businessType == 'deal' && canBeReply">
        <!--PD10未处理，PD20处理中，PD30处理完结，PD40取消问题件-->
        <x-button type="primary" class="yto-btn-primary" @click.native="popupShow = true">回复</x-button>
      </div>
      <div v-transfer-dom>
        <confirm v-model="operatTip"
                 @on-cancel="operatTip = false;"
                 @on-confirm="sendMessage"
                 title="操作提示">
          <p style="text-align:center;">{{operatTipTxt}}</p>
        </confirm>
      </div>
      <div v-transfer-dom>
        <confirm v-model="sendMessageTip"
                 :close-on-confirm="false"
                 @on-cancel="sendMessageTip = false;identifyCode = '';sendCertifyReturn = '';"
                 @on-confirm="checkMessage"
                 title="操作提示">
          由于您查看的次数过多，请输入验证码：验证码已发送至您的手机{{sendMessageInfo.mobile ? '('+(sendMessageInfo.mobile.substring(0,3) + '****' + sendMessageInfo.mobile.substring(7)) + ')' : ''}}
          <x-input type="number" title="" v-model="identifyCode" class="weui-vcode certify-code" :max="6" :show-clear="false">
            <x-button slot="right" style="font-size:12px;" type="primary" class="yto-btn-primary" @click.native="sendMessage" :disabled="timeSeconds > 0">重新发送{{timeSeconds > 0 ? '('+timeSeconds+'s)':''}}</x-button>
          </x-input>
          <p style="color: #f43530;">{{sendCertifyReturn}}</p>
        </confirm>
      </div>
    </view-box>
    <!--&lt;!&ndash; 走件流程窗口开始 &ndash;&gt;-->
    <div v-transfer-dom v-if="isShow">
      <popup v-model="sendShow" position="right" width="70%">
        <timeline>
          <timeline-item v-for="(item, index) in sendInfo" :key="index" class="sendBox">
            <h4 :class="[index === 0 ? 'recent' : '']">[{{item.opName}}]&nbsp;&nbsp;{{item.opOrgName}}</h4>
            <p :class="[index === 0 ? 'recent' : '']">{{item.opTime}}</p>
          </timeline-item>
        </timeline>
        <msg v-if="showEmpty" title="对不起" description="该单号无走件流程" icon="info"></msg>
      </popup>
    </div>
    <!-- 回复窗口开始 -->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="问题件回复"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <cell title="常用语" value-align="left" @click.native="commonLanguage" :value="templateSelect" is-link></cell>
            <x-textarea :max="200" v-model="dealContent" placeholder="知悉，如有问题再上报我司"></x-textarea>
            <x-input title="客户电话" placeholder="15位以内字符" :show-clear="false" v-model="replayParams.mobile" type="text"></x-input>
            <x-input title="收款账号" placeholder="" :show-clear="false" v-model="replayParams.account" type="text"></x-input>
            <cell-box>
              <check-icon :value.sync="isCheck">完结</check-icon>
            </cell-box>
          </group>
          <div class="yto-foot" slot="bottom">
            <x-button type="primary" class="yto-btn-primary" @click.native="replyIssue">回复</x-button>
          </div>
        </view-box>
      </popup>
    </div>
    <!-- 常用语窗口开始 -->
    <div v-transfer-dom>
      <popup v-model="templateShow" position="right" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="常用语选择"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="templateShow = false">
          </x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <radio title="title" :options="templateList" v-model="templateSelect" @click.native="templateShow = false"
                   @on-change="change"></radio>
          </group>
        </view-box>
      </popup>
    </div>
    <!-- 电话图片窗口开始 -->
    <div v-transfer-dom>
      <popup v-model="showMobilesPic" id="popup_box">
        <div>
          <img class="previewer-demo-img" :src="mobilesPic" style="width: 100%; height: 200px;">
        </div>
      </popup>
    </div>
    <!-- 回复列表电话图片窗口开始 -->
    <div v-transfer-dom>
      <popup v-model="showMobilesPicReply" id="popup_box_reply">
        <div>
          <img class="previewer-demo-img" :src="mobilesPicReply" style="width: 100%; height: 200px;">
        </div>
      </popup>
    </div>
  </div>
</template>
<script>
  import {
    Confirm,
    Previewer,
    TransferDomDirective as TransferDom,
    Group,
    XButton,
    ViewBox,
    Cell,
    XHeader,
    Popup,
    XInput,
    XTextarea,
    CheckIcon,
    CellBox,
    Timeline,
    TimelineItem,
    Msg,
    Radio,
    Swiper,
    SwiperItem
  } from 'vux';
  import {mapActions} from 'vuex';
  import {
    problempieceCheckSmsCode,
    problempieceSmsSend,
    getFiles,
    getIssueUsually,
    problempieceDetail,
    problempieceMobile,
    problemReply,
    replyIssueInfo,
    sendInfo,
    problempieceBatchMobile
  } from '../../service/service';
  import {appUtil} from "../../common/commonUtils";

  export default {
    directives: {
      TransferDom
    },
    components: {
      Confirm,
      Previewer,
      Group,
      XButton,
      ViewBox,
      Cell,
      XHeader,
      Popup,
      XInput,
      XTextarea,
      CheckIcon,
      CellBox,
      Timeline,
      TimelineItem,
      Msg,
      Radio,
      Swiper,
      SwiperItem
    },
    computed: {
    },
    methods: {
      ...mapActions([
        'updateDemoPosition'
      ]),
      // 收到验证码后提交验证码
      checkMessage() {
        if(this.identifyCode.length === 0) {
          this.sendCertifyReturn = '验证码不能为空';
          // this.$vux.alert.show({
          //   title: '操作提示',
          //   content: '验证码不能为空',
          //   buttonText: ' ',
          //   hideOnBlur: true
          // });
          // setTimeout(() => {
          //   this.$vux.alert.hide();
          // }, 1500);
        } else {
          let mobileList1 = [];
          if(this.issueDetail.mobile) {
            mobileList1.push(this.issueDetail.mobile);
          }
          if(this.issueDetail.mobile2) {
            mobileList1.push(this.issueDetail.mobile2);
          }
          if(this.issueDetail.mobile3) {
            mobileList1.push(this.issueDetail.mobile3);
          }
          if(this.issueDetail.mobile4) {
            mobileList1.push(this.issueDetail.mobile4);
          }
          this.CheckSmsCode({
            mobileList: mobileList1,
            empCode: this.sendMessageInfo.empCode,
            mobile: this.sendMessageInfo.mobile,
            smsCode: this.identifyCode
          });
          this.identifyCode = '';
        }
      },
      // 发送验证码
      sendMessage(type) {
        this.operatTip = false;
        this.sendMessageTip = true;
        this.sendCertifyReturn = '';
        // alert(JSON.stringify(this.sendMessageInfo));
        if(JSON.stringify(this.sendMessageInfo) !== "{}") {
          this.sendMessageToMe(this.sendMessageInfo);
        }
      },
      onImgError(item, $event) {
        console.log(item, $event);
      },
      pullUp() {
        setTimeout(() => {
          this.pullUpConfig.showLoading = true;
          this.lists.push('2');
        }, 200);
      },
      shows(index) {
        this.$refs.previewer.show(index);
      },
      change(value, label) {
        this.dealContent = label;
      },
      load2() {
        setTimeout(() => {
          this.n2 += 10;
          setTimeout(() => {
            this.$refs.demo2.donePullup();
          }, 100);
          if (this.n2 === 30) { // unload plugin
            setTimeout(() => {
              this.$refs.demo2.disablePullup();
            }, 100);
          }
        }, 2000);
      },
      // 电话图片
      showMobilPic(baseMobile) {
        this.showMobilesPicReply = true;
        this.mobilesPicReply = baseMobile;
      },
      // 校验验证码
      async CheckSmsCode(params) {
        let mess = await problempieceCheckSmsCode(params);
        // alert(JSON.stringify(mess));
        if (mess.data.object.status === 0){
          this.mobilesPic = mess.data.mobilesPic;
          this.showMobilesPic = true;
          this.sendMessageTip = false;
          this.sendCertifyReturn = '';
        } else {
          this.sendCertifyReturn = mess.data.object.message;
          // this.$vux.alert.show({
          //   title: '操作提示',
          //   content: mess.data.object.message,
          //   buttonText: ' ',
          //   hideOnBlur: true
          // });
        }
      },
      // 发送验证码请求
      async sendMessageToMe(params) {
        let mess = await problempieceSmsSend(params);
        if (mess.status === 0){
           this.sendMessageTip = true;
          /*alert(JSON.stringify(mess));*/
          if(this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          let _this = this;
          _this.timeSeconds = 60;
          this.timer = setInterval(function () {
            if(_this.timeSeconds === 1) {
              clearInterval(_this.timer);
              _this.timer = null;
            }
            _this.timeSeconds--;
          }, 1000);
          this.timeSeconds--
          // alert(JSON.stringify(mess));
        } else if (mess.status === -2){
          if (mess.message){
            if (mess.message.indexOf("网点管家客户端") > -1){
              this.sendMessageTip = false;
              this.$vux.alert.show({
                title: '操作',
                content: mess.message,
                buttonText: ' ',
                hideOnBlur: true
              });
            } else {
              this.sendCertifyReturn = mess.message;
            }
          }
        }
      },
      // 回复信息列表
      async listReply() {
        this.replyList = [];
        let replyLists = await problemReply({
          issueId: this.issueDetail.id,
          issueCreateTime: this.issueDetail.createTime
        });
        this.replyList = replyLists.data.list;
        this.replyList.reverse();
        this.$nextTick(() => {
          //  this.$refs.swiper.xheight = this.$refs.swiperitem[this.issueDetail.index].$el.scrollHeight + 'px';
          this.$vux.loading.hide();
        });
      },
      async getSendInfo() {
        let getData = await sendInfo(this.issueDetail.waybillNo);
        this.sendInfo = getData.data.list;
        if (!this.sendInfo || this.sendInfo.length === 0) {
          this.showEmpty = true;
        } else {
          this.showEmpty = false;
        }
      },
      async replyIssue() { // 提交回复信息
        // 电话号校验
        // !!this.replayParams.mobile && !((/^(\d{1,11})?$/.test(this.replayParams.mobile)))
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
        let dm = 'PD20';
        if (this.isCheck) {
          dm = 'PD30';
        }
        this.parameters.issueId = this.issueDetail.id;
        this.parameters.statusId = this.issueDetail.statusId;
        this.parameters.lastDealOrgCode = this.issueDetail.lastDealOrgCode;
        this.parameters.dealContent = this.dealContent || '知悉，如有问题再上报我司';
        this.parameters.issueCreateTime = this.issueDetail.createTime;
        this.parameters.dealMethod = dm;
        this.parameters.waybillNo = this.issueDetail.waybillNo;
        this.parameters.mobile = this.replayParams.mobile;
        this.parameters.account = this.replayParams.account;
        let res = await replyIssueInfo(this.parameters);
        if (res.status === 0) {
          this.$vux.alert.show({
            title: '操作成功',
            content: '回复成功',
            buttonText: ' ',
            hideOnBlur: true
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 1500);
        }
        this.popupShow = false;
        // 回复后详情显示逻辑
        let st = this.issueDetail.status;
        if (this.isCheck) { // 若选完结
          this.handleStatus = '处理完结';
        } else {
          if (st === 'PD10') {
            this.handleStatus = '处理中';
          }
        }
        // 刷新回复列表
        let replyLists = await problemReply({
          issueId: this.issueDetail.id,
          issueCreateTime: this.issueDetail.createTime
        });
        this.replyList = replyLists.data.list;
        this.replyList.reverse();
      },
      async commonLanguage() { // 常用语
        let res = await getIssueUsually({
          pageNo: null,
          start: null,
          limit: 10
        });
        this.templateList = [];
        let temList = res.data.list;
        for (let x in temList) {
          this.templateList.push({value: temList[x].templateContent, key: temList[x].templateType});
        }
        this.templateShow = true;
      },
      async getPictures() { // 图片
        this.list = [];
        let filesObj = await getFiles({mediaId: this.issueDetail.mediaId});
        if (filesObj.status === 0) {
          this.images = filesObj.data.imgs;
          for (let x in this.images) {
            this.list.push({src: 'data:image/jpeg;base64,' + this.images[x]});
          }
        }
      },
      async nextDetails(index) { // 滑动下一个详情
        this.$vux.loading.show({
          text: '加载中'
        });
        setTimeout(() => {
          this.$vux.loading.hide();
        }, 3000);
        // this.$refs.swiper.xheight = document.body.offsetHeight + 'px';

        let issue = Object.assign({}, this.getListJson[index]);
        await this.detail({
          waybillNo: issue.waybillNo,
          id: issue.id,
          type: this.businessType,
          createTime: issue.createTime
        }).then(detail => {
          // this.businessType = this.issueDetail.businessType;
          this.issueDetail = detail;
          this.issueDetail.index = index;
          this.mobileShow = false;
          this.mobile = this.issueDetail.mobile ? '******' : null;
          this.mobile2 = this.issueDetail.mobile2 ? '******' : null;
          this.mobile3 = this.issueDetail.mobile3 ? '******' : null;
          this.mobile4 = this.issueDetail.mobile4 ? '******' : null;
          this.account = this.issueDetail.account;
          this.mobilesPic = this.issueDetail.mobilesPic;
          let st = this.issueDetail.status;
          this.handleStatus = st === 'PD10' ? '未处理' : st === 'PD20' ? '处理中' : st === 'PD30' ? '处理完结' : st === 'PD40' ? '取消问题件' : st;
          if (this.isWay) { // 是否通过运单号查询
            // 登录人所在网点为当前处理网点 且 状态为'未处理'和'处理中'的才可回复
            if (typeof (this.issueDetail.dealOrgCode) == 'undefined' || this.issueDetail.dealOrgCode == '') {
              this.canBeReply = (this.issueDetail.recOrgCode === this.currentStationCode) && (st === 'PD10' || st === 'PD20');
            } else {
              this.canBeReply = (this.issueDetail.dealOrgCode === this.currentStationCode) && (st === 'PD10' || st === 'PD20');
            }
            // 如果不是相关网点，则不显示电话
            if (this.currentStationCode != this.issueDetail.recOrgCode
              && this.currentStationCode != this.issueDetail.dealOrgCode
              && this.currentStationCode != this.issueDetail.regionCode
              && this.currentStationCode != this.issueDetail.orgCode) {
              this.mobileShow = true;
            }
          } else {
            this.canBeReply = true;
          }
          this.getSendInfo();
          this.listReply();
          this.getPictures(); // 获取图片
          this.$vux.loading.hide();
        });
      },
      backClick() { // 返回上一页
        this.$router.go(-1);
      },
      subscribe() {
        appUtil.subscribe(this.issueDetail.waybillNo)
      },
      async showMobile() {
        /*  this.showMobilesPic = true;*/
        let mobileList = [];
        if(this.issueDetail.mobile) {
          mobileList.push(this.issueDetail.mobile);
        }
        if(this.issueDetail.mobile2) {
          mobileList.push(this.issueDetail.mobile2);
        }
        if(this.issueDetail.mobile3) {
          mobileList.push(this.issueDetail.mobile3);
        }
        if(this.issueDetail.mobile4) {
          mobileList.push(this.issueDetail.mobile4);
        }
        let result = await problempieceBatchMobile({
          mobileList: mobileList,
          waybillNo: this.issueDetail.waybillNo
        });
        /*alert(JSON.stringify(mobileList));*/
        if(result.data.object.status === -2) {
          /*if(JSON.stringify(this.sendMessageInfo) !== '{}') {*/
            if(this.timeSeconds === 0) {
              let _this = this;
              _this.timeSeconds = 60;
              this.timer = setInterval(function () {
                if(_this.timeSeconds === 1) {
                  clearInterval(_this.timer);
                  _this.timer = null;
                }
                _this.timeSeconds--;
              }, 1000);
            }
            this.timeSeconds--;
         /* } else {
            this.$vux.alert.show({
              title: '操作提示',
              content: result.data.object.message,
              buttonText: '',
              hideOnBlur: true
            });
          }*/
          let res = JSON.parse(result.data.object.message);
          this.sendMessageInfo = {
            empCode: res.empCode,
            mobile: res.mobile
          };
          if (res.msg){
            if (res.msg.indexOf("网点管家客户端") > -1){
               this.$vux.alert.show({
                title: '操作',
                content: res.msg,
                buttonText: ' ',
                hideOnBlur: true
              });
            } else {
              this.sendCertifyReturn = res.msg;
              this.sendMessageTip = true;
            }
          }
          return false;
        } else if (result.data.object.status === 0){
          this.mobilesPic = result.data.mobilesPic;
          this.showMobilesPic = true;
        } else if (result.data.object.status === -3){
          let res = JSON.parse(result.data.object.message);
          this.sendMessageInfo = {
            empCode: res.empCode,
            mobile: res.mobile
          };
          this.operatTipTxt = '你已经查询' + res.visitCount + '次,查看手机号需要短信验证,是否继续?';
          this.operatTip = true;
        } else {
          // alert (result.data.object.message);
          this.$vux.alert.show({
            title: '操作提示',
            content: result.data.object.message,
            buttonText: ' ',
            hideOnBlur: true
          });
        }
      },
      async detail(params) {
        let result = await problempieceDetail(params);
        // this.issueDetail = result.data;
        return result.data;
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
      },
      async showWaybillSidebarWithWaybillNo () {
        try {
          appUtil.showWaybillSidebarWithWaybillNo(this.issueDetail.waybillNo)
        }catch (e) {
          this.isShow = true;
        }
      }
    },
    created() {
      let issue = this.$route.params.item.issue;
      this.getListJson = this.$route.params.getListJson;
      this.businessType = this.$route.params.item.businessType;
      this.isWay = this.$route.params.item.isWay;
      this.currentStationCode = this.$route.params.item.currentStationCode;
      this.detail({
        waybillNo: issue.waybillNo,
        id: issue.id,
        type: this.businessType,
        createTime: issue.createTime
      }).then((detail) => {
        this.issueDetail = detail;
        this.issueDetail.index = this.$route.params.item.index;
        this.mobileShow = false;
        this.mobile = this.issueDetail.mobile ? '******' : null;
        this.mobile2 = this.issueDetail.mobile2 ? '******' : null;
        this.mobile3 = this.issueDetail.mobile3 ? '******' : null;
        this.mobile4 = this.issueDetail.mobile4 ? '******' : null;
        this.account = this.issueDetail.account;
        this.mobilesPic = this.issueDetail.mobilesPic;
        let st = this.issueDetail.status;
        this.handleStatus = st === 'PD10' ? '未处理' : st === 'PD20' ? '处理中' : st === 'PD30' ? '处理完结' : st === 'PD40' ? '取消问题件' : st;
        if (this.isWay) { // 是否通过运单号查询
          // 登录人所在网点为当前处理网点 且 状态为'未处理'和'处理中'的才可回复
          if (typeof (this.issueDetail.dealOrgCode) == 'undefined' || this.issueDetail.dealOrgCode == '') {
            this.canBeReply = (this.issueDetail.recOrgCode === this.currentStationCode) && (st === 'PD10' || st === 'PD20');
          } else {
            this.canBeReply = (this.issueDetail.dealOrgCode === this.currentStationCode) && (st === 'PD10' || st === 'PD20');
          }
          // 如果不是相关网点，则不显示电话
          // console.log(this.currentStationCode)
          // console.log(this.issueDetail.recOrgCode)
          // console.log(this.issueDetail.dealOrgCode)
          // console.log(this.issueDetail.regionCode)
          // console.log(this.issueDetail)
          if (this.currentStationCode != this.issueDetail.recOrgCode
            && this.currentStationCode != this.issueDetail.dealOrgCode
            && this.currentStationCode != this.issueDetail.regionCode
            && this.currentStationCode != this.issueDetail.orgCode) {
            this.mobileShow = true;
          }
        } else {
          this.canBeReply = true;
        }
        this.getSendInfo();
        this.getPictures(); // 获取图片
        this.listReply();
      });
      window.goToBack = () => {
        this.backClick();
      };
    /*  //初始化当前用户信息
      this.initCurrentUser();*/
    },
    mounted() {
      // 加载下一条开始
      let me = {
        _start: {x: 0, y: 0},
        _move: {x: 0, y: 0},
        _end: {x: 0, y: 0},
        _options: {
          minMovingDistance: 150
        }
      };
      const $wrap = document.getElementById('yto-wrap');
      $wrap.addEventListener('touchstart', (e) => {
        me._start.x = e.changedTouches[0].pageX;
        me._start.y = e.changedTouches[0].pageY;
        let transition = 'none';
        $wrap.style.webkitTransition = transition;
        $wrap.style.transition = transition;
      });
      $wrap.addEventListener('touchmove', (e) => {
        me._move.x = e.changedTouches[0].pageX;
        me._move.y = e.changedTouches[0].pageY;
        let distanceX = me._move.x - me._start.x;
        let distanceY = me._move.y - me._start.y;
        let distance = distanceX;
        let noScrollerY = Math.abs(distanceX) > Math.abs(distanceY);
        distance = distance / 3;
        let transform = `translate3d(${distance}px, 0, 0)`;
        $wrap.style.webkitTransform = transform;
        $wrap.style.transform = transform;
        noScrollerY && e.preventDefault();
      });

      $wrap.addEventListener('touchend', (e) => {
        me._end.x = e.changedTouches[0].pageX;
        me._end.y = e.changedTouches[0].pageY;

        let distance = me._end.x - me._start.x;

        if (distance !== 0 && me._options.minMovingDistance && Math.abs(distance) > me._options.minMovingDistance) {
          if (distance > 0) {
            if (this.issueDetail.index === 0) {
              this.$vux.toast.show({
                text: '已经到底了。'
              });
            } else {
              this.nextDetails(this.issueDetail.index - 1);
            }
          } else {
            if (this.issueDetail.index === this.getListJson.length - 1) {
              this.$vux.toast.show({
                text: '已经到底了。'
              });
            } else {
              this.nextDetails(this.issueDetail.index + 1);
            }
          }
          distance = 0;
          $wrap.style.webkitTransition = 'all';
          $wrap.style.transition = 'all';
          let transform = `translate3d(${distance}px, 0, 0)`;
          $wrap.style.webkitTransform = transform;
          $wrap.style.transform = transform;
          return false;
        } else {
          distance = 0;
          $wrap.style.webkitTransition = 'all';
          $wrap.style.transition = 'all';
          let transform = `translate3d(${distance}px, 0, 0)`;
          $wrap.style.webkitTransform = transform;
          $wrap.style.transform = transform;
          return false;
        }
      }, false);
    },
    data() {
      return {
        timer: null, // 验证码定时器
        sendCertifyReturn: '',
        identifyCode: '',// 验证码
        timeSeconds: 0,// 时间倒数计时
        sendMessageInfo: {},
        sendMessageTip: false,// 发送验证码的弹窗是否显示
        operatTipTxt: '',// 电话操作提示的内容
        operatTip: false,// 是否显示电话操作提示
        mobilesPicReply: '', // 回复列表电话图片
        showMobilesPicReply: false,
        list: [],
        options: {
          getThumbBoundsFn(index) {
            // find thumbnail element
            let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
            // get window scroll Y
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            // optionally get horizontal scroll
            // get position of element relative to viewport
            let rect = thumbnail.getBoundingClientRect();
            // w = width
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
            // Good guide on how to get element coordinates:
            // http://javascript.info/tutorial/coordinates
          },
          fullscreenEl: false
        },
        images: [],
        canBeReply: false,
        businessType: 'query', // query:问题件查询/deal:问题件处理(默认为查询)
        isWay: false,
        currentStationCode: '',
        replayParams: {
          mobile: null,
          account: ''
        },
        parameters: {
          issueId: '',
          statusId: '',
          lastDealOrgCode: '',  // 最后处理网点
          dealContent: '', // 处理信息
          issueCreateTime: '', // 问题件上报时间,格式yyyy-MM-dd HH:mm:ss
          dealMethod: '', // 处理方法（保存（PD20）或者完结（PD30））
          waybillNo: ''  // 运单号
        },
        issueDetail: {},
        handleStatus: null,
        replyList: [],
        popupShow: false,
        dealContent: '',
        isCheck: false,
        sendShow: false,
        sendInfo: null,
        showEmpty: false,
        templateShow: false,
        showSWiper: true,
        templateList: [],
        templateSelect: '', // '常用1'
        prevORnext: 2,
        getListJson: [],
        mobile: null,
        mobile2: null,
        mobile3: null,
        mobile4: null,
        account: '',
        showMobilesPic: false,
        mobilesPic: '',
        mobileShow: false,
        isShow: false
      };
    }
  };
</script>

<style lang="less" scoped>
  .yto-codeInfo {
    position: fixed;
    right: 0;
    bottom: 20%;
    width: 50px;
    height: 95px;
    background: url("../../assets/img/quick_nor@2x.png") 0 0 no-repeat;
    background-size: cover;
    z-index: 99;
  }

  .yto-codeInfo.open {
    background: url("../../assets/img/quick_nor@2x.png") 0 0 no-repeat;
    left: 20%;
    right: auto;
    z-index: 9999;
  }

  .reply-title {
    width: 100%;
    padding-top: 20px;
    text-align: center;
  }

  .sendBox h4 {
    font-weight: 400;
    font-size: 0.85rem;
    color: #666;
  }

  .sendBox p {
    font-size: 0.85rem;
    color: #999;
  }

  .sendBox p {
    font-size: 0.85rem;
    color: #999;
  }

  .sendBox p.recent, .sendBox h4.recent {
    color: #000;
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
</style>
<style lang="less">
  .weui-vcode.certify-code {
    .weui-cell__bd.weui-cell__primary {
      .weui-input {
        height: 26px;
        border-bottom: 1px solid;
      }
    }
  }
</style>
