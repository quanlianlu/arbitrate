<template>
  <div class="main">
    <!-- <x-header slot="header" style="width:100%;position:absolute;left:0;top:0;z-index:100;" title="董事长专栏"
              :left-options="{preventGoBack:true, backText:''}" @on-click-back="backClick"></x-header> -->
    
        <div class="bannerPart">
            <div class="whitePartone"></div>
            <div class="whiteParttwo"></div>
            <!-- <img src="../../assets/img/710X320-董事长语录@3x.png" alt="" class="banner"> -->
            <div class="banner">

                 <swiper :list="pictureList" auto style="margin:0 auto;padding:0 10px;margin-bottom:10px;" dots-class="custom-bottom" dots-position="center">

                 </swiper>
            </div>
        </div>
        
        <div align='center'>
            <div class="title">董事长说</div>
        </div>
        <div class="content">
          <div v-for="(item,index) in operationListRes" :key="index">
              <div class="articalTitle">{{item.fdSubject}}</div>
              <div class="articalContent">
                <!-- 唧唧复唧唧,木兰当户织,不闻机杼声,惟闻女叹息,问女何所思,问女何所忆,女亦无所思,女亦无所忆,昨夜见军帖,可汗大点兵 -->
                {{item.fdDescription}}
              </div>
          </div>
        </div>
        <div align='center'>
            <div class="title">视频专栏</div>
        </div>
        <!-- <div class="videoPart">
            <video  controls="controls" v-for="video in videoList">
                <source v-bind:src="video.fdFilePath" type="video/mp4">
            </video>

        </div> -->
      <div class="videoPart" v-for="(item,index) in videoList" :key="index">
        <video-player  class="video-player-box"
                 ref="videoPlayer"
                 :options="videoList[index]"
                 :playsinline="true"
                 customEventName="customstatechangedeventname"

                 @play="onPlayerPlay($event,index)"
                 @pause="onPlayerPause($event)"
                 @ended="onPlayerEnded($event)"
                 @waiting="onPlayerWaiting($event)"
                 @playing="onPlayerPlaying($event)"
                 @loadeddata="onPlayerLoadeddata($event)"
                 @timeupdate="onPlayerTimeupdate($event)"
                 @canplay="onPlayerCanplay($event)"
                 @canplaythrough="onPlayerCanplaythrough($event)"

                 @statechanged="playerStateChanged($event)"
                 @ready="playerReadied">
        </video-player>

      </div>

    
  </div>
</template>

<script>
import {  XHeader } from 'vux'
import { appUtil } from "../../common/commonUtils";
import {findVideoFile, findOperation} from '../../service/service';
import { Swiper } from 'vux'

import 'video.js/dist/video-js.css'
import {videoPlayer} from 'vue-video-player'




