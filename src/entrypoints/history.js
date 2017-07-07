import 'babel-polyfill'
import Vue from 'vue'
import Vuex from 'vuex'
import History from '../components/History.vue'
import store from '../store/history'

window.Vue = Vue

new Vue({
    el: '#history',
    store,
    render: h => h(History)
})