<template>
  <div style="height:100%;">
    <view-box ref="viewBox" body-padding-bottom="46px" body-padding-top="26px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="问题件上报"
                :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
        <a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
          <x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
        </a>
        <a slot="right" @click="subscribe">
          <img src="../../assets/img/ding.png">
        </a>
        <a v-if="isSingle === true" :class="['unLock', isLock ? 'lock':'']" slot="right"
           v-on:click="isLock = !isLock"></a>
      </x-header>
      <group label-width="4.5em" label-margin-right="2em" label-align="right">
        <x-input title="运单号" placeholder="必填" :show-clear="false" v-model="parameters.waybillNo"
                 @on-blur="waybillNoChange(false)" type="text"> <!--type="number"-->
          <img slot="right" class="code-img" src="../../assets/img/saoyisao@2x.png" v-on:click="getQRScanapp">
        </x-input>
        <cell title="问题类型" :value="bigType" value-align="left"
              @click.native="showType = true;showPopup = true;parameters.push = true"
              is-link></cell>
        <cell class="noline" title=" " :value="smallType" value-align="left"
              @click.native="clickSmall();showPopup = true"
              is-link></cell>
      </group>
      <div class="pushxz">
        <label
          v-if="parameters.issueType == '03' || parameters.issueType == '17' || parameters.issueType == '18' || parameters.issueType == '27'">
          <input type="checkbox" v-model="parameters.push" value="true"/>推送给行者业务员</label>
      </div>
      <group title="" label-width="4.5em" label-margin-right="2em" label-align="right">
        <cell title="接收组织" :value="receiveOrgText" is-link value-align="left" @click.native="getReceiveOrg"></cell>
        <cell title="常用语" value-align="left" @click.native="commonLanguage" :value="templateSelect" is-link></cell>
        <x-textarea title="问题描述" placeholder="请填写详细信息" v-model="parameters.issueDesc" :show-counter="false" :rows="3"
                    :max="400"></x-textarea>
        <x-input title="客户电话" placeholder="15位以内字符" :show-clear="false" v-model="parameters.mobile"
                 type="text"></x-input>
        <x-input title=" " placeholder="15位以内字符" :show-clear="false" v-model="parameters.mobile2" type="text"></x-input>
        <x-input title=" " placeholder="15位以内字符" :show-clear="false" v-model="parameters.mobile3" type="text"></x-input>
        <x-input title=" " placeholder="15位以内字符" :show-clear="false" v-model="parameters.mobile4" type="text"></x-input>
        <x-input title="收款账号" placeholder="" :show-clear="false" v-model="parameters.account" type="text"></x-input>
      </group>
      <div class="upimg-box" v-if="isSingle === true">
        <div class="img-box">
          <div v-for="(item,index) in getImage" :key="index" v-on:click="getImage.splice(index, 1)">
            <span><img :src="'data:image/jpeg;base64,'+item"/></span>
            <icon type="clear" class="clear"></icon>
          </div>
        </div>
        <div class="upimg-btn" v-on:click="toPicture" v-show="getImage.length < 8">+ 点击添加图片</div>
      </div>
      <div style="padding:18px 20px;">
        <x-button type="primary" @click.native="searchSubmit" :disabled="reportFlag">确认上报</x-button>
      </div>
      <!-- 批量上报，保存最后十个运单号 -->
      <div style="padding:0px 20px;" v-if="isSingle === false">
        <group style="padding-bottom:1px; overflow: hidden;">
          <cell-box v-for="(item,index) in reportWaybillNos" :key="item">
            {{item}}
          </cell-box>
        </group>
      </div>
    </view-box>
    <tabbar>
      <tabbar-item :selected="true" @on-item-click="isSingle = true">
        <img slot="icon" src="../../assets/img/zuhe_nor@2x.png">
        <img slot="icon-active" src="../../assets/img/zuhe@2x.png">
        <span slot="label" class="tabar-a">单票上报</span>
      </tabbar-item>
      <tabbar-item @on-item-click="isSingle = false">
        <img slot="icon" class="tabbar-img" src="../../assets/img/danhao_nor@2x.png">
        <img slot="icon-active" src="../../assets/img/danhao@2x.png">
        <span slot="label" class="tabar-a">批量上报</span>
      </tabbar-item>
    </tabbar>
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
    <!-- -->
    <div v-transfer-dom>
      <popup v-model="showPopup" id="popup_box">
        <div>
          <tab>
            <tab-item :selected="showType" @on-item-click="showType = true">大类</tab-item>
            <tab-item :selected="!showType" @on-item-click="showType = false">小类</tab-item>
          </tab>
        </div>
        <div class="popup">
          <load-more tip="正在加载" v-show="showLoading"></load-more>
          <group v-show="showType">
            <cell-box @click.native="getSmall(item)" v-for="(item, index) in bigText" :key="index">
              {{item.bigName}}
            </cell-box>
          </group>
          <group v-show="!showType">
            <cell-box @click.native="setSmall(item)" v-for="(item, index) in smallNewText" :key="index">
              {{item.smallTemplet}}
            </cell-box>
          </group>
        </div>
      </popup>
      <popup v-model="popupShow" position="right" width="100%">
        <view-box body-padding-bottom="0" body-padding-top="26px">
          <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="接收组织"
                    :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
          <group label-width="0em" label-margin-right="2em">
            <cell-box class="yto-cell-link" @click.native="setReceiveOrg(item)" v-for="(item, index) in receiveOrgList"
                      :key="index" is-link>
              {{item.opOrgName}}
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
    Checker,
    CheckerItem,
    Datetime,
    DatetimeRange,
    Flexbox,
    FlexboxItem,
    Group,
    Icon,
    LoadMore,
    Popup,
    Radio,
    Selector,
    Sticky,
    Tab,
    Tabbar,
    TabbarItem,
    TabItem,
    TransferDomDirective as TransferDom,
    ViewBox,
    XButton,
    XHeader,
    XInput,
    XNumber,
    XTextarea
  } from 'vux';
  import {
    getProblemType,
    getStationInfo,
    getUserInfo,
    report,
    reportTemplate,
    searchReceiveOrg,
    searchReceiveOrgRemove,
    searchReceiveGetOrg
  } from '../../service/service';
  import {appUtil} from '../../common/commonUtils';
  import {constant} from '../../common/publicConstant';
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
      Popup,
      Tab,
      TabItem,
      CellBox,
      Icon,
      Sticky,
      LoadMore,
      Tabbar,
      TabbarItem,
      Radio
    },
    data() {
      return {
        serviceList: ['未处理', '处理中', '处理完成', '已撤销'],
        complaintTypeList: ['全部', '普通投诉', '淘宝投诉', '升级投诉'],
        handleStateList: ['全部', '未处理', '处理中', '申请完结', '已完结', '系统申请完结', '菜鸟已回复'],
        complaintSourceList: ['全部', '电话', '微信', '满意度调研', '快运', '语音留言', 'B网', '贝贝网', '在线客服', '支付宝', '圆通会员', '圆通官网'],
        ListIndex: 0,
        selectStartDate: '',
        selectEndDate: '',
        endDate: '',
        showPopup: false,
        popupShow: false,
        bigType: '问题大类',
        smallType: '问题小类',
        showType: true,
        bigText: [],
        receiveOrgList: [],
        receiveOrgText: '',
        smallText: [],
        smallNewText: [],
        isLock: false, // 单票问题件上报 是否加锁
        isSingle: true, // 是否单票上报
        roportMes: '',
        getImage: [],
        showLoading: true,
        reportFlag: false, // 上报标识，点击上报后按钮变灰
        batchReport: false, // 批量上报标志，true则标识批量上报页面扫描运单号二维码后自动上报
        reportWaybillNos: [], // 问题件批量上报--保存已上报的最新十个运单号
        parameters: {
          waybillNo: '',
          mobile: null,
          mobile2: null,
          mobile3: null,
          mobile4: null,
          account: '',
          issueType: '',
          issueSmallType: '',
          issueDesc: '',
          recOrgCode: '',
          issueDistr: '',
          desOrgCode: '',
          empCode: '',
          files: [],
          push: true
        },
        templateShow: false,
        templateList: [],
        templateSelect: '',
        isShowClose: false,
        userInfo: {}
      };
    }
    ,
    watch: {
      'parameters.issueDesc'(val) {
        // console.log('用户工号：', this.userInfo.userCode);
        // val = '我把工号：#工号#，第二次工号：#工号#网点编码：#网点编码#和第二次网点编码：#网点编码#网点名称：#网点名称#填了进来';
        let _this = this;
        if (val !== 'undefined' && val !== undefined && val !== null && val !== 'null'){
          this.parameters.issueDesc = val.replace(/(#工号#|#网点编号#|#网点名称#|#日期#|#姓名#)/g, function () {
            return {
              '#工号#': _this.userInfo.userCode,
              '#网点编号#': _this.userInfo.currentOrgCode,
              '#网点名称#': _this.userInfo.currentOrgName,
              '#日期#': format('yyyy-MM-dd hh:mm:ss'),
              '#姓名#': _this.userInfo.userName
            }[arguments[1]]
          });
          }

        // 格式化日期的方法
        function format(fmt) {
          let now = new Date();
          let o = {
            "M+": now.getMonth() + 1,                 //月份
            "d+": now.getDate(),                    //日
            "h+": now.getHours(),                   //小时
            "m+": now.getMinutes(),                 //分
            "s+": now.getSeconds(),                 //秒
            "q+": Math.floor((now.getMonth() + 3) / 3), //季度
            "S": now.getMilliseconds()             //毫秒
          };
          if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length));
          }
          for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
          }
          return fmt;
        }

        // this.parameters.issueDesc = val.replace('#工号#', this.userInfo.userCode).replace('#网点编码#', this.userInfo.currentOrgCode).replace('#网点名称#', this.userInfo.currentOrgCode);
      }
    },
    created() {
      this.getWaybillNo();
      this.parameters.issueDesc = this.$route.query.describe;
      let  bigType = this.$route.query.bigType;
      let smallType = this.$route.query.smallType;
      this.setProblemType(bigType, smallType);
      console.log(this.$route.query.waybillNo);
      /*this.isShowClose = appUtil.showClose();*/
      appUtil.showClose().then((res) => {
        this.isShowClose = res;
      });
      let nowTime = new Date();
      this.endDate = this.returnFormatDate(nowTime);
      this.selectEndDate = this.returnFormatDate(nowTime) + ' ' + nowTime.getHours() + ':' + nowTime.getMinutes();
      this.selectStartDate = this.returnFormatBeforeDate(nowTime, 2) + ' ' + nowTime.getHours() + ':' + nowTime.getMinutes();

      /* let appParams = appUtil.getParameters();
       if (appParams.oddNum) {
         this.parameters.waybillNo = appParams.oddNum;
         this.waybillNoChange(true);
       }*/
      appUtil.getParameters().then((res) => {
        let appParams = res;
        if (appParams.oddNum) {
          this.parameters.waybillNo = appParams.oddNum;
          this.waybillNoChange(true);
        }
      });
      window.getPicture = (code, size) => {
        this.getImage.push(code);
      };
      window.goToBack = () => {
        this.backClick();
      };
      //初始化当前用户信息
      this.initCurrentUser();
    }
    ,
    methods: {
      async waybillNoChange(isBathchReport) {
        // 运单号小写变大写
        if (this.parameters.waybillNo !== 'undefined' && this.parameters.waybillNo !== undefined && this.parameters.waybillNo !== null && this.parameters.waybillNo !== 'null' && this.parameters.waybillNo !== ''){
          this.parameters.waybillNo = this.parameters.waybillNo.toUpperCase();
        }
        // 如果不是批量上报，则自动上报的标识为false
        if (!isBathchReport) {
          this.batchReport = false;
        }
        this.receiveOrgText = '';
        this.parameters.recOrgCode = '';
        if (this.parameters.waybillNo === '' || this.parameters.waybillNo == null) {
          return;
        }
        /** ^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$|^[6-9][0-9]{17}$|^[DD]{2}[8-9][0-9]{15}$|^[Y][0-9]{12}$ */
        /** 正则表达式判断运单号 */
        var reg = constant.waybillNoRegular();
        if (!reg.test(this.parameters.waybillNo)) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '运单号不正确，请重新填写', timerFlag);
          return;
        }
        let getOrg = await
          searchReceiveGetOrg(this.parameters.waybillNo);
        let getOrgMap = getOrg.data.map[this.parameters.waybillNo];
        if (getOrgMap) {
          this.receiveOrgText = getOrgMap.receivedStationName;
          this.parameters.recOrgCode = getOrgMap.receivedStationCode;
        }
        const orgObj = await
          searchReceiveOrg(this.parameters.waybillNo);
        if (orgObj.status === 0) {
          // this.receiveOrgList = orgObj.data.list;
          let olist = orgObj.data.list;
          if (olist != null && olist.length > 0) {
            let defultOrgNode = null;
            // 判断始发网点是否与当前登陆用户网点一致，相同则取走件流程最后一个网点
            defultOrgNode = olist[0];
            // 如果走件操作网点代码和当前登陆网点代码一致
            if (defultOrgNode.opOrgCode == this.userInfo.currentOrgCode) {
              // 取最后一天走件记录的数据
              defultOrgNode = olist[olist.length - 1];
            } else if (this.userInfo.stationType == 'SUB_DEPARTMENT') {
              if (this.userInfo.parentCode == defultOrgNode.opOrgCode) {
                defultOrgNode = olist[olist.length - 1];
              } else {
                let response = await
                  getStationInfo(defultOrgNode.opOrgCode);
                let station = response.data;
                if (this.userInfo.parentCode == station.parentCode) {
                  defultOrgNode = olist[olist.length - 1];
                }
              }
            } else if (this.userInfo.stationType == 'BRANCH') {
              let response = await
                getStationInfo(defultOrgNode.opOrgCode);
              let station = response.data;
              if (this.userInfo.currentOrgCode === station.parentCode) {
                defultOrgNode = olist[olist.length - 1];
              }
            }
            // 若最后一条记录操作code是131（装件入车），则默认网点为下一网点，否则是最后一条记录的操作网点
            /*if (defultOrgNode.opCode === '131') {
              this.receiveOrgText = defultOrgNode.nextOrgName;
              this.parameters.recOrgCode = defultOrgNode.nextOrgCode;
            } else {
              this.receiveOrgText = defultOrgNode.opOrgName;
              this.parameters.recOrgCode = defultOrgNode.opOrgCode;
            }*/
          }
        }
        // 如果是批量上报，扫描运单号二维码后查找接收组织，然后上报问题件
        if (this.batchReport) {
          this.searchSubmit();
        }
      }
      ,
      async commonLanguage() { // 常用语
        let res = await
          reportTemplate({
            pageNo: null,
            start: null,
            limit: 10
          });
        this.templateList = [];
        let temList = res.data.list;
        for (let x in temList) {
          this.templateList.push({value: temList[x].templateContent, key: temList[x].templateType});
        }
        // console.log(this.templateList);
        this.templateShow = true;
      }
      ,
      change(value, label) {
        this.parameters.issueDesc = label;
      }
      ,
      // 问题件上报错误提示定时器
      reportWarnTimeOut(times) {
        let timerFlag = window.setTimeout(() => {
          this.$vux.alert.hide();
        }, times);
        return timerFlag;
      }
      ,
      // 问题件上报提示框
      reportWarnPart(title, content, timerFlag) {
        this.$vux.alert.show({
          title: title,
          content: content,
          onHide() {
            window.clearTimeout(timerFlag);
          }
        });
      }
      ,
      // 问题件上报
      async searchSubmit() {
        let _this = this;
        if (!this.parameters.mobile && !this.parameters.mobile2 && !this.parameters.mobile3 && !this.parameters.mobile4) {
          let mobileContent = "客户电话属于个人隐私，上报问题件必须填在客户电话框内,严禁在问题件描述框内填写客户电话！";
          mobileContent += "如违反规定，造成信息泄露，分公司负责人及上报人须承担相应刑事民事法律责任，总公司按照规定从严处理！";
          mobileContent += "分公司负责人必须加强员工安全意识教育！请按照规定上报！";
          this.$vux.confirm.show({
            title: '操作提示',
            content: mobileContent,
            onCancel() {
            },
            onConfirm() {
              _this.searchSubmit1();
            }
          });
        } else {
          _this.searchSubmit1();
        }
      }
      ,
      async searchSubmit1() {
        /** 上报问题件判断校验运单号 */
        /** 上报问题件判断运单号是否为空 */
        if (this.parameters.waybillNo === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请填写运单号', timerFlag);
          return;
        }

        // 运单号字母小写转大写
        this.parameters.waybillNo = waybillNoLowToUp(this.parameters.waybillNo);
        /** ^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$|^[6-9][0-9]{17}$|^[DD]{2}[8-9][0-9]{15}$|^[Y][0-9]{12}$ */
        /** 正则表达式判断运单号 */
        var reg = constant.waybillNoRegular();
        if (!reg.test(this.parameters.waybillNo)) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '运单号不正确，请重新填写', timerFlag);
          return;
        }
        // 电话号校验
        // !!this.parameters.mobile && !((/^(\d{1,11})?$/.test(this.parameters.mobile)))
        if (!!this.parameters.mobile && this.parameters.mobile.length > 15) {
          // 判断是否是手机号或者是座机号码
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '第一行电话号码格式不正确', timerFlag);
          return;
        }
        if (!!this.parameters.mobile2 && this.parameters.mobile2.length > 15) {
          // 判断是否是手机号或者是座机号码
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '第二行电话号码格式不正确', timerFlag);
          return;
        }
        if (!!this.parameters.mobile3 && this.parameters.mobile3.length > 15) {
          // 判断是否是手机号或者是座机号码
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '第三行电话号码格式不正确', timerFlag);
          return;
        }
        if (!!this.parameters.mobile4 && this.parameters.mobile4.length > 15) {
          // 判断是否是手机号或者是座机号码
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '第四行电话号码格式不正确', timerFlag);
          return;
        }
        // 支付宝账号
        if (this.parameters.account != null && this.parameters.account.length > 25) {
          // 支付宝账号
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '账号内容字符长度不能超过25', timerFlag);
          return;
        }

        /** 上报问题件判断问题大类是否为空 */
        if (this.parameters.issueType === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请选择问题大类', timerFlag);
          return;
        }
        /** 上报问题件判断问题小类是否为空 */
        if (this.parameters.issueSmallType === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请选择问题小类', timerFlag);
          return;
        }
        /** 上报问题件判断问题描述是否为空 */
        if (this.parameters.issueDesc === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请填写问题描述信息', timerFlag);
          return;
        }
        if (this.parameters.issueDesc.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g) != null) { // 过滤emoji表情
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请不要使用特殊符号', timerFlag);
          return;
        }
        if (this.isEmojiCharacter(this.parameters.issueDesc)) { // 过滤emoji表情
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请不要使用特殊符号', timerFlag);
          return;
        }
        /** 描述不能超过400字 */
        if (this.parameters.issueDesc.length > 400) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '问题描述最多不能超过400字', timerFlag);
          return;
        }
        /** 上报问题件判断接收组织是否为空 */
        if (this.parameters.recOrgCode === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请选择接收组织', timerFlag);
          return;
        }
        /** 图片上传不能超过8张 */
        if (this.getImage.length > 8) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '图片上传不能超过8张', timerFlag);
          return;
        }
        // 点击上报后，上报按钮不能再次点击
        this.reportFlag = true;
        this.parameters.files = this.getImage;
        const backMessage = await
          report(this.parameters);
        if (backMessage.status === 0) {
          if (this.isSingle) { // 单票上报
            this.parameters.files = [];
            this.getImage = [];
            if (!this.isLock) {
              this.bigType = '问题大类';
              this.smallType = '问题小类';
              this.parameters.issueDesc = '';
              this.parameters.issueType = '';
              this.parameters.issueSmallType = '';
              this.templateSelect = '';
            }
          } else { // 问题件批量上报保存最近十个运单号
            // 把上报的运单号放到第一个
            this.reportWaybillNos.unshift(this.parameters.waybillNo);
            if (this.reportWaybillNos.length > 10) {
              // 删除运单号列表最后一个
              this.reportWaybillNos.pop();
            }
          }
          this.roportMes = '上报成功';
          this.parameters.waybillNo = '';
          this.parameters.mobile = null;
          this.parameters.mobile2 = null;
          this.parameters.mobile3 = null;
          this.parameters.mobile4 = null;
          this.parameters.account = '';
          this.receiveOrgText = '';
          // 上报成功之后，问题大类默认选中
          this.showType = true;
        } else {
          this.roportMes = '上报失败，请稍后再试';
        }
        this.reportFlag = false;
        this.$vux.alert.show({
          title: '操作提示',
          content: this.roportMes,
          buttonText: ' ',
          hideOnBlur: true
        });
        this.reportWarnTimeOut(1500);
      }
      ,
      async setProblemType(big, small) { // 获取问题大小类
        if (big ==null && small==null){
          big = 0; small =0;
        }
        const backMessage = await
          getProblemType({
            bigVersion: '1',
            smallVersion: '1'
          });
        this.showLoading = false;
        if (backMessage.status === 0) {
          this.bigText = backMessage.data.bigList || [];
          this.smallText = backMessage.data.smallList || [];
          // console.log(this.bigText);
          // console.log(this.smallText);
          // 问题大类赋初始值
          this.parameters.issueType = this.bigText[big].bigCode;
          this.bigType = this.bigText[big].bigName;
          // 问题小类赋初始值
          this.smallNewText = this.smallText.filter((items) => {
            return items.bigCode === this.parameters.issueType;
          });
          this.parameters.issueSmallType = this.smallNewText[small].smallCode;
          this.smallType = this.smallNewText[small].smallTemplet;
        }
      }
      ,
      returnFormatDate(nowDate) {
        let o = {
          'Y': 1900 + nowDate.getYear(),
          'M': '0' + (nowDate.getMonth() + 1),
          'D': '0' + nowDate.getDate(),
          'HH': nowDate.getHours(),
          'mm': nowDate.getMinutes()
        };
        let nowTime = o.Y + '-' + o.M.substring(o.M.length - 2, o.M.length) + '-' + o.D.substring(o.D.length - 2, o.D.length);
        return nowTime;
      }
      ,
      returnFormatBeforeDate(nowDate, num) {
        let beforeDate = nowDate;
        beforeDate.setDate(beforeDate.getDate() - num);
        return this.returnFormatDate(beforeDate);
      }
      ,
      backClick() {
        appUtil.back();
      }
      ,
      popRootBack() {
        appUtil.goToRoot();
      }
      ,
      getSmall(item) {
        this.showType = false;
        this.parameters.issueType = item.bigCode;
        this.bigType = item.bigName;
        this.smallNewText = this.smallText.filter((items) => {
          return items.bigCode === this.parameters.issueType;
        });
        this.parameters.issueSmallType = null;
        this.smallType = '问题小类';
      }
      ,
      clickSmall() {
        // 点击问题小类时，若问题大类为空，则默认选中问题大类
        if (this.parameters.issueType === '') {
          this.showType = true;
        } else {
          this.showType = false;
        }
      }
      ,
      setSmall(item) {
        // 点击问题小类时，若问题大类为空，则默认选中问题大类
        if (this.parameters.issueType === '') {
          this.showType = true;
        } else {
          this.parameters.issueSmallType = item.smallCode;
          this.smallType = item.smallTemplet;
          this.showPopup = false;
        }
      }
      ,
      async getReceiveOrg() {
        if (this.parameters.waybillNo === '') {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '请填写运单号', timerFlag);
          return;
        }
        /** ^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$|^[6-9][0-9]{17}$|^[DD]{2}[8-9][0-9]{15}$|^[Y][0-9]{12}$ */
        /** 正则表达式判断运单号 */
        var reg = constant.waybillNoRegular();
        if (!reg.test(this.parameters.waybillNo)) {
          let timerFlag = this.reportWarnTimeOut(3000);
          this.reportWarnPart('操作提示', '运单号不正确，请重新填写', timerFlag);
          return;
        }
        const backMessage = await
          searchReceiveOrgRemove(this.parameters.waybillNo);
        if (backMessage.status === 0) {
          this.receiveOrgList = backMessage.data.list;
        }
        this.popupShow = true;
      }
      ,
      setReceiveOrg(item) {
        this.receiveOrgText = item.opOrgName;
        this.parameters.recOrgCode = item.opOrgCode;
        this.popupShow = false;
      }
      ,
      getQRScanapp() {
        // appUtil.qrScan();
        NA.qrScan((code) => {
          // 若是批量上报，则支持扫面运单号自动上报
          this.parameters.waybillNo = code;
          // 因为查询接收组织和问题件上报是异步请求，所以两个方法不能写一起，只能通过标识判断
          if (!this.isSingle) {
            this.batchReport = true;
          } else {
            this.batchReport = false;
          }
          // 通过运单号查询接收组织
          this.waybillNoChange(true);
        });
      }
      ,
      toPicture() {
        let num = 8 - this.getImage.length;
        try {
          appUtil.newChoosePic(num, 1024);
        } catch (e) {
          appUtil.choosePic(num);
        }
      },
      async getUser() { // 获取当前登录人信息
        let obj = await
          getUserInfo({});
        let nowOrgName = obj.data.stationName;
        let nowOrgCode = obj.data.stationCode;
      }
      ,
      isEmojiCharacter(substring) {
        for (let i = 0; i < substring.length; i++) {
          let hs = substring.charCodeAt(i);
          if (hs >= 0xd800 && hs <= 0xdbff) {
            if (substring.length > 1) {
              let ls = substring.charCodeAt(i + 1);
              let uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
              if (uc >= 0x1d000 && uc <= 0x1f77f) {
                return true;
              }
            }
          } else if (substring.length > 1) {
            let ls = substring.charCodeAt(i + 1);
            if (ls == 0x20e3) {
              return true;
            }
          } else {
            if (hs >= 0x2100 && hs <= 0x27ff) {
              return true;
            } else if (hs >= 0x2B05 && hs <= 0x2b07) {
              return true;
            } else if (hs >= 0x2934 && hs <= 0x2935) {
              return true;
            } else if (hs >= 0x3297 && hs <= 0x3299) {
              return true;
            } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
              || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
              || hs == 0x2b50) {
              return true;
            }
          }
        }
      }
      ,
      async initCurrentUser() {
        let obj = await
          getUserInfo({});
        this.userInfo.currentOrgName = obj.data.stationName;
        this.userInfo.currentOrgCode = obj.data.stationCode;
        this.userInfo.userCode = obj.data.userCode; // 写入用户工号
        this.userInfo.userName = obj.data.userName; // 写入用户工号姓名
        let station = await
          getStationInfo(this.userInfo.currentOrgCode);
        this.userInfo.parentCode = station.data.parentCode;
        this.userInfo.parentName = station.data.parentName;
        this.userInfo.stationType = station.data.type;
      }
      ,
      subscribe() {
        appUtil.subscribe(this.parameters.waybillNo)
      }
      ,
      async getAppParams() {
        appUtil.getParameters().then((res) => {
          let appParams = res;
          if (appParams.oddNum) {
            this.parameters.waybillNo = appParams.oddNum;
          }
        });
      },
      async getWaybillNo () {
        this.parameters.waybillNo = this.$route.query.waybillNo;
        if (this.parameters.waybillNo !== 'undefined'){
          this.waybillNoChange(true);
        }
      }
    }
  }
  ;
</script>

<style lang="less" scoped>
  .weui-cell.noline:before {
    left: 7.5em;
  }

  .popup {
    padding-bottom: 15px;
    height: 350px;
    overflow-y: scroll;
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

  .demo1-item {
    padding: 5px 0 !important;
    border-radius: 3px;
    font-size: 0.8em;
    text-align: center;
    background-color: #EFEFEF;
    border: 0 !important;
    margin: 0 3px 8px 3px !important;
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

  .unLock {
    background: url("../../assets/img/unlock.png") 0 0 no-repeat;
    width: 22px;
    height: 22px;
  }

  .lock {
    background: url("../../assets/img/lock.png") 0 0 no-repeat;
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

  .weui-cell:before {
    border-color: #fff;
  }

  .weui-tabbar__item.weui-bar__item_on .tabar-a {
    color: #4080CA;
  }

  .pushxz {
    width: 10em;
    margin-right: 2em;
    text-align: right;
    margin-top: 5px;
  }
</style>
