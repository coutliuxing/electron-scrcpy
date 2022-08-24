<template>
<div  style="text-align: center;margin:8px">
    <el-input v-model="ipAddress" >
     <template #append>
        <el-button @click="saveRemoteIP()" size="mini" type="primary">确定</el-button>
      </template>  
    </el-input>
    <div class="ip-input-alter">ps:连接其他电脑的手机设备，输入对应ip并确保对应电脑启动了本客户端</div>
   
</div>

</template>
<script>
const storage = require('electron-localstorage');
const { remote } = require('electron')
const { ipcRenderer } = require("electron");
  export default {
  data() {
    return {
      loading: true,
      device_arr:[],
      dialogVisible:true,
      ipAddress:"localhost"
    }
  },
  created() {
    let remoteIP= storage.getItem("remote_ip");
    if(remoteIP){
      this.ipAddress = remoteIP
    }
  },
  methods:{
    saveRemoteIP(){
      storage.setItem("remote_ip",`${this.ipAddress}`)
      console.log(storage.getItem("remote_ip"))
      // ipcRenderer.send('remote_ip', {
      //   remote_ip: this.ipAddress,
      // })

    remote.webContents.getAllWebContents().forEach((item,index)=>{
        console.log(item,index)
        
        if(remote.BrowserWindow.fromId(item.id) && remote.BrowserWindow.fromId(item.id).webContents){
            remote.BrowserWindow.fromId(item.id).webContents.send('remote_ip', {"ip":this.ipAddress,"from":"remote"});
      }
    });
      remote.getCurrentWindow().close()
    }
  }
}

</script>
