// 这里是定义菜单的地方，详情请查看 https://electronjs.org/docs/api/menu
import { dialog } from 'electron'
import { app,ipcMain,  BrowserWindow } from 'electron'
const { ipcRenderer } = require("electron");
import {  remote } from 'electron'
import { type, arch, release } from 'os'
import { winURL } from '../config/StaticPath'
import packageInfo from '../../../package.json'
var fs = require("fs")
const menu = [
  {
    label: '设置',
    submenu: [{
        label: '远程设备',
        accelerator: '',
        click: function () {
          remoteDevices()
        },
        // role: 'close'
      },
      {
        label: '云测',
        accelerator: '',
        id:"cloud",
        click: function () {
          showLogin()
        },
        // role: 'close'
      },
      {
      label: '快速重启',
      accelerator: 'F5',
      role: 'reload'
    }, {
      label: '退出',
      accelerator: 'CmdOrCtrl+F4',
      role: 'close'
    }]
  }, {
    label: '帮助',
    submenu: [{
      label: '关于',
      click: function () {
        info()
      }
    }
  ]
  }]
function info() {
  dialog.showMessageBox({
    title: '关于',
    type: 'info',
    message: '云测客户端',
    detail: `版本信息：${packageInfo.version}\n引擎版本：${process.versions.v8}\n当前系统：${type()} ${arch()} ${release()}`,
    noLink: true,
    buttons: ['确定']
  })
}

function showLogin(){
  BrowserWindow.getAllWindows().forEach((item,index)=>{
    if(BrowserWindow.fromId(item.id) &&BrowserWindow.fromId(item.id).webContents){
      BrowserWindow.fromId(item.id).webContents.send('login_msg', {"isShow":true});
    }
  })
}

function remoteDevices(){

  const ChildWin = new BrowserWindow({
    height: 80,
    useContentSize: true,
    width: 640,
    autoHideMenuBar: true,
    // frame:false,
    // minWidth: 640,
    show: false,
    webPreferences: {
      // preload: path.join(app.getAppPath(), 'preload.js'),
      contextIsolation:false,
      nodeIntegration: true,
      webSecurity: false,
      // 如果是开发模式可以使用devTools
      devTools: process.env.NODE_ENV === 'development',
      // devTools: true,
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === 'darwin',
      enableRemoteModule: true
    }
  })
    console.log(winURL + `#/remote_devices`)
    ChildWin.loadURL(winURL + `#/remote_devices`)
    ChildWin.webContents.once('dom-ready', () => {
    ChildWin.show()
  })
}

export default menu
