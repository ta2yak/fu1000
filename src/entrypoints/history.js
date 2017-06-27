import 'babel-polyfill'
import Vue from 'vue'
import History from '../components/History.vue'
import store from '../store/history'

Vue.config.debug = true

new Vue({
    el: '#history',
    store,
    render: h => h(History)
})