import Vue from 'vue';
import Vuex from 'vuex';
import { createPersistedState, createSharedMutations } from "vuex-electron"

const state = {
    main: 0,
    stretch: true,
}

const mutations = {
    turnStretch(state, str) {
        // 这个state是传上面的全局参数(必须的，不然修改不了全局参数)
        state.stretch = false // 修改state里面的值
        state.main = str
        console.log('state.stretch:', state.stretch)
        console.log('state.main:', state.main)
    },
otherFun(state) { // 都需要带state
}
}