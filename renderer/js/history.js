const electron = require("electron")
const remote = electron.remote
const ipc = electron.ipcRenderer
const settings = require('electron-settings');
const _ = require("lodash")
const uuid = require("uuid")
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
        <div class="ui bottom attached button teal" v-on:click="restoreCard">
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
      let restoreId = uuid.v4()
      settings.set(restoreId + ".title", this.title)
      settings.set(restoreId + ".text", this.text)
      ipc.send('restore-card', restoreId)
    }, 300),
  },
})

const cards = new Vue({
  el: '#cards',
  data: {
    items: settings.get("history") || new Array(),
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
    remote.getCurrentWindow().webContents.openDevTools()
  }
})
