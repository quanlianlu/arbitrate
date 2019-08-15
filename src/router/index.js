const problemSearch = r => require.ensure([], () => r(require('../page/search/problemSearch.vue')), 'problemSearch');
const problemList = r => require.ensure([], () => r(require('../page/search/problemList.vue')), 'problemList');
const problemContent = r => require.ensure([], () => r(require('../page/search/problemContent.vue')), 'problemContent');
const problemPartsSearch = r => require.ensure([], () => r(require('../page/problem/problemPartsSearch.vue')), 'problemPartsSearch');
const problemPartsList = r => require.ensure([], () => r(require('../page/problem/problemPartsList.vue')), 'problemPartsList');
const problemPartsReport = r => require.ensure([], () => r(require('../page/problem/problemPartsReport.vue')), 'problemPartsReport');
const problemPartsDetails = r => require.ensure([], () => r(require('../page/problem/problemPartsDetails.vue')), 'problemPartsDetails');
const problemSubscribeDetail = r => require.ensure([], () => r(require('../page/problem/problemSubscribeDetail.vue')), 'problemSubscribeDetail');

const complainSearch = r => require.ensure([], () => r(require('../page/complain/complainSearch.vue')), 'complainSearch');
const complainList = r => require.ensure([], () => r(require('../page/complain/complainList.vue')), 'complainList');
const complainDetails = r => require.ensure([], () => r(require('../page/complain/complainDetails.vue')), 'complainDetails');

const Consult = r => require.ensure([], () => r(require('../page/consultation/consult.vue')), 'Consult');
const consultList = r => require.ensure([], () => r(require('../page/consultation/consultList.vue')), 'consultList');
const consultDetil = r => require.ensure([], () => r(require('../page/consultation/consultDetil.vue')), 'consultDetil');

const home = r => require.ensure([], () => r(require('../page/home/index.vue')), 'home');
const realTimeBusiness = r => require.ensure([], () => r(require('../page/home/realTimeBusiness.vue')), 'realTimeBusiness');
const realTimeCustomer = r => require.ensure([], () => r(require('../page/home/realTimeCustomer.vue')), 'realTimeCustomer');
const branchBusiness = r => require.ensure([], () => r(require('../page/home/branchBusiness.vue')), 'branchBusiness');
const electronOrder = r => require.ensure([], () => r(require('../page/home/electronOrder.vue')), 'electronOrder');

const urgeExpressPage = r => require.ensure([], () => r(require('../page/urgeExpress/urgeExpressPage.vue')), 'urgeExpressPage');
const urgeExpressSearch = r => require.ensure([], () => r(require('../page/urgeExpress/urgeExpressSearch.vue')), 'urgeExpressSearch');
const urgeExpressDetail = r => require.ensure([], () => r(require('../page/urgeExpress/urgeExpressDetail.vue')), 'urgeExpressDetail');

const unreceivedReport = r => require.ensure([], () => r(require('../page/unreceived/unreceivedReport.vue')), 'unreceivedReport');

const beyondRegionReport = r => require.ensure([], () => r(require('../page/beyondRegion/beyondRegionReport.vue')), 'beyondRegionReport');

// 通辑件上报
const compilationReport = r => require.ensure([], () => r(require('../page/compilation/compilationReport.vue')), 'compilationReport');

// 分公司账单
const selectDate = r => require.ensure([], () => r(require('../page/branchFinance/branchBill/selectDate.vue')), 'selectDate');
const branchBill = r => require.ensure([], () => r(require('../page/branchFinance/branchBill/index.vue')), 'branchBill');
const billManage = r => require.ensure([], () => r(require('../page/branchFinance/branchBill/billManage.vue')), 'billManage');
// 分公司账单汇总
const summary = r => require.ensure([], () => r(require('../page/branchFinance/branchBill/summary.vue')), 'summary');

// 分公司财务首页
const branchHome = r => require.ensure([], () => r(require('../page/branchFinance/branchHome/index')), 'branchHome');
const summaryDetail = r => require.ensure([], () => r(require('../page/branchFinance/branchBill/summaryDetail')), 'summaryDetail');
const summaryInfo = r => require.ensure([], () => r(require('../page/branchFinance/branchBill/summaryInfo')), 'summaryInfo');

//分公司财务余额
const summaryCostAndIncome = r => require.ensure([], () => r(require('../page/branchFinance/branchBalance/summaryCostAndIncome.vue')), 'summaryCostAndIncome');
const summaryReal = r => require.ensure([], () => r(require('../page/branchFinance/branchBalance/summaryReal.vue')), 'summaryReal');

// KPI
const kpiDataSummar = r => require.ensure([], () => r(require('../page/evaluation/kpiDataSummar.vue')), 'kpiDataSummar');

//boss语录
const bossWord = r => require.ensure([],() => r(require('../page/boss/bossWord.vue')),'bossWord')

