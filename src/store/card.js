import Vue from 'vue'
import Vuex from 'vuex'
import electron from 'electron' 

const remote = electron.remote
const ipc = electron.ipcRenderer
const windowManager = remote.require('electron-window-manager')
 
const getCardId = () => {
    return window.location.hash.replace("#", "")
}

const state = {
    card: {
        width: 600,
        height: 332,
        x: 0,
        y: 0,
        title: "",
        text: "",
        editable: false,
        loaded: false
    }
}
 
const getters = {
    
}
 
const actions = {
    fetchCard ({commit}) {
        let data = windowManager.sharedData.fetch(getCardId())

        let width = data.width
        let height = data.height
        let x = data.x
        let y = data.y
        let title = data.title
        let text = data.text
        let editable = data.title ? false : true
        let loaded = false

        commit("setCardData", {
            width: width,
            height: height,
            x: x,
            y: y,
            title: title,
            text: text,
            editable: editable,
            loaded: true
        })

    },
    updateTitle ({commit}, title) {
        commit("setCardData", {
            title: title,
        })
    },
    updateText ({commit}, text) {
        commit("setCardData", {
            text: text,
        })
    },
    updateCardSize ({commit}) {
        let sizes = remote.getCurrentWindow().getSize()
        ipc.send('update-card-size', {id: getCardId(), width: sizes[0], height: sizes[1]})

        commit("setCardData", {
            width: sizes[0],
            height: sizes[1],
        })

    },
    updateCardPosition ({commit}) {
        let positions = remote.getCurrentWindow().getPosition()
        ipc.send('update-card-position', {id: getCardId(), x: positions[0], y: positions[1]})

        commit("setCardData", {
            x: positions[0],
            y: positions[1],
        })
    },
    startEdit ({commit}) {
        commit("setCardData", {
            editable: true,
        })
    },
    saveCard ({commit}, card) {

        let prevTitle = windowManager.sharedData.fetch(getCardId()).title
        let prevText = windowManager.sharedData.fetch(getCardId()).text

        if (prevTitle === card.title && prevText === card.text ) {
            commit("setCardData", {
                editable: false,
            })
            return
        }

        // 履歴に追記する
        ipc.send('add-card-history', {title: card.title, text: card.text})
        // 内容を保存する
        ipc.send('update-card', {id: getCardId(), title: card.title, text: card.text})

        commit("setCardData", {
            title: card.title,
            text: card.text,
            editable: false,
            loaded: true
        })
    },
    closeCard ({commit}) {
        ipc.send('delete-card', {id: getCardId()})
    },
}
 
const mutations = {
    setCardData (state, card) {
        let mergedCard = Object.assign({}, state.card, card)
        state.card = mergedCard
    },
}
 
Vue.use(Vuex)
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
})