# electron-scrcpy


#### 如何安装

``` bash
# 首先全局安装nrm
npm i -g nrm
# 然后使用nrm切换为淘宝源，或者你已经切换了npm的源也是可以的，强烈不建议使用cnpm如果你不想看到什么奇奇怪怪的爆红问题
nrm ls
nrm use taobao
# 安装依赖，这里有个问题，可能ELECTRON或者postcss会由于玄学原因安装失败，此时我推荐使用cnpm安装依赖然后！删除那个node_modules包，重新npm i，这样做的原因是
# ELECTRON只要下载了一次您自己没有清除缓存的话，就可以直接使用上次的安装包，这样通过cnpm安装完成之后，一定！要删除一次依赖包！一定哦！
# 再使用npm安装就会使用缓存了，免去那个魔法的过程～～
# 或者可以使用更加优秀的yarn。
# 当然，yarn也需要配置淘宝镜像，需要将配置到系统的环境变量里
npm install or yarn install

# 启动之后，会在9080端口监听
# 需要重新运行一次此命令
npm run dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
npm run build

# 启动单元测试模块,但是需要注意的是,我没有更新依赖,所以很可能会导致失败
npm test
# 如若实在不行无法安装electron依赖，请使用
npm config edit
# 该命令会打开npm的配置文件，请在registry=https://registry.npm.taobao.org/这行代码后的下一行添加
# electron_mirror=https://cdn.npm.taobao.org/dist/electron/  和  ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
# 然后关闭该窗口，重启命令行，删除node_modules文件夹，并重新安装依赖即可

```

---


