<template>
<div>
  <el-dialog
    v-model="dialogVisible"
    title="设备ip地址(默认localhost，即当前电脑)"
    width="60%"
    :before-close="handleClose"
  >
    <el-input v-model="ipAddress" >
    </el-input>
    <div class="ip-input-alter">ps:如需连接其他电脑的手机设备，输入对应ip并确保对应电脑启动了本客户端</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setAndClose" size="mini">确定</el-button>
      </span>
  </template>
  </el-dialog>
  <el-table  :data="device_arr" stripe style="width: 100%;height:100%"  v-loading="loading">
      <el-table-column label="设备" width="180" align="center" prop="ro.product.model">
        <template #default="scope">
          <span>{{ scope.row['ro.product.model']}}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" width="180" align="center" prop="ro.product.manufacturer">
        <template #default="scope">
          <span>{{ scope.row['ro.product.manufacturer']}}</span>
      </template>
      </el-table-column>
      <el-table-column label="标识" width="180" align="center" prop="udid">
        <template #default="scope">
          <span>{{ scope.row['udid']}}</span>
      </template>
      </el-table-column>
      <el-table-column label="系统" width="180" align="center" prop="ro.build.version.release">
        <template #default="scope">
          <span>{{ scope.row['ro.build.version.release']}}</span>
      </template>
      </el-table-column>
      <el-table-column label="操作"  align="center" width="180" >
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
const { ipcRenderer } = require("electron");
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  name: 'DeviceControl',
  data() {
    return {
      loading: true,
      device_arr:[],
      dialogVisible:true,
      ipAddress:"localhost"
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

    window.addEventListener('copy', function(event){
    console.log("copy",event)
    });
  },
  unmounted() {
    console.log('device page destroyed')
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: { 
    devices(){
    const deviceSocket = new WebSocket(`ws://${this.ipAddress}:8006/?action=droid-device-list`)
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
          that.device_arr = JSON.parse(data.data).data
        }else{
          for (var index in that.device_arr) {
            var d = that.device_arr[index]
            if(d['udid'] === json.data['udid']){
              delete that.device_arr[index]
            }
          }
          that.device_arr.push(json.data)
        }
      }
      deviceSocket.onerror = this.websocketonerror
    },
    open(index,row){
      let data = {
        url: `/converter?udid=${row['udid']}&ip=${this.ipAddress}`,
        udid:row['udid'],
        height:560,
        width:560
      };
      ipcRenderer.invoke("open-win", data);
    },
    checkState(row){
      return row['state'] ==="device"
    },
    setAndClose(){
      this.dialogVisible = !this.dialogVisible
      this.devices()
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
