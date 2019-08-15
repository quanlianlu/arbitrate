<template>
  <div id="billManage">
    <x-header :left-options="{backText: '', preventGoBack: true}" @on-click-back="backClick">
      账单
      <icon name="icon_6" slot="right" style="width:20px;height:20px;color:#fff;" @click.native="dialogShow = true"></icon>
    </x-header>
    <flexbox v-if="showSearch==false">
      <flexbox-item>
        <div :class="{'color-unsel': showFilter, 'color-sel': showFilter}" style="text-align: left;margin-left: 15px;" @click="filterBill">
          筛选&nbsp;<icon name="icon_shaixuan" style="width:12px;height:12px;"></icon></div>
      </flexbox-item>
      <flexbox-item>
        <div :class="{'color-unsel': showSort, 'color-sel': showSort}" @click="sortBill">
          排序&nbsp;<icon name="icon_paixu" style="width:12px;height:12px;"></icon></div>
      </flexbox-item>
      <flexbox-item></flexbox-item>
      <flexbox-item>
        <div :class="{'color-unsel': showSearch, 'color-sel': showSearch}" style="text-align: right;margin-right: 15px;" @click="searchBill">
          搜索&nbsp;<icon name="icon_sousuo" style="width:12px;height:12px;"></icon></div>
      </flexbox-item>
    </flexbox>
    <search v-model="searchValue" ref="search" @on-change="onChange" @on-cancel="onCancel" v-else></search>

    <!-- 排序选项 -->
    <flexbox v-if="showSort==true">
      <flexbox-item v-for="item in sortName" :key="item.value">
        <div class="sort-item bg-unselected" :class="{'bg-unselected': sortValue!=item.value, 'bg-selected': sortValue==item.value}" @click="sortBillTable(item.value)">{{item.name}}</div>
      </flexbox-item>
    </flexbox>

    <!-- 应付/应收 -->
    <div class='total-item' v-if="showSearch==false&&showFilter==false">
      <icon name="icon_money" style="width:27px;height:27px;margin:10px 10px 10px 0;color:#4080CA;"></icon>
      <div class="card-padding">
        <span style="font-size:14px;">{{totalDate}}</span>
        <br/>{{accountType==6?'应付:'+totalCost:'实付:'+realPay}}&nbsp;&nbsp;&nbsp;{{accountType==6?'应收:'+totalIncome:'实收:'+realGet}}
      </div>
      <div class="date-item" @click="selectDate">
        <icon name="icon_5" style="width:14px;height:13px;color: #333333;"></icon>
      </div>
    </div>
    <!-- 账单列表 -->
    <div class="view-tab-item" v-if="showFilter==false">
      <scroller :height="scrollHeight" lock-x use-pullup ref="scroller" :pullup-config="pullupDefaultConfig" :scroll-bottom-offst="200" @on-pullup-loading="pullupLoad">
        <x-table :cell-bordered="false" style="background-color:#fff;">
          <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td class="first-td"><icon name="icon_money" style="width:27px;height:27px;margin-top:12px;margin-left:3px;color:#F8BE1F;" ></icon></td>
            <td style="text-align: left;padding-left: 8px;">{{item.feeName}}</td>
            <td>{{item.billAmountStr}}</td>
            <td style="color:#999999;text-align: right;">{{item.auditTime}}</td>
          </tr>
          </tbody>
        </x-table>
      </scroller>
    </div>
    <!-- 筛选条件 -->
    <div class="view-item" v-if="showFilter==true">
      <group-title>业务收支类型:</group-title>
      <checker v-model="bussType" default-item-class="buss-item">
        <checker-item :value="6||7">
          <icon :name="(bussType==6||bussType==7)?'icon_quanbu_sel':'icon_quanbu_unsel'" style="width:45px;height:45px;"></icon>
          <div>全部</div>
        </checker-item>
        <checker-item value="0" v-if="accountType==6">
          <icon :name="bussType==0?'icon_yingfu_sel':'icon_yingfu_unsel'" style="width:45px;height:45px;"></icon>
          <div>应付</div>
        </checker-item>
        <checker-item value="1" v-if="accountType==6">
          <icon :name="bussType==1?'icon_yingshou_sel':'icon_yingshou_unsel'" style="width:45px;height:45px;"></icon>
          <div>应收</div>
        </checker-item>
        <checker-item value="2" v-if="accountType==7">
          <icon :name="bussType==2?'icon_yingfu_sel':'icon_yingfu_unsel'" style="width:45px;height:45px;"></icon>
          <div>实付</div>
        </checker-item>
        <checker-item value="3" v-if="accountType==7">
          <icon :name="bussType==3?'icon_yingshou_sel':'icon_yingshou_unsel'" style="width:45px;height:45px;"></icon>
          <div>实收</div>
        </checker-item>
      </checker>
      <group-title v-if="accountType==6">费用类型:</group-title>
      <checker v-model="costType" type="checkbox" default-item-class="cost-item bg-unselected" selected-item-class="bg-selected" v-if="accountType==6&&bussType==6">
        <checker-item v-for="item in costTypeName1" :key="item.value" :value="item.value">{{item.name}}</checker-item>
      </checker>
      <checker v-model="costType" type="checkbox" default-item-class="cost-item bg-unselected" selected-item-class="bg-selected" v-if="accountType==6&&bussType==0">
        <checker-item v-for="item in costTypeName2" :key="item.value" :value="item.value">{{item.name}}</checker-item>
      </checker>
      <checker v-model="costType" type="checkbox" default-item-class="cost-item bg-unselected" selected-item-class="bg-selected" v-if="accountType==6&&bussType==1">
        <checker-item v-for="item in costTypeName3" :key="item.value" :value="item.value">{{item.name}}</checker-item>
      </checker>
      <group-title>金额:</group-title>
      <div style="color: #999999;">
        <input type="text" placeholder="￥最低金额" v-model="minAmount" />
        <span>-</span>
        <input type="text" placeholder="￥最高金额" v-model="maxAmount" />
      </div>
      <group-title></group-title>
      <x-button type="default" @click.native="resetFilterItem">重置</x-button>
      <x-button type="primary" @click.native="confirmFilterBill">确定</x-button>
    </div>

    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 14px">
          <div class="infoDetail" style="text-align: left">
            <p>默认按时间降序排列当月全部账单明细，可选择时间图标按日（按查询日期起始时间与终止时间）、按月（按查询月统计）查询全部账单明细，最多查询当前时间T-1往前一年的数据（每日早上7:00更新）</p>
            <p>全部：应付+应收/实付+实收</p>
            <p>其它：除应付费用项【面单费、中转费、出港派费、出港操作费、建包费、物料费、奖罚款】、应收费用项【进港派费、网点补贴、奖罚款】外的其他费用项</p>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
  import { TransferDom, XHeader, Flexbox, FlexboxItem, XTable, Scroller, Popup, Search, Checker, CheckerItem, XButton, GroupTitle, Card, XDialog } from 'vux';
  import { dateFormat } from 'vux'
  import { queryBranchBillList } from '../../../service/service';
  export default {
    name: 'billManage',
    directives: {
      TransferDom
    },
    components: {
      XHeader, Flexbox, FlexboxItem, XTable, Scroller, Popup, Search, Checker, CheckerItem, XButton, GroupTitle, Card,XDialog
    },
    data() {
      return {
        scrollHeight: 'calc(100vh - 200px)',
        pullupDefaultConfig: {
          content: '上拉加载更多',
          pullUpHeight: 60,
          height: 40,
          autoRefresh: false,
          downContent: '释放后加载',
          upContent: '上拉加载更多',
          loadingContent: '加载中...',
          clsPrefix: 'xs-plugin-pullup-'
        },
        accountType: '', // 6:综合账户, 7:代收账户
        showFilter: false,
        showSort: false,
        showSearch: false,
        totalDate: '',
        totalCost: '',
        totalIncome: '',
        realGet: '',
        realPay: '',
        tableData: [],
        pageIndex: 1,
        pageSize: 10,
        sortName: [
          {value: 0, name: '时间降序'}, {value: 1, name: '时间升序'},
          {value: 2, name: '金额升序'}, {value: 3, name: '金额降序'}
        ],
        // 全部
        costTypeName1: [
          {value: '0004', name: '网点补贴'}, {value: '0157', name: '派送费(进港)'},
          {value: '0102', name: '面单费'}, {value: '0002', name: '中转费'}, {value: '0158', name: '派送费(出港)'},
          {value: '0019', name: '出港操作费'}, {value: '0114', name: '建包费'},
          // {value: '0011', name: '物料费'}, {value: '0022', name: '奖罚款'}, {value: '000', name: '其他'}
          {value: '0022', name: '奖罚款'}, {value: '000', name: '其他'}
        ],
        // 应付
        costTypeName2: [
          {value: '0102', name: '面单费'}, {value: '0002', name: '中转费'}, {value: '0158', name: '派送费(出港)'},
          {value: '0019', name: '出港操作费'}, {value: '0114', name: '建包费'},
          // {value: '0011', name: '物料费'}, {value: '0022', name: '奖罚款'}, {value: '0000', name: '其他'}
          {value: '0022', name: '奖罚款'},{value: '0000', name: '其他'}
        ],
        // 应收
        costTypeName3: [
          {value: '0050', name: '派送费'}, {value: '0004', name: '网点补贴'}, {value: '0157', name: '派送费(进港)'},
          {value: '0022', name: '奖罚款'}, {value: '1111', name: '其他'}
        ],
        searchValue: '',
        sortValue: 0,
        bussType: '',
        costType: [],
        minAmount: '',
        maxAmount: '',
        startTime: '',
        endTime: '',
        month: '',
        dialogShow: false
      };
    },
    created() {
      if(this.$route.params.accountType) {
        this.accountType = this.$route.params.accountType
      }else {
        this.accountType = '6'
      }
      this.bussType = this.accountType
      if(this.$route.params.startTime) {
        this.startTime = this.$route.params.startTime
      }
      if(this.$route.params.endTime) {
        this.endTime = this.$route.params.endTime
      }
      if(this.$route.params.month) {
        this.month = this.$route.params.month
      }
    },
    mounted() {
      if(this.month && this.month !== '') {
        this.totalDate = this.month
      }else if(this.startTime && this.startTime !== '' && this.endTime && this.endTime !== '') {
        this.totalDate = this.startTime + '~' + this.endTime
      }else {
        this.month = dateFormat(new Date(), 'YYYY-MM')
        this.totalDate = this.month
      }
      this.getBranchBillList()
    },
    watch: {
      // 每次切换业务类型时清空费用类型选项
      bussType(val) {
        this.costType = []
      }
    },
    methods: {
      backClick() {
        this.$router.push({path: '/branchHome'})
      },
      filterBill() {
        this.showFilter = !this.showFilter
        this.showSort = false
        this.showSearch = false
      },
      sortBill() {
        this.showSort = !this.showSort
        this.showFilter = false
        this.showSearch = false
      },
      searchBill() {
        this.scrollHeight =  'calc(100vh - 100px)'
        this.showSearch = true
        this.showFilter = false
        this.showSort = false
        this.$nextTick(() => {
          this.$refs.search.setFocus()
        })
      },
      // 搜索
      onChange(val) {
        this.pageIndex = 1
        this.getBranchBillList()
      },
      onCancel() {
        this.scrollHeight =  'calc(100vh - 200px)'
        this.showSearch = false
      },
      // 账单排序
      sortBillTable(value) {
        this.pageIndex = 1
        this.sortValue = value
        this.getBranchBillList()
      },
      selectDate() {
        this.$router.push({name: 'selectDate', params: {accountType: this.accountType, startTime: this.startTime, endTime: this.endTime, month: this.month}})
      },
      // 获取过滤条件
      getFilterItems() {
        let params = {}
        params.pageIndex = this.pageIndex
        params.pageSize = this.pageSize
        params.sortOrder = this.sortValue
        if(this.bussType == '6' || this.bussType == '7') {
          this.bussType = this.accountType
        }
        params.billType = this.bussType
        //   if(this.costType !== '') {
        //       params.feeType = this.costType
        //   }
        if(this.costType.length !== 0) {
          params.multiFeeType = this.costType
        }
        if(this.searchValue !== '') {
          params.feeName = this.searchValue
        }
        if(this.minAmount !== '' && this.maxAmount !== '') {
          params.moneyRange = [this.minAmount, this.maxAmount]
        }
        if(this.month !== '') {
          params.month = this.month
        }else if(this.startTime !== '' && this.endTime !== '') {
          params.dateRange = [this.startTime, this.endTime]
        }
        return params
      },
      // 初始化加载账单列表
      getBranchBillList() {
        let params = this.getFilterItems()
        queryBranchBillList(params).then(backJson => {
          if (backJson.status === 0) {
            if(backJson.data.cost) {
              this.totalCost = backJson.data.cost;
            }
            if(backJson.data.income) {
              this.totalIncome = backJson.data.income;
            }
            if(backJson.data.realPay) {
              this.realPay = backJson.data.realPay;
            }
            if(backJson.data.realGet) {
              this.realGet = backJson.data.realGet;
            }
            this.tableData = backJson.data.list;
            this.$nextTick(() => {
              this.$refs.scroller.reset({top: 0})
            })
          }
        });
      },
      // 上拉追加账单列表
      pullupLoad() {
        this.pageIndex = this.pageIndex + 1
        let params = this.getFilterItems()
        queryBranchBillList(params).then(backJson => {
          if (backJson.status === 0) {
            if(backJson.data.cost) {
              this.totalCost = backJson.data.cost;
            }
            if(backJson.data.income) {
              this.totalIncome = backJson.data.income;
            }
            if(backJson.data.realPay) {
              this.realPay = backJson.data.realPay;
            }
            if(backJson.data.realGet) {
              this.realGet = backJson.data.realGet;
            }
            let list = backJson.data.list;
            if(list.length == 0) {
              this.$nextTick(() => {
                this.$refs.scroller.donePullup()
                document.getElementsByClassName('xs-plugin-pullup-container')[0].innerHTML = '没有更多数据'
                if(this.tableData.length < 10) {
                  this.$refs.scroller.reset({top: 0})
                }
              })
            }else {
              for (let i = 0; i < list.length; i++) {
                this.tableData.push(list[i])
              }
              this.$nextTick(() => {
                this.$refs.scroller.donePullup()
                document.getElementsByClassName('xs-plugin-pullup-container')[0].innerHTML = '上拉加载更多'
              })
            }
          }
        });
      },
      resetFilterItem() {
        this.costType = ''
        this.minAmount = ''
        this.maxAmount = ''
      },
      confirmFilterBill() {
        this.pageIndex = 1
        this.getBranchBillList()
        this.showFilter = !this.showFilter
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import '~vux/src/styles/1px.less';
  .weui-tab__panel {
    overflow: hidden!important;
  }
  #billManage {
    width: 100%;
    height: 100%;
    background-color: #fff;
    .vux-flexbox {
      height: 40px;
      .vux-flexbox-item {
        text-align: center;
        font-size: 15px;
      }
    }
    .weui-search-bar {
      background-color: #4080CA;
      height: 46px;
    }
    .weui-search-bar__cancel-btn {
      color: #fff;
    }
    .weui-cells__title {
      border-top: 1px dashed #BFBFBF;
      padding: 10px 0 5px 5px;
    }
    .weui-btn {
      width: 30vw;
      display: inline-block;
      margin: 10px 20px;
      font-size: 14px;
    }
    .vux-table {
      line-height: 40px;
      width: calc(~'100% - 6px');
    }
    .vux-table:after {
      border-top: 0;
    }
    @media screen and (max-width: 350px) {
      .vux-table td, .vux-table th {
        font-size: 12px;
      }
    }
    @media screen and (min-width: 350px) {
      .vux-table td, .vux-table th {
        font-size: 14px;
      }
    }
    .first-td {
      width: 30px;
    }
    .first-td:before {
      border-bottom: 0;
    }
  }
  .color-unsel {
    color: #4D4D4D;
  }
  .color-sel {
    color: #4080CA;
  }
  .search-item {
    position: absolute;
    z-index: 300;
  }
  .sort-item {
    margin-left: 3vw;
    font-size: 12px;
    width: 60px;
    height: 23px;
    line-height: 23px;
    border-radius: 3px;
  }
  .bg-unselected {
    background-color: #F6F6F6;
  }
  .bg-selected {
    background-color: #4080CA;
    color: #fff;
  }
  .view-tab-item {
    margin: 0 10px;
    overflow-y: auto;
    max-height: 100%;
    font-size: 14px;
  }
  .view-item {
    margin: 0 10px;
    overflow-y: auto;
    max-height: calc(~'100% - 85px');
    font-size: 14px;
  }
  .total-item {
    display: inline-flex;
    border-top: 1px dashed #BFBFBF;
    border-bottom: 1px dashed #BFBFBF;
    width: calc(~'100% - 30px');
    margin: 5px 15px;
    padding: 5px 0;
    margin-bottom: 0;
    font-size: 12px;
    color: #999999;
    span {
      font-size: 14px;
      color: #333333;
    }
    .date-item {
      position: absolute;
      right: 0px;
      margin: 10px 15px;
      width: 30px;
      height: 30px;
      text-align: center;
      line-height: 30px;
    }
  }
  .filter-title {
    margin-left: 10px;
    margin-top: 10px;
  }
  .buss-item {
    width: 27vw;
    margin: 1vw;
    text-align: center;
    font-size: 12px;
    display: inline-grid;
  }
  .cost-item {
    width: 27vw;
    height: 30px;
    line-height: 30px;
    margin: 1vw;
    padding: 0 1vw;
    text-align: center;
    font-size: 12px;
    display: inline-grid;
    border-radius: 3px;
  }
  input {
    width: 27vw;
    height: 30px;
    margin: 1vw;
    border: 1px solid #BFBFBF;
    -webkit-appearance: none;
  }
</style>
