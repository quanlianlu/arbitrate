<template>
  <div style="height:100%;">
    <div class="yto-codeInfo" v-on:click="sendShow = true" @click="showWaybillSidebarWithWaybillNo"></div>
    <view-box body-padding-bottom="46px" body-padding-top="46px">
      <!--header-->
      <x-header
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"
        :title="'催件详情'"
        :left-options="{backText:'',preventGoBack:true}" @on-click-back="backClick">
        <div v-if="urgeExpressDetail.checkingType == 0" slot="right" @click="subscribe()">
          <img src="../../assets/img/ding.png">
        </div>
      </x-header>
      <!--content-->
      <div style="min-height:100%;transform: translate3d(0px, 0px, 0px); transition: all 300ms ease 0s;">
        <group label-width="4.5em" label-margin-right="2em" label-align="right" style="width: 100%;">
          <cell v-if="urgeExpressDetail.checkingType == 0" title="运单号" value-align="left">
            <div class="yto-title">
              <div class="left">{{urgeExpressDetail.wayBillNo }}</div>
              <div class="right red">{{urgeExpressDetail.prescription }}</div>
            </div>
          </cell>
          <cell v-if="urgeExpressDetail.checkingType == 1" title="订单号" value-align="left">
            <div class="yto-title">
              <div class="left">{{urgeExpressDetail.orderNo }}</div>
              <div class="right red">{{urgeExpressDetail.prescription }}</div>
            </div>
          </cell>
          <cell title="客户姓名" value-align="left">
            <span>{{urgeExpressDetail.customerName }}</span>
            <span style="padding-right: 10px;">{{urgeExpressDetail.customerSex === 1 ? '男' : '女' }}</span>
          </cell>
         <!-- <cell title="客户电话" value-align="left">
            <span>{{urgeExpressDetail.customerTel }}</span>
          </cell>-->
          <cell title="处理状态" value-align="left">
            <span>{{enumState[urgeExpressDetail.stateId] }}</span>
          </cell>
          <cell title="催件时间" value-align="left">
            <span>{{urgeExpressDetail.complaintTime }}</span>
          </cell>
          <cell title="发件网点" value-align="left">
            <span>{{urgeExpressDetail.sendStationName }}</span>
          </cell>
          <cell title="催件网点" value-align="left">
            <div style="width: 80%; float: left;">{{urgeExpressDetail.objectiveStationName }}</div>
            <x-button
              v-if="urgeExpressDetail.stateId != 60 && this.userStationCode == urgeExpressDetail.sendStationCode"
              type="primary"
              style="width: 20%; float: right; padding-left:0; padding-right: 0;"
              @click.native="stationShow = true">修改
            </x-button>
          </cell>
          <cell title="催件内容" :value="urgeExpressDetail.complaintContent" value-align="left" align-items="flex-start">
          </cell>
        </group>

        <!--回复记录-->
        <div class="reply-title" v-show="urgeExpressReply.length > 0">回复记录</div>
        <group label-width="4.5em" label-margin-right="2em" label-align="right" v-for="(item,index) in urgeExpressReply"
               :key="item.index"
               gutter="10px"
               style="width: 100%;">
          <cell title="回复人" value-align="left">
            <span>{{item.replyStationCode}}/{{item.replyStationName}}</span><br/>
            <span>{{item.replyUserCode}}/{{item.replyUserName}}</span>
          </cell>
          <cell title="回复时间" :value="item.replyTime.replace('T',' ')" value-align="left"></cell>
          <cell title="回复内容" :value="item.replyContent" value-align="left"></cell>
        </group>
      </div>

      <!--底部按钮-->
      <!-- <flexbox style="width:100%;position:absolute;left:0;bottom:0;z-index:100;">
         <flexbox-item v-if="urgeExpressDetail.stateId != 60">
           <x-button type="primary" @click.native="showCheck()">回复</x-button>
         </flexbox-item>
       </flexbox>-->
      <div v-if="urgeExpressDetail.stateId != 60 &&
         (this.userStationCode == urgeExpressDetail.sendStationCode || this.userStationCode == urgeExpressDetail.objectiveStationCode )"
           class="yto-foot" slot="bottom">
        <x-button type="primary" class="yto-btn-primary" @click.native="showCheck()">回复</x-button>
      </div>
    </view-box>

    <!-- 走件流程窗口开始 -->
    <div v-transfer-dom　v-if = "isShow">
      <popup v-model="sendShow" position="right" width="70%" @click.native="getSendInfo(urgeExpressDetail.wayBillNo)">
        <timeline>
          <timeline-item v-for="(item, index) in sendInfo" :key="index" class="sendBox">
            <h4 :class="[index === 0 ? 'recent' : '']">[{{item.opName}}]&nbsp;&nbsp;{{item.opOrgName}}</h4>
            <p :class="[index === 0 ? 'recent' : '']">{{item.opTime}}</p>
          </timeline-item>
        </timeline>
        <msg v-if="showEmpty" title="对不起" description="该单号无走件流程" icon="info"></msg>

        <group v-if="showEmpty2" title="问题件信息" class="reply-title">
          <cell title="运单号" :value="issueDetail.waybillNo" value-align="left"></cell>
          <cell title="上报网点" :value="issueDetail.orgName" value-align="left"></cell>
          <cell title="上报人" :value="issueDetail.createUserName" value-align="left"></cell>
          <cell title="接收网点" :value="issueDetail.recOrgName" value-align="left"></cell>
          <cell title="上报时间" :value="issueDetail.createTime" value-align="left"></cell>
          <cell title="问题种类" :value="issueDetail.issueTypeName" value-align="left" align-items="flex-start"></cell>
          <cell title="问题描述" :value="issueDetail.issueDesc" value-align="left" align-items="flex-start"></cell>
        </group>
      </popup>
    </div>

    <!--回复 窗口-->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" width="100%" height="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="催件回复"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
          <group label-width="4.5em" label-margin-right="2em">
            <cell title="常用语" value-align="left" @click.native="commonLanguage" :value="templateSelect" is-link></cell>
            <x-textarea :max="200" v-model="dealContent"></x-textarea>
            <!-- <checklist class="reply-check" :max="1" :options="replyCheckList" v-model="replyChecked"></checklist>-->
          </group>
          <div v-show=" !isCaiNiao ">
            <label><input type="checkbox" v-model=" checked" value="60"/>完结</label>
          </div>
          <div v-show="isCaiNiao && urgeExpressDetail.stateId == 35">
            <label><input type="checkbox" v-model="checked" value="60">完结</label>
          </div>
          <div v-show="isCaiNiao && urgeExpressDetail.stateId == 30">
            <label><input type="checkbox" v-model="checked" value="35">回复菜鸟</label>
          </div>
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
            <radio title="title" :options="templateList" v-model="templateSelect" @click.native="templateShow = false"
                   @on-change="change"></radio>
          </group>
        </view-box>
      </popup>
    </div>

    <!--修改网点窗口 -->
    <div v-transfer-dom>
      <popup v-model="stationShow" position="right" width="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="催件网点修改"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="stationShow = false"></x-header>

          <group label-width="4.5em" label-margin-right="2em">
            <x-input title="" placeholder="输入网点名称或网点代码" text-align="center" v-model="searchText"
                     @on-change="getBranch"></x-input>
          </group>

          <group label-width="4.5em" label-margin-right="2em" style="padding-bottom:10px; overflow: hidden;">
            <cell-box v-for="item in branchList" :key="item.index" @click.native="modifyStation(item)">
              {{item.code}}   {{item.name}}
            </cell-box>
          </group>

        </view-box>
      </popup>
    </div>

  </div>
