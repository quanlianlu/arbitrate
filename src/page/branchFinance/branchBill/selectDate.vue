<template>
  <div id="selectDate">
    <flexbox>
        <flexbox-item><div style="float:left;" @click="handleCancel">取消</div></flexbox-item>
        <flexbox-item><div>时间选择</div></flexbox-item>
        <flexbox-item><div style="float:right;" @click="handleFinish">完成</div></flexbox-item>
    </flexbox>
    <button-tab v-model="tabValue">
        <button-tab-item @on-item-click="handleClickTabItem()">按日选择</button-tab-item>
        <button-tab-item @on-item-click="handleClickTabItem()">按月选择</button-tab-item>
    </button-tab>

    <div v-show="tabValue==0">
        <div style="color: #4080CA;text-align: center;">
            <input :class="{'input-focus': timeTab=='0'}" type="text" placeholder="开始时间" 
                readonly v-model="startTime" @click="handleClickInput(0)"/>
            <span>&nbsp;&nbsp;至&nbsp;&nbsp;</span>
            <input :class="{'input-focus': timeTab=='1'}" type="text" placeholder="结束时间" 
                readonly v-model="endTime" @click="handleClickInput(1)"/>
        </div>
        <div style="position: absolute;z-index: 2;right: 20px;" @click="clearDate">
            <icon name="icon_del" style="width:20px;height:20px;"></icon>
        </div>
        <datetime-view v-model="startTime" :format="format1" v-if="timeTab==0"></datetime-view>
        <datetime-view v-model="endTime" :format="format1" v-if="timeTab==1"></datetime-view>
    </div>
    <div v-show="tabValue==1">
        <div style="color: #4080CA;text-align: center;">
            <input class="input-focus" type="text" placeholder="月份" readonly v-model="month" />
        </div>
        <div style="position: absolute;z-index: 2;right: 20px;" @click="clearDate">
            <icon name="icon_del" style="width:20px;height:20px;"></icon>
        </div>
        <datetime-view v-model="month" :format="format2"></datetime-view>
    </div>
  </div>
</template>

<script>
  import { Flexbox, FlexboxItem, ButtonTab, ButtonTabItem, DatetimeView, Alert } from 'vux';
  export default {
    name: 'selectDate',
    components: {
      Flexbox,
      FlexboxItem,
      ButtonTab,
      ButtonTabItem,
      DatetimeView,
      Alert
    },
    data() {
      return {
          tabValue: 0,
          timeTab: 0,
          startTime: '',
          endTime: '',
          format1: 'YYYY-MM-DD',
          month: '',
          format2: 'YYYY-MM',
          accountType: ''
      }
    },
    created() {
        this.accountType = this.$route.params.accountType
        this.startTime = this.$route.params.startTime,
        this.endTime = this.$route.params.endTime,
        this.month = this.$route.params.month
        if(this.month != '') {
            this.tabValue = 1
        }
    },
    methods: {
        handleCancel() {
            this.startTime = this.$route.params.startTime,
            this.endTime = this.$route.params.endTime,
            this.month = this.$route.params.month
            if(this.accountType === '6') {
                this.$router.push({name: 'billManage', params: {accountType: this.accountType, startTime: this.startTime, endTime: this.endTime, month: this.month}})
            }else {
                this.$router.push({name: 'swiperBillManage', params: {accountType: this.accountType, startTime: this.startTime, endTime: this.endTime, month: this.month}})
            }
        },
        handleFinish() {
            if(this.tabValue === 0) {
                this.month = ''
                if(this.startTime == '') {
                    this.$vux.alert.show({title: '', content: '请选择开始时间'})
                    return
                }
                if(this.endTime == '') {
                    this.$vux.alert.show({title: '', content: '请选择结束时间'})
                    return
                }
                if(this.startTime > this.endTime) {
                    this.$vux.alert.show({title: '', content: '开始时间必须小于结束时间'})
                    return
                }
            }else {
                this.startTime = ''
                this.endTime = ''
                if(this.month == '') {
                    this.$vux.alert.show({title: '', content: '请选择月份'})
                    return
                }
            }
            if(this.accountType === '6') {
                this.$router.push({name: 'billManage', params: {accountType: this.accountType, startTime: this.startTime, endTime: this.endTime, month: this.month}})
            }else {
                this.$router.push({name: 'swiperBillManage', params: {accountType: this.accountType, startTime: this.startTime, endTime: this.endTime, month: this.month}})
            }
        },
        handleClickTabItem() {
            if(this.tabValue === 0) {
                // this.month = ''
                this.timeTab = 0
            }else {
                // this.startTime = ''
                // this.endTime = ''
            }
        },
        handleClickInput(value) {
            this.timeTab = value
        },
        clearDate() {
            this.startTime = ''
            this.endTime = ''
            this.month = ''
        }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import '~vux/src/styles/1px.less';
  #selectDate {
    width: 100%;
    height: 100%; 
    background-color: #fff;
    .vux-flexbox {
        background-color: #4080CA;
        height: 44px;
        padding: 0 20px;
        width: auto;
        .vux-flexbox-item {
            text-align: center;
            color: #fff;
        }
    }
    .vux-button-group {
        margin: 20px;
        border: 1px solid #4080CA;
        border-radius: 10px;
        a.vux-button-group-current {
            color: #FFF;
            background-color: #4080CA;
        }
        a.vux-button-tab-item-first:after {
            border: 0;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }
        a.vux-button-tab-item-last:after {
            border: 0;
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        a.vux-button-tab-item-first {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }
        a.vux-button-tab-item-last {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
    }
    input {
        width: 120px;
        border: 0;
        border-radius: 0;
        border-bottom: 2px solid #e7e7e7;
        color: #4080CA;
        text-align: center;
        padding: 5px 0;
    }
    .input-focus {
        border-bottom-color: #4080CA;
    }
  }
</style>
