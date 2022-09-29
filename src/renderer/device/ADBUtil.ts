const exec = require('child_process').exec
import path from 'path';
const Adb  = require('@devicefarmer/adbkit/lib/adb')
export default class AdbUtil{
    private static adbBin = path.join(process.env.NODE_ENV === 'development'?path.resolve("")/*项目目录*/:process.resourcesPath,`vendor/${process.platform ==="win32"?"/adb/adb.exe":""}`)

    public static client(host,port =5037){
        // return Adb.createClient({"host":host,"port":port,"bin":this.adbBin})
        let client = Adb.createClient({"host":host,"port":port})
        // console.log( "AdbUtil",client.version())
        // client.version().then((v)=>{
        //     console.log(v)
        // }).catch((err)=>{
        //     console.log(err)
        // })
        return Adb.createClient({"host":host,"port":port})
    }
}

    