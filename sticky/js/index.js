const remote = require("electron").remote
const settings = require('electron-settings');
const marked = require("marked")
const _ = require("lodash")
const winston = require('winston')
require('winston-papertrail').Papertrail

let mainWindow = null
let tray = null
let contextMenu = null
let logger = new winston.Logger({
  transports: [
    new winston.transports.Papertrail({
      level: 'info',
      host: 'logs5.papertrailapp.com',
      port: 19352
    })
  ]
})


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
let persistWindowSize = function(){
  let sizes = remote.getCurrentWindow().getSize()
  settings.set(window.location.hash + ".width", sizes[0])
  settings.set(window.location.hash + ".height", sizes[1])
}

/* 画面位置を保存する */
let persistWindowPosition = function(){
  let positions = remote.getCurrentWindow().getPosition()
  settings.set(window.location.hash + ".x", positions[0])
  settings.set(window.location.hash + ".y", positions[1])
}

/* 画面サイズを復元する */
let restoreWindowSize = function(){
  let width = settings.get(window.location.hash + ".width") || 600
  let height = settings.get(window.location.hash + ".height") || 332
  remote.getCurrentWindow().setSize(width, height)
}

/* 画面位置を復元する */
let restoreWindowPosition = function(){
  let x = settings.get(window.location.hash + ".x") || 0
  let y = settings.get(window.location.hash + ".y") || 0
  remote.getCurrentWindow().setPosition(x, y)
}

/* タイトルを設定する */
let setTitle = function(title){
  remote.getCurrentWindow().setTitle(title || "名称を入力してください")
}

const vue = new Vue({
  el: '#card',
  data: {
    title: settings.get(window.location.hash + ".title") || '',
    input: settings.get(window.location.hash + ".text") || '# hello',
    editable: false,
    loaded: false,
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.input, { sanitize: true })
    }
  },
  methods: {
    updateTitle: _.debounce(function (e) {
      this.title = e.target.value
    }, 300),
    updateText: _.debounce(function (e) {
      this.input = e.target.value
    }, 300),
    onEdit: function(){
      persistWindowSize()
      persistWindowPosition()

      this.editable = true
    },
    onSave: function(){
      logger.info("Saving form ...")
      settings.set(window.location.hash + ".title", this.title)
      settings.set(window.location.hash + ".text", this.input)
      this.editable = false
      restoreWindowSize()
      restoreWindowPosition()
      setTitle(this.title)
      logger.info("Saved form !!")
    },
    onClose: function(){
      if (confirm("このカードを削除してもよろしいですか？\n※ 一度削除すると復元できません")) {
        logger.info("Deleting card ...")
        // 永続化データから削除する
        let windows = settings.get('windows')
        let key = window.location.hash
        _.remove(windows, function(w) { return ("#" + w.id) === key })
        settings.set('windows', windows)
        settings.delete(window.location.hash)
        logger.info("Deleted card !!")

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
