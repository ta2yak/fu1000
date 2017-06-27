import 'babel-polyfill'
import Vue from 'vue'
import Card from '../components/Card.vue'
import store from '../store/card'

new Vue({
    el: '#card',
    store,
    render: h => h(Card)
})