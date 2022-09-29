<template>
    <el-dialog width="40%" title="登录"  :before-close="closeCallback()" >
        <el-form ref="form" :rules="LoginfromRules"  :model="form" size="small" label-width="100px" :disabled="disabled">
            <el-row>
                <el-form-item label="用户名：" prop="username" >
                    <el-input class="search-input" v-model="form.username"/>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                    <el-input type="password" class="search-input" v-model="form.password"/>
                </el-form-item>
            </el-row>
        </el-form>
        <div  class="btns">
            <el-button type="primary" @click="login('form')" >{{disabled?"退出登录":"登 录"}}</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import md5 from 'js-md5'
    const storage = require('electron-localstorage');
    export default {
        name: "Login",
        emits: ['onLogined'],
        setup(props,context){
            function onLogined(data){
                context.emit('onLogined',data)
            }
            return {onLogined}
        },
        data() {
            return {
                //是否显示本面板
                disabled: true,
                //是否可以关闭
                canClose: true,
                //表单数据
                form: {
                    username: '',
                    password: '',
                    },
                LoginfromRules:{
                   // 验证用户名是否合法
                    username: [
                        { required: true, message: '请输入登录名称', trigger: 'blur' },
                        // { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    // 验证密码是否合法
                    password: [
                        { required: true, message: '请输入登录密码', trigger: 'blur' },
                        // { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ]
                    }
                }
        },
        updated(){
            let usr= storage.getItem("user");
            this.form = usr
            if(usr && usr.username && usr.password && usr.token){
                this.disabled = true
            }else{
                this.disabled = false
            }

        },
        mounted: function () {
            const that = this;
            //如果用户没有登录，则打开登录界面
            // if (window.sessionStorage) {
            //     const data = JSON.parse(sessionStorage.getItem("is_login"));
            //     if (data) {
            //         that.modelShow = false;
            //     } else {
            //         that.modelShow = true;
            //     }
            // }
        },
        methods: {
            //登录
            login: function () {
                if(this.disabled){
                    storage.setItem("user",{})
                    this.onLogined(undefined);
                    this.form = {}
                    return
                }
                
                var that = this
                console.log(this.form)
                fetch('http://192.168.6.241:8069/zcloud_api/login',{
                    method:"POST",
                    mode: 'cors',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body:JSON.stringify({
                        'username' : this.form.username,
                        'password' :md5( this.form.password)
                    })
                    })
                    .then(response => response.json())
                    .then(json => {
                        if(json.code === 20000){
                            json.data["username"] = this.form.username
                            json.data["password"] = this.form.password
                            storage.setItem("user",json.data)
                            that.onLogined(json.data);
                        }
                        console.log(json)
                    })
                
            },
            //关闭登录窗口前的回调(如果用户没有登录成功，则再次打开本窗口，以达到强制登录的目的)
            closeCallback: function () {
                this.modelShow = false;
                // if (window.sessionStorage) {
                //     const data = JSON.parse(sessionStorage.getItem("is_login"));
                //     if (data) {
                //         this.modelShow = false;
                //     } else {
                //         this.modelShow = true;
                //     }
                // }
            }
        },
    }
</script>

<style scoped>
.btns{
    display: flex;
    justify-content: center;
}
</style>
