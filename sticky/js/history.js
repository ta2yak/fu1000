const remote = require("electron").remote
const settings = require('electron-settings');
const _ = require("lodash")
const moment = require("moment")
const winston = require('winston')
require('winston-loggly-bulk')

winston.add(winston.transports.Loggly, {
    token: "41feb295-2f15-4838-8d59-e65a7ec9b5e4",
    subdomain: "ta2yak",
    tags: ["Winston-NodeJS", "Sticky-Renderer"],
    json:true
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
    getTimeAgo: (date) => {
      return moment(date).fromNow()
    },
    restoreCard: _.debounce( function(e) {
      // this.title = e.target.value
    }, 300),
  },
  mounted: () => {
  }
})

const menu = new Vue({
  el: '#menu',
  data: {
  },
  methods: {
    onClose: () => {
      remote.getCurrentWindow().close()
    }
  },
  mounted: () => {
  }
})
