<template>
	<div style="height:100%;">
		<view-box ref="viewBox" body-padding-bottom="0" :body-padding-top="isShow?'46px':0">
			<!--标题-->
			<x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="网点催件查询" :left-options="{preventGoBack:true, backText:'返回'}" @on-click-back="backClick" v-show="isShow">
				<a slot="left" @click="popRootBack" class="yto-head-close" v-if="isShowClose">
					<x-icon class="yto-icon" type="ios-close-empty" size="40"></x-icon>
				</a>
			</x-header>
			<!-- 订单催件，运单催件 button-->
			<div class="yto-box">
				<checker v-model="defaultList" type="radio" :radio-required="true" default-item-class="demo1-item" selected-item-class="demo1-item-selected">
					<checker-item v-for="(item, index) in titlelist" :key="index" :value="index" @click.native="switchTab(item.key);">{{item.value}}
					</checker-item>
				</checker>
			</div>

			<group label-width="4.5em" label-margin-right="2em" label-align="right" gutter="10px">
				<x-input type="text" title="运<i class='vux-blank-half' ></i>单<i class='vux-blank-half'></i>号" v-model="parameters.wayBillNo" @on-change="wayBillNoChange()" v-if="nowTab=='expressSearch'" ref="wayBillNo"></x-input>
				<x-input type="text" title="订<i class='vux-blank-half' ></i>单<i class='vux-blank-half'></i>号" v-model="parameters.orderNo" @on-change="wayBillNoChange()" v-if="nowTab=='consult'" ref="wayBillNo"></x-input>
				<cell title="处理状态" value-align="left">
					<checker v-model="parameters.stateId" default-item-class="demo2-item" selected-item-class="demo2-item-selected" type="radio" :radio-required="true">
						<checker-item :key="index" :value="item.key" v-for="(item, index) in stateId">{{item.value}}
						</checker-item>
					</checker>
				</cell>
				<!--v-model="parameters.beginTime" :end-date="endDate"  @on-change="changeDate('start')"-->
				<Datetime title="查询时间" placeholder="开始时间" start-date="2017-01-01" value-text-align="left" format="YYYY-MM-DD HH:mm" year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}时"></Datetime>
				<!--v-model="parameters.endTime" start-date="parameters.beginTime.substring(0, 10)" :end-date="endDate" @on-change="changeDate('end')"-->
				<Datetime title="" placeholder="结束时间" value-text-align="left" format="YYYY-MM-DD" year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}时"></Datetime>
				<cell title=""></cell>
				<cell title="催件来源" :value="parameters.microMessageSource" value-align="left" @click.native="showType = true;showPopup = (nowTab=='consult')" :is-link="nowTab=='consult'" v-show="parameters.checky"></cell>
			</group>
			<div style="padding:20px;">
				<x-button text="提交" type="primary" @click.native="submitConsult"></x-button>
			</div>
			<!--问题大小类弹出框-->
			<div v-transfer-dom>
				<popup v-model="showPopup">
					<div>
						<tab>
							<tab-item :selected="showType" @on-item-click="showType = true">大类</tab-item>
							<tab-item :selected="!showType" @on-item-click="showType = false">小类</tab-item>
						</tab>
					</div>
					<div class="popup">
						<group v-show="showType">
							<cell-box @click.native="selectBig(item)" v-for="(item, index) in issueTypeJson_0" :key="index">
								{{item.problemName}}
							</cell-box>
						</group>
						<group v-show="!showType">
							<cell-box @click.native="selectSmall(item)" v-for="(item, index) in currentBigNode.smallProblemList" :key="index">
								{{item.smallProblemName}}
							</cell-box>
						</group>
					</div>
				</popup>
			</div>
			<!--网点模糊匹配-->
			<div v-transfer-dom>
				<popup v-model="popupShow" position="right" width="100%">
					<view-box body-padding-bottom="0" body-padding-top="26px">
						<x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="网点查询" :left-options="{preventGoBack:true, backText:''}" @on-click-back="popupShow = false"></x-header>
						<group label-width="0em" label-margin-right="2em">
							<x-input title="" placeholder="输入网点名称或网点代码" text-align="center" v-model="searchText" @on-change="getBranch"></x-input>
						</group>
						<group label-width="0em" label-margin-right="2em">
							<cell-box @click.native="setBranch(item)" v-for="(item, index) in branchList" :key="index">
								{{item.code}} {{item.name}}
							</cell-box>
						</group>
					</view-box>
				</popup>
			</div>
		</view-box>
		<!--与原生互跳弹出框-->
		<div v-transfer-dom>
			<x-dialog hide-on-blur @click="showScrollBox = false" v-model="showScrollBox" :dialog-style="dialogCss">
				<div class="yto-dialog">
					<p class="dialog-title cj-icon" @click="pushVC">查件</p>
				</div>
			</x-dialog>
		</div>
	</div>
