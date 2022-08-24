<template>
<div>
  <el-table  :data="device_arr" stripe style="width: 100%;height:100%"  v-loading="loading">
      <el-table-column label="设备" width="160" align="center" prop="ro.product.model">
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
          <span>{{ scope.row['address']["from"]}}</span>
      </template>
      </el-table-column>
      <el-table-column label="操作"  align="center" width="160" >
        <template #default="scope">
        <el-button
          size="mini" v-if="checkState(scope.row)"
          @click="open(scope.$index, scope.row)">使用</el-button>
        <template v-else>
          <span>离线</span>
      </template>
      </template>
      </el-table-column>
    </el-table>
</div>

</template>

<style lang="scss">
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

<script>
const { ipcRenderer,remote } = require("electron");
// const { remote } = require('electron')
import { ElMessage, ElMessageBox } from 'element-plus'
const storage = require('electron-localstorage');
export default {
  name: 'DeviceControl',
  data() {
    return {
      loading: true,
      device_arr:[],
      ipAddress:[{"ip":"localhost","from":"local"}]
    }
  },
  computed: {
  },
  created() {
    // ipcRenderer.invoke("statr-server").then((res) => {
    //     if (res) {
    //       this.$message({
    //         type: "success",
    //         message: res,
    //       });
    //     }
    //   });
    console.log()
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
      console.log(this.ipAddress)
    })
  },
  unmounted() {
    console.log('device page destroyed')
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: { 
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
              d["address"] = address
              that.add_with_unique(d)
            }
          }else{
            data = json.data
            data["address"] = address
            that.add_with_unique(data)
          }
        }
        deviceSocket.onerror = this.websocketonerror
    },
    unique(arr) {
      var ret = [];
      var len = arr.length;
      var isRepeat;
      for(var i=0; i<len; i++) {
        isRepeat = false;
        for(var j=i+1; j<len; j++) {
          if(arr[i] === arr[j]){
            isRepeat = true;
            break;
          }
        }
        if(!isRepeat){
          ret.push(arr[i]);
        }
      }
      return ret;
      },
    add_with_unique(device){
      for (var index in this.device_arr) {
          var d = this.device_arr[index]
          if(d['udid'] === device['udid']){
            delete this.device_arr[index]
          }
        }
        this.device_arr.push(device)
    },
    open(index,row){
      console.log("open",row)
      let data = {
        url: `/converter?udid=${row['udid']}&ip=${row["address"]["ip"]}`,
        udid:row['udid'],
        height:560,
        width:560
      };
      ipcRenderer.invoke("open-win", data);
    },
    checkState(row){
      return row['state'] ==="device"
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
  }
}
</script>
