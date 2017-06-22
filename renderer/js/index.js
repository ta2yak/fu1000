const electron = require("electron")
const remote = electron.remote
const ipc = electron.ipcRenderer
const shell =  electron.shell
const windowManager = remote.require('electron-window-manager')
const marked = require("marked")
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

renderer.link = function (href, title, text) {
  return "<a onclick='openExternalWindow(this)' href=\"" + href + "\" title=\"" + title + "\">" + text + "</a>";
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

/* カードIDを取得 */
let getCardId = () => {
  return window.location.hash.replace("#", "")
}

/* 画面サイズを復元する */
let restoreWindowSize = () => {
  let data = windowManager.sharedData.fetch(getCardId())
  let width = data.width
  let height = data.height
  remote.getCurrentWindow().setSize(width, height)
}

/* 画面位置を復元する */
let restoreWindowPosition = () => {
  let data = windowManager.sharedData.fetch(getCardId())
  let x = data.x
  let y = data.y
  remote.getCurrentWindow().setPosition(x, y)
}

/* タイトルを設定する */
let setTitle = (title) => {
  remote.getCurrentWindow().setTitle(title || "タイトルを入力してください")
}

/* 外部リンクを開く */
let openExternalWindow = (linkElement) => {
  event.preventDefault()
  shell.openExternal(linkElement.href)
}

const vue = new Vue({
  el: '#card',
  data: {
    title: windowManager.sharedData.fetch(getCardId()).title,
    text: windowManager.sharedData.fetch(getCardId()).text,
    editable: windowManager.sharedData.fetch(getCardId()).title ? false : true,
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
      this.editable = true
    },
    onSave: function(){

      if (this.title == "") {
        confirm("タイトルは必ず入力してください")
        return
      }

      let prevTitle = windowManager.sharedData.fetch(getCardId()).title
      let prevText = windowManager.sharedData.fetch(getCardId()).text

      if (prevTitle === this.title && prevText === this.text ) {
        winston.log('info', "No Change Data")
        this.editable = false
        restoreWindowSize()
        restoreWindowPosition()
        return
      }

      winston.log('info', "Saving form ...")

      // 履歴に追記する
      ipc.send('add-card-history', {title: this.title, text: this.text})
      // 内容を保存する
      ipc.send('update-card', {id: getCardId(), title: this.title, text: this.text})

      this.editable = false

      restoreWindowSize()
      restoreWindowPosition()
      setTitle(this.title)

      winston.log('info', "Saved form !!")

    },
    onClose: function(){
      if (confirm("このカードを削除してもよろしいですか？\n※ 一度削除すると復元できません")) {
        ipc.send('delete-card', {id: getCardId()})
        remote.getCurrentWindow().close()
      }
    }
  },
  mounted: function(){
    restoreWindowSize()
    restoreWindowPosition()
    setTitle(this.title)
    this.loaded = true
  }
})

remote.getCurrentWindow().on('resize', function (e) {
  let sizes = remote.getCurrentWindow().getSize()
  ipc.send('update-card-size', {id: getCardId(), width: sizes[0], height: sizes[1]})
})

remote.getCurrentWindow().on('move', function (e) {
  let positions = remote.getCurrentWindow().getPosition()
  ipc.send('update-card-position', {id: getCardId(), x: positions[0], y: positions[1]})
})
