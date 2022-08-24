<template>
  <div class="main">
    <div class="video">
      <div id="canvas_box" >
        <!-- <div class="sanjiao" style="top: -4px; left: -14px; transform: rotate(-45deg)" />
        <div class="sanjiao" style="top: -4px; right: -14px; transform: rotate(45deg)" />
        <div class="sanjiao" style="bottom: -4px; right: -14px; transform: rotate(135deg)" />
        <div class="sanjiao" style="bottom: -4px; left: -14px; transform: rotate(-135deg)" /> -->
        <video id="video-player" class="video-layer" autoplay="autoplay" muted="muted" />
        <canvas id="touch-player" class="touch-layer" />
      </div>
      <el-dialog
        title="剪切板"
        v-model="dialogVisible"
        width="80%"
        :modal="true"
        :before-close="clipboardDialog">
        <el-input v-model="clipboardInput" type="textarea" :rows="2" focus></el-input>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="setClipboard" size="mini">写入</el-button>
            <el-button  @click="getClipboard = false" size="mini">读取</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <div>
      <el-tabs >
        <div class="buttons">
          <el-tooltip effect="dark" content="解锁屏" placement="left-end">
            <i id="power" class="btns el-icon-unlock"  type="primary" style="margin-bottom: 10px;" />
          </el-tooltip>
          <el-tooltip effect="dark" content="音量+" placement="left-end">
            <i id="volume_up" class="btns el-icon-plus" type="primary" style="margin-bottom: 10px;" />
          </el-tooltip>
          <el-tooltip effect="dark" content="音量-" placement="left-end">
            <i id="volume_down" class="btns el-icon-minus" type="primary" style="margin-bottom: 10px;" />
          </el-tooltip>
          <el-tooltip effect="dark" content="返回" placement="left-end">
            <i id="back" class="btns el-icon-back" type="primary" style="margin-bottom: 10px;" />
          </el-tooltip>
          <i id="home" class="btns el-icon-s-home" type="primary" style="margin-bottom: 10px;" />
          <el-tooltip effect="dark" content="最近任务" placement="left-end">
            <i id="overview" class="btns el-icon-s-operation" type="primary" style="margin-bottom: 10px;"/>
          </el-tooltip>
          <el-tooltip effect="dark" content="手机剪切板" placement="left-end"> <i id="copy" class="btns el-icon-document-copy" type="primary" /></el-tooltip>
        </div>
      </el-tabs>
    </div>
    
  </div> 
</template>

<style lang="scss">
.video {
  // width: 320px;
  // height: 720px;
  float: right;
  position: absolute;
  border: 1px dashed #cccccc;
}
.video-layer {
  position: absolute;
  z-index: 0;
}
.touch-layer {
  position: absolute;
  z-index: 1;
}
.other {
    float: left;
    // width: 680px; margin-left: 10px;
}
.buttons {
    // width: 70px;
    float: right;
    margin: 0px 0px 10px 0px;
    .btns {
      padding: 10px 0px 10px 0px;
      display: block;
      background-color: #1e9fff;
      text-align: center;
      width: 39px;
      color: #fff;
      cursor: pointer;
      border-radius: 0%;
      box-shadow: 0px 1px 4px
      rgba(0,0,0,0.3),
      0px 0px 20px rgba(0,0,0,0.1)
      inset;
    }
}
.upload {
    float: left;
}
.installing {
  color: #1682e6
}
.installfail {
  color: #e64242
}
.installsuccess {
  color: #11b95c
}
.clear_both {
  clear: both;
}
.device_info {
  margin-top: 20px
}
.text {
  font-size: 12px;
}
.sanjiao {
    width: 0;
    height: 0;
    border-width: 0 20px 20px;
    border-style: solid;
    border-color: transparent transparent red;
    position: absolute;
}
.logcat-list {
  max-height: 520px;
  overflow-y: auto;
  font-size: 12px;
}
.debug {
  background: #46a6ff;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.info {
  background: #c0c4cc;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.warn {
  background: #ffba00;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.error {
  background: #ff4949;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.fatal {
  background: #1325a7;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.silent {
  background: #303133;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.verbose {
  background: #13ce66;
  color: #fff;
  padding: 1px 3px;
  margin-right: 5px;
}
.logcat-message {
  line-height: 17px;
}
</style>

