const exec = require('child_process').exec
import path from 'path';
export default {
    async lockCloudDevice(usr,row){
        let that = this
        // 请求使用
        const  response =await fetch(`http://192.168.8.241:8069/zcloud_api/stf/device/use/${row["cloud.ext"]["id"]}`,{
                    method:"post",
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
        if(json){
            return json
        }
        // .then(response => response.json())
        //             .then(json => {
        //                 // console.log(json)
        //                 // console.log(that.device_arr)
        //                 that.converToStandardDeviceInfo(json.data)
        //             })
        },
        async releaseCloudDevice(usr,id,bin=path.join(process.env.NODE_ENV === 'development'?path.resolve("")/*项目目录*/:process.resourcesPath,`vendor/${process.platform ==="win32"?"/adb/adb.exe":""}`)){
        // 请求使用
        const  response =await fetch(`http://192.168.8.241:8069/zcloud_api/stf/device/release/${id}`,{
                    method:"delete",
                    mode: 'cors',
                    headers: {
                    'Content-Type': 'application/json',
                    "X-Token":usr.token
                    }
                    })
        console.log(response)
        if(response.status !==200){
            return
        }
        const json = await response.json();
        if(json){
            this.refreshDevices(this.cloudUsr)
            return json
        }
    },
    connectDevice(bin,host,port){
        return new Promise(function(resolve, reject){
            
            // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            let cmd = `${bin} connect ${host}:${port}`
            console.log(cmd)
            var workerProcess = exec(cmd, {cwd: "/"})
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})

            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
                resolve(data)
            });

            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
                reject(`${data}`)
            });

            // // 退出之后的输出
            // workerProcess.on('close', function (code) {
            //     console.log('out code：' + code);
            // })
            });

    },

    disconnectDevice(host,port,bin=(path.join(process.env.NODE_ENV === 'development'?path.resolve("")/*项目目录*/:process.resourcesPath,`vendor/${process.platform ==="win32"?"/adb/adb.exe":""}`))){
        return new Promise(function(resolve, reject){
            
            // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            let cmd = `${bin} disconnect ${host}:${port}`
            console.log(cmd)
            var workerProcess = exec(cmd, {cwd: "/"})
            // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})

            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
                resolve(data)
            });

            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
                reject(`${data}`)
            });

            // // 退出之后的输出
            // workerProcess.on('close', function (code) {
            //     console.log('out code：' + code);
            // })
            });

    }
}