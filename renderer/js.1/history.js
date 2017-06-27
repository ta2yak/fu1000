const electron = require("electron")
const remote = electron.remote
const ipc = electron.ipcRenderer
const windowManager = remote.require('electron-window-manager')
const _ = require("lodash")
const moment = require("moment")
const winston = require('../lib').logger.renderer()

Vue.component('history-item', {
  template: `
      <div class="card">
        <div class="content">
          <div class="header">{{ title }}</div>
          <div class="meta">{{ fromNowString }}</div>
          <div class="description">
            {{ text }}
          </div>
        </div>
        <div class="ui bottom attached button pink" v-on:click="restoreCard">
          <i class="add icon"></i>
          この内容で新しいカードを作る
        </div>
      </div>
    </div>
  `,
  props: ['title', 'updatedAt', 'text'],
  computed: {
    fromNowString: function () {
      return moment(this.updatedAt).fromNow()
    }
  },
  methods: {
    restoreCard: _.debounce( function(e) {
      ipc.send('restore-card', {title: this.title, text: this.text})
    }, 300),
  },
})

const cards = new Vue({
  el: '#cards',
  data: {
    items: windowManager.sharedData.fetch("history"),
  },
  computed: {
    sortedItems: function () {
      return _.reverse(this.items)
    }
  },
  methods: {
    onClose: () => {
      remote.getCurrentWindow().close()
    },
  },
  mounted: () => {
  }
})
