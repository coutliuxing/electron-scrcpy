<template>
<el-table  :data="device_arr" stripe style="width: 100%" >
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
export default {
  name: 'DeviceControl',
  data() {
    return {
      loading: true,
      device_arr:[]
    }
  },
  computed: {
  },
  created() {
    this.devices()
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
    const deviceSocket = new WebSocket(`ws://localhost:8006/?action=droid-device-list`)
    // ws.on('open', function open() {
    //   ws.send('something');
    // });
    let that = this
    deviceSocket.onmessage =function(data){
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
    },
    open(index,row){
      let data = {
        url: `/converter?udid=${row['udid']}`,
        udid:row['udid'],
        height:560,
        width:560
      };
      ipcRenderer.invoke("open-win", data);
    },
    checkState(row){
      return row['state'] ==="device"
    }
  }
}
</script>
