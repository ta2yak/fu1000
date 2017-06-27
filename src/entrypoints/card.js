import 'babel-polyfill'
import Vue from 'vue'
import Card from '../components/Card.vue'
import store from '../store/card'

Vue.config.debug = true

new Vue({
    el: '#card',
    store,
    render: h => h(Card)
})