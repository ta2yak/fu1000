import Vue from 'vue'
import Vuex from 'vuex'
import electron from 'electron' 

const remote = electron.remote
const ipc = electron.ipcRenderer
const windowManager = remote.require('electron-window-manager')
 
const state = {
    items: []
}
 
const getters = {
}
 
const actions = {
    fetchHistory ({commit}) {
        let items = windowManager.sharedData.fetch("history")
        commit("setItems", {
            items: items,
        })

    },
    restoreCard ({commit}, card) {
        ipc.send('restore-card', {title: card.title, text: card.text})
    },
}
 
const mutations = {
    setItems (state, payload) {
        state.items = payload.items
    },
}
 
Vue.use(Vuex)
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
})