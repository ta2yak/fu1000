import 'babel-polyfill'
import Vue from 'vue'
import Card from '../components/Card.vue'
import store from '../store/card'

import electron from 'electron' 
const shell =  electron.shell
// Marked から呼び出すための処理
window.openExternalLink = function(href){
  shell.openExternal(href)
}


new Vue({
    el: '#card',
    store,
    render: h => h(Card)
})