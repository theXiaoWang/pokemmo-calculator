var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var path = require('path');

function createWindow() {
  var win = new BrowserWindow({
    width: 1200,
    height: 900,
    title: "Pokemon Damage Calculator",
    icon: path.join(__dirname, 'dist/img/favicon.png')
  });

  win.loadFile('dist/index.html');
}

app.whenReady().then(function() {
  createWindow();

  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 