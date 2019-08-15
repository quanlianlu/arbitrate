import {get, post} from '../service/fetch';
/*
 * 账号密码登录
 */
export const accountLogin = (userName, password) => post('/app/loginAjax.action', {userName, password});

/*
 * 获取当前人信息
 */
export const getUserInfo = (params) => get('/user', params);

/*
 * 问题件查询列表
 */
export const searchList = (token, params) => post('/app/loginAjax.action', {token, params});

/*
 * 问题大小类
 */
export const getProblemType = (parameters) => get('problempiece/getProblemType', parameters);

/*
 * 问题件列表
 */
export const problempiece = (parameters) => get('problempiece', parameters);

/*
 * 问题件列表(运单号)
 */
export const problempieceByWaybillNo = (parameters) => get('problempiece/getProByWaybillNo', parameters);
/**
 * 问题件详情
 * @param parameters
 * @returns {*}
 */
export const problempieceDetail = (parameters) => get('problempiece/detail', parameters);
/**
 * 问题件批量解密电话
 * @param parameters
 * @returns {*}
 */
export const problempieceBatchMobile = (parameters) => post('problempiece/batchMobile', parameters);

/**
 * 问题件发送短信
 * @param parameters
 * @returns {*}
 */
export const problempieceSmsSend = (parameters) => get('problempiece/smsSend', parameters);

/**
 * 问题件查询电话校验短信
 * @param parameters
 * @returns {*}
 */
export const problempieceCheckSmsCode = (parameters) => post('problempiece/checkSmsCode', parameters);
/**
 * 问题件电话
 * @param parameters
 * @returns {*}
 */
export const problempieceMobile = (parameters) => get('problempiece/mobile', parameters);
/*
 * 查询网点
 */
export const searchBranch = (params) => get('station/search', params);

/*
 * 走件基本信息
 */
export const processInfomation = (params) => get('express/sendDetailInfo', params);

/*
 * 问题件回复列表
 */
export const problemReply = (params) => get('problempiece/reply', params);

/*
 * 查询走件信息
 */
export const sendInfo = (waybillNo) => get('express/sendInfo', {waybillNo: waybillNo});

/*
 * 查询接收组织
 */
export const searchReceiveOrg = (waybillNo) => get('station/receiveOrgList', {waybillNo: waybillNo});

/*
 * 新查询接收组织
 */
export const searchReceiveGetOrg = (waybillNo) => get('station/getOrg', {waybillNo: waybillNo});

/*
 * 查询接收组织(去重)
 */
export const searchReceiveOrgRemove = (waybillNo) => get('station/receiveOrgListRemove', {waybillNo: waybillNo});

/**
 * 网点信息
 * @param stationCode 网点代码
 * @returns {*}
 */
export const getStationInfo = (stationCode) => get('station/detail', {stationCode: stationCode});

/*
 * 问题件上报
 */
export const report = (parameters) => post('problempiece/save', parameters);

/*
 * 回复问题件
 */
export const replyIssueInfo = (parameters) => post('problempiece/reply', parameters);

/*
 * 问题件常用语
 */
export const getIssueUsually = (params) => get('problempiece/reply/template', params);
/*
 * 投诉常用语
 */
export const getComplainUsually = (params) => get('/complain/reply/phrase', params);

/*
 * 批量回复
 */
export const batchReply = (params) => post('problempiece/reply/batchReply', params);

/*
 * 获取问题大小类
 */
export const issueTypeList = (params) => get('consult/register/getDataProblem', params);

/*
 * 问题件获取图片
 */
export const getFiles = (params) => post('problempiece/getFiles', params);

/*
 * 咨询/快件查询 登记提交
 */
export const consultSubmit = (params) => post('consult/register/submit', params);

/*
 * 咨询/快件查询 查询列表
 */
export const consultList = (params) => get('/consult', params);

/*
 * 咨询/快件查询工单详情
 */
export const consultDetil = (params) => get('/consult/detail', params);

/*
 * 获取投诉来源
 */
