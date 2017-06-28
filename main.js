const electron = require('electron')
const ipc = electron.ipcMain
const windowManager = require('electron-window-manager')
const settings = require('electron-settings')
const uuid = require('uuid')
const _ = require('lodash')
const path = require('path')
const {app, BrowserWindow, Menu, Tray, globalShortcut} = electron
const notifier = require('node-notifier')
const CronJob = require('cron').CronJob
const moment = require('moment')
const winston = require('./lib').logger.main()


// Consoleを開くときにはTrueを設定する
const debug = false
// 保存内容を削除する場合に利用する
//settings.deleteAll()

let mainWindow = null
let tray = null
let contextMenu = null

/* 初期カードデータ */
let cardDataTemplate = {
  title: "",
  text: "# Hello",
  width: 600,
  height: 332,
  x: 0,
  y: 0,
}

// 新規のカードを生成する
let createSticky = () => {
  winston.log('info', "Create New Card ...")

  let id = uuid.v4()
  windowManager.sharedData.set(id, Object.assign({}, cardDataTemplate, {}))
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/renderer/card.html" + "#" + id) 

  let windows = settings.get('windows') || new Array()
  windows.push({id: id})
  settings.set('windows', windows)
  winston.log('info', "Created New Card !! Total Card Count：" + windows.length)
}

// 作成済みのカードを生成する
let resumeSticky = (id) => {
  windowManager.sharedData.set(id, Object.assign({}, cardDataTemplate, settings.get(id)))
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/renderer/card.html" + "#" + id) 
}

// 全てのウィンドウを前面に表示する
let allToFront = () => {
  winston.log('info', "Setting Changing... Screen To Top")
  let windows = settings.get('windows') || new Array()
  _.each(windows, (window) => {
    let win = windowManager.get(window.id)
    if(win) win.restore()
    if(win) win.focus()
  })
  winston.log('info', "Setting Changed!! Screen To Top")
}

// 全てのウィンドウを最小化する
let allToMinimize = () => {
  winston.log('info', "Setting Changing... Screen To Min")
  let windows = settings.get('windows') || new Array()
  _.each(windows, (window) => {
    let win = windowManager.get(window.id)
    if(win) win.minimize()
  })
  winston.log('info', "Setting Changed!! Screen To Min")
}

// 履歴参照画面を表示する
let showHistory = () => {
  windowManager.sharedData.set("history", settings.get("history") || new Array())
  windowManager.open("history", 'Sticky History', "file://" + __dirname + "/renderer/history.html", false, {
      width: 290, 
      height: 400, 
      frame: false, 
      resizable: false,
      "skip-taskbar": true,
      show: false,
      showDevTools: debug,
  }) 
}

let showNotify = (title, message) => [
  notifier.notify({
      title: title,
      message: message,
      sound: true,
      wait: true,
      contentImage: 'file://' + __dirname + '/assets/images/icon-full.png'
  }, function (err, response) {
      console.log(response)
  })
]

// 試験的に時刻通知機能をつけてみる
new CronJob('*/15 * * * *', function() {
  showNotify("15分刻みにお知らせ！", moment().format("YYYY年MM月DD日 HH時mm分 です"))
}, null, true, 'Asia/Tokyo')

