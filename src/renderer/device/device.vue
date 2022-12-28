<template>
<div>
  <login @onLogined="onUserLogined"  v-model="modelShow"></login>
  <el-table  :data="device_arr" stripe style="width: 100%;height: 100%;" scrollbar-always-on v-loading="loading">
      <el-table-column :label="deviceModleLabel()" width="200" align="center" prop="ro.product.model">
        <template #default="scope">
          <span>{{ scope.row['ro.product.model']}}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" width="160" align="center" prop="ro.product.manufacturer">
        <template #default="scope">
          <span>{{ scope.row['ro.product.manufacturer']}}</span>
      </template>
      </el-table-column>
      <el-table-column label="标识" width="160" align="center" prop="udid">
        <template #default="scope">
          <span>{{ scope.row['udid']}}</span>
      </template>
      </el-table-column>
      <el-table-column label="系统" width="160" align="center" prop="ro.build.version.release">
        <template #default="scope">
          <span>{{ scope.row['ro.build.version.release']}}</span>
      </template>
      </el-table-column>
      <el-table-column label="来源" width="160" align="center" prop="from">
        <template #default="scope">
          <span>{{ scope.row['address']["ip"]}}</span>
      </template>
      </el-table-column>
      <el-table-column label="操作"  align="center" width="160" >
        <template #default="scope">
          <el-button
            :type="getType(scope.row)"
            size="mini"  :disabled="!checkState(scope.row)"
            @click="open(scope.$index, scope.row)">{{checkState(scope.row)?(getType(scope.row) ==="danger"?"继续使用":"使用"):"不可用"}}</el-button>
        </template>
      </el-table-column>
    </el-table>
</div>

</template>