export const getComplainSource = (params) => get('/complain/source', params);

/*
 * 获取投诉列表
 */
export const getComplainList = (params) => get('/complain', params);

/*
 * 获取投诉详情
 */
export const getComplainDetail = (params) => get('/complain/detail', params);

/*
 * 获取责任网点
 */
export const getResOrg = (params) => get('/complain/station', params);

/*
 * 投诉回复列表
 */
export const getComplainReplyList = (params) => get('/complain/reply', params);

/*
 * 投诉回复
 */
export const submitReply = (params) => post('/complain/reply', params);

/*
 * 图片上传
 */
export const fileUpload = (params) => post('/attachment/fileUpload', params);

/*
 * 问题件上报常用语
 */
export const reportTemplate = (params) => get('/problempiece/getReportTemplate', params);

/*
 * 管理监控
 */
export const complaintAPI = (params) => get('/monitor/complaint', params);
export const rewardAPI = (params) => get('/monitor/reward', params);
export const realTimeRankAPI = (params) => get('/monitor/realTimeRank', params);
export const complaintChartAPI = (params) => get('/monitor/complaintChart', params);
export const businessChartAPI = (params) => get('/monitor/businessChart ', params);
export const queryReportDataAPI = (params) => get('/rollCall/queryReportData', {'p_endDate': params});
export const queryBranchVolumeAPI = (params) => get('/rollCall/queryBranchVolume', {'p_endDate': params});
export const querySurfaceUseRateAPI = (params) => get('/rollCall/querySurfaceUseRate', {'p_endDate': params});
export const querySurfaceTrendAPI = (params) => get('/rollCall/querySurfaceTrend', {'p_endDate': params});

/*
 * 查询催件分页
 */
export const getUrgeExpressPage = (params) => get('/urgingExpress/getPage', params);

/**
 * 查询催件详情
 */
export const getUrgeExpressDetail = (params) => get('/urgingExpress/getDetail', params);

/**
 * 查询催件回复记录
 */
export const getUrgeExpressReply = (params) => get('/urgingExpress/getStationReply', params);

/**
 * 回复催件
 */
export const urgeExpressPostReply = (params) => post('/urgingExpress/postReply', params);

/**
 * 修改网点
 */
export const urgeExpressModifyStation = (params) => post('/urgingExpress/modifyStation', params);

/**
 * 手机配置
 */
export const mobileConfig = (params) => post('/headless_package/phoneManagement', params);
/**
 * 无着件上报
 */
export const headLessPackageReport = (params) => post('/headless_package/report', params);
/**
 * 无着件上报物品类型
 */
export const headLessPackageType = (params) => post('/headless_package/getType', params);
/**
 * 运单基本信息
 */
export const baseMess = (params) => get('/track/search', params);
/**
 * 获取敏感信息--电话
 */
export const getTel = (params) => get('/digest/getWaybillDigestPhone', params);

/**
 * 获取省市区
 * @param params
 */
export const getDistrict = (params) => post('/databus/function/district/get/contry', params);

/**
 * 根据运单号自动带出省、市、区县、详细地址、重量
 * @param params
 */
export const getOverrangeWaybillSearch = (params) => post('/v1/expuz/overrangeWaybillSearch',  params);


/**
 * 获取超区点下拉列
 * @param params
 */
export const findOverrangePoint = (params) => post('/v1/expuz/findOverrangePoint',  params);

/**
 * 超区件上报
 * @param params
 */
export const saveExpuzInfo = (params) => post('/v1/expuz/saveExpuzInfo',  params);

/**
 * 超区点变动获取对应的金额和超区描述.
 * @param params
 */
export const searchUnpointAmtAndDesc = (params) => post('/v1/expuz/searchUnpointAmtAndDesc',  params);
/**
 * 上报通缉件
 * @param params
 */
export const reportComp = (params) => post('/comp/reportComp', params);

/**
 * 投诉列表
 * @param params
 */
export const complaintApiList = (params) => post('/api/complaint/list', params);

/**
 * 获取投诉工单明细.
 * @param params
 */