app.on('ready', () => {

  winston.log('info', "Launch...")

  // **************************************************
  // メインウィンドウの設定
  // **************************************************
  // メインウィンドウは表示しないため、非表示化しておく
  mainWindow = new BrowserWindow(
    {
      width: 1, 
      height: 1, 
      frame: false, 
      show: false, 
      "skip-taskbar": true
    }
  )
  mainWindow.on('closed', () => {
    mainWindow = null
    tray = null
    contextMenu = null
  })

  // **************************************************
  // ウィンドウマネージャーの設定
  // **************************************************
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  windowManager.setDefaultSetup(
    {
      width: 400, 
      height: 400, 
      frame: false, 
      resizable: true,
      "skip-taskbar": true,
      show: false,
      maxWidth: width, 
      maxHeight: height,
      showDevTools: debug,
    })

  winston.log('info', "Resume Cards ...")

  // 画面一覧を取得
  let windows = settings.get('windows') || new Array()
  // 画面一覧からウィンドウを復元
  _.each(windows, (window) => {
    resumeSticky(window.id)
  })

  winston.log('info', "Resumed Cards!! Resume count:" + windows.length)

  // **************************************************
  // タスクトレイの設定
  // **************************************************
  tray = new Tray(path.join(__dirname, 'assets', 'images', "icon.png"))
  contextMenu = Menu.buildFromTemplate([
      { label: "新しいカードを作成する", 
        click: function() {
          createSticky()
        } 
      },
      { label: "過去の履歴を参照する", 
        click: function() {
          showHistory()
        } 
      },
      { label: "最前面に表示する", 
        click: function() {
          allToFront()
        } 
      },
      { label: "全てを隠す", 
        click: function() {
          allToMinimize()
        } 
      },
      { label: "終了", 
        click: function() { 
          winston.log('info', "Quit app.")
          app.quit()
        } 
      }
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip(app.getName())


  var template = [{
      label: "Application",
      submenu: [
          { label: "Quit", accelerator: "Command+Q", click: () => { 
            winston.log('info', "Quit app.")
            app.quit() 
          }}
      ]}, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
  ]
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  globalShortcut.register('Shift+CmdOrCtrl+N', () => {
    winston.log('info', "Handle shortcut. [New Card]")
    createSticky()
  })

  globalShortcut.register('Shift+CmdOrCtrl+D', () => {
    winston.log('info', "Handle shortcut. [WINDOWS MIN]")
    allToMinimize()
  })

  globalShortcut.register('Shift+CmdOrCtrl+F', () => {
    winston.log('info', "Handle shortcut. [WINDOWS TOP]")
    allToFront()
  })
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// IPC
ipc.on('restore-card', function(event, arg /* {title:"", text:""} */) {
  winston.log('info', "Restore Card ..." + arg)
  let restoreCardId = uuid.v4()

  let windows = settings.get('windows') || new Array()
  windows.push({id: restoreCardId})
  settings.set('windows', windows)

  settings.set(restoreCardId + ".title", arg.title)
  settings.set(restoreCardId + ".text", arg.text)

  winston.log('info', "Restored Card !!")

  resumeSticky(restoreCardId)
})

ipc.on('update-card', function(event, arg /* {id:"", title:"", text:""} */) {
  winston.log('info', "Update Card ..." + arg)
  settings.set(arg.id + ".title", arg.title)
  settings.set(arg.id + ".text", arg.text)
  winston.log('info', "Updated Card !!")
})

ipc.on('update-card-size', function(event, arg /* {id:"", width:"", height:""} */) {
  settings.set(arg.id + ".width", arg.width)
  settings.set(arg.id + ".height", arg.height)
})

ipc.on('update-card-position', function(event, arg /* {id:"", x:"", y:""} */) {
  settings.set(arg.id + ".x", arg.x)
  settings.set(arg.id + ".y", arg.y)
})

ipc.on('delete-card', function(event, arg /* {id:""} */) {
  winston.log('info', "Deleting card ..." + arg)
  let windows = settings.get('windows')
  _.remove(windows, function(w) { return w.id === arg.id })
  settings.set('windows', windows)
  settings.delete(arg.id)
  winston.log('info', "Deleted card !!")
})

ipc.on('add-card-history', function(event, arg /* {title:"", text:""} */) {
  winston.log('info', "Adding history ..." + arg)
  let historyId = uuid.v4()
  let history = settings.get('history') || new Array()
  history.push({id: historyId, title: arg.title, text: arg.text, updatedAt: new Date()})
  _.slice(history, 0, 50) // 50件を残す
  settings.set('history', history)
  winston.log('info', "Added history !!")
})