//遗失预警
const lostClassify = r => require.ensure([],() => r(require('../page/lostWarning/lostClassify.vue')),'lostClassify')
const dealDetail = r => require.ensure([],() => r(require('../page/lostWarning/dealDetail.vue')),'dealDetail')
const expressDetail = r => require.ensure([],() => r(require('../page/lostWarning/expressDetail.vue')),'expressDetail')
//待仲裁遗失
const arbitrateAll = r => require.ensure([],() => r(require('../page/arbitrate/arbitrateAll.vue')),'arbitrateAll')
export default [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/home',
    name: '首页',
    component: home,
    meta: {keepAlive: true},
  },
 
  {
    path: '/arbitrateAll',
    name: '待仲裁遗失',
    component: arbitrateAll,
  },
  {
    path: '/expressDetail',
    name: '分部下业务员和派件量详情',
    component: expressDetail,
  },
  {
    path: '/dealDetail',
    name: '催办明细',
    component: dealDetail
  },
  {
    path: '/lostClassify',
    name: '遗失预警类型',
    component: lostClassify,
    // meta: {keepAlive: true},
  },
  {
    path: '/bossWord',
    name: '董事长语录',
    component: bossWord
  },
  {
    path: '/realTimeBusiness',
    name: '实时业务量',
    component: realTimeBusiness
  },
  {
    path: '/branchBusiness',
    name: '网点业务量',
    component: branchBusiness
  },
  {
    path: '/electronOrder',
    name: '电子面单使用率',
    component: electronOrder
  },
  {
    path: '/realTimeCustomer',
    name: '实时投诉量',
    component: realTimeCustomer
  },
  {
    path: '/Consult',
    name: '咨询登记',
    component: Consult
  },
  {
    path: '/problemSearch',
    name: '查询',
    component: problemSearch,
    meta: {keepAlive: true}
  },
  {
    path: '/problemList',
    name: '查询列表',
    component: problemList,
    meta: {keepAlive: false}
  },
  {
    path: '/problemContent',
    name: '查询详情',
    component: problemContent,
    meta: {keepAlive: false}
  },
  {
    path: '/problem/problemPartsSearch/:type',
    name: '问题件查询',
    component: problemPartsSearch,
    meta: {keepAlive: false}
  },
  {
    path: '/problem/problemPartsList',
    name: '问题件列表',
    component: problemPartsList,
    meta: {keepAlive: false}
  },
  {
    path: '/problem/problemPartsReport',
    name: '问题件上报',
    component: problemPartsReport,
    meta: {keepAlive: false}
  },
  {
    path: '/problem/problemPartsDetails',
    name: '问题件详情',
    component: problemPartsDetails,
    meta: {keepAlive: false}
  }, {
    path: '/problem/problemSubscribeDetail',
    name: '问题件订阅详情',
    component: problemSubscribeDetail,
    meta: {keepAlive: false}
  },
  {
    path: '/complain/complainSearch',
    name: '网点投诉查询',
    component: complainSearch,
    meta: {keepAlive: true}
  },
  {
    path: '/complain/complainList',
    name: '投诉查询列表',
    component: complainList,
    meta: {keepAlive: false}
  },
  {
    path: '/complain/complainDetails',
    name: '投诉详情',
    component: complainDetails,
    meta: {keepAlive: false}
  },
  {
    path: '/consult/consultList',
    name: '咨询快件查询列表',
    component: consultList,
    meta: {keepAlive: false}
  },
  {
    path: '/consult/detail',
    name: '咨询快件网点投诉详情',
    component: consultDetil,
    meta: {keepAlive: false}
  },
  {
    path: '/urgeExpress/Page',
    name: '催件查询列表',
    component: urgeExpressPage,

  },
  {
    path: '/urgeExpress/Search',
    name: '催件查询',
    component: urgeExpressSearch,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/urgeExpress/Detail',
    name: '催件详情',
    component: urgeExpressDetail
  },
  {
    path: '/unreceived/unreceivedReport',
    name: '无着件上报',
    component: unreceivedReport
  },
  {
    path: '/beyondRegion/beyondRegionReport',
    name: '超区件上报',
    component: beyondRegionReport
  },

  {
    path: '/compilation/compilationReport',
    name: '通辑件上报',
    component: compilationReport
  },
  {
    path: '/branchHome',
    name: '分公司财务首页',
    component: branchHome
  },
  {
    path: '/branchBill',
    name: '账单',
    component: branchBill,
    children: [
      {
        path: '/billManage',
        name: 'billManage',
        component: billManage
      },
      {
        path: '/summary',
        name: '汇总',
        component: summary
      },
      {
        path: '/summaryDetail',
        name: 'summaryDetail',
        component: summaryDetail
      },
      {
        path: '/summaryInfo',
        name: 'summaryInfo',
        component: summaryInfo
      }
    ]
  },
  {
    path: '/summaryCostAndIncome',
    name: '账户余额实付实收',
    component: summaryCostAndIncome,
    meta: {keepAlive: false}
  },
  {
    path: '/summaryReal',
    name: '账户余额应付应收',
    component: summaryReal,
    meta: {keepAlive: false}
  },
  {
    path: '/swiperBillManage',
    name: 'swiperBillManage',
    component: billManage
  },
  {
    path: '/selectDate',
    name: 'selectDate',
    component: selectDate
  },
  {
    path: '/kpi/dataSummar',
    name: 'KPI',
    component: kpiDataSummar
  }
];
