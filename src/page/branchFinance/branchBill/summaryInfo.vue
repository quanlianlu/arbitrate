<template>
  <div class="infoBox">
    <x-header :left-options="{backText: ''}">{{infoBox}}
      <div class="info" slot="right">
        <icon name="icon_6" style="color: #ffffff;height: 19px;width: 19px;" @click.native="dialogShow = true"></icon>
      </div>
    </x-header>
    <div class="filterBox">
      <div :class="[clickItem === 'time' ? 'active' : '']" @click="orderByTime">
        按时间
        <span :class="[clickItem === 'time' ? 'activeOrderT' : 'orderT']"></span>
      </div>
      <div :class="[clickItem === 'money' ? 'active' : '']" @click="orderByMoney">
        按金额
        <span :class="[clickItem === 'money' ? 'activeOrderM' : 'orderM']"></span>
      </div>
    </div>
    <iscroll @getData="getData" :data="swiperData" class="iscroll" ref="iscroll">
      <template slot-scope="item">
        <!--<p>{{item.item}}</p>-->
        <div class="listBox">
          <div class="listName">{{item.item.feeName}}</div>
          <div class="listMoney">{{item.item.billAmountStr}}</div>
          <div class="listTime">{{item.item.auditTime}}</div>
        </div>
      </template>
    </iscroll>
    <toast v-model="showtoast" type="warn">亲，到底了</toast>
    <!--弹出层-->
    <div v-transfer-dom>
      <x-dialog v-model="dialogShow" class="dialog-demo" hide-on-blur>
        <div class="img-box" style="padding: 10px;font-size: 14px">
          <div class="infoDetail" style="text-align: left">
            <p>默认当月全部应收/应付汇总，可选择时间图标按月份查询，最多查询当前时间T-1往前一年的数据（每日早上7:00更新）</p>
            <p>其它应付：总应付-主要应付</p>
            <p>其它收入：总应收</p>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
  import iscroll from '../components/iscroll/iscroll';
  import {XHeader, Toast,XDialog,TransferDomDirective as TransferDom,} from 'vux';
  import {queryBranchBillList} from '../../../service/service';

  // 小类聚合
  const feeType = ['1111','0120','0050','0004','0139'];
  export default {
    name: "summary-info",
    components: {iscroll, XHeader, Toast, XDialog},
    directives: {
      TransferDom
    },
    data() {
      return {
        dialogShow: false,
        swiperData: [],
        clickItem: '',
        infoBox: '账单汇总',
        pageIndex: 1,
        pageSize: 20,
        sortOrder: '',
        orderBy: false,
        showtoast: false,
        loadData: true
      };
    },
    created() {
      this.accountType = this.$route.params.accountType;
      this.month = this.$route.params.month;
      console.log(this.accountType);
      console.log(this.month);
      this.queryBranchBillListApi();
    },
    methods: {
      getData() {
        if (!this.loadData) {
          return
        }
        // this.queryBranchBillListApi();
        this.pageIndex = this.pageIndex + 1;
        this.queryBranchBillListApi();
      },
      orderByTime() {
        this.loadData = true;
        this.clickItem = 'time';
        this.sortOrder = this.sortOrder === '0' ? '1' : '0';
        this.orderBy = true;
        this.pageIndex = 1;
        this.$refs.iscroll.init();
        this.queryBranchBillListApi()
      },
      orderByMoney() {
        this.loadData = true;
        this.clickItem = 'money';
        this.sortOrder = this.sortOrder === '2' ? '3' : '2';
        this.orderBy = true;
        this.$refs.iscroll.init();
        this.pageIndex = 1;
        this.queryBranchBillListApi();
      },
      queryBranchBillListApi() {
        let iType = {};
        if (feeType.includes(this.accountType)) {
          iType = {feeType: this.accountType}
        } else {
          iType = {billType: this.accountType}
        }
        let obj = {
          month: this.month,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          sortOrder: this.sortOrder
        };
        let params = Object.assign(obj, iType);
        queryBranchBillList(params).then(backJson => {
          console.log(backJson);
          if (backJson.status === 0) {
            // this.swiperData = this.swiperData.concat(backJson.data.list);
            if (this.orderBy) {
              this.swiperData = backJson.data.list;
              this.orderBy = false;
            } else {
              this.swiperData = this.swiperData.concat(backJson.data.list);
            }
            if (backJson.data.list.length === 0) {
              this.$refs.iscroll.endScroll();
              this.showtoast = true;
              this.loadData = false;
              return false;
            }
          }
        });
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .infoBox {
    background-color: #ffffff;
    .iscroll {
      padding: 0 15px;
    }
    .filterBox {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      margin: 0 20px;
      border-bottom: 1px dotted #999999;
      span{
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-top: 3px;
        vertical-align: middle;
      }
      .orderT{
        background: url("../../../assets/img/time.png") no-repeat center center;
        background-size: cover;
      }
      .orderM{
        background: url("../../../assets/img/money.png") no-repeat center center;
        background-size: cover;
      }
      .activeOrderT{
        background: url("../../../assets/img/time_sel.png") no-repeat center center;
        background-size: cover;
      }
      .activeOrderM{
        background: url("../../../assets/img/time_sel.png") no-repeat center center;
        background-size: cover;
      }
    }
    .filterBox {
      .order{
        width: 12px;
        height: 12px;
      }
      .active {
        color: #4080CA;
      }
    }
  }
</style>