<script>
import VideoConverter, { setLogger } from 'h264-converter'
import { stringToUtf8ByteArray } from './js/Util'
import { EqualArrays } from './js/StreamReceiver'
import ScreenInfoFun from './js/ScreenInfoFun'
import VideoSettingsFun from './js/VideoSettingsFun'
import ToucherFun from './js/ToucherFun'
import KeyCodeFun from './js/KeyCodeFun'
// import  Buffer  from 'buffer/'
const {Buffer} = require('buffer/')
const { remote } = require('electron')
const Adb  = require('@devicefarmer/adbkit/lib/adb')
import {KeyInputHandler,KeyEventImpl} from './keyhandler/KeyInputHandler';
// const KeyEventImpl = require('./keyhandler/KeyInputHandler');
import {CommandControlMessage} from './controlMessage/CommandControlMessage'
import DeviceMessage from  './controlMessage/DeviceMessage'
import DisplayInfo from './DisplayInfo'
import VideoSettings from "./VideoSettings"
import ScreenInfo from "./ScreenInfo"
const storage = require('electron-localstorage');
import path from 'path';
// import {createClient} from '@devicefarmer/adbkit/lib/adb';
// import { getDevice, startLogcat, stopLogcat } from '@/re/tcloud/device'
export default {
  name: 'Converter',
  data() {
    return {
      resizeChangeTimer:null,
      screenTimer:null,
      clipboardInput:"",
      dialogVisible:false,
      logcat_type: 'D',
      logcat_types: [
        {
          value: 'A',
          label: 'Verbose'
        },
        // {
        //   value: 'V',
        //   label: 'Verbose'
        // },
        {
          value: 'D',
          label: 'Debug'
        },
        {
          value: 'I',
          label: 'Info'
        },
        {
          value: 'W',
          label: 'Warn'
        },
        {
          value: 'E',
          label: 'Error'
        },
        {
          value: 'F',
          label: 'Fatal'
        },
        {
          value: 'S',
          label: 'Silent'
        }
      ],
      logcat_class: {
        D: 'debug',
        I: 'info',
        W: 'warn',
        E: 'error',
        F: 'fatal',
        V: 'verbose',
        S: 'silent'
      },
      logcat_pid: null,
      logcat_tid: null,
      logcat_message: null,
      logcat_tag: null,
      options: {
        target: `${process.env.VUE_APP_BASE_API}/v1/stf/upload/apk/process`,
        testChunks: false,
        query: {}
      },
      attrs: {
        accept: '.apk'
      },
      checkTimer: null,
      installInfo: {
        class: 'none',
        text: ''
      },
      serial: 'GDB6R19830006363',
      device_info: {
        marketName: 'xxx',
        screen: 'xxx',
        version: 'xxx',
        serial: 'xxx',
        cpu_cores: 'xxx',
        cpu_freq: 'xxx',
        ram: 'xxx',
        rom: 'xxx',
        remote: 'xxx'
      },
      websocket: null,
      MAGIC_BYTES_INITIAL: 0,
      DEVICE_NAME_FIELD_LENGTH: 64,
      screenInfo: null,
      videoSettings: null,
      currentSettings: {
        bitrate: 15000000,
        bounds: { height: 800, width: 800, h: 800, w: 800 },
        bytesLength: 25,
        crop: null,
        displayId: 0,
        iFrameInterval: 15,
        lockedVideoOrientation: -1,
        maxFps: 60,
        sendFrameMeta: false
      },
      hasInitialInfo: false,
      displayInfo: null,
      state: 3,
      STATE2: {
        PLAYING: 1,
        PAUSED: 2,
        STOPPED: 3
      },
      tag: null,
      converter: null,
      hasTouchListeners: false,
      EVENT_ACTION_MAP: {
        touchstart: 0,
        touchend: 1,
        touchmove: 2,
        touchcancel: 1,
        mousedown: 0,
        mousemove: 2,
        mouseup: 1
      },
      BUTTONS_MAP: {
        0: 17,
        1: 1 << 2,
        2: 26
      },
      TouchControlMessage: {
        action: undefined,
        pointerId: undefined,
        position: undefined,
        pressure: undefined,
        buttons: undefined,
        PAYLOAD_LENGTH: 28,
        type: 2,
        MAX_PRESSURE_VALUE: 0xffff
      },
      touch_tag: null,
      down: 0,
      KeyEvent: [
        {
          title: 'power',
          code: 26
        },
        {
          title: 'volume_up',
          code: 24
        },
        {
          title: 'volume_down',
          code: 25
        },
        {
          title: 'back',
          code: 4
        },
        {
          title: 'home',
          code: 3
        },
        {
          title: 'overview',
          code: 187
        },
        {
          title: 'copy',
          code: -1
        }
      ],
      KeyCodeControlMessage: {
        action: undefined,
        code: undefined,
        repeat: 0,
        metaState: 0,
        type: 0,
        PAYLOAD_LENGTH: 13
      },
      canRaw: true,
      playing: false,
      can_log: true,
      downloading: false,
      downdone: false,
      down_path: null,
      only_screen: false,
      logcatData: [],
      logcat_list_tag: null,
      logcat_count: 0,
      reloadWindow:null,
      keyEventImpl:null,
      deviceIP:"localhost"
    }
    
  },
  beforeCreate(){
    
  },

  created() {
    
    // this.serial = this.$route.query.serial
    // console.log(this.serial)
    // const only_screen = this.$route.query.only_screen
    // if (only_screen !== undefined) {
    //   this.only_screen = true
    // }


    remote.getCurrentWindow().setTitle(this.$route.query.udid)
    if(this.$route.query.ip){
      this.deviceIP = this.$route.query.ip
    }
    // 初始化某些变量
    this.MAGIC_BYTES_INITIAL = stringToUtf8ByteArray('scrcpy_initial')
    // this.pause()
    // setLogger(() => {}, console.error)
    this.options.query = { serial: this.serial }
  },
  mounted() {
    this.init()
    // console.log(remote.getGlobal("rate"))
    // window.addEventListener("resize",this.resizeWindow);
    
  },
  unmounted() {
    this.destroy()
  },
  methods: {
    init(){
      let isResizeComplate = storage.getItem("isResizeComplate")
      if(isResizeComplate!=null && isResizeComplate.length !== 0){
        console.log("isResizeComplate",isResizeComplate)
        let size = storage.getItem("size")
        if(isResizeComplate && size){
          size = JSON.parse(size)
          this.currentSettings.bounds = { height: size['height'], width : size['width'], h: size['height'], w: size['width'] }
        }
          this.initWebSocket()
          
      }else{
        this.initWebSocket()
      }
      
      this.touch_tag = document.getElementById('touch-player')
      document.addEventListener('visibilitychange', this.handleVisiable) 
    },
    destroy(){
      if (this.websocket !== null) {
      this.websocket.close()
      }

      if (this.log_ws !== null) {
        this.log_ws.close()
      }
      this.pause()
      document.body.removeEventListener('mousedown', this.onMouseEvent)
      document.body.removeEventListener('mouseup', this.onMouseEvent)
      document.body.removeEventListener('mousemove', this.onMouseEvent)
      document.removeEventListener('visibilitychange', this.handleVisiable)
      if(this.keyEventImpl)  
      KeyInputHandler.removeEventListener(this.keyEventImpl);
      // storage.removeAll()
    },
    // websocket 连接相关方法-------------------------------------------------------------------------
    initWebSocket() {
      const ws_url = `ws://${this.deviceIP}:8006/?action=proxy&remote=tcp%3A8886&udid=${this.$route.query.udid}`
      console.log(ws_url)
      this.websocket = new WebSocket(ws_url)
      this.websocket.onopen = this.websocketonopen
      this.websocket.onmessage = this.websokectonmessage
      this.websocket.onerror = this.websocketonerror
      this.websocket.onclose = this.websocketclose
    },
    handleVisiable(e) {
      const tmpCanRaw = e.target.visibilityState === 'visible' ? true:false;
      if(this.canRaw !== tmpCanRaw){
        this.canRaw = tmpCanRaw;
        // if(this.canRaw)
        //   this.reloadWindow()
      }
    },
    websocketonopen() {
      this.setToucher()
      this.buttonEvent()
      /**
       * 键盘输入逻辑，定时器只是为了在键盘被捕捉之前打开调试
       */
      if(!this.keyEventImpl){
        this.keyEventImpl = new KeyEventImpl(this.websocket)
        setTimeout(() => {
          KeyInputHandler.addEventListener(this.keyEventImpl);
          // clearTimeout(this)
        }, 3*1000);
      }
    },
    websokectonmessage(e) {
      if (e.data instanceof Blob) {
        const reader = new FileReader()
        const that = this
        reader.readAsArrayBuffer(e.data) // blob转ArrayBuffer
        reader.onload = function() {
          const data = reader.result
          if (data.byteLength > that.MAGIC_BYTES_INITIAL.length) {
            const magicBytes = new Uint8Array(data, 0, that.MAGIC_BYTES_INITIAL.length)
            if (EqualArrays(magicBytes, that.MAGIC_BYTES_INITIAL)) {
              if(!that.hasInitialInfo){
                setTimeout(()=>{
                  that.reloadWindow = function(){
                    remote.getCurrentWindow().reload()
                  }
                  remote.getCurrentWindow().on("will-resize",(event, newBounds)=>{
                    console.log("will-resize")
                    that.canRaw = false;
                    that.hasInitialInfo = false
                    that.resizeWindow(event, newBounds)
                  })
                  // remote.getCurrentWindow().on("resize", that.resizeWindow);
                },100)
              }
              that.handleInitialInfo(data)
              if(that.reloadWindow!=null){
                that.reloadWindow()
              }
              return
            }
            if (EqualArrays(magicBytes, DeviceMessage.MAGIC_BYTES_MESSAGE)) {
                const message = DeviceMessage.fromBuffer(data);
                // this.emit('deviceMessage', message);
                // console.log(message.getText())
                that.clipboardInput = message.getText();
                return;
                }

          }
          that.onVideo(new Uint8Array(data))
        }
      } else {
        if (this.logcat_list_tag) {
          this.setLogcat(JSON.parse(e.data))
        }
      }
    },
    websocketonerror() {
      console.log('ws error')
      remote.getCurrentWindow().close()
    },
    websocketclose(e) {
      console.log('ws close', e)
      remote.getCurrentWindow().close()
    },
    // ---------------------------------------------------------------------------------------------
    //
    // 画面播放相关方法 -----------------------------------------------------------------------------
    handleInitialInfo(data) {
      console.log(new Uint8Array(data, 0).length)
      let offset = this.MAGIC_BYTES_INITIAL.length
      // let nameBytes = new Uint8Array(data, offset, this.DEVICE_NAME_FIELD_LENGTH)
      offset += this.DEVICE_NAME_FIELD_LENGTH
      let rest = new Buffer(new Uint8Array(data, offset))
      const displaysCount = rest.readInt32BE(0)
      rest = rest.slice(4)
      for (let i = 0; i < displaysCount; i++) {
        const displayInfoBuffer = rest.slice(0, DisplayInfo.BUFFER_LENGTH);
        this.displayInfo = DisplayInfo.fromBuffer(displayInfoBuffer);
        // const { displayId } = displayInfo;
        // this.displayInfoMap.set(displayId, displayInfo);
        rest = rest.slice(DisplayInfo.BUFFER_LENGTH)
        rest = rest.slice(4)
        const screenInfoBytesCount = rest.readInt32BE(0)
        rest = rest.slice(4)
        if (screenInfoBytesCount) {
          this.screenInfo = ScreenInfo.fromBuffer(rest.slice(0, screenInfoBytesCount))
          this.screenInfo.deviceRotation = this.displayInfo.rotation
          rest = rest.slice(screenInfoBytesCount)
        }
        
        const videoSettingsBytesCount = rest.readInt32BE(0)
        console.log(videoSettingsBytesCount)
        rest = rest.slice(4)
        console.log(rest.length)
        if (videoSettingsBytesCount) {
          this.videoSettings = VideoSettings.fromBuffer(rest.slice(0, videoSettingsBytesCount))
          rest = rest.slice(videoSettingsBytesCount)
          console.log(this.videoSettings)
        }
      }
      this.hasInitialInfo = true
      this.triggerInitialInfoEvents()
    },
    triggerInitialInfoEvents() {
      this.pause()
      // this.playing = false
      if (this.hasInitialInfo) {
        this.onDisplayInfo()
      }
    },
    onDisplayInfo() {
      if (this.state === this.STATE2.PAUSED) {
        this.play()
      }
      
      if (!this.screenInfo || !this.videoSettings || !this.playing) {
        const event = this.createSetVideoSettingsCommand()
        this.websocket.send(event)
        this.playing = true
        return
      }
      
      let deviceRotation = storage.getItem("deviceRotation")
      // 如果旧的方向与新的方向不同，则使用保存好的旧长宽重新加载
      if(deviceRotation!=null &&deviceRotation.length!=0 && this.screenInfo.deviceRotation!=deviceRotation){
        let size =storage.getItem(`size${this.screenInfo.deviceRotation}`)
        if(size){
          size = JSON.parse(size)
          console.log("size",size)
          let saved_width =  size["width"],saved_height= size["height"]
              storage.removeItem("deviceRotation")
              // 重新获取到的实际宽高会比请求的小，所以width+30
              storage.setItem(`size`,JSON.stringify({"width":saved_width+30,"height":saved_height}))
              this.init()
              return
          }
      }else{
        const { width, height } = this.screenInfo.videoSize
        storage.setItem("deviceRotation",`${this.screenInfo.deviceRotation}`)
        storage.setItem(`size${this.screenInfo.deviceRotation}`,JSON.stringify({"width":width,"height":height}))
      }
      
      if(this.screenTimer){
        clearTimeout(this.screenTimer)
      }
      // this.setScreen()
      let that = this;
      this.screenTimer =setTimeout(() => {
        that.setScreen()
        clearTimeout(that.screenTimer)

      }, 100); 

      // this.debounce(this.setScreen())
      
    },
    createSetVideoSettingsCommand() {
      const temp = VideoSettingsFun.toBuffer(this.currentSettings)
      const offset = 0 + 1
      const buffer = new Buffer(offset + temp.length)
      buffer.writeUInt8(101, 0)
      temp.forEach((byte, index) => {
        buffer.writeUInt8(byte, index + offset)
      })

      return buffer
    },
    createVideoSettingsWithBounds(old, newBounds) {
        return new VideoSettings({
            crop: old.crop,
            bitrate: old.bitrate,
            bounds: newBounds,
            maxFps: old.maxFps,
            iFrameInterval: old.iFrameInterval,
            sendFrameMeta: old.sendFrameMeta,
            lockedVideoOrientation: old.lockedVideoOrientation,
            displayId: old.displayId,
            codecOptions: old.codecOptions,
            encoderName: old.encoderName,
        });
    },
    play() {
      if (!this.screenInfo && true) {
        return
      }
      this.state = this.STATE2.PLAYING
      if (!this.converter) {
        const video_element = document.getElementById('video-player')
        const fpf = 1
        let fps = 24
        if (this.videoSettings) {
          fps = this.videoSettings.maxFps
        }
        this.converter = new VideoConverter(video_element, fps, fpf)
        setLogger((msg)=>{
          // console.log(msg)
        },(err)=>{
          console.error(err)
        })
      }

      this.converter.play()
    },
    pause() {
      this.state = this.STATE2.PAUSED
      if (this.converter) {
        this.appendRawData(new Uint8Array([]))
        this.converter.pause()
        delete this.converter
      }
    },
    appendRawData(data) {
      if (this.converter && this.canRaw) {
        try {
          this.converter.appendRawData(data)
        } catch (error) {
          console.error(error)
          this.converter.reset()
        }
      }
    },
    setScreen() {
      // this.pause()
      if (this.screenInfo) {
        // 触控板
        const { width, height } = this.screenInfo.videoSize
        const touchableCanvas = document.getElementById('touch-player')
        touchableCanvas.width = width
        touchableCanvas.height = height
        touchableCanvas.style.margin = `0 0 0 0`

        // 显示板
        const videoableCanvas = document.getElementById('video-player')
        videoableCanvas.width = width
        videoableCanvas.height = height
        videoableCanvas.style.margin = `0 0 0 0`

        const canvas_box = document.getElementById('canvas_box')
        canvas_box.width = width
        canvas_box.height = height
        canvas_box.style.margin = `0 0 0 0`
        
        this.setScreenSize(width,height)
        this.drop()
      }
    },
    setScreenSize(bodyWidth,bodyHeight){

      if(bodyWidth ==undefined || bodyHeight == undefined || bodyWidth <=0 || bodyHeight <=0 || bodyWidth === bodyHeight)
          return
      // remote.getCurrentWindow().resizable = true
      bodyWidth = bodyWidth+42
      bodyHeight = bodyHeight+4
      // remote.getCurrentWindow().setContentBounds({ height: bodyHeight, width : bodyWidth, x: 50, y:50 })
      // remote.getCurrentWindow().setSize(bodyWidth,bodyHeight)
      remote.getCurrentWindow().setContentSize(bodyWidth,bodyHeight)
      console.log("=====setScreenSize=========")
      // remote.getCurrentWindow().resizable = false
      
    },
    resizeWindow(event, newBounds){
      const win = event.sender;
      event.preventDefault();//拦截，使窗口先不变
      const currentSize = win.getSize();
      // console.log(newBounds)
      // const widthChanged = (currentSize[0] != newBounds.width);//判断是宽变了还是高变了，两者都变优先按宽适配
      // if(widthChanged){
      //     win.setContentSize(newBounds.width, parseInt(newBounds.width / (realSize.width / realSize.height) + 0.5));
      // } else {
      //     win.setContentSize(parseInt((realSize.width / realSize.height) * newBounds.height + 0.5), newBounds.height);
      // }
      storage.setItem("isResizeComplate",false)
      if(this.resizeChangeTimer){
        clearTimeout(this.resizeChangeTimer)
      }
      let that = this;
      this.resizeChangeTimer =setTimeout(() => {
        storage.setItem("isResizeComplate",true)
        let bodyHeight,bodyWidth
        bodyWidth = currentSize[0]
        bodyHeight = currentSize[1]
        storage.setItem(`size`,JSON.stringify({"width":bodyWidth,"height":bodyHeight}))
        
        that.screenInfo = null;
        that.currentSettings.bounds = { height: bodyHeight, width : bodyWidth, h: bodyHeight, w: bodyWidth }
        that.websocket.send(that.createSetVideoSettingsCommand())
        that.triggerInitialInfoEvents()
        that.canRaw = true;
        that.hasInitialInfo = true;
        // that.init()
        clearTimeout(that.resizeChangeTimer)

      }, 500); 
    },
    onVideo(data) {
      if (this.state === this.STATE2.PAUSED) {
        this.play()
      }
      if (this.state === this.STATE2.PLAYING) {
        this.appendRawData(data)
      }
    },
    // ---------------------------------------------------------------------------------------------
    //
    // 触控相关方法 ---------------------------------------------------------------------------------
    onMouseEvent(e) {
      if (e.type === 'mousedown') {
        this.down++;
        /**
         * 右键按下
         */
        if(e.button ==2){
          this.mouseRightEvent(0)
        }
      }

      if (e.target === this.touch_tag) {
        const screenInfo = this.screenInfo
        if (!screenInfo) {
          return
        }
        let events = null
        let condition = true
        condition = this.down > 0
        events = this.buildTouchEvent(e, screenInfo)
        if (events && events.length && condition) {
          events.forEach((event) => {
            this.websocket.send(ToucherFun.toBuffer(event))
          })
        }

        if (e.cancelable) {
          e.preventDefault()
        }
        e.stopPropagation()
      }

      if (e.type === 'mouseup') {
        this.down--
        /**
         * 右键弹起
         */
        if(e.button ==2){
          this.mouseRightEvent(1)
        }
      }
    },
    mouseRightEvent(action){
          const my_event = JSON.parse(JSON.stringify(this.KeyCodeControlMessage))
          my_event.action = action
          my_event.keycode = this.KeyEvent[3].code
          this.websocket.send(KeyCodeFun.toBuffer(my_event))
    },

    setToucher() {
      if (!this.hasTouchListeners) {
        this.down = 0
        document.body.addEventListener('mousedown', this.onMouseEvent)

        document.body.addEventListener('mouseup', this.onMouseEvent)

        document.body.addEventListener('mousemove', this.onMouseEvent)

        this.hasTouchListeners = true
      }
    },
    calculateCoordinates(e, screenInfo) {
      const action = this.EVENT_ACTION_MAP[e.type]
      if (typeof action === 'undefined' || !screenInfo) {
        return null
      }
      const htmlTag = document.getElementsByTagName('html')[0]
      const { width, height } = screenInfo.videoSize
      const target = e.target
      const { scrollTop, scrollLeft } = htmlTag
      let { clientWidth, clientHeight } = target
      let touchX = e.clientX - target.offsetLeft + scrollLeft
      let touchY = e.clientY - target.offsetTop + scrollTop
      let invalid = false
      if (touchX < 0 || touchX > clientWidth || touchY < 0 || touchY > clientHeight) {
        invalid = true
      }
      const eps = 1e5
      const ratio = width / height
      const shouldBe = Math.round(eps * ratio)
      const haveNow = Math.round((eps * clientWidth) / clientHeight)
      if (shouldBe > haveNow) {
        const realHeight = Math.ceil(clientWidth / ratio)
        const top = (clientHeight - realHeight) / 2
        if (touchY < top || touchY > top + realHeight) {
          return null
        }
        touchY -= top
        clientHeight = realHeight
      } else if (shouldBe < haveNow) {
        const realWidth = Math.ceil(clientHeight * ratio)
        const left = (clientWidth - realWidth) / 2
        if (touchX < left || touchX > left + realWidth) {
          invalid = true
        }
        touchX -= left
        clientWidth = realWidth
      }
      const x = (touchX * width) / clientWidth
      const y = (touchY * height) / clientHeight
      const size = { width, height }
      const point = { x, y }
      const position = { point: point, screenSize: size }
      if (x < 0 || y < 0 || x > width || y > height) {
        invalid = true
      }
      const buttons = e.button

      return {
        client: {
          width: clientWidth,
          height: clientHeight
        },
        touch: {
          invalid,
          action,
          position,
          buttons
        }
      }
    },
    getTouch(e, screenInfo) {
      const touchOnClient = this.calculateCoordinates(e, screenInfo)
      if (!touchOnClient) {
        return null
      }
      const { touch } = touchOnClient
      const result = [touch]

      return result
    },
    buildTouchEvent(e, screenInfo) {
      const touches = this.getTouch(e, screenInfo)
      if (!touches) {
        return null
      }

      const message = []

      touches.forEach((touch, pointerId) => {
        const { action, buttons, position } = touch
        const res = JSON.parse(JSON.stringify(this.TouchControlMessage))
        res.action = action
        res.pointerId = pointerId
        res.position = position
        let pressure = 1.0
        if (action === 1) {
          pressure = 0
        }
        res.pressure = pressure
        res.buttons = buttons
        message.push(res)
      })

      return message
    },
    // ---------------------------------------------------------------------------------------------
    //
    // 按钮相关方法 ---------------------------------------------------------------------------------
    buttonHanler(e) {
      const action = e.type === 'mousedown' ? 0 : 1
      if(e.target.id === this.KeyEvent[6].title){
        this.clipboardDialog()
        return
      }
      const filter = this.KeyEvent.filter((value) => {
        return value.title === e.target.id
      })

      const code = filter[0].code

      const my_event = JSON.parse(JSON.stringify(this.KeyCodeControlMessage))
      my_event.action = action
      my_event.keycode = code
      this.websocket.send(KeyCodeFun.toBuffer(my_event))
    },
    clipboardDialog(){
      this.dialogVisible = !this.dialogVisible
            /**
       * 剪切板功能和键盘捕捉功能冲突，所以打开剪切板功能的时候，先关闭键盘捕捉
       */
      if(this.keyEventImpl){
        if(this.dialogVisible){
          KeyInputHandler.removeEventListener(this.keyEventImpl);
        }else{
          KeyInputHandler.addEventListener(this.keyEventImpl)
          this.clipboardInput  = ""
        }
      }
    },
    setClipboard(){
      this.websocket.send(CommandControlMessage.createSetClipboardCommand(this.clipboardInput).toBuffer())
    },
    getClipboard(){
        this.websocket.send(new CommandControlMessage(7).toBuffer())
    },
    buttonEvent() {
      const buttons = document.getElementsByClassName('btns')
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('mousedown', this.buttonHanler)
        buttons[i].addEventListener('mouseup', this.buttonHanler)
      }
    },
       // apk安装 相关代码 -----------------------------------------------------------------------------
    drop(){
      let _this = this;
      var dropbox = document.getElementById('canvas_box');
      dropbox.addEventListener("drop",this.enterDroop,false)
      dropbox.addEventListener("dragleave",function (e) {
        e.stopPropagation();
        e.preventDefault();
      })
      dropbox.addEventListener("dragenter",function (e) {
        e.stopPropagation();
        e.preventDefault();
      })
      dropbox.addEventListener("dragover",function (e) {
        e.stopPropagation();
        e.preventDefault();
      })
    },
    enterDroop(e){
      e.stopPropagation();
      e.preventDefault();  //必填字段
      let fileData = e.dataTransfer.files;
      let apkPath = fileData[0]["path"]
      const apkName = fileData[0]["name"]
      const duration = 2000
      const offset = -15
      if(!apkName.endsWith("apk")){
        console.log(`${apkPath} is not a apk` )
        this.$message({
          message: `只支持apk文件`,
          type: 'error',
          duration:duration,
          offset:offset,
          center: true
        });
        return
      }
      this.$message({
          message: `开始安装${apkName}`,
          type: 'info',
          duration:duration,
          offset:offset,
          center: true
      });
      // const client = Adb.createClient();
      const client = Adb.createClient({"host":this.deviceIP,"bin":path.join(process.env.NODE_ENV === 'development'?path.resolve("")/*项目目录*/:process.resourcesPath,`vendor/${process.platform ==="win32"?"/adb/adb.exe":""}`)})
      let that = this
      client.install(this.$route.query.udid,apkPath).then(()=>{
        this.$message({
          message: `安装成功`,
          type: 'success',
          duration:duration,
          offset:offset,
          center: true
        });
      }).catch(function(err) {
        console.error('install apk fail:', err.stack)
        that.$message({
          message: `安装失败${err.stack}`,
          type: 'error',
          duration:duration+1000,
          offset:offset,
          center: true
        });
      })
    },
    getMaxSize() {
        // if (!this.controlButtons) {
        //     return;
        // }
        // const body = document.body;
        // const width = (body.clientWidth - this.controlButtons.clientWidth) & ~15;
        // const height = body.clientHeight & ~15;
        const body = document.body;
        const width = (body.clientWidth) & ~15;
        const height = body.clientHeight & ~15;
        return new Size(width, height);
    },
    debounce(fn, delay = 500) {
      // 是闭包中的
      let timer
      
    // input事件调用的函数，相当于obj调用函数 this指向Input
        return function() {
          // 这个if 判断不做也没关系，可直接清空，只有第一次timer非空
        if(timer) {
            claerTimeout(timer)
        }
        // 此时的箭头函数的this 和 arguments 都是从外部函数继承而来
        // r如果用普通函数就要用词法作用域 var thsta = this var arg = arguments
        timer = setTimeOut(() =>{
            // 使得传入的回调函数的this 指向Input这个元素对象
            // arguments是该事件的详情，可以获得该函数被调用时的所有参数,是一个event 对象（所有Dom事件都会传event对象进入）
            // 直接使用 fn() 问题也不大
            fn.apply(this,arguments) 
            timer = null
        },delay)
      }
    },

    // logcat 相关代码 -----------------------------------------------------------------------------
    startLog() {
      startLogcat({ serial: this.serial, type: this.logcat_type }).then(() => {
        this.can_log = false
        this.downloading = true
        this.downdone = false
      })
    },
    stopLog() {
      stopLogcat({ serial: this.serial }).then(res => {
        this.can_log = true
        this.downloading = false
        this.downdone = true
        this.down_path = res.data.file_url
      })
    },
    startLog2() {
      this.can_log = false
      this.websocket.send(JSON.stringify({
        command: 'start',
        data: []
      }))
    },
    stopLog2() {
      this.can_log = true
      this.websocket.send(JSON.stringify({
        command: 'stop',
        data: []
      }))
    },
    clearLog() {
      this.logcat_list_tag.innerHTML = ''
      this.logcat_count = 0
    },
    setLogcat(data) {
      if (this.logcat_count > 3000) {
        this.logcat_list_tag.innerHTML = ''
        this.logcat_count = 0
        return
      }

      if (!this.canRaw) {
        return
      }

      // 筛选条件
      if (this.logcat_type !== 'A') {
        if (this.logcat_type !== data['level']) {
          return
        }
      }
      if (this.logcat_pid) {
        if (this.logcat_pid !== data['pid']) {
          return
        }
      }
      if (this.logcat_tid) {
        if (this.logcat_tid !== data['tid']) {
          return
        }
      }
      if (this.logcat_tag) {
        const index2 = data['tag'].indexOf(this.logcat_tag)
        if (index2 === -1) {
          return
        }
      }
      if (this.logcat_message) {
        const index = data['message'].indexOf(this.logcat_message)
        if (index === -1) {
          return
        }
      }

      const p = document.createElement('p')
      p.className = 'logcat-message'
      const s1 = document.createElement('span')
      const s2 = document.createElement('span')
      s1.className = this.logcat_class[data['level']]
      s1.innerText = data['level']
      p.appendChild(s1)
      s2.innerText = `${data['time']} ${data['pid']} ${data['tid']} ${data['tag']} ${data['message']}`
      p.appendChild(s2)
      this.logcat_list_tag.insertBefore(p, this.logcat_list_tag.children[0])
      this.logcat_count++
    }
    // --------------------------------------------------------------------------------------------
  }
}
</script>

