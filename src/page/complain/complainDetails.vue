<template>
  <div style="height:100%;">
    <div class="yto-codeInfo" v-on:click="sendShow = true" @click="showWaybillSidebarWithWaybillNo"></div>
    <view-box body-padding-bottom="46px" body-padding-top="46px">
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"
        :title="enumComplaintType[complaintDetail.complaintType]+'详情'"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back="backClick">
        <div slot="right" @click="subscribe()">
          <img src="../../assets/img/ding.png">
        </div>
      </x-header>
      <div id="yto-wrap" style="min-height:100%;transform: translate3d(0px, 0px, 0px); transition: all 300ms ease 0s;">
        <group label-width="4.5em" label-margin-right="2em" label-align="right" style="width: 100%;">
          <cell title="运单号" value-align="left">{{complaintDetail.waybillNo}}
            {{enumComplaintType[complaintDetail.complaintType]}} {{complaintDetail.complaintCount}}次
          </cell>
          <cell title="客户姓名" value-align="left">
            <span>{{complaintDetail.customerName}}</span>
            <span style="padding-right: 10px;">{{complaintDetail.customerSex===1?'男':'女'}}</span>
          </cell>
          <cell title="客户电话" value-align="left">
            <span @click="goToTell(complaintDetail.customerTel)">{{complaintDetail.customerTel}}</span>
          </cell>
          <cell title="处理状态" value-align="left">
            {{ComplaintStatusEnum[complaintDetail.stateId]}} {{complaintDetail.priorLevel===1?'普通':'加急'}}
          </cell>
          <cell v-if="complaintDetail.complaintType === 3" title="受理局" value-align="left">
            {{complaintDetail.officeName}}
          </cell><!--普通1，淘宝2，升级3-->
          <cell v-if="complaintDetail.complaintType === 3 && complaintDetail.decisionResult >= 0" title="判定结果" value-align="left">
            {{complaintDetail.decisionResult===0 ?'有责':'无责'}}
          </cell><!--有效。1：无效-->
          <cell title="问题大类" :value="complaintDetail.bigProblemName" value-align="left"></cell>
          <cell title="问题小类" :value="complaintDetail.smallProblemName" value-align="left"></cell>
          <cell title="投诉内容" :value="complaintDetail.complaintContent" value-align="left"
                align-items="flex-start"></cell>

          <cell title="责任网点" :value="resOrgText" is-link value-align="left" @click.native="resOrgsShow = true"></cell>
          <!--图片显示start-->
          <!--<cell>-->
          <div class="upimg-box">
            <div class="img-box">
              <div v-for="(item,index) in (complaintDetail.images||[])" :key="index">
                  <span><img :src="fileUrl(item.fileAddress)" class="previewer-img"
                             @click="previewImage(index)"/></span>
              </div>
            </div>
          </div>
          <!--</cell>-->
          <!--图片显示end-->
        </group>
        <div class="reply-title" v-show="replyList.length > 0">回复记录</div>
        <group label-width="4.5em" label-margin-right="2em" label-align="right" v-for="(item) in replyList"
               :key="item.id"
               gutter="10px"
               style="width: 100%;">
          <cell title="回复人" value-align="left">
            <span>{{item.replyStationCode}}/{{item.replyStationName}}</span><br/>
            <span>{{item.replyUserCode}}/{{item.replyUserName}}</span>
          </cell>
          <cell title="回复时间" :value="item.replyTime.replace('T', ' ')" value-align="left"></cell>
          <cell title="回复内容" :value="item.replyContent" value-align="left"></cell>
        </group>
      </div>
      <div v-transfer-dom>
        <previewer :list="previewList" ref="previewer" :options="previewerOptions"></previewer>
      </div>
      <div class="yto-foot" slot="bottom" v-if="showAss.showReplyBtn">
        <x-button type="primary" class="yto-btn-primary" @click.native="popupShow = true">回复</x-button>
      </div>
    </view-box>
    <!-- &lt;!&ndash; 走件流程窗口开始 &ndash;&gt;-->
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
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="投诉回复"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <checklist v-if="complaintDetail.complaintType===3" class="reply-check" :max="1" :options="isHaveDutyList" v-model="isHaveDutyChecked" @on-change="changeDecisionResult"></checklist>
            <cell title="工单判定" value-align="left" v-if="showAss.showDetermine" @click.native="determineShow = true"
                  :value="determineValue" is-link></cell>
            <cell title="工单判定" value-align="left" v-if="showAss.cloudCollectionShowDetermine" @click.native="cloudCollectionDetermineShow = true"
                  :value="cloudCollectionDetermineValue" is-link></cell>
            <cell title="常用语" value-align="left" @click.native="commonLanguage" :value="templateSelect" is-link></cell>
            <x-input v-if="this.complaintDetail.complaintType === 2 || this.complaintDetail.complaintSourceExternal" title="手机号" v-model="siteCodeMobile" :max="15" placeholder="15位以内字符" type="text"></x-input>
            <x-textarea :max="200" v-model="dealContent"></x-textarea>
            <checklist class="reply-check" :max="1" :options="replyCheckList" v-model="replyChecked"></checklist>
          </group>

         <!-- <div class="upimg-box" v-show="showAss.showUpload">
            <div class="img-box">
              <div v-for="(item,index) in getImage" v-on:click="getImage.splice(index, 1)">
                <span><img :src="'data:image/jpeg;base64,'+item.code"/></span>
                <icon type="clear" class="clear"></icon>
              </div>
            </div>
            <div class="upimg-btn" v-on:click="toPicture" v-show="getImage.length < 6">+ 点击添加图片</div>
          </div>-->

          <div class="yto-foot" slot="bottom">
            <x-button type="primary" class="yto-btn-primary" @click.native="subReply()">回复</x-button>
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
            <!--<cell-box @click.native="" v-for="(item, index) in templateList">
              {{item.value}}
            </cell-box>-->
            <radio title="title" :options="templateList" v-model="templateSelect" @click.native="templateShow = false"
                   @on-change="change"></radio>
          </group>
        </view-box>
      </popup>
    </div>
    <!-- 工单判定窗口 -->
    <div v-transfer-dom>
      <popup v-model="determineShow" position="right" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="判定选择"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="determineShow = false">
          </x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <!--<cell-box @click.native="" v-for="(item, index) in determineList">
              {{item.value}}
            </cell-box>-->
            <radio title="title" :options="determineList" v-model="determineSelect"
                   @click.native="determineShow = false" @on-change="changeDetermine"></radio>
          </group>
        </view-box>
      </popup>
    </div>
    <!-- 云集工单判定窗口 -->
    <div v-transfer-dom>
      <popup v-model="cloudCollectionDetermineShow" position="right" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="判定选择"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="cloudCollectionDetermineShow = false">
          </x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <!--<cell-box @click.native="" v-for="(item, index) in determineList">
              {{item.value}}
            </cell-box>-->
            <radio title="title" :options="cloudCollectionDetermineList" v-model="cloudCollectionDetermineSelect"
                   @click.native="cloudCollectionDetermineShow = false" @on-change="changeCloudCollectionDetermine"></radio>
          </group>
        </view-box>
      </popup>
    </div>

    <!-- 责任网点 -->
    <div v-transfer-dom>
      <popup v-model="resOrgsShow" position="right" width="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="责任网点"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="resOrgsShow = false"></x-header>
          <group label-width="0em" label-margin-right="2em">
            <cell-box v-for="(item, index) in resOrgs" :key="index">
              <div class="yto-info">
                <div class="yto-title">
                  <div class="left">{{item.liablityStationName}}</div>
                  <div class="right">{{item.manageStationName}}</div>
                </div>
                <div class="yto-content">
                  <div class="left">
                    {{item.complaintFlag===0?'投诉':''}}
                    {{item.sendStationFlag===0?'始发':''}}
                    {{item.appealStatus===0?'':'申诉'}}
                    {{item.reminder===1?'催办':''}}
                    {{item.applyAssist===0?'申请协助':''}}
                    {{item.unClearDuty===1?'责任不清':''}}
                    {{item.transportReason===1?'运输中原因':''}}
                    {{item.irresistibleReason===1?'不可抗拒原因':''}}
                  </div>
                </div>
              </div>
            </cell-box>
          </group>
        </view-box>
      </popup>
    </div>
  </div>