export const getcomplaintApiDetail= (params) => post('/api/complaint/getDetail', params);
/**
 * 获取投诉工单回复列表.
 * @param params
 */
export const complaintApiReplyList= (params) => post('/api/complaint/replyList', params);
/**
 * 添加投诉工单回复.
 * @param params
 */
export const complaintApiReplyInsert= (params) => post('/api/complaint/replyInsert', params);
/**
 * c5图片上传接口.
 * @param params
 */
export const  c5FileUpload = (params) => post('/api/reply/file/upload', params);
/**
 * .c5责任网点接口
 * @param params
 */
export const  complaintStation = (params) => post('/api/complaint/station/all', params);
/**
 * .c5工单完结接口
 * @param params
 */
export const  complaintComplete = (params) => post('/api/complaint/complete', params);

/**
 * .c5咨询登记接口
 * @param params
 */
export const  consultInsertApi = (params) => post('/v1/api/consult/insert', params);

/**
 * .首页-账户余额
 * @param params
 */
export const  balanceApi = (params) => post('/v1/finance/balance', params);
export const  balanceIndexApi = (params) => post('/v1/finance/index', params);

/**
 * .分公司首页趋势图
 * @param params
 */
export const  balanceChartsApi = (params) => post('/v1/finance/key/echarts', params);


/**
 * .分公司财务账单
 * @param params
 */
export const  queryBranchBillList = (params) => post('/v1/finance/bill/query', params);

/**
 * .分公司财务汇总
 * @param params
 */
export const  getSummary = (params) => post('/v1/finance/bill/summary', params);

/**
 * .分公司财务成本
 * @param params POST /v1/finance/bill/summary/cost
 */
export const  getSummaryCost = (params) => post('/v1/finance/bill/summary/cost', params);
/**
 * .分公司财务应收
 * @param params POST /v1/finance/bill/summary/income
 */
export const  getSummaryIncome = (params) => post('/v1/finance/bill/summary/income', params);
/**
 * .分公司财务应收/应付汇总
 * @param POST /v1/finance/should/line 汇总应收应付的趋势图
 */
export const  getSummaryshouldline = (params) => post('/v1/finance/should/line', params);
/**
 * .分公司财务应收/应付汇总
 * @param POST /v1/finance/should/ringChart  汇总应收应付的环形图
 */
export const  getSummaryshouldringChart = (params) => post('/v1/finance/should/ringChart', params);

/**
 * .分公司财务实收实付
 * @param params
 */
export const realLineApi =(params) => post('/v1/finance/real/line', params);
/**
 * KPI汇总接口
 * @param params
 */
export const netKpiMonitor =(params) => post('/v1/kpi/getData', params);
/**
 * 获取问题大类调用c5开放平台接口.
 * @param params
 */
export const getBigproblemList =(params) => post('/api/basic/bigproblem/list', params);
/**
 * 获取问题小类调用c5开放平台接口.
 * @param params
 */
export const getSmallproblemList =(params) => post('/api/basic/smallproblem/list', params);
/**
 * 董事长专栏视频或者图片接口.
 * @param params
 */
export const findVideoFile =(params) => post('/v1/boss/videoFile/find', params);
/**
 * 董事长专栏运营消息.
 * @param params
 */
export const findOperation =(params) => post('/v1/boss/operation/find', params);
/**
 * 查询各种预警数量.
 * @param params
 */
export const queryMonitorInfo =(params) => post('/v1/lostMonitor/queryMonitorInfo', params);
/**
 * 点击查询各种相应预警列表.
 * @param params
 */
export const queryMonitorList =(params) => post('/v1/lostMonitor/queryMonitorList', params);
/**
 * 明细列表.
 * @param params
 */
export const queryRemindDetailList =(params) => post('/v1/lostMonitor/queryRemindDetailList', params);
/**
 * 查询分公司下各业务员的需要派件情况.
 * @param params
 */
export const queryTcodeManList =(params) => post('/v1/lostMonitor/queryTcodeManList', params);
