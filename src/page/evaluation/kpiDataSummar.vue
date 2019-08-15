<template>
  <!-- kpi -->
  <div style="height:100%;">
    <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="KPI"
              :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick">
    </x-header>
    <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="26px">
      <group label-width="4.5em" label-margin-right="1em" label-align="">

        <div class="tips">
          昨日考核指标已出炉,来看看自己的考核情况吧~
        </div>
        <div>
          <p class="yto-p" style="padding-top:10px">
            <checker v-model="dateType" default-item-class="demo1-item"
                     selected-item-class="demo1-item-selected" type="radio" :radio-required="true">
              <checker-item :key="index" :value="item.id" v-for="(item, index) in dateTypeList">{{item.name}}
              </checker-item>
            </checker>
          </p>
          <div v-if="dateType === '0'">
            <Datetime title="查询日:" v-model="parameters.dayTime" start-date="2018-01-01" :end-date="endDateMonth"
                      value-text-align="left" format="YYYY-MM-DD" year-row="{value}年"
                      placeholder="请选择日期"
                      month-row="{value}月" day-row="{value}日" @on-change="onChangeSumType(1)"></Datetime>
          </div>
          <!--<div><x-switch title="查询周/月" v-model="value" ></x-switch></div>-->
          <!-- <div v-show="value">-->
          <div  v-if="dateType === '1'">
            <Datetime title="开始时间:" v-model="parameters.weekStartTime" start-date="2018-01-01" :end-date="endDateMonth"
                      value-text-align="left" format="YYYY-MM-DD" year-row="{value}年"
                      placeholder="周开始时间"
                      month-row="{value}月" day-row="{value}日" @on-change="selectDate(0)" v-if="hackReset"></Datetime>
            <Datetime title="结束时间:"  :readonly="readonly" v-model="parameters.weekEndTime"  value-text-align="left" format="YYYY-MM-DD" year-row="{value}年"
                      placeholder="周结束时间"></Datetime>
            <vue-better-calendar v-show="activeIndex !== -1"
                                 ref="calendar"
                                 mode="single"
                                 :limitEndDate="limitweekEnd"
                                 @select-single-date="selectDate"
            ></vue-better-calendar>
          </div>
          <Datetime  v-if ="dateType === '2'" title="查询月:" v-model="parameters.monthTime" start-date="2018-01-01" v-bind:end-date="endMonth"
                     value-text-align="left" format="YYYY-MM" year-row="{value}年"
                     placeholder="请选择月份"
                     month-row="{value}月" @on-change="onChangeSumType(3)"></Datetime>
        </div>
        <!-- </div>-->

      </group>
      <group label-width="4.5em" label-margin-right="2em" label-align="right" >
        <flexbox style="padding:5px 0 5px;">
          <flexbox-item>
            <div class="yto-hot1"><label>KPI指数: </label><label style="color: #E59313;">{{returnParameter.netScore || '--'}}</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="yto-hot1"><label>区域内排名: </label><label style="color: #E59313;">{{returnParameter.areaRank || '--'}}</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="level-css"><label class="lable-css" @click.prevent="dialogImprovementGuidanceShow =true"><strong>改善指导</strong></label>
              <label class="lable-css" @click.prevent="dialogCalculationRuleShow = true"><strong>计算规则</strong></label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>揽收出港及时率</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox class="flexbox-style">
          <flexbox-item>
            <div class="no-icon-hot"><label>得分: </label><label class="color-style">{{returnParameter.kpi1Score}}</label>
            </div>
            <div class="no-icon-red-hot"><label>超时出港件量: </label><label class="color-style-red">{{returnParameter.kpi1Exp || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>及时出港件量: </label><label class="color-style">{{returnParameter.kpi1Up || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/second.png" class="img-style"><label>应出港件量: </label><label class="color-style">{{returnParameter.kpi1Down || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">{{returnParameter.kpi1Stand || 0}}%</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-1-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi1Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi1Rate"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi1Rate < returnParameter.kpi1Stand" style="color: #CE3C39">{{returnParameter.kpi1Rate}}%</span>
                  <span v-else style="color:#09bb07">{{returnParameter.kpi1Rate}}%</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>派件出门准点率</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox class="flexbox-style">
          <flexbox-item>
              <div class="no-icon-hot"><label>得分: </label><label class="color-style">{{returnParameter.kpi2Score}}</label>
              </div>
              <div class="no-icon-red-hot"><label>延误出门件量: </label><label class="color-style-red">{{returnParameter.kpi2Exp || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>准点出门件量: </label><label class="color-style">{{returnParameter.kpi2Up || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/second.png" class="img-style"><label>中心发出件量：</label><label class="color-style">{{returnParameter.kpi2Down || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">{{returnParameter.kpi2Stand || 0}}%</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-1-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi2Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi2Rate"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi2Rate < returnParameter.kpi2Stand" style="color: #CE3C39">{{returnParameter.kpi2Rate}}%</span>
                  <span v-else style="color:#09bb07">{{returnParameter.kpi2Rate}}%</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>当日签收率</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox class="flexbox-style">
          <flexbox-item>
            <div class="no-icon-hot"><label>得分: </label><label class="color-style">{{returnParameter.kpi3Score}}</label>
            </div>
            <div class="no-icon-red-hot"><label>当日未签收件量：</label><label class="color-style-red">{{returnParameter.kpi3Exp || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>当日签收件量: </label><label class="color-style">{{returnParameter.kpi3Up || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/second.png" class="img-style"><label>中心发出件量: </label><label class="color-style">{{returnParameter.kpi3Down || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">{{returnParameter.kpi3Stand || 0}}%</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-1-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi3Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi3Rate"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi3Rate < returnParameter.kpi3Stand" style="color: #CE3C39">{{returnParameter.kpi3Rate}}%</span>
                  <span v-else style="color:#09bb07">{{returnParameter.kpi3Rate}}%</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>虚假签收投诉率</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox class="flexbox-style">
          <flexbox-item>
            <div class="no-icon-hot"><label>得分: </label><label class="color-style">{{returnParameter.kpi4Score}}</label>
            </div>
            <div class="icons-red-hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>虚假签收投诉件量: </label><label class="color-style-red">{{returnParameter.kpi4Up || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/second.png" class="img-style"><label>派件量: </label><label class="color-style">{{returnParameter.kpi4Down || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">万分之{{returnParameter.kpi4Stand || 0}}</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-2-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi4Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi4Rate/100"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi4Rate > returnParameter.kpi4Stand" style="color: #CE3C39">万分之{{returnParameter.kpi4Rate}}</span>
                  <span v-else style="color:#09bb07">万分之{{returnParameter.kpi4Rate}}</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>遗失率</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox class="flexbox-style">
          <flexbox-item>
            <div class="no-icon-hot"><label>得分: </label><label class="color-style">{{returnParameter.kpi5Score}}</label>
            </div>
            <div class="icons-red-hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>遗失件量: </label><label class="color-style">{{returnParameter.kpi5Up || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/second.png" class="img-style"><label>派件量: </label><label class="color-style">{{returnParameter.kpi5Down || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">十万分之{{returnParameter.kpi5Stand || 0}}</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-2-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi5Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi5Rate/1000"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi5Rate > returnParameter.kpi5Stand" style="color: #CE3C39">十万分之{{returnParameter.kpi5Rate}}</span>
                  <span v-else style="color:#09bb07">十万分之{{returnParameter.kpi5Rate}}</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>升级投诉申诉率</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox class="flexbox-style">
          <flexbox-item>
            <div class="no-icon-hot"><label>得分: </label><label class="color-style">{{returnParameter.kpi6Score}}</label>
            </div>
            <div class="icons-red-hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>升级投诉件量: </label><label class="color-style-red">{{returnParameter.kpi6Up || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/second.png" class="img-style"><label>派件量: </label><label class="color-style">{{returnParameter.kpi6Down || '--'}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">百万分之{{returnParameter.kpi6Stand || 0}}</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-2-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi6Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi6Rate/10000"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi6Rate > returnParameter.kpi6Stand" style="color: #CE3C39">百万分之{{returnParameter.kpi6Rate}}</span>
                  <span v-else style="color:#09bb07">百万分之{{returnParameter.kpi6Rate}}</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label>菜鸟平台网点指数</label>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox  class="flexbox-style">
          <flexbox-item>
            <div class="hot"><img slot="icon" src="../../assets/img/third.png" class="img-style"><label>得分: </label><label class="color-style">{{returnParameter.kpi7Score}}</label>
            </div>
            <div class="hot"><img slot="icon" src="../../assets/img/first.png" class="img-style"><label>目标值: </label><label class="color-style">{{returnParameter.kpi7Stand|| '--'}}</label>
            </div>
          </flexbox-item>
          <flexbox-item>
            <div class="no-icon-rank-2-hot"><label>排名: </label><label class="color-style">{{returnParameter.kpi7Rank || '--'}}</label>
            </div>
            <div class="vux-circle-demo">
              <div style='width:100px;height:100px;'>
                <x-circle
                  :percent="returnParameter.kpi7"
                  :stroke-width="6"
                  :trail-width="6"
                  :stroke-color="['#36D1DC', '#5B86E5']"
                  trail-color="#ececec">
                  <span v-if="returnParameter.kpi7 < returnParameter.kpi7Stand" style="color: #CE3C39">{{returnParameter.kpi7}}</span>
                  <span v-else style="color:#09bb07">{{returnParameter.kpi7}}</span>
                </x-circle>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item>
            <div class="yto-hot"><label style="color: #828282">以上数据的明细请前往网点管家电脑端查看</label>
            </div>
          </flexbox-item>
        </flexbox>
      </group>
    </view-box>
    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogCalculationRuleShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 14px;color: #828282">
          <div class="infoDetail" style="text-align: left">
            <p style="text-align: center;color: #4080CA;"><strong>计算规则</strong></p>
            <p>1、揽收出港及时率=及时出港件量/应出港件量*100%</p>
            <p>2、派件出门准点率=准点派件票数/末端中心监控票数*100%</p>
            <p>3、当日签收率=中心发出当日签收票数+中心发出当日驿站入库未出库票数）/中心发出总票数*100%</p>
            <p>4、虚假签收投诉率=虚假签收投诉量/派件量*10000</p>
            <p>5、遗失率=遗失件量/派件量*100000</p>
            <p>6、升级投诉申诉率=升级投诉量/派件量*1000000</p>
            <p>7、网点指数=菜鸟天地网点指数得分</p>
            <p>注：每天下午15:00出前一天的数据，每周周四15:00出上一周的数据，每月15号9:00出上个月的数据</p>
          </div>
        </div>
      </x-dialog>
    </div>
    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogImprovementGuidanceShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 14px;height: 500px;overflow: scroll;color: #828282" >
          <div class="infoDetail" style="text-align: left">
            <p style="text-align: center;color: #4080CA;"><strong>改善指导</strong></p>
            <p>一、揽收出港及时率:</p>
            <ol class="ol_style">
              <li>多频次交件，当天揽收快件中心截单时间前完成交件；</li>
              <li>当日因商家原因当日无法发出的快件，无需做揽收操作，并于商家沟通当日无法发出的快件，建议商家不要点发货或在18点以后点击发货；</li>
              <li>由上级中心代为建包报，简化操作流程；</li>
              <li>使用出港简化操作功能，提升操作效率。</li>
            </ol>
            <p>二、派件出门准点率:</p>
            <ol class="ol_style">
              <li>进港操作前置，在末端中心做快件分拣；</li>
              <li>配备独立的内场分拣人员，收派员不兼职内场操作；</li>
              <li>对网点管家未达标明细数据实时分析责任到人，因操作人员不足导致操作时长过长，新增操作人员，因操作人员效率较低制定操作人员考核方案，对业务员自身原因导致出门较晚，制定业务员考核制度，督促业务员准点出门。</li>
            </ol>
            <p>三、当日签收率:</p>
            <ol class="ol_style">
              <li>设立时效服务管控专员，对重点指标进行实时监控跟进；</li>
              <li>每日下班前安排专人查看前置库等业务系统，避免因数据上传异常导致延误；</li>
              <li>每日安排人员对网点管家-数据分析-进港件数据监控中未签收且未入库数据进行核对，已派送成功快件及时录入签收，因客户原因无法妥投的，征得客户同意后做入库处理。</li>
            </ol>
            <p>四、虚假签收投诉率:</p>
            <ol class="ol_style">
              <li>未经客户同意不得将快件放入驿站、代办点及自提柜，他人代收快件，须经收件人本人同意方可由他人代收；</li>
              <li>利用好客户画像，对易投诉客户，务必做好派送服务，100%派前电联及送货上门；</li>
              <li>确保派件电话准确、畅通，避免因客户联系不畅导致的投诉；</li>
              <li>合理分配业务员人均效能（建议人效控制在120-150票/天）；</li>
              <li>制定内部虚假签收考核指标及相应的奖惩措施。</li>
            </ol>
            <p>五、遗失率:</p>
            <ol class="ol_style">
              <li>配备下车扫描监控设备或OSD功能，确保每票快件可追溯、可判责；</li>
              <li>每日安排人员对网点管家-数据分析-进港件数据监控中有发未到、有到未派、有派未签数据进行跟进，确保从源头降低遗失件产生；</li>
              <li>对下属分部及业务员制定考核制度。</li>
            </ol>
            <p>六、升级投诉申诉率:</p>
            <ol class="ol_style">
              <li>内部投诉、内部处理；</li>
              <li>对因网点自身原因导致快件遗失、破损、延误等责任，第一时间主动与客户沟通处理，已产生客户投诉的快件，积极主动与客户沟通处理，从根本上降低升级投诉；</li>
              <li>责任到人，制度处罚制度。</li>
            </ol>
            <p>七、网点指数:</p>
            <ol class="ol_style">
              <li>设立专人跟进网点指数；</li>
              <li>常态化通报数据，对未达标的数据(菜鸟天地-网点指数-下载样单)进行分析，通过数据分析到存在问题并解决；</li>
              <li>结合总部指标，制定内部业务员及客服考核指标，做到人人身上背指标。</li>
            </ol>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
  import {
    XCircle,
    Cell,
    Datetime,
    DatetimeRange,
    Flexbox,
    FlexboxItem,
    Group,
    TransferDomDirective as TransferDom,
    ViewBox,
    XHeader,
    XButton,
    XSwitch,
    Selector,
    Checker,
    CheckerItem,
    XDialog
  } from "vux";
  import { appUtil } from "../../common/commonUtils";
  import {netKpiMonitor} from '../../service/service';
  import {FormatDate} from '../../common/dateFormat';
  function getRate(val) {
    if (typeof val === 'number') {
      return parseFloat((val * 100).toFixed(2));
    } else {
      return '--';
    }
  }
  export default {
    directives: {
      TransferDom
    },
    components: {
      XCircle,
      Cell,
      Datetime,
      DatetimeRange,
      Flexbox,
      FlexboxItem,
      Group,
      ViewBox,
      XHeader,
      XButton,
      XSwitch,
      Selector,
      Checker,
      CheckerItem,
      XDialog
    },
    data() {
      return {
        dialogCalculationRuleShow: false, //计算规则
        dialogImprovementGuidanceShow: false, //改善指导
        hackReset: true, //重新加载时间
        showDay: false,
        showWeek: false,
        showMonth: false,
        readonly: true,
        dateType: "0",
        parameters: {
          dayTime: '',
          weekStartTime: "",
          weekEndTime:"",
          monthTime: "",
          sumType: 'D'
        },
        dateTypeList: [
          {id: '0', name: '日'},
          {id: '1', name: '周'},
          {id: '2', name: '月'}
        ],
        limitweekEnd:[],
        endDate:'',
        startDate:'',
        activeIndex:-1,
        showYear:true,
        value3:'',
        value:false,
        selectMonth:'',
        endDateMonth:'',
        endMonth:'',
        timepick:'',
        percent: 80,
        kpiData: {},
        returnParameter: {
          kpi1Rate: 0,
          kpi1Down: '',//揽收量
          kpi1Up: '',//揽收出港及时率
          kpi1Min: '',//保底值
          kpi1Exp: '',//超时出港及时率
          kpi1Stand: '',//目标值
          kpi1Score: '',//得分
          kpi1Rank:'',//排名
          kpi2Rate: 0,
          kpi2Down: '',
          kpi2Up: '',
          kpi2Min: '',//保底值
          kpi2Exp: '',//延误出门票数
          kpi2Stand: '',//目标值
          kpi2Score: '',//得分
          kpi2Rank:'',//排名
          kpi3Rate: 0,
          kpi3Down: '',
          kpi3Up: '',
          kpi3Min: '',//保底值
          kpi3Exp: '',//未签收票数
          kpi3Stand: '',//目标值
          kpi3Score: '',//得分
          kpi3Rank:'',//排名
          kpi4Rate: 0,
          kpi4Down: '',
          kpi4Up: '',
          kpi4Min: '',//保底值
          kpi4Stand: '',//目标值
          kpi4Score: '',//得分
          kpi4Rank:'',//排名
          kpi5Rate: 0,
          kpi5Down: '',
          kpi5Up: '',
          kpi5Min: '',//保底值
          kpi5Stand: '',//目标值
          kpi5Score: '',//得分
          kpi5Rank:'',//排名
          kpi6Rate: 0,
          kpi6Down: '',
          kpi6Up: '',
          kpi6Min: '',//保底值
          kpi6Stand: '',//目标值
          kpi6Score: '',//得分
          kpi6Rank:'',//排名
          netScore: 0, //最终得分
          areaRank: '', // 区域内得分排名
          kpi7Score: 0,
          kpi7Stand:"",//目标值
          kpi7: 0,//指数
          kpi7Rank: "",
          kpiRank: ''//区域排名
        },
        showTime: false
      }
    },
    created() {
      window.goToBack = () => {
        this.backClick();
      };
      this.dateSet()
      this.netKpiMonitor();
    },
    mounted(){

    },
    methods: {
      selectDate(type) {
        if (this.parameters.weekStartTime !== '' && this.parameters.weekStartTime !== 'null' && this.parameters.weekStartTime !== null
          && this.parameters.weekStartTime !== undefined && this.parameters.weekStartTime !== 'undefined'){
          this.parameters.sumType = "W";
          this.parameters.monthTime = '';
          this.parameters.dayTime = '';
          this.activeIndex = type;
          let dateInfo = this.parameters.weekStartTime;
          this.startDate = this.parameters.weekStartTime;
          this.endDate = this.parameters.weekEndTime;
          this.parameters.sumType = "W";
          let startDate = this.startDate ? this.startDate.split('-').join('') : '';
          let endDate = this.endDate ? this.endDate.split('-').join('') : '';
          switch (this.activeIndex) {
            case 0 :
              console.log(this.startDate);
              let tempTime = Date.parse(this.startDate);
              let week = moment(tempTime).weekday();
              if(week === 0) {
                this.startDate = moment(tempTime).subtract(week+6, "days").format('YYYY-MM-DD');
                this.endDate = moment(tempTime).subtract(week, "days").format('YYYY-MM-DD');
              } else {
                this.startDate = moment(tempTime).subtract(week-1, "days").format('YYYY-MM-DD');
                this.endDate = moment(tempTime).subtract(week-7, "days").format('YYYY-MM-DD');
              }
              this.parameters.weekStartTime = this.startDate;
              this.parameters.weekEndTime = this.endDate;
              this.hackReset = false;
              this.$nextTick(() => {
                this.hackReset = true
              });

              break;
            case 1:

              console.log(this.endDate);
              let ended = Date.parse(this.endDate);
              let weeked = moment(ended).weekday();
              console.log(weeked);
              if(weeked === 0 ) {
                this.startDate = moment(ended).subtract(weeked+6, "days").format('YYYY-MM-DD');
                this.endDate = moment(ended).subtract(weeked, "days").format('YYYY-MM-DD');
              } else {
                this.startDate = moment(ended).subtract(weeked-1, "days").format('YYYY-MM-DD');
                this.endDate = moment(ended).subtract(weeked-7, "days").format('YYYY-MM-DD');
              }
              this.parameters.weekStartTime = this.startDate;
              this.parameters.weekEndTime = this.endDate;
              break;
            default:
              alert('请先选择要选择的日期');
              break
          }
          this.netKpiMonitor(2);
          this.activeIndex = -1
        }

      },
      dateSet() {
        let time = moment().format('YYYY-MM-DD');
        console.log(time);
        this.endDateMonth = FormatDate(new Date(), -1);//设置天的可选截止
        let date = new Date();
        let day = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        let temp = new Date(new Date().getFullYear(),new Date().getMonth()-1,day);
        this.endMonth = moment(temp).format('YYYY-MM-DD');
        console.log(this.endMonth);//设置月的可选截止
        if (new Date().getHours() >= 16){
          this.parameters.dayTime = FormatDate(new Date(), -1);
        } else {
          this.parameters.dayTime = FormatDate(new Date(), -2);
        }


        let weekOfday = parseInt(moment().format('d'));
        let end = moment().subtract(weekOfday , 'days').format('YYYY-MM-DD');
        // 周日日期
        console.log(end);
        let weekArrEnd = end.split('-') ;
        console.log(weekArrEnd);
        let tempArr = [];
        for(var index in weekArrEnd){
          tempArr.push(Number(weekArrEnd[index]));
        }
        this.limitweekEnd = tempArr;
        console.log(this.limitweekEnd);// 设置选择上周的截止日期



      },
      backClick() {
        appUtil.back();
      },
      /**
       * 获取KPI汇总数据.
       */
      /**
       * 获取KPI汇总数据.
       */
      async netKpiMonitor(type){
        //初始化话参数
        this.initData();
        if (1 === type){
          this.parameters.sumType = "D";
        } else if (2 === type){
          this.parameters.sumType = "W";
        } else if (3 === type){
          this.parameters.sumType = "M";
        }
        let res = await netKpiMonitor(JSON.stringify(this.parameters));
        if (null !== res.data && "null" !== res.data && "" !==  res.data){
          if (res.data.code === 0 ){
            if (null !== res.data.result && "null" !== res.data.result  && "" !==  res.data.result && typeof (res.data.result) !== 'undefined'){
              this.returnParameter.areaRank = res.data.result.areaRank;
              this.returnParameter.netScore = res.data.result.netScore;
              this.returnParameter.kpi1Down = res.data.result.kpi1Down;
              this.returnParameter.kpi1Rate = getRate(res.data.result.kpi1Rate);
              this.returnParameter.kpi1Up = res.data.result.kpi1Up;
              this.returnParameter.kpi1Exp = res.data.result.kpi1Exp;
              this.returnParameter.kpi1Min = res.data.result.kpi1Min;
              this.returnParameter.kpi1Stand = res.data.result.kpi1Stand;
              this.returnParameter.kpi1Score = res.data.result.kpi1Score;
              this.returnParameter.kpi1Rank = res.data.result.kpi1Rank;
              this.returnParameter.kpi2Down = res.data.result.kpi2Down;
              this.returnParameter.kpi2Rate =getRate(res.data.result.kpi2Rate);
              this.returnParameter.kpi2Up = res.data.result.kpi2Up;
              this.returnParameter.kpi2Exp = res.data.result.kpi2Exp;
              this.returnParameter.kpi2Min = res.data.result.kpi2Min;
              this.returnParameter.kpi2Stand = res.data.result.kpi2Stand;
              this.returnParameter.kpi2Score = res.data.result.kpi2Score ;
              this.returnParameter.kpi2Rank = res.data.result.kpi2Rank;
              this.returnParameter.kpi3Down = res.data.result.kpi3Down;
              this.returnParameter.kpi3Rate =getRate(res.data.result.kpi3Rate);
              this.returnParameter.kpi3Up = res.data.result.kpi3Up;
              this.returnParameter.kpi3Exp = res.data.result.kpi3Exp;
              this.returnParameter.kpi3Min = res.data.result.kpi3Min;
              this.returnParameter.kpi3Stand = res.data.result.kpi3Stand;
              this.returnParameter.kpi3Score = res.data.result.kpi3Score;
              this.returnParameter.kpi3Rank = res.data.result.kpi3Rank;
              this.returnParameter.kpi4Down = res.data.result.kpi4Down;
              this.returnParameter.kpi4Rate = parseFloat((res.data.result.kpi4Rate).toFixed(2));
              this.returnParameter.kpi4Up = res.data.result.kpi4Up;
              this.returnParameter.kpi4Min = res.data.result.kpi4Min;
              this.returnParameter.kpi4Stand = res.data.result.kpi4Stand;
              this.returnParameter.kpi4Score = res.data.result.kpi4Score;
              this.returnParameter.kpi4Rank = res.data.result.kpi4Rank;
              this.returnParameter.kpi5Down = res.data.result.kpi5Down;
              this.returnParameter.kpi5Rate = parseFloat((res.data.result.kpi5Rate).toFixed(2));
              this.returnParameter.kpi5Up = res.data.result.kpi5Up;
              this.returnParameter.kpi5Min = res.data.result.kpi5Min;
              this.returnParameter.kpi5Stand = res.data.result.kpi5Stand;
              this.returnParameter.kpi5Score = res.data.result.kpi5Score;
              this.returnParameter.kpi5Rank = res.data.result.kpi5Rank;
              this.returnParameter.kpi6Down = res.data.result.kpi6Down;
              this.returnParameter.kpi6Rate = parseFloat((res.data.result.kpi6Rate).toFixed(2));
              this.returnParameter.kpi6Up = res.data.result.kpi6Up;
              this.returnParameter.kpi6Min = res.data.result.kpi6Min;
              this.returnParameter.kpi6Stand = res.data.result.kpi6Stand;
              this.returnParameter.kpi6Score = res.data.result.kpi6Score;
              this.returnParameter.kpi6Rank = res.data.result.kpi6Rank;
              this.returnParameter.kpi7Score = res.data.result.kpi7Score;
              this.returnParameter.kpi7Stand = res.data.result.kpi7Stand;
              this.returnParameter.kpi7 = (Number(res.data.result.kpi7).toFixed(2))*1;
              this.returnParameter.kpi7Rank = res.data.result.kpi7Rank;
              this.returnParameter.kpiRank = res.data.result.kpiRank;
            } else {
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
        }
      },
      onChangeSumType(type){
        if (1 === type && this.parameters.dayTime !== '' && this.parameters.dayTime !== 'null' && this.parameters.dayTime !== null
          && this.parameters.dayTime !== undefined && this.parameters.dayTime !== 'undefined'){
          this.parameters.sumType = "D";
          this.parameters.monthTime = '';
          this.parameters.weekStartTime = '';
          this.parameters.weekEndTime = '';
        } else if (2 === type && this.parameters.weekStartTime !== '' && this.parameters.weekStartTime !== 'null' && this.parameters.weekStartTime !== null
          && this.parameters.weekStartTime !== undefined && this.parameters.weekStartTime !== 'undefined'){
          this.parameters.sumType = "W";
          this.parameters.monthTime = '';
          this.parameters.dayTime = '';
        } else if (3 === type && this.parameters.monthTime !== '' && this.parameters.monthTime !== 'null' && this.parameters.monthTime !== null
          && this.parameters.monthTime !== undefined && this.parameters.monthTime !== 'undefined'){
          this.parameters.sumType = "M";
          this.parameters.dayTime = '';
          this.parameters.weekStartTime = '';
          this.parameters.weekEndTime = '';
        }
        this.netKpiMonitor(type);
      },
      initData(){
        this.returnParameter.areaRank = "";
        this.returnParameter.netScore = "";
        this.returnParameter.kpi1Exp = "";
        this.returnParameter.kpi1Down = "";
        this.returnParameter.kpi1Rate = 0;
        this.returnParameter.kpi1Up = "";
        this.returnParameter.kpi1Min = "";
        this.returnParameter.kpi1Stand = "";
        this.returnParameter.kpi2Exp = "";
        this.returnParameter.kpi2Down = "";
        this.returnParameter.kpi2Rate = 0;
        this.returnParameter.kpi2Up = "";
        this.returnParameter.kpi2Min = "";
        this.returnParameter.kpi2Stand = "";
        this.returnParameter.kpi3Exp = "";
        this.returnParameter.kpi3Down = "";
        this.returnParameter.kpi3Rate = 0;
        this.returnParameter.kpi3Up = "";
        this.returnParameter.kpi3Min = "";
        this.returnParameter.kpi3Stand = "";
        this.returnParameter.kpi4Down = "";
        this.returnParameter.kpi4Rate =  0;
        this.returnParameter.kpi4Up = "";
        this.returnParameter.kpi4Min = "";
        this.returnParameter.kpi4Stand = "";
        this.returnParameter.kpi5Down = "";
        this.returnParameter.kpi5Rate =  0;
        this.returnParameter.kpi5Up = "";
        this.returnParameter.kpi5Min = "";
        this.returnParameter.kpi5Stand = "";
        this.returnParameter.kpi6Down = "";
        this.returnParameter.kpi6Rate = 0;
        this.returnParameter.kpi6Up = "";
        this.returnParameter.kpi6Min = "";
        this.returnParameter.kpi6Stand = "";
        this.returnParameter.kpi7Score ="--";
        this.returnParameter.kpi6Score ="--";
        this.returnParameter.kpi5Score ="--";
        this.returnParameter.kpi4Score ="--";
        this.returnParameter.kpi3Score ="--";
        this.returnParameter.kpi2Score ="--";
        this.returnParameter.kpi1Score ="--";
        this.returnParameter.kpi7 = 0;
        this.returnParameter.kpi7Stand = "";
        this.returnParameter.kpi1Rank = "";
        this.returnParameter.kpi2Rank = "";
        this.returnParameter.kpi3Rank = "";
        this.returnParameter.kpi4Rank = "";
        this.returnParameter.kpi5Rank = "";
        this.returnParameter.kpi6Rank = "";
        this.returnParameter.kpi7Rank = "";
      }
    }
  }
</script>
<style>
  .weui-cell {
    /* padding-right:30px !important; */
  }
  .weui-label{
    width: 8.5em;
  }
  .weui-btn.yto-btn-primary {
    font-size: 12px ;
  }
  .vue-better-calendar .calendar-body .calendar-weeks ul .weekday {
    list-style: none;
  }
  .vue-better-calendar .calendar-body .calendar-dates .date-row ul .calendar-day {
    list-style: none;
  }
</style>

<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';
  .tips {
    font-size: 14px;
    color: #999;
    padding-left:20px;
    padding-top:10px;
  }

  ul {
    list-style: none;
  }
  .date-input {
    text-align: center;
    padding:5px 0;
    border: none;
    border-bottom:1px solid #666;
    width: 43%;
  }
  .start-date {
    margin-left:13px;
  }
  .end-date {
    //  margin-right:13px;
  }
  .yto-hot {
    text-align: center;
    padding-bottom: 20px;
    padding-top: 12px;
    h2 {
      line-height: inherit;
      font-size: 28px;
      color: #4080CA;
      b {
        font-size: 12px;
      }
    }
    span {
      font-size: 12px;
      color: #666;
    }
  }
  .yto-hot1 {
    text-align: center;
    padding-bottom: 20px;
    h2 {
      line-height: inherit;
      font-size: 28px;
      color: #4080CA;
      b {
        font-size: 12px;
      }
    }
    span {
      font-size: 12px;
      color: #666;
    }
  }

  .yto-grid {
    padding-left: 16px;
    position: relative;
    text-align: center;
    > h3 {
      font-size: 20px;
      color: #333;
      line-height: normal;
      font-weight: 600;
    }
    > span {
      font-size: 12px;
      color: #666;
    }
  }

  .title-right {
    position: absolute;
    right: 12px;
    top: 15px;
  }
  .vux-circle-demo {
    padding-top: 0;
    text-align: center;
  }
  .vux-circle-demo > div {
    margin: 0 auto;
  }
  .hot {
    padding-bottom: 12px;
    padding-left: 8px;
    width: 230px;
    font-size: 15px;
  }
  .icons-red-hot {
    padding-bottom: 12px;
    padding-left: 8px;
    width: 230px;
    font-size: 15px;
    color: #CE3C39;
  }
  .no-icon-red-hot {
    padding-bottom: 12px;
    padding-left: 35px;
    width: 230px;
    font-size: 15px;
    color: #CE3C39;
  }
  .no-icon-hot {
    padding-bottom: 12px;
    padding-left: 35px;
    width: 230px;
    font-size: 15px;
  }
  .no-icon-rank-1-hot {
    padding-bottom: 45px;
    padding-left: 60px;
    width: 230px;
    font-size: 15px;
  }
  .no-icon-rank-2-hot {
    padding-bottom: 10px;
    padding-left: 60px;
    width: 230px;
    font-size: 15px;
  }
  .level-css{
    text-align: right;
    font-size: 14px;
    margin-top: -15px;
    padding: 3px 15px 10px;
  }
  .lable-css{
    padding: 0 8px 0;
    color:#4080CA;
  }
  .color-style{
    color: #333333;
  }
  .img-style{
    margin: -4px 3px;
  }
  .color-style-red{
    color: #CE3C39;
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
    .yto-item {
      min-width: 31.43% !important;
      max-width: 31.43%;
      // padding: 5px 12px !important;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .ol_style{
    font-size: 12px;
    padding: 0 25px;
  }
  .flexbox-style{
    padding:5px 1px 5px;
    color: #999 !important;
    border-bottom: 1px solid #F0F0F0;
  }
</style>

