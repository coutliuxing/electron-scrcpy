<script>
  import BaseConverter from './converter.vue'
  import Cloud from './Cloud'
  const { remote} = require('electron')
  export default {
    extends: BaseConverter,
    data() {
      return {
        cloudDeviceId:-1,
        adbRemote:""
      }
    },
    created(){
      this.cloudInit()
    },
    mounted() {
    },
    unmounted() {
    },
    methods: {
      cloudInit(){
        if(this.$route.query.ws_url){
            this.wsUrl = this.$route.query.ws_url
            
        }
        if(this.$route.query.remote){
            this.adbRemote = this.$route.query.remote
        }
        if(this.$route.query.device_id){
          this.cloudDeviceId = this.$route.query.device_id
        }
      },
      onSocketOpened() {
        let that = this
        if(this.adbRemote){
          Cloud.connectDevice(this.adbBin,this.deviceIP,this.adbRemote).then(function(value){
            that.$message({message: value,type: 'success',duration:2000,offset:-15,center: true});

          },function(error){
            let err = `<p> adb connect ${that.deviceIP}:${that.adbRemote}</p> \n 连接失败请尝试手动 \n ${error}`
            that.$message({message: err,type: 'error',duration:0,offset:-15,center: true,showClose: true,dangerouslyUseHTMLString:true});
          })
            

          if(that.cloudDeviceId!==-1){
              remote.webContents.getAllWebContents().forEach((item,index)=>{
                if(remote.BrowserWindow.fromId(item.id) && remote.BrowserWindow.fromId(item.id).webContents){
                  remote.BrowserWindow.fromId(item.id).webContents.send('converter_msg', {"type":"connected","id":this.cloudDeviceId});
                }
              });
            }
      }
      },
      destroy(){
        if(this.cloudDeviceId!==-1){
          remote.webContents.getAllWebContents().forEach((item,index)=>{
          if(remote.BrowserWindow.fromId(item.id) && remote.BrowserWindow.fromId(item.id).webContents){
            remote.BrowserWindow.fromId(item.id).webContents.send('converter_msg', 
            {
              "type":"release",
              "id":this.cloudDeviceId,"ip":this.deviceIP,
              "port":this.adbRemote
            });
          }
        });
      }
      let that = this
      if(this.adbRemote){
        Cloud.disconnectDevice(this.deviceIP,this.adbRemote,this.bin).then(function(value){
        that.$message({message: value,type: 'success',duration:2000,offset:-15,center: true});

        },function(error){
          that.$message({message: error,type: 'error',duration:2000,offset:-15,center: true});
        })

      }
    }
    },
    
  }

  
</script>