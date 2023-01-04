import { app,ipcMain, dialog, BrowserWindow } from 'electron'
import Server from '../server'
import { winURL } from '../config/StaticPath'
import { updater } from './HotUpdater'
import path from 'path'

export default {
  Mainfunc(mainWindow: BrowserWindow, IsUseSysTitle: Boolean) {
    ipcMain.handle('IsUseSysTitle', async () => {
      return IsUseSysTitle
    })
    ipcMain.handle('windows-mini', () => {
      mainWindow.minimize()
    })
    ipcMain.handle('window-max', async () => {
      if (mainWindow.isMaximized()) {
        mainWindow.restore()
        return { status: false }
      } else {
        mainWindow.maximize()
        return { status: true }
      }
    })
    ipcMain.handle('window-close', () => {
      mainWindow.close()
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(mainWindow, {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      })
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      )
    })
    ipcMain.handle('statr-server', async () => {
      Server.startDeviceServer()
      // try {
      //   const serveStatus = await Server.StatrServer()
        
      //   console.log(serveStatus)
      //   return serveStatus
      // } catch (error) {
      //   dialog.showErrorBox(
      //     '错误',
      //     error
      //   )
      // }
      
    })
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer()
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('hot-update', (event, arg) => {
      updater(mainWindow)
    })
    ipcMain.handle('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        title: arg.udid,
        height: arg.height|640,
        useContentSize: true,
        width: arg.width|640,
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
      console.log(winURL + `#${arg.url}`)
      // ChildWin.loadURL(`${arg.url}`)
      ChildWin.loadURL(winURL + `#${arg.url}`)  
      ChildWin.webContents.once('dom-ready', () => {
        ChildWin.show()
        ChildWin.webContents.send('send-data', arg.sendData)
        if (arg.IsPay) {
          // 检查支付时候自动关闭小窗口
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close()
            }
          }, 1200)
          ChildWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })

      if (process.env.NODE_ENV === 'development') {
        ChildWin.webContents.openDevTools({ mode: 'undocked', activate: true })
      }
    })
  }
}
