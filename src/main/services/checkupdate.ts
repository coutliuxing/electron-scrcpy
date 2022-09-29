import { autoUpdater } from 'electron-updater'
import { ipcMain, BrowserWindow } from 'electron'
import path from 'path'
/**
 * -1 检查更新失败 0 正在检查更新 1 检测到新版本，准备下载 2 未检测到新版本 3 下载中 4 下载完成
 **/
class Update {
  public mainWindow: BrowserWindow
  constructor(mainWindow: BrowserWindow) {
    autoUpdater.setFeedURL('http://192.168.6.241:4507/denodir')
    this.mainWindow = mainWindow
    // 注册事件
    this.checkUpdate()
    this.start()
    this.hasData()
    this.noData()
    this.listen()
    this.done()
    this.quitInstall()
    this.error()

    
    // 本地开发环境，改变app-update.yml地址
    if (process.env.NODE_ENV === 'development') {
      // const publishUrl = process.env.VUE_APP_PUBLISH_URL
      // autoUpdater.setFeedURL({
      //   provider: 'generic',
      //   url: publishUrl
      // })
      // if (isMac) {
      //   autoUpdater.updateConfigPath = path.join(__dirname, 'mac/dev-sidecar.app/Contents/Resources/app-update.yml')
      // } else if (isLinux) {
      //   autoUpdater.updateConfigPath = path.join(__dirname, 'linux-unpacked/resources/app-update.yml')
      // } else {
        console.log(path.join(path.resolve(""), '/build/win-unpacked/resources/app-update.yml'))
        autoUpdater.updateConfigPath = path.join(path.resolve(""), '/build/win-unpacked/resources/app-update.yml')
      // }
    }

    autoUpdater.checkForUpdatesAndNotify().then((value)=>{
      console.log(value)
    })
  }
  // 负责向渲染进程发送信息
  Message(mainWindow: BrowserWindow, type: Number, data?: String) {
    const senddata = {
      state: type,
      msg: data || ''
    }
    mainWindow.webContents.send('UpdateMsg', senddata)
  }

  // 当更新发生错误的时候触发。
  error() {
    autoUpdater.on('error', (err) => {
      console.log('更新出现错误', err.message)
      if (err.message.includes('sha512 checksum mismatch')) {
        this.Message(this.mainWindow, -1, 'sha512校验失败')
      } else {
        this.Message(this.mainWindow, -1, '错误信息请看主进程控制台')

      }
    })
  }
  // 当开始检查更新的时候触发

  start() {
    autoUpdater.on('checking-for-update', (event, arg) => {
      console.log('开始检查更新')
      this.Message(this.mainWindow, 0)
    })
  }

  // 发现可更新数据时
  hasData() {
    autoUpdater.on('update-available', (event, arg) => {
      console.log('有更新')
      this.Message(this.mainWindow, 1)
    })
  }

  // 没有可更新数据时
  noData() {
    autoUpdater.on('update-not-available', (event, arg) => {
      console.log('没有更新')
      this.Message(this.mainWindow, 2)
    })
  }

  // 下载监听
  listen() {
    autoUpdater.on('download-progress', (progressObj) => {
      this.Message(this.mainWindow, 3, progressObj)
    })
  }

  // 下载完成
  done() {
    autoUpdater.on('update-downloaded', () => {
      console.log('下载完成')
      this.Message(this.mainWindow, 4)
    })
  }

  // 执行自动更新检查
  checkUpdate() {
    ipcMain.handle('check-update', () => {
      autoUpdater.checkForUpdates().catch(err => {
        console.log('网络连接问题', err)
      })
    })
  }

  // 退出并安装
  quitInstall() {
    ipcMain.handle('confirm-update', () => {
      autoUpdater.quitAndInstall()
    })
  }
}

export default Update
