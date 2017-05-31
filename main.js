const electron = require('electron');
const windowManager = require('electron-window-manager');
const settings = require('electron-settings');
const uuid = require('uuid');
const _ = require('lodash');
const {app, BrowserWindow, Menu, Tray} = electron;

let mainWindow = null;
let tray = null;
let contextMenu = null;

// 新規の付箋を生成する
let createSticky = function(){
  let id = uuid.v4();
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/sticky/index.html" + "#" + id); 

  let windows = settings.get('windows') || new Array();
  windows.push({id: id});
  settings.set('windows', windows);
}

// 作成済みの付箋を生成する
let resumeSticky = function(id){
  windowManager.open(id, 'Sticky Page', "file://" + __dirname + "/sticky/index.html" + "#" + id); 
}

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
  );
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  // **************************************************
  // ウィンドウマネージャーの設定
  // **************************************************
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  windowManager.setDefaultSetup(
    {
      width: 340, 
      height: 332, 
      frame: false, 
      resizable: false,
      maxWidth: width, 
      maxHeight: height
    });

  // 画面一覧を取得
  let windows = settings.get('windows') || new Array();
  // 画面一覧からウィンドウを復元
  _.each(windows, function(window){
    resumeSticky(window.id);
  });

  // **************************************************
  // タスクトレイの設定
  // **************************************************
  tray = new Tray(__dirname + "/public/images/icon.png");
  contextMenu = Menu.buildFromTemplate([
      { label: "新しいカードを作成する", 
        click: function () {
          createSticky();
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