export default {
  name: 'bossWord',

  components: {
    XHeader,  Swiper ,videoPlayer
  },
  data(){
    return{

      videoList:[],
      pictureList:[],
      operationListRes: [],
      playerOptions: {
          // videojs options
          muted: true,
          language: 'en',
          playbackRates: [0.7, 1.0, 1.5, 2.0],
          sources: [
            {
            type: "video/mp4",
            src: "https://cdn.theguardian.tv/webM/2015/07/20/150716YesMen_synd_768k_vp8.webm"
            }
          ],
          poster: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1562131456666&di=fb09394f839167c5b2739c7f3043ae2c&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201505%2F06%2F20150506130052_tEnw8.thumb.700_0.jpeg",
        }
      /*operationListRes:{
        docCreatorName: "", //创建者的名称
        fdSubject: '',//标题
        docCreateTime: '',//发布时间
        fdDescription: '',//主体内容
        docDeptName: ''//所属部门的名称
      }*/
    }
  },
  computed: {
      player() {
        return this.$refs.videoPlayer
      }
  },
  methods:{
    backClick() {
      appUtil.back();
    },

    //视频及图片
    async findVideoFile(){
      let res = await findVideoFile();
      if (res.status === 0){
        let list = res.data.attachmentList;
        if (list.length > 0){
          for (let x in list) {
            //视频
            if (list[x].fdKey === "videoOfspgl"){
              let obj = {}
              obj.muted = true
              obj.language = 'en'
              obj.playbackRates = [0.7, 1.0, 1.5, 2.0]
              obj.sources = []
              let videoObj = {}
              videoObj.src = list[x].fdFilePath
              videoObj.type = "video/mp4"
              obj.sources.push(videoObj)
              // obj.poster = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1562131456666&di=fb09394f839167c5b2739c7f3043ae2c&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201505%2F06%2F20150506130052_tEnw8.thumb.700_0.jpeg"
              // obj.sources.push({list[x]})
              console.log(list[x]);
              this.videoList.push(obj);

            } else if (list[x].fdKey === "fdAttachment"){ //图片
              list[x].img = list[x].fdFilePath
              this.pictureList.push(list[x]);

            }
          }
        }
      }
    },
    //运营消息
    async findOperation(){
      let res = await findOperation();
      if (res.status === 0){
        this.operationListRes = res.data.operationListRes;
      }
      console.log(this.operationListRes);

    },

    // listen event
      onPlayerPlay(player,index) {
        console.log('player play!')
        console.log(index);

        console.log(player.el_.children[0]);
        let video = document.getElementsByTagName('video')
        for(let i = 0 ; i < video.length ; i++) {
          if(i != index) {
            if(!video[i].paused ){
              video[i].pause()
            }

          }
        }
        // player.el_.children[index].play()
      },
      onPlayerPause(player) {
        console.log('player pause!', player)
      },
      // ...player event

      // or listen state event
      playerStateChanged(playerCurrentState) {
        // console.log('player current update state', playerCurrentState)
      },

      // player is ready
      playerReadied(player) {
        console.log('the player is readied', player)
        // you can use it to do something...
        // player.[methods]
      },
      onPlayerEnded () {

      },
      onPlayerWaiting() {

      },
      onPlayerPlaying() {

      },
      onPlayerLoadeddata() {

      },
      onPlayerTimeupdate() {

      },
      onPlayerCanplay() {

      },
      onPlayerCanplaythrough(){

      },
  },
  created(){
    window.goToBack = () => {
      this.backClick();
    };
  },
  mounted(){
    this.findVideoFile();
    this.findOperation();
  }
};
</script>
<style>
.vux-slider {
    width: calc(100vw - 20px) ;
}
.vux-swiper {
    height: calc(50vw - 20px) !important;
}
.video-player-box>div {

    height: 48vw;
    padding: 10px;
    width: 100%;
}
.video-js .vjs-big-play-button {
    top: calc(24vw - .75em);
    left: calc(50% - 1.5em);
}

</style>

<style scoped>
.bannerPart {
    width: 100%;
    background: #4080CA;
    /* height: 180px; */
    position: relative;
    height: 50vw;
    overflow: hidden;
    /* margin-top: 46px; */
}
.banner {
    width: 100%;
    position: absolute;
    top:0px;
    left:0px;
    z-index: 2;
    height: calc(100% - 10px);
    padding-bottom:10px;
}

.whitePartone {
   position: absolute;
   top:60%;
   left:-38%;
   transform: rotate(-38deg);
   width: 100%;
   height: 100%;
   background: #fff;
   z-index: 0;
}
.whiteParttwo {
   position: absolute;
   top:60%;
   right:-38%;
   transform: rotate(38deg);
   width: 100%;
   height: 100%;
   background: #fff;
   z-index: 0;
}


.title {
    display: inline-block;
    background: #4080CA;
    color:#fff;
    width: 36.8vw;
    height: 30px;
    line-height: 30px;
    border-radius: 15px;
}
.content {
    padding: 10px;
    font-size: 14px;
    text-indent: 2em;
    margin:5px 0px 15px;
    color: #666666;
    font-family: PingFangSC-Regular, sans-serif;
}
.videoPart {
    height: 48vw;
    padding: 10px;
}
.videoPart>video {
    height: 100%;
    width: 100%;
}
.bodyPart {

}
.main{
  height: 100%;
  background-color: #fff;
  overflow: auto;
  width: 100vw;
}

.icon_question {
  font-size: 18px;

}
.articalTitle {
  text-align:center;
  font-size:16px;
  color:#333;
  /* word-wrap:break-word; */
}
.articalContent {
  margin-bottom:5px;
  /* word-wrap: break-word; */
}
* {
   word-wrap:break-word;
}
</style>
