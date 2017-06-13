const remote = require("electron").remote
const settings = require('electron-settings');
const marked = require("marked")
const uuid = require("uuid")
const _ = require("lodash")
const winston = require('../lib').logger.renderer()

let renderer = new marked.Renderer()
renderer.listitem = (text) => {
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    text = text
      .replace(/^\s*\[ \]\s*/, '<i class="square outline icon"></i> ')
      .replace(/^\s*\[x\]\s*/, '<i class="checkmark box icon"></i> ')
    return '<li style="list-style: none">' + text + '</li>';
  } else {
    return '<li>' + text + '</li>';
  }
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

/* 画面サイズを保存する */
let persistWindowSize = () => {
  let sizes = remote.getCurrentWindow().getSize()
  settings.set(window.location.hash + ".width", sizes[0])
  settings.set(window.location.hash + ".height", sizes[1])
}

/* 画面位置を保存する */
let persistWindowPosition = () => {
  let positions = remote.getCurrentWindow().getPosition()
  settings.set(window.location.hash + ".x", positions[0])
  settings.set(window.location.hash + ".y", positions[1])
}

/* 画面サイズを復元する */
let restoreWindowSize = () => {
  let width = settings.get(window.location.hash + ".width") || 600
  let height = settings.get(window.location.hash + ".height") || 332
  remote.getCurrentWindow().setSize(width, height)
}

/* 画面位置を復元する */
let restoreWindowPosition = () => {
  let x = settings.get(window.location.hash + ".x") || 0
  let y = settings.get(window.location.hash + ".y") || 0
  remote.getCurrentWindow().setPosition(x, y)
}

/* タイトルを設定する */
let setTitle = (title) => {
  remote.getCurrentWindow().setTitle(title || "タイトルを入力してください")
}

const vue = new Vue({
  el: '#card',
  data: {
    title: settings.get(window.location.hash + ".title") || '',
    text: settings.get(window.location.hash + ".text") || '# Welcome to Sticky',
    editable: false,
    loaded: false,
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.text, { sanitize: true })
    }
  },
  methods: {
    updateTitle: _.debounce(function (e) {
      this.title = e.target.value
    }, 300),
    updateText: _.debounce(function (e) {
      this.text = e.target.value
    }, 300),
    onEdit: function(){
      persistWindowSize()
      persistWindowPosition()

      this.editable = true
    },
    onSave: function(){

      let prevTitle = settings.get(window.location.hash + ".title")
      let prevText = settings.get(window.location.hash + ".text")

      if (prevTitle === this.title && prevText === this.text ) {
        winston.log('info', "No Change Data")
        this.editable = false
        restoreWindowSize()
        restoreWindowPosition()
        return
      }

      winston.log('info', "Saving form ...")

      // 履歴に追記する
      let historyId = uuid.v4()
      let history = settings.get('history') || new Array()
      history.push({id: historyId, title: this.title, text: this.text, updatedAt: new Date()})
      _.slice(history, 0, 10) // 10件を残す
      settings.set('history', history)

      // 内容を保存する
      settings.set(window.location.hash + ".title", this.title)
      settings.set(window.location.hash + ".text", this.text)
      this.editable = false
      restoreWindowSize()
      restoreWindowPosition()
      setTitle(this.title)
      winston.log('info', "Saved form !!")

    },
    onClose: function(){
      if (confirm("このカードを削除してもよろしいですか？\n※ 一度削除すると復元できません")) {
        winston.log('info', "Deleting card ...")
        // 永続化データから削除する
        let windows = settings.get('windows')
        let key = window.location.hash
        _.remove(windows, function(w) { return ("#" + w.id) === key })
        settings.set('windows', windows)
        settings.delete(window.location.hash)
        winston.log('info', "Deleted card !!")

        remote.getCurrentWindow().close()
      }
    }
  },
  mounted: function(){
    restoreWindowSize()
    restoreWindowPosition()
    setTitle(this.title)
    this.loaded = true
    //remote.getCurrentWindow().webContents.openDevTools()
  }
})

remote.getCurrentWindow().on('resize', function (e) {
  persistWindowSize()
})

remote.getCurrentWindow().on('move', function (e) {
  persistWindowPosition()
})