</template>
<script>
  import {
    Cell,
    CellBox,
    CheckIcon,
    Checklist,
    Group,
    Msg,
    Popup,
    Previewer,
    Radio,
    Swiper,
    SwiperItem,
    Timeline,
    TimelineItem,
    ViewBox,
    XButton,
    XHeader,
    XInput,
    XTextarea,
    TransferDomDirective as TransferDom
  } from 'vux';
  import {
    fileUpload,
    getComplainDetail,
    getComplainReplyList,
    getComplainUsually,
    getResOrg,
    getUserInfo,
    sendInfo,
    submitReply,
    getcomplaintApiDetail,
    complaintApiReplyList,
    complaintApiReplyInsert,
    complaintStation,
    complaintComplete
  } from '../../service/service';
  import {appUtil, getFileUrl} from '../../common/commonUtils';
  import {ComplaintStatusEnum} from './complainConstantEnum';

  export default {
    directives: {
      TransferDom
    },
    components: {
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
      SwiperItem,
      Previewer,
      Checklist
    },
    computed: {},
    methods: {
      changeDecisionResult (val, label) {
        console.log('change', val, label)
      },
      previewImage(index) {
        this.$refs.previewer.show(index);
      },
      fileUrl: (fileId) => {
        return getFileUrl(fileId);
      },
      backClick() {
        this.$router.go(-1);
      },
      goToTell(phoneNum) {
        if (phoneNum) {
          appUtil.goToTell(phoneNum);
        }
      },
      // 选择常用语
      change(value, label) {
        this.dealContent = label;
      },
      // 选择工单判定
      changeDetermine(value, label) {
        this.determineValue = label;
      },
      // 选择云集工单判定
      changeCloudCollectionDetermine(value, label) {
        this.cloudCollectionDetermineValue = label;
      },
      // 走件信息
      async getSendInfo() {
        let getData = await
          sendInfo(this.complaintDetail.waybillNo);
        this.sendInfo = getData.data.list;
        if (typeof this.sendInfo === 'undefined' || this.sendInfo.length === 0) {
          this.showEmpty = true;
        }
      },
      // 提交回复信息
      async subReply() {
        // 1.校验
        if (!this.dealContent || this.dealContent.trim().length === 0) {
          this.$vux.alert.show({
            title: '错误',
            content: '回复内容为空'
          });
          setTimeout(() => {
            this.$vux.alert.hide();
          }, 3000);
          return;
        }
        // 回复
        let dm = 'reply';
        if (this.replyChecked && this.replyChecked.length > 0) {
          dm = this.replyChecked[0];
        }
        if (this.complaintDetail.complaintType === 3){
          if (!this.isHaveDutyChecked && this.isHaveDutyChecked.length === 0){
            this.$vux.alert.show({
              title: '错误',
              content: '升级投诉需要选择有责或者无责'
            });
            setTimeout(() => {
              this.$vux.alert.hide();
            }, 3000);
            return;
          }
        }
        let attachmentList = [];
        for (let x in this.getImage) {
          attachmentList.push({
            // 投诉id
            complaintId: this.complaintDetail.id,
            // 投诉类型
            complaintType: this.complaintDetail.complaintType,
            // 原始文件名
            fileName: this.getImage[x].id,
            // 目前固定是0，表示图片
            fileType: 0,
            // 文件扩展名
            fileExtension: 'jpeg',
            // TFS文件名
            fileAddress: this.getImage[x].id,
            // 文件大小，单位KB
            fileSize: this.getImage[x].size
          });
        }

        if (dm === 'complete'){
          //完结工单
           await complaintComplete({
            complaintId: this.complaintDetail.id,
            replyContent: this.dealContent,
          });
        } else {
          //申请完结
          if (dm === 'applyFinish'){
            if (this.complaintDetail.complaintType === 2 || this.complaintDetail.complaintSourceExternal){
              // 1.校验
              if (!this.siteCodeMobile || this.siteCodeMobile.trim().length === 0) {
                this.$vux.alert.show({
                  title: '错误',
                  content: '手机号不能为空'
                });
                return;
              } else if ( !/^1(3|4|5|6|7|8)\d{9}$/.test(this.siteCodeMobile) &&
                !/^(\d{3,4}(-|\s))\d{7,8}((-|\s)\d{1,4})?$/.test(
                  this.siteCodeMobile
                )){
                this.$vux.alert.show({
                  title: '错误',
                  content: '格式不正确，手机号或座机（格式：021-69773588）'
                });
                return;
              }
              if (this.complaintDetail.complaintSourceName.indexOf('云集') !== -1 ){
                this.cbbCainiao = this.cloudCollectionDetermineSelect;
              } else {
                //菜鸟工单判定、贝贝网
                this.cbbCainiao = this.determineSelect;
              }
            }

            this.chkApplyComplete = true;
            this.chkComplaintAppeal = false;
          } else if (dm === 'appeal'){  //责任申诉
            this.chkApplyComplete = false;
            this.chkComplaintAppeal = true;
          } else if (dm === 'cancelApplyFinish'){ //取消申请完结
            this.chkApplyComplete = false;
            this.chkComplaintAppeal = false;
            this.showAss.showCancelApplyEnd = true;
          } else {
            this.chkApplyComplete = false;
            this.chkComplaintAppeal = false;
            this.showAss.showCancelApplyEnd = false;
          }
          if (this.complaintDetail.complaintType === 3){
            if (this.isHaveDutyChecked[0] === 2){}
              this.isHaveDuty = 0;
          } else {
            this.isHaveDuty = this.isHaveDutyChecked[0];
          }
          this.replyMsgContent = this.dealContent;
          await complaintApiReplyInsert({
            complaintId: this.complaintDetail.id,
            replyContent: this.dealContent,
            replyMsgContent: this.replyMsgContent,
            /* operate: dm,*/
            cbbCainiao: this.cbbCainiao,
            /*attachments: attachmentList,*/
            phoneNo: this.siteCodeMobile,
            chkApplyComplete:this.chkApplyComplete,
            chkComplaintAppeal:this.chkComplaintAppeal,
            isHaveDuty: this.isHaveDuty,
            chkCancelApplyComplete: this.showAss.showCancelApplyEnd
          });
        }
        this.$vux.alert.show({
          title: '操作成功',
          content: '回复成功'
        });
        this.popupShow = false;
        // 刷新投诉信息及回复列表
        this.getResOrgs();
        this.clearReplyContent();
        this.reloadData();
      },
      // 常用语
      async commonLanguage() {
        this.templateList = [];
        let res = await getComplainUsually({complainType: this.complaintDetail.complaintType});
        let temList = res.data.items;
        for (let x in temList) {
          this.templateList.push({value: temList[x].content, key: temList[x].referred});
        }
        this.templateShow = true;
      },
      toPicture() {
        let num = 6 - this.getImage.length;
        appUtil.choosePic(num);
      },
      // 投诉详情
      async getDetail() {
        let detailData = await getcomplaintApiDetail({id: this.complaintDetail.id, waybillNo: this.complaintDetail.waybillNo});
        let newDetail = detailData.data;
        newDetail.index = this.complaintDetail.index;
        this.complaintDetail = newDetail;
        if (this.complaintDetail.images) {
          this.previewList = [];
          for (let ima of this.complaintDetail.images) {
            this.previewList.push({src: this.fileUrl(ima.fileAddress)});
          }
        }
      },
      // 获取责任网点
      async getResOrgs() {
        let orgs = await
          complaintStation({complaintId: this.complaintDetail.id, limit :20});
        let res = orgs.data.items;
        this.resOrgs = [];
/*
        this.resOrgs = orgs.data.items;
*/
        this.resOrgText = '';
        if (res.length > 0) {
          for (let x in res) {
            if (res[x].complaintFlag === 0){
              this.resOrgs.push(res[x]);
              this.resOrgText += res[x].liablityStationName + ',';
            }
          }
          this.resOrgText = this.resOrgText.substring(0, this.resOrgText.length - 1);
        }
      },
      // 投诉回复列表
      async listReply() {
        let replyLists = await
          complaintApiReplyList({complaintId: this.complaintDetail.id, limit: 100, pageNo:0});
        if (replyLists.data){
          this.replyList = replyLists.data.items;
        }
      },
      // 设置组件显示状态
      setAssemblyShow() {
        this.replyCheckList = [];
        // 回复按钮状态
        this.showAss.showReplyBtn = false;

        // 为接单网点
        if (this.userInfo.currentOrgCode === this.complaintDetail.acceptStationCode) {
          this.stationType = 'accept';
        } else if (this.resOrgs.length > 0) {
          for (let x in this.resOrgs) {
            // 为责任网点
            if ((this.resOrgs[x].liablityStationCode === this.userInfo.currentOrgCode || this.resOrgs[x].complaintStationCode === this.userInfo.currentOrgCode) && this.resOrgs[x].complaintFlag === 0) {
              this.stationType = 'liability';
                this.currentResOrg = this.resOrgs[x];
              break;
            }
          }
        }
        // 普通投诉
        if (this.complaintDetail.complaintType === 1) {
          // 责任网点
          if (this.stationType === 'liability') {
            // 处理中
            if (this.complaintDetail.stateId === 30) {
              if (this.currentResOrg && this.currentResOrg.appealStatus === 0) {
                this.showAss.showAppeal = true;
              }
              if (this.complaintDetail.complaintSourceName.indexOf('云集') !== -1 ){
                this.showAss.cloudCollectionShowDetermine = true;
              }
              if (this.complaintDetail.complaintSourceName.indexOf('贝贝网') !== -1 ){
                this.showAss.showDetermine = true;
              }
              this.showAss.showApplyEnd = true;
              this.showAss.showReplyBtn = true;
              // 申请完结or系统申请完结
            } else if (this.complaintDetail.stateId === 40 || this.complaintDetail.stateId === 45) {
              if (this.complaintDetail.complaintSourceName !== '贝贝网投诉') {
                this.showAss.showReplyBtn = true;
              }
            }
            // 接单网点
          } else if (this.stationType === 'accept') {
            // 处理中or申请完结
            if (this.complaintDetail.stateId === 30 || this.complaintDetail.stateId === 40) {
              //申请完结状态接单网点有取消申请完结权限
              if (this.complaintDetail.stateId === 40){
                this.showAss.showCancelApplyEnd = true;
              }
              if (this.complaintDetail.stateId === 30){}
              // 未申请协助可以完结
              if (this.complaintDetail.isApplyAssist !== 40 && this.complaintDetail.isApplyAssist !== 20) {
                if (!this.complaintDetail.complaintSourceExternal){
                  this.showAss.showEnd = true;
                }
              }
              this.showAss.showReplyBtn = true;
            }
          } else {
            this.showAss.showReplyBtn = true;
          }
          // 淘宝投诉
        } else if (this.complaintDetail.complaintType === 2) {
          // 责任网点
          if (this.stationType === 'liability') {
            // 处理中||菜鸟已回复
            if (this.complaintDetail.stateId === 30 || this.complaintDetail.stateId === 80) {
              this.showAss.showDetermine = true;
              this.showAss.showApplyEnd = true;
              this.showAss.showReplyBtn = true;
              if (this.complaintDetail.stateId === 30){
                if (this.currentResOrg && this.currentResOrg.appealStatus === 0) {
                  this.showAss.showAppeal = true;
                }
              }
            }
          }
          // 升级投诉
        } else if (this.complaintDetail.complaintType === 3) {
          // 责任网点
          if (this.stationType === 'liability') {
            // 处理中
            if (this.complaintDetail.stateId === 30) {
              if (this.currentResOrg && this.currentResOrg.appealStatus === 0) {
                this.showAss.showAppeal = true;
              }
              this.showAss.showApplyEnd = true;
              this.showAss.showReplyBtn = true;
              this.showAss.showUpload = true;
              // 申请完结
            } else if (this.complaintDetail.stateId === 40) {
              this.showAss.showReplyBtn = true;
              this.showAss.showUpload = true;
            }
          }
        }
        if (this.showAss.showAppeal) {
          this.replyCheckList.push({key: 'appeal', value: '责任申诉'});
        }
        if (this.showAss.showApplyEnd) {
          this.replyCheckList.push({key: 'applyFinish', value: '申请完结'});
        }
        if (this.showAss.showEnd) {
          this.replyCheckList.push({key: 'complete', value: '完结'});
        }
        if (this.showAss.showCancelApplyEnd) {
          this.replyCheckList.push({key: 'cancelApplyFinish', value: '取消申请完结'});
        }
      },
      async orderMethod() {
        let obj = await
          getUserInfo({});
        this.userInfo.currentOrgName = obj.data.stationName;
        this.userInfo.currentOrgCode = obj.data.stationCode;
        // 详情
        await this.getDetail();
        // 获取责任网点
        // 回复信息
        this.listReply();
        // 走件信息
        this.getSendInfo();
        await this.getResOrgs();
        // 设置组件显示状态
        this.setAssemblyShow();
      },
      // 上传图片
      async upFile(baseFile) {
        let data = await fileUpload({file: baseFile.code});
        baseFile.id = data.data.id;
        this.getImage.push(baseFile);
      },
      clearReplyContent() {
        this.currentResOrg = null;
        this.showAss.showReplyBtn = false;
        this.showAss.showDetermine = false;
        this.showAss.showEnd = false;
        this.showAss.showApplyEnd = false;
        this.showAss.showAppeal = false;
        this.showAss.showUpload = false;
        this.isCheckAppeal = false;
        this.isCheckApplyEnd = false;
        this.isCheckEnd = false;
        this.getImage = [];
        this.replyCheckList = [];
        this.replyChecked = [];
        this.stationType = '';
        this.isHaveDuty = '';
        this.chkApplyComplete = false;
        this.chkComplaintAppeal = false;
      },
      async reloadData() {
        await this.getDetail();
        this.listReply();
        this.setAssemblyShow();
      },
      async nextDetails(index) { // 滑动下一个详情
        this.clearReplyContent();
        this.$vux.loading.show({
          text: '加载中'
        });
        setTimeout(() => {
          this.$vux.loading.hide();
        }, 3000);
        this.complaintDetail = Object.assign({}, this.complainList[index]);
        this.complaintDetail.index = index;
        await this.getDetail();
        // 回复信息
        this.listReply();
        // 走件信息
        this.getSendInfo();
        // 获取责任网点
        await this.getResOrgs();
        this.setAssemblyShow();
        this.$vux.loading.hide();
      },
      subscribe() {
        appUtil.subscribe(this.complaintDetail.waybillNo);
      },
      showWaybillSidebarWithWaybillNo () {
        try {
          appUtil.showWaybillSidebarWithWaybillNo(this.complaintDetail.waybillNo);
        } catch (e) {
          this.isShow = true;
        }
      }
    },
    created() {
      this.complaintDetail = this.$route.params.item;
      this.complainList = this.$route.params.complainList;
      this.orderMethod();
      // 每张图片调用一次该方法
      window.getPicture = (code, size) => {
        if (size) {
          size = Math.round(size);
        }
        let file = {code: code, size: size};
        this.upFile(file);
      };
      /*
      this.getPictures();//获取图片
      */
      window.goToBack = () => {
        this.backClick();
      };
      // 加载下一条结束
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
            if (this.complaintDetail.index === 0) {
              this.$vux.toast.show({
                text: '已经到底了。'
              });
            } else {
              this.nextDetails(this.complaintDetail.index - 1);
            }
          } else {
            if (this.complaintDetail.index === this.complainList.length - 1) {
              this.$vux.toast.show({
                text: '已经到底了。'
              });
            } else {
              this.nextDetails(this.complaintDetail.index + 1);
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
        previewerOptions: {
          getThumbBoundsFn(index) {
            // find thumbnail element
            let thumbnail = document.querySelectorAll('.previewer-img')[index];
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
        // 投诉类型
        enumComplaintType: {
          '1': '普通投诉',
          '2': '淘宝投诉',
          '3': '升级投诉'
        },
        // 处理状态
        ComplaintStatusEnum,
        // 当前网点类型 accept:接单网点/liability:责任网点
        stationType: '',
        resOrgs: [],
        currentResOrg: null,
        // 责任网点
        resOrgText: '',
        userInfo: {},
        // 投诉详情信息
        complaintDetail: {},
        previewList: [],
        // 责任网点show字段
        resOrgsShow: false,
        showAss: {
          // 回复按钮show状态
          showReplyBtn: false,
          // 工单判定show状态
          showDetermine: false,
          // 完结show状态
          showEnd: false,
          // 申请完结show状态
          showApplyEnd: false,
          // 责任申诉show状态
          showAppeal: false,
          // 上传附件show状态
          showUpload: false,
          //取消申请完结
          showCancelApplyEnd:false,
          // 云集工单判定show状态
          cloudCollectionShowDetermine: false
        },
   // 已选图片
        getImage: [],
        popupShow: false,
        canBeReply: false,
        // query:问题件查询/deal:问题件处理(默认为查询)
        businessType: 'query',
        handleStatus: null,
        replyList: [],
        dealContent: '',
        replyMsgContent: '',
        // 责任申诉
        isCheckAppeal: false,
        // 申请完结
        isCheckApplyEnd: false,
        // 完结
        isCheckEnd: false,
        sendShow: false,
        sendInfo: [],
        showEmpty: false,
        templateShow: false,
        templateList: [],
        // '常用语'
        templateSelect: '',
        // 工单判定show
        determineShow: false,
        // 工单判定状态
        determineList: [
          {key: 12, value: '判定成立'},
          {key: 14, value: '判定不成立'},
          {key: 16, value: '申请小二协助'}
        ],
        // 云集工单判定状态
        cloudCollectionDetermineList: [
          {key: 0, value: '已联系核实，此件已正常签收，感谢您的反馈！；'},
          {key: 1, value: '已联系核实，网点仍在处理中，有问题您可联系！；'},
          {key: 2, value: '因客服核实信息时，您的电话未接通。如需帮助您可联系快递网点！；'},
          {key: 3, value: '您反馈的问题需自己联系商家处理，感谢您的反馈；'}
        ],
        // 云集工单判定已选key
        cloudCollectionDetermineSelect: '',
        // 云集工单判定show
        cloudCollectionDetermineShow: false,
        // 工单判定已选value
        cloudCollectionDetermineValue: '',
        //工单判定
        cbbCainiao:'',
        // 工单判定已选key
        determineSelect: '',
        replyCheckList: [],
        replyChecked: [],
        isHaveDutyList: [ {key: 1, value: '有责'},
          {key: 2, value: '无责'}],
        isHaveDutyChecked:[1],
        // 工单判定已选value
        determineValue: '',
        complainList: [],
        siteCodeMobile:'',
        isShow: false,
        chkApplyComplete: false,
        chkComplaintAppeal:false,
        isHaveDuty: ''
      };
    }
  }
  ;
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
</style>