<style lang="scss">
.el-table {
  .el-table__header-wrapper th {
    background-color: #f0f1ff;
  }
  .el-table__body-wrapper::-webkit-scrollbar {
    /* width: 0;宽度为0隐藏 */
    width: 0px;
    height: 0;
  }
  .el-table__body-wrapper::-webkit-scrollbar-thumb {
    border-radius: 0;
    background: #fff;
  }
  .el-table__body-wrapper::-webkit-scrollbar-track {
    box-shadow: none;
    border-radius: 0;
    background: #fff;
  }
}
.video {
  width: 720px;
  height: 720px;
  float: left;
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
.ip-input-alter {
  margin: 10px 10px 10px 10px;
}
</style>

<style scoped>
.screen{
  width: 100%;
  height: 830px;
  overflow: hidden;
  position: relative;
}
</style>

<script lang="ts">
const { ipcRenderer } = require("electron");
const { remote } = require('electron')
const { Menu } = require('electron')
import { ElMessage, ElMessageBox } from 'element-plus'
import converter from './converter.vue';
import login from './login.vue'
const storage = require('electron-localstorage');
import Cloud from './Cloud'
import  AdbUtil  from './ADBUtil';
export default {
  components: { converter,login },
  name: 'DeviceControl',

  setup(){

  },
  data() {
    return {
      loading: true,
      device_arr:[],
      modelShow:false,
      ipAddress:[{"ip":"localhost","from":"local"}],
      cloudUsr:{},
      usingDevices:[],
      refreshTimer:undefined
    }
  },
  computed: {
  },
  created() {
    let remoteIP= storage.getItem("remote_ip");
    if(remoteIP){
      this.ipAddress.push({"ip":remoteIP,"from":"remote"})
    }
    for( var  row of this.ipAddress){
      this.devices(row)
    }
    window.addEventListener('copy', function(event){
      console.log("copy",event)
    });
    // window.addEventListener('focus', function(event){
    //   console.log("focus",event)
    // });
    // window.addEventListener('blur', function(event){
    //   console.log("blur",event)
    // });
    ipcRenderer.on('remote_ip', (event, message) => {
      for(let address of this.ipAddress){
        if(address["ip"]===message["ip"]){
            ElMessageBox.alert(`${message["ip"]} 已连接`, '远程连接失败', {
          confirmButtonText: 'OK',
          })
          return
        }
      }

      this.ipAddress.push(message)
      this.devices(message)
    })

    ipcRenderer.on('converter_msg', (event, message) => {
      if(message){
        if(message["type"]=="release"){
          this.releaseCloudDevice(this.cloudUsr,message["id"])
          Cloud.disconnectDevice(message["ip"],message["port"],"adb")
        }
        if(message["type"]=="connected"){
          this.usingDevices.push(message["id"])
          this.relaseRemoteLostDevice("localhost")
        }
      }
      
    })

    ipcRenderer.on('login_msg', (event, message) => {
      if(message){
        this.modelShow = message["isShow"]
      }
    })

  },
  mounted(){
      this.cloudUsr = storage.getItem("user")
      if(this.cloudUsr){
        this.onUserLogined(this.cloudUsr)
      }
    window.addEventListener('beforeunload', () => {
      this.destroy()
    })
    this.relaseRemoteLostDevice("localhost")
  },
  unmounted() {
    console.log('device page destroyed')
    this.destroy()
  },
  methods: { 
    destroy(){
      
      for(let index in this.usingDevices){
        this.releaseCloudDevice(this.cloudUsr,this.usingDevices[index])
      }
      if(this.refreshTimer){
        clearInterval(this.refreshTimer)
      }
    },
    deviceModleLabel(){
      var count = Object.keys(this.device_arr).length
      return `设备(${count})`
    },
    devices(address){
      const deviceSocket = new WebSocket(`ws://${address.ip}:8006/?action=droid-device-list`)
      // ws.on('open', function open() {
      //   ws.send('something');
      // });
      let that = this
      deviceSocket.onmessage =function(data){
          if(that.loading){
            that.loading = false
          }
          let json = JSON.parse(data.data)
          if((json.data instanceof Array)){
            let arr = JSON.parse(data.data).data
            for(let d of arr){
              if(d["state"] && d["state"] ==="device"){
                d["address"] = address
                that.add_with_unique(d)
              }

            }
          }else{
            data = json.data
            if(data["state"] && data["state"] ==="device"){
                data["address"] = address
                that.add_with_unique(data)
              }else{
                that.remove_device(data)
              }
              // data["address"] = address
              // that.add_with_unique(data)

          }
        }
        deviceSocket.onerror = this.websocketonerror
    },
    message(msg,t){
      this.$message({message: msg,type: t||"success",duration:2000,offset:-15,center: true});
    },
    add_with_unique(device){
      for (var index in this.device_arr) {
          var d = this.device_arr[index]
          /**
           * 云测设备本地adb connect产生的问题
           */
          if(device["cloud.ext"] && !d["cloud.ext"]){
              let splitArr = d['udid'].split(":")
              if(splitArr.length>1 && splitArr[1] ==device["cloud.ext"]["logcat_ws_port"]){
                delete this.device_arr[index]
            }
          }
          if(d['udid'] === device['udid']){
            delete this.device_arr[index]
          }
        }
        this.device_arr.push(device)
    },
    remove_device(device){
      for (var index in this.device_arr) {
        var d = this.device_arr[index]
        if(d['udid'] === device['udid']){
            delete this.device_arr[index]
          }
      }
    },
    async open(index,row){
      var url = `/mobile_converter?udid=${row['udid']}&ip=${row["address"]["ip"]}`
      if(row["cloud.ext"] && this.usingDevices.length>=3){
        this.message("最多只支持同时打开三台云测设备~",'warning')
        return
      }
      if(row["cloud.ext"]){
            /**
           * 已经打开则不允许再打开
           */
          if(this.usingDevices.includes(row["cloud.ext"]["id"].toString())){
            this.message( 'device  opened','warning')
            return false
          }
        const res = await this.lockCloudDevice(row)
        if(!res) 
          return
        const ws_url = `ws://${row["address"]["ip"]}:8069/${row["cloud.ext"]["scrcpy_proxy"]}`
        url = `${url}&ws_url=${ws_url}&remote=${row["cloud.ext"]["logcat_ws_port"]}&device_id=${row["cloud.ext"]["id"]}`
      }
      let data = {
        url: url,
        udid:row['udid'],
        height:560,
        width:560
      };
      ipcRenderer.invoke("open-win", data);
    },
    checkState(row){
      var viable = false
      if(row["cloud.ext"]){
          let cloud = row["cloud.ext"]

          let hasUsed = cloud["user"]["username"] == this.cloudUsr.username
          viable =(( cloud['status'] == 0 && cloud['owner'] ==0 && cloud['lock'] ==false) || hasUsed)
          // if(hasUsed){
          //   this.usingDevices.push(cloud["id"])
          // }
      }else{
        viable = row['state'] ==="device" 
      }

      return viable
    },
    getType(row){
      let cloud = row["cloud.ext"]
      if(!cloud){
        return "primary"
      }
      let hasUsed = cloud["user"]["username"] == this.cloudUsr.username 
      return hasUsed?"danger":"primary"
    },
    websocketonerror() {
      let that = this
      ElMessageBox.alert('请求失败，请确认ip正确及客户端正常启动', '错误提示'
      , {
      confirmButtonText: 'OK',
      callback: (action) => {
          // ElMessage({
          //   type: 'info',
          //   message: `action: ${action}`,
          // })
          that.dialogVisible = true
        },
      }
      )
      remote.getCurrentWindow().close()
    },
    onUserLogined(usr){
      
      if(this.refreshTimer){
        clearInterval(this.refreshTimer)
      }
      if(!usr || !usr.token){
        /**退出登录，重新 */
        this.modelShow = false
        for (var index in this.device_arr) {
          var d = this.device_arr[index]
          if(d && d["address"]["from"]==="cloud"){
            delete this.device_arr[index]
          }
        }

        return
      }

      this.modelShow = false
      let menu = remote.app.applicationMenu
      var cloudAccount = menu.getMenuItemById("cloud")
      cloudAccount.sublabel = usr.username
      console.log(cloudAccount,usr)

      this.cloudUsr = usr
      // 获取设备列表
      if(this.refreshTimer){
        clearInterval(this.refreshTimer)
      }
      this.refreshDevices(usr)
      this.refreshTimer = setInterval(() => {
          this.refreshDevices(usr)
        }, 4000);
    },

    refreshDevices(usr){
      let that = this
      fetch(`http://192.168.8.241:8069/zcloud_api/stf/devices?brand=${-2}&screen=${-2}&system=${-2}&status=${-2}`,{
                        method:"get",
                        mode: 'cors',
                        headers: {
                        'Content-Type': 'application/json',
                        "X-Token":this.cloudUsr.token
                        }
                        })
                        .then(response => response.json())
                        .then(json => {
                            // console.log(json)
                            // console.log(that.device_arr)
                            // token过期：-10007
                            if(json["code"]===20000){
                              that.converToStandardDeviceInfo(json.data)
                              var deviceModel = document.getElementById('device_model')
                              if(deviceModel)
                                deviceModel.textContent = `设备(${json.data.length})`
                            }else{
                              if(json["code"]===-10007){
                                usr.token = ""
                                storage.setItem("user",usr)
                                that.$message({message: "cloud token过期,请重新登录",type: 'error',duration:2000,offset:-15,center: true});
                                if(that.refreshTimer){
                                    clearInterval(that.refreshTimer)
                                }
                              }
                            }
                        })
    },
    // 将云测的数据转换成默认格式
    converToStandardDeviceInfo(arr){
      for(let d of arr){
        var deviceInfo = {
                    "udid": "7HX0219925006547",
                    "state": "device",
                    "interfaces": [
                        {
                            "name": "wlan0",
                            "ipv4": "10.1.0.114"
                        }
                    ],
                    "pid": 30072,
                    "wifi.interface": "wlan0",
                    "ro.build.version.release": "10",
                    // "ro.build.version.sdk": "29",
                    "ro.product.manufacturer": "HUAWEI",
                    "ro.product.model": "LIO-AL00",
                    // "ro.product.cpu.abi": "arm64-v8a",
                    // "last.seen.active.timestamp": 1661409180528,
                    "address": {
                        "ip": "192.168.8.241",
                        "from": "cloud"
                    }
                }
          deviceInfo.udid = d.serial
          deviceInfo.state = d.status
          deviceInfo["ro.build.version.release"] = d.version
          deviceInfo["ro.product.manufacturer"] = d.brand.name
          deviceInfo["ro.product.model"] = `${d.model}(${d.marketName})`
          deviceInfo["cloud.ext"] = d
          this.add_with_unique(deviceInfo)
          // break
        }
    },
    async lockCloudDevice(row){
      let that = this
      // 请求使用
      const  response =await fetch(`http://192.168.8.241:8069/zcloud_api/stf/device/use/${row["cloud.ext"]["id"]}`,{
                  method:"post",
                  mode: 'cors',
                  headers: {
                  'Content-Type': 'application/json',
                  "X-Token":this.cloudUsr.token
                  }
                  })
      if(response.status !==200){
        this.message(response,"error")
        return
      }
      const json = await response.json();
      if(json){
        this.refreshDevices(this.cloudUsr)
        return json
      }
      // .then(response => response.json())
      //             .then(json => {
      //                 // console.log(json)
      //                 // console.log(that.device_arr)
      //                 that.converToStandardDeviceInfo(json.data)
      //             })
    },
    async releaseCloudDevice(usr,id){
      // 请求使用
      const  response =await fetch(`http://192.168.8.241:8069/zcloud_api/stf/device/release/${id}`,{
                  method:"delete",
                  mode: 'cors',
                  headers: {
                  'Content-Type': 'application/json',
                  "X-Token":usr.token
                  }
                  })
      if(response.status !==200){
        return
      }
      const json = await response.json();
      // console.log(json)
      if(json && json["code"] ==20000){
        for(let index in this.usingDevices){
          if(this.usingDevices[index].toString() == id){
            this.usingDevices.splice(index,1)
            // delete this.usingDevices[index]
          }
        }
        
        this.message("设备释放成功")
        
        this.refreshDevices(this.cloudUsr)
        return json
      }
    },
    relaseRemoteLostDevice(host="192.168.8.241"){
      /**
       * 释放已经解除占用但adb connect仍然连接的设备
       */
      
      AdbUtil.client(host).listDevices().then((value)=>{
        let localDevices = []
          for(let index in value){
            let device = value[index]
            if(device["type"] != "device" || device["id"].indexOf(":") ==-1){
              continue
            }
            
            for (let index in this.device_arr) {
            var d = this.device_arr[index]
            if(d["cloud.ext"] && device["id"].indexOf(d["cloud.ext"]["logcat_ws_port"])!=-1&& !this.usingDevices.includes(d["cloud.ext"]["id"].toString())){
              let d_split = device["id"].split(":")
              Cloud.disconnectDevice(d_split[0],d_split[1],"adb")
            }
          }
        }
      })
      
    }
  }
}
</script>
