const electron = require('electron');
const windowManager = require('electron-window-manager');
const uuid = require('uuid');
const {app, BrowserWindow, Menu, Tray} = electron;

let mainWindow = null;
let tray = null;
let contextMenu = null;
app.on('ready', () => {
  // **************************************************
  // メインウィンドウの設定
  // **************************************************
  // メインウィンドウは表示しないため、最小化しておく
  mainWindow = new BrowserWindow(
    {
      width: 1, 
      height: 1, 
      frame: false, 
      show: false, 
      "skip-taskbar": true
    }
  );
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  // **************************************************
  // ウィンドウマネージャーの設定
  // **************************************************
  windowManager.setDefaultSetup({'width': 300, 'height': 200, frame: false});

  // **************************************************
  // タスクトレイの設定
  // **************************************************
  tray = new Tray(__dirname + "/public/images/icon.png");
  contextMenu = Menu.buildFromTemplate([
      { label: "新しい付箋を作成する", 
        click: function () {
          let id = uuid.v4();
          windowManager.open(uuid.v4(), 'New Window', "file://" + __dirname + "/sticky/index.html" + "#" + id); 
        } 
      },
      { label: "終了", 
        click: function () { 
          mainWindow.close(); 
        } 
      }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(app.getName());
  tray.on("clicked", function () {
      tray.popUpContextMenu(contextMenu);
  });

});