</template>

<script>
	import {
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
		CellBox,
		DatetimeRange,
		Flexbox,
		FlexboxItem,
		Datetime,
		Popup,
		Tab,
		TabItem,
		XDialog,
		TransferDomDirective
	} from 'vux';
	import { issueTypeList, searchBranch, processInfomation, consultSubmit } from '../../service/service';
	import { appUtil } from '../../common/commonUtils';
	import { constant } from '../../common/publicConstant';
	import { wayBillNoLowToUp } from '../../common/publicMethods';

	export default {
		directives: {
			TransferDomDirective
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
			CellBox,
			DatetimeRange,
			Flexbox,
			FlexboxItem,
			Datetime,
			Popup,
			Tab,
			TabItem,
			XDialog
		},
		methods: {
			//选择Table
			switchTab(key) {
				checkingType = key;
			},
			// 运单号带出网点
			async wayBillNoChange() {
				// 运单号小写变大写
				this.parameters.wayBillNo = this.parameters.wayBillNo.toUpperCase();
				let stationObj = await processInfomation({
					wayBillNo: this.parameters.wayBillNo
				});
				if(stationObj.status == 0) {
					this.parameters.sendOrgName = stationObj.data.sourceOrgName;
					this.parameters.sendOrgCode = stationObj.data.sourceOrgCode;
					// 若业务类型为'快件查询',则自动带入物料发放网点为始发网点
					if(this.nowTab == 'expressSearch') {
						this.parameters.sendOrgName = stationObj.data.billSourceOrgName;
						this.parameters.sendOrgCode = stationObj.data.billSourceOrgCode;
					}
				}
			},
			setBranch(item) { // 设置接单网点
				this.parameters.sendOrgCode = item.code;
				this.parameters.sendOrgName = item.name;
				this.popupShow = false;
			},
			async getBranch() { // 模糊匹配网点
				if(this.searchText == null || this.searchText == '') {
					return;
				}
				let vali = {
					stationName: this.searchText
				}; // 按网点名称查询
				var reg = /^(([0-9])|([1-9]([0-9]+)))$/;
				if(reg.test(this.searchText)) {
					vali = {
						stationCode: this.searchText
					}; // 若未纯数字则按网点code查询
				}
				let stationObj = await searchBranch(vali);
				this.branchList = stationObj.data.list;
			},
			reportWarnTimeOut(times) { // 封装弹框定时器
				let timerFlag = window.setTimeout(() => {
					this.$vux.alert.hide();
				}, times);
				return timerFlag;
			},
			reportWarnPart(title, content, timerFlag) { // 点击确定时删除指定定时器
				this.$vux.alert.show({
					title: title,
					content: content,
					onHide() {
						window.clearTimeout(timerFlag);
					}
				});
			},
			created() {
				this.isShowClose = appUtil.showClose();
				let nowTime = moment(new Date());
				let modifyTime = moment(new Date());
				this.endDate = nowTime.format('YYYY-MM-DD');
				this.parameters.endTime = nowTime.format('YYYY-MM-DD');
				modifyTime.add(-3, 'd')
				this.parameters.beginTime = modifyTime.format('YYYY-MM-DD');
				this.parameters.type = this.$route.params.type;
				this.getUser();
				window.getQRScan = (code) => {
					this.parameters.waybillNo = code;
				};
				window.goToBack = () => {
					this.backClick();
				};
			},
			async submitConsult() { // 表单提交
				var reg = constant.wayBillNoRegular();
				if(this.nowTab === 'expressSearch' && this.parameters.wayBillNo === '') {
					let timerFlag = this.reportWarnTimeOut(3000);
					this.reportWarnPart('操作提示', '快件查询时运单号不能为空', timerFlag);
					return;
				}
				if(this.parameters.wayBillNo !== '' && !reg.test(this.parameters.wayBillNo)) {
					let timerFlag = this.reportWarnTimeOut(3000);
					this.reportWarnPart('操作提示', '运单号不正确，请重新填写', timerFlag);
					return;
				}
				// 运单号字母小写转大写
				this.parameters.wayBillNo = wayBillNoLowToUp(this.parameters.wayBillNo);
				if(this.parameters.customerName === '') {
					this.$vux.alert.show({
						title: '操作提示',
						content: '请填写客户姓名'
					});
					setTimeout(() => {
						this.$vux.alert.hide();
					}, 3000);
					return;
				}
				if(this.parameters.remarkContent === '') {
					this.$vux.alert.show({
						title: '操作提示',
						content: '请填写咨询内容'
					});
					setTimeout(() => {
						this.$vux.alert.hide();
					}, 3000);
					return;
				}
				if(this.parameters.smallProblemId === '-1' && this.parameters.bigProblemId !== '-1') {
					this.$vux.alert.show({
						title: '操作提示',
						content: '请填写问题小类'
					});
					setTimeout(() => {
						this.$vux.alert.hide();
					}, 3000);
					return;
				}
				let res = await consultSubmit(this.parameters);
				if(res.status === 0) {
					this.$vux.alert.show({
						title: '提示',
						content: '提交成功'
					});
					setTimeout(() => {
						this.$vux.alert.hide();
					}, 3000);
					this.parameters = {
						wayBillNo: '',
						stateId: '1',
						microMessageSource: '请选择问题大类',
						remarkContent: ''
					};
				}
			},
			backClick() {
				appUtil.back();
			},
			popRootBack() {
				appUtil.goToRoot();
			},
			// 是够显示小工具
			/*pushVCShow() {
				this.showScrollBox = true;
			},*/
			pushVC() {
				this.showScrollBox = false;
				appUtil.pushVCName('SearchOddNumViewController', {
					oddNum: this.parameters.wayBillNo
				});
			}
		},
		data() {
			return {
				parameters: {
					pageNo: '', //页码
					checkingType: '1', //催件类型 0:运单催件,1:订单催件
					wayBillNo: '', //运单号
					orderNo: '', //订单号
					stateId: '', //处理状态: 30,35正在处理  -- 60 完结  -- null全部状态。
					complaintTimeLower: '', //时间下限
					complaintTimeUpper: '', //时间上限
					microMessageSource: '请选择催件来源' //催件来源
				},
				stateId: [{
						key: '1',
						value: '全部'
					},
					{
						key: '2',
						value: '处理中'
					},
					{
						key: '3',
						value: '已完结'
					}
				],
				//选择订单查询Or运单查询
				titlelist: [{
					key: '0',
					value: '运单催件'
				}, {
					key: '1',
					value: '订单催件'
				}],
				nowTab: 'consult', // 当前业务页面>consult:咨询//expressSearch:快件查询
				issueTypeJson_0: [], // 咨询>问题大小类数据
				issueTypeJson_2: [], // 快件>问题大小类数据
				currentBigNode: {}, // 当前选择的大类节点
				searchText: '', // 查询网点条件
				showType: true,
				showPopup: false,
				popupShow: false, // 网点模糊匹配页面show字段
				branchList: [], // 网点列表
				listRouter: ['one', 'two', 'three'],
				defaultList: 0,
				isShow: true,
				isShowClose: false,
				showScrollBox: false,
				dialogCss: {
					'width': '120px',
					'left': 'auto',
					'top': '62px',
					'right': '-52px',
					'padding-top': '5px',
					'background-color': 'transparent'
				},

			};
		},
		created() {
			this.orderMethods();
			let appParams = appUtil.getParameters();
			if(appParams.oddNum) {
				this.parameters.wayBillNo = appParams.oddNum;
				this.wayBillNoChange();
			}
			window.goToBack = () => {
				this.backClick();
			};
		},
		activated() {
			window.goToBack = () => {
				this.backClick();
			};
		}
	};
</script>

<style scoped>
	.yto-box {
		padding-top: 20px;
		padding-left: 20px;
	}
	
	.popup {
		padding-bottom: 15px;
		height: 350px;
		overflow-y: scroll;
	}
	
	.demo1-item {
		padding: 5px 0 !important;
		border-radius: 3px;
		width: 100px;
		text-align: center;
		background-color: #EFEFEF;
		border: 0 !important;
		margin: 0 3px 8px 3px !important;
	}
	
	.demo1-item-selected {
		background-color: #4080CA;
		color: #fff;
	}
	
	.demo2-item {
		padding: 3px 15px !important;
		border-radius: 3px;
		text-align: center;
		font-size: 0.8em;
		background-color: #EFEFEF;
		border: 0 !important;
		margin: 0 3px !important;
	}
	
	.demo2-item-selected {
		background-color: #4080CA;
		color: #fff;
	}
</style>
