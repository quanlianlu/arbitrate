<template>
<!-- 待仲裁遗失 -->
    <div style="height:100%;">
        <view-box ref="viewBox" body-padding-bottom="0" body-padding-top="46px">
            <x-header
                slot="header"
                style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                title="待仲裁遗失"
                :left-options="{backText:''}" >
            </x-header>
            <div class="outBox">
                <div class="timeTips">统计时间 10:30</div>
                <div class="btnArea">
                    <button-tab>
                        <button-tab-item selected>出港件</button-tab-item>
                        <button-tab-item >进港件</button-tab-item>
                    </button-tab>
                </div>
                <div class="secondChosen">
                    <button-tab>
                        <button-tab-item selected>疑似遗失</button-tab-item>
                        <button-tab-item >待仲裁遗失</button-tab-item>
                    </button-tab>
                </div>
            </div>
            <div class="titleAndCharts">
                <div class="title">待仲裁遗失数据</div>
                <ul class="totalShow">
                    <li class="">
                        <div class="font">总待仲裁遗失</div>
                        <div class="num">4690</div>
                    </li>
                    <li class="">
                        <div class="font">揽收待仲裁遗失</div>
                        <div class="num">1688</div>
                    </li>
                    <li class="">
                        <div class="font">中转待仲裁遗失</div>
                        <div class="num">1688</div>
                    </li>
                    <li class="">
                        <div class="font">派签待仲裁遗失</div>
                        <div class="num">1688</div>
                    </li>
                </ul>
            </div>
        </view-box>
    </div>
</template>

<script>
import {
    XHeader,
    ButtonTab, ButtonTabItem,Tab, TabItem,XTable ,
    ViewBox,
} from 'vux';
export default {
    name:'arbitrate',
    components: {
      XHeader,
      ViewBox,
      ButtonTab,
      ButtonTabItem,
      Tab, TabItem,XTable 
    },

}
</script>

<style>
.secondChosen a {
    border-radius:0px !important;
    font-size: 12px !important;
    height: 20px !important;
    line-height: 20px !important;
}
.secondChosen a::after {
    border-radius:0px !important;
}
</style>
<style scoped>
.outBox {
    
}
.btnArea {
    padding:0px 30px;
    padding-top:20px;
}
.timeTips {
    float: right;
    font-size:12px;
    margin-right:20px;
}
.secondChosen {
    padding:8px 30px 0px 150px;
}
.title {
    padding-left:7px;
    border-left:5px solid blue;
    height: 20px;
    line-height:20px;
}
.titleAndCharts {
    margin:10px;
}
.totalShow {
    text-align:center;
    overflow: hidden;
    width: 100%;
}
.totalShow li {
    float: left;
    list-style: none;
    font-size:12px;
    width: 25%;
    box-sizing: border-box;
    padding:8px;
}
.totalShow li:nth-child(1) .num{
    color:#e15865;
}
.totalShow li:nth-child(2) .num{
    color:#41b65f;
}
.totalShow li:nth-child(3) .num{
    color:red;
}
.totalShow li:nth-child(4) .num{
    color:#41b65f;
}

.num {
    font-size:16px;
}
.font {
    color:#000;
    font-weight:500;
}
</style>

