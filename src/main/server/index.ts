/* eslint-disable prefer-promise-reject-errors */
import app from './server'
import config from '@config/index'
import { createServer } from 'http';
import * as readline from 'readline';
import { HttpServer } from './services/HttpServer';
import { WebSocketServer } from './services/WebSocketServer';

import { Service, ServiceClass } from './services/Service';
import { AndroidDeviceTracker } from './services/AndroidDeviceTracker';
import { DeviceTracker } from './mw/DeviceTracker';
import { MwFactory } from './mw/Mw';
import { RemoteShell } from './mw/RemoteShell';
import { WebsocketProxy } from './mw/WebsocketProxy';
import { RemoteDevtools } from './mw/RemoteDevtools';
const port = config.BuiltInServerPort
var server = null
app.set('port', port)

export default {
  startDeviceServer(){
    if(HttpServer.getInstance().getServer()){
      return;
    }
    const servicesToStart: ServiceClass[] = [HttpServer,WebSocketServer, AndroidDeviceTracker];
    const runningServices: Service[] = [];

    servicesToStart.forEach((serviceClass: ServiceClass) => {
        const service = serviceClass.getInstance();
        runningServices.push(service);
        service.start();
    });

    const mwList: MwFactory[] = [DeviceTracker, /*RemoteShell,*/ WebsocketProxy, RemoteDevtools];
    const wsService = WebSocketServer.getInstance();
    mwList.forEach((mwFactory: MwFactory) => {
        wsService.registerMw(mwFactory);
    });

    if (process.platform === 'win32') {
        readline
            .createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            .on('SIGINT', exit);
    }

    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);

    let interrupted = false;
    function exit(signal: string) {
        console.log(`\nReceived signal ${signal}`);
        if (interrupted) {
            console.log('Force exit');
            process.exit(0);
            return;
        }
        interrupted = true;
        runningServices.forEach((service: Service) => {
            const serviceName = service.getName();
            console.log(`Stopping ${serviceName} ...`);
            service.release();
        });
    }
  },
  StatrServer() {
    return new Promise((resolve, reject) => {
      server = createServer(app)
      server.listen(port)
      server.on('error', (error) => {
        switch (error.code) {
          case 'EACCES':
            reject('权限不足内置服务器启动失败，请使用管理员权限运行。')
            break
          case 'EADDRINUSE':
            reject('内置服务器端口已被占用，请检查。')
            break
          default:
            reject(error)
        }
      })
      server.on('listening', () => {
        resolve('服务端运行中')
      })
    })
  },
  StopServer() {
    return new Promise((resolve, reject) => {
      if (server) {
        server.close()
        server.on('close', () => {
          server = null
          resolve(1)
        })
      } else {
        reject('服务端尚未开启')
      }
    })
  }
}