</template>
<script>
  import {
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
    Flexbox,
    FlexboxItem,
    Checklist,
    TransferDomDirective as TransferDom
  } from 'vux';
  import {appUtil} from '../../common/commonUtils';
  import {
    problempieceByWaybillNo,
    getUserInfo,
    getUrgeExpressDetail,
    getUrgeExpressReply,
    getComplainUsually,
    urgeExpressPostReply,
    urgeExpressModifyStation,
    searchBranch,
    sendInfo
  } from '../../service/service';

  export default {
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
      Flexbox,
      FlexboxItem,
      Checklist
    },
    directives: {
      TransferDom
    },
    computed: {},
    methods: {
      // 获取用户信息
      async getUser() {
        let obj = await getUserInfo({});
        this.userStationCode = obj.data.stationCode;
        this.userStationName = obj.data.stationName;
      },
      // 添加订阅按钮
      subscribe() {
        appUtil.subscribe(this.urgeExpressDetail.wayBillNo);
      },
      // 点击回复时检测选项框状态
      showCheck() {
        this.popupShow = true;
        // 检测该催件的回复状态
        if (this.urgeExpressDetail.microMessageSource === '菜鸟平台催件' || this.urgeExpressDetail.microMessageSource === '菜鸟平台物流举证') {
          this.isCaiNiao = true;
        }
      },
      // 同时获取走件
      async getSendInfo() {
        // 走件信息
        let getData = await sendInfo(this.urgeExpressWayBillNo);
        this.sendInfo = getData.data.list;
        if (typeof this.sendInfo === 'undefined' || this.sendInfo.length === 0) {
          this.showEmpty = true;
        }
      },
      async getIssueDetail() {
        // 问题件信息
        let issueDetail = await problempieceByWaybillNo({waybillNo: this.urgeExpressWayBillNo});
        this.issueDetail = issueDetail.data;
        if (typeof this.issueDetail !== 'undefined' || this.issueDetail.length !== 0) {
          this.showEmpty2 = true;
        }
      },
      // 提交修改网点
      async modifyStation(item) {
        let id = this.urgeExpressDetail.id;
        let code = item.code;
        let name = item.name;

        await urgeExpressModifyStation({
          id: id,
          objectiveStationCode: code,
          objectiveStationName: name
        });
        this.$vux.alert.show({
          title: '操作成功',
          content: '修改成功'
        });
        // 更新页面
        this.clearStatue();
        this.ajaxUrgeExpressDetail();
        this.ajaxUrgeEXpressReply();
      },
      // 获取网点
      async getBranch() {
        // 判断网点编号或名称是否为空
        if (this.searchText === '') {
          this.$vux.alert.show({
            title: '错误',
            content: '网点编号或名称不能为空！'
          });
        } else {
          let vali = {stationName: this.searchText};
          var reg = /^(([0-9])|([1-9]([0-9]+)))$/;
          if (reg.test(this.searchText)) {
            vali = {stationCode: this.searchText};
          }
          let getList = await searchBranch(vali);
          this.getListJson = getList.data;
          this.branchList = this.getListJson.list;
        }
      },
      // 选择常用语
      change(value, label) {
        this.dealContent = label;
      },
      // 常用语
      async commonLanguage() {
        this.templateList = [];
        let res = await getComplainUsually({complainType: '2'});
        let temList = res.data.items;
        for (let x in temList) {
          this.templateList.push({value: temList[x].content, key: temList[x].referred});
        }
        this.templateShow = true;
      },
      backClick() {
        this.$router.go(-1);
      },
      // 获取催件详情
      async ajaxUrgeExpressDetail() {
        let detailData = await getUrgeExpressDetail({urgingExpressId: this.urgeExpressId, waybillNo: this.urgeExpressDetail.waybillNo});
        let newDetail = detailData.data;
        this.urgeExpressDetail = newDetail;
      },
      // 获取催件回复列表
      async ajaxUrgeEXpressReply() {
        let getUrgeEXpressReply = await getUrgeExpressReply({urgeExpressId: this.urgeExpressId});
        this.getUrgeExpressReplyListJson = getUrgeEXpressReply.data.items;
        this.urgeExpressReply = this.urgeExpressReply.concat(this.getUrgeExpressReplyListJson);
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
        let stateId = this.checked[0];
        let replyContent = this.dealContent;
        let urgeExpressId = this.urgeExpressDetail.id;
        // 检查选中状态是否为空
        if (stateId == null || stateId === '') {
          await urgeExpressPostReply({
            stateId: this.urgeExpressDetail.stateId,
            replyContent: replyContent,
            urgeExpressId: urgeExpressId
          });
        } else {
          await urgeExpressPostReply({
            stateId: stateId,
            replyContent: replyContent,
            urgeExpressId: urgeExpressId
          });
        }

        this.$vux.alert.show({
          title: '操作成功',
          content: '回复成功'
        });
        this.clearStatue();
        this.ajaxUrgeEXpressReply();
        this.ajaxUrgeExpressDetail();
      },
      // 清空状态
      clearStatue() {
        this.searchText = null;
        this.stationShow = false;
        this.dealContent = null;
        this.templateSelect = null;
        this.popupShow = false;
        this.templateShow = false;
        this.isCaiNiao = false;
        this.checked = [];
        this.urgeExpressReply = [];
        this.urgeExpressDetail = {};
        this.sendShow = false;
      },
      showWaybillSidebarWithWaybillNo () {
        try{
          appUtil.showWaybillSidebarWithWaybillNo(this.urgeExpressDetail.wayBillNo);
        }catch (e) {
            this.isShow = true;
        }
      }
    },
    created() {
      // 获取催件ID
      this.urgeExpressId = this.$route.params.id;
      this.urgeExpressWayBillNo = this.$route.params.wayBillNo;
      // 发送ajax请求获取催件详情
      this.ajaxUrgeExpressDetail();
      this.ajaxUrgeEXpressReply();
      this.getSendInfo();
      // 获取用户信息
      this.getUser();
      this.getIssueDetail();
      window.goToBack = () => {
        this.backClick();
      };
    },
    data() {
      return {
        issueDetail: {},
        userStationName: '',
        userStationCode: '',
        getListJson: [],
        isCaiNiao: false,
        checked: [],
        branchList: [],
        stationCode: '',
        stationName: '',
        searchText: '',
        stationShow: false,
        dealContent: '',
        templateSelect: '',
        popupShow: false,
        showEmpty: false,
        showEmpty2: false,
        templateShow: false,
        templateList: [],
        urgeExpressId: null,
        urgeExpressWayBillNo: null,
        urgeExpressDetail: {},
        urgeExpressReply: [],
        getUrgeExpressReplyListJson: [],
        sendShow: false,
        sendInfo: null,
        enumState: {
          '30': '处理中',
          '35': '处理中',
          '60': '已完结'
        },
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

  .yto-info {
    flex: 2;
  }

  .left {
    text-align: left;
    max-width: 320px;
    flex: 1;
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
    .red {
      color: #ff0000;
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

</style>

