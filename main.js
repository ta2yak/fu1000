const electron = require('electron')
const windowManager = require('electron-window-manager')
const settings = require('electron-settings')
const uuid = require('uuid')
const _ = require('lodash')
const path = require('path')
const {app, BrowserWindow, Menu, Tray, globalShortcut} = electron

let mainWindow = null
let tray = null
let contextMenu = null

// 新規の付箋を生成する
let createSticky = () => {
  let id = uuid.v4()
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/sticky/index.html" + "#" + id) 

  let windows = settings.get('windows') || new Array()
  windows.push({id: id})
  settings.set('windows', windows)
}

// 作成済みの付箋を生成する
let resumeSticky = (id) => {
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/sticky/index.html" + "#" + id) 
}

// 全てのウィンドウを前面に表示する
let allToFront = () => {
  let windows = settings.get('windows') || new Array()
  _.each(windows, (window) => {
    let win = windowManager.get(window.id)
    win.restore()
    win.focus()
  })
}

// 全てのウィンドウを最小化する
let allToMinimize = () => {
  let windows = settings.get('windows') || new Array()
  _.each(windows, (window) => {
    let win = windowManager.get(window.id)
    win.minimize()
  })
}

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') app.quit()
})

app.on('ready', () => {

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
      
    })

  // 画面一覧を取得
  let windows = settings.get('windows') || new Array()
  // 画面一覧からウィンドウを復元
  _.each(windows, (window) => {
    resumeSticky(window.id)
  })

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
          app.quit()
        } 
      }
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip(app.getName())


  var template = [{
      label: "Application",
      submenu: [
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit() }}
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
    createSticky()
  })

  globalShortcut.register('Shift+CmdOrCtrl+D', () => {
    allToMinimize()
  })

  globalShortcut.register('Shift+CmdOrCtrl+F', () => {
    allToFront()
  })
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})