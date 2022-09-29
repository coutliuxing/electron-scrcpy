import type { App } from 'vue'
import { nextTick } from "vue"
var fs = require("fs")
import { remote } from 'electron';
import path from 'path';
export const errorHandler = (App: App<Element>) => {
    App.config.errorHandler = (err, vm, info) => {
        nextTick(() => {
            if (process.env.NODE_ENV === 'development') {
                console.group('%c >>>>>> 错误信息 >>>>>>', 'color:red')
                console.log(`%c ${info}`, 'color:blue')
                console.groupEnd()
                console.group('%c >>>>>> 发生错误的Vue 实例对象 >>>>>>', 'color:green')
                console.log(vm)
                console.groupEnd()
                console.group('%c >>>>>> 发生错误的原因及位置 >>>>>>', 'color:red')
                console.error(err)
                console.groupEnd()
            }else{
                // 写入本地文件
                // const errorLogPath = path.join(remote.app.getPath('exe'), '../inoteError.log');
                // fs.writeFileSync(errorLogPath, info + '\n', { flag: 'a' });
                // fs.writeFileSync(errorLogPath, vm + '\n', { flag: 'a' });
                // fs.writeFileSync(errorLogPath, err + '\n', { flag: 'a' });
            }
        })
    }

}