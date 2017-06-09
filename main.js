const electron = require('electron')
const windowManager = require('electron-window-manager')
const settings = require('electron-settings')
const uuid = require('uuid')
const _ = require('lodash')
const path = require('path')
const {app, BrowserWindow, Menu, Tray, globalShortcut} = electron
const winston = require('winston')
require('winston-loggly-bulk')

// 保存内容を削除する場合に利用する
//settings.deleteAll()

let mainWindow = null
let tray = null
let contextMenu = null
winston.add(winston.transports.Loggly, {
    token: "41feb295-2f15-4838-8d59-e65a7ec9b5e4",
    subdomain: "ta2yak",
    tags: ["Winston-NodeJS", "Sticky-Main"],
    json:true
})

// 新規のカードを生成する
let createSticky = () => {
  winston.log('info', "Create New Card ...")
  let id = uuid.v4()
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/sticky/index.html" + "#" + id) 

  let windows = settings.get('windows') || new Array()
  windows.push({id: id})
  settings.set('windows', windows)
  winston.log('info', "Created New Card !! Total Card Count：" + windows.length)
}

// 作成済みのカードを生成する
let resumeSticky = (id) => {
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/sticky/index.html" + "#" + id) 
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
  windowManager.open("history", 'Sticky History', "file://" + __dirname + "/sticky/history.html", false, {
      width: 290, 
      height: 400, 
      frame: false, 
      resizable: false,
      "skip-taskbar": true,
      show: false,
  }) 
}

app.on('window-all-closed', () => {
  winston.log('info', "Close windows")
  if(process.platform != 'darwin') app.quit()
})

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
      //showDevTools: true,
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
        click: () => {
          createSticky()
        } 
      },
      { label: "過去の履歴を参照する", 
        click: () => {
          showHistory()
        } 
      },
      { label: "最前面に表示する", 
        click: () => {
          allToFront()
        } 
      },
      { label: "全てを隠す", 
        click: () => {
          allToMinimize()
        } 
      },
      { label: "終了", 
        click: () => { 
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