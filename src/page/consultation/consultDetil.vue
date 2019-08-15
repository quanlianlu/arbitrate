<template>
  <div style="height:100%;">
    <view-box body-padding-bottom="46px" body-padding-top="46px">
      <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                :title="consultDetail.businessType == '0'?'咨询详情':consultDetail.businessType == '2'?'快件详情':'未知类别'"
                :left-options="{backText:''}" @on-click-back="backClick">
        <div slot="right" @click="subscribe()">
          <img src="../../assets/img/ding.png">
        </div>
      </x-header>
      <swiper :show-dots="false" v-model="parameters.index" ref="swiper" @on-index-change="nextDetails">
        <swiper-item v-for="(item,index) in consultList" :key="index" ref="swiperitem">
          <group label-width="4.5em" label-margin-right="2em" label-align="right" style="width: 100%;">
            <cell title="运单号" :value="consultDetail.waybillNo" value-align="left"></cell>
            <cell title="客户姓名" value-align="left">{{consultDetail.customerName}}
              {{consultDetail.customerSex == '1' ? '先生' : '女士'}}
            </cell>
            <cell title="客户电话" :value="phoneNum" value-align="left"></cell>
            <cell title="业务类型"
                  :value="consultDetail.businessType == '0'?'咨询':consultDetail.businessType == '2'?'快件查询':'未知类别code'+consultDetail.businessType"
                  value-align="left"></cell>
            <cell title="咨询大类" :value="consultDetail.bigProblemName" value-align="left"></cell>
            <cell title="咨询小类" :value="consultDetail.smallProblemName" value-align="left"></cell>
            <cell title="始发组织" :value="consultDetail.sendOrgName" value-align="left" align-items="flex-start"></cell>
            <cell title="问题描述" :value="consultDetail.remarkContent" value-align="left" align-items="flex-start"></cell>
          </group>
        </swiper-item>
      </swiper>
    </view-box>
  </div>
</template>
<script>
  /* eslint-disable linebreak-style */

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
    Previewer
  } from 'vux';
  import {mapState, mapActions} from 'vuex';
  import {consultDetil} from '../../service/service';
  import {appUtil} from "../../common/commonUtils";

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
      Previewer
    },
    computed: {
      ...mapState({
        direction: state => state.vux.demoScrollTop,
        demoTop: state => state.vux.demoScrollTop
      })
    },
    methods: {
      ...mapActions([
        'updateDemoPosition'
      ]),
      onImgError(item, $event) {
        console.log(item, $event);
      },
      pullUp() {
        setTimeout(() => {
          this.pullUpConfig.showLoading = true;
          this.lists.push('2');
        }, 200);
      },
      backClick() { // 返回上一页
        this.$router.go(-1);
      },
      async getDetils() { // 获取详细
        let getData = await consultDetil({id: this.parameters.id, waybillNo:this.parameters.waybillNo});
        this.consultDetail = getData.data;
        if (this.consultDetail.customerTel) {
          this.phoneNum = this.consultDetail.customerTel;
        } else {
          this.phoneNum = this.consultDetail.customerMobile;
        }

        this.$nextTick(() => {
          let winH = document.body.scrollHeight;
          let swiperH = this.$refs.swiperitem[this.parameters.index].$el.scrollHeight;
          if (swiperH < winH) {
            swiperH = winH;
          }
          this.$refs.swiper.xheight = swiperH + 'px';
          this.$vux.loading.hide();
        });
      },
      async nextDetails(index) { // 滑动下一个详情
        this.$vux.loading.show({
          text: '加载中'
        });
        this.parameters = Object.assign({}, this.consultList[index]);
        this.parameters.index = index;
        await this.getDetils();
      },
      subscribe() {
        appUtil.subscribe(this.parameters.waybillNo)
      }
    },
    created() {
      this.parameters = this.$route.params.item;
      this.consultList = this.$route.params.consultList;
      this.getDetils();
      window.goToBack = () => {
        this.backClick();
      };
    },
    data() {
      return {
        parameters: null,
        consultDetail: {},
        consultList: [],
        titleName: '',
        phoneNum: ''
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
</style>
