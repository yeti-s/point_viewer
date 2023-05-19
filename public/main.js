const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require('fs')

const VERSION = 1.0

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: isDev,
      contextIsolation: false
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.setResizable(true);
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.focus();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {

    


    createWindow();
  }
});


const ipcError = (channel, err) => {
  console.log(`${new Date().toDateString()} [ERROR] IPC[${channel}]: `, err, new Date());
}

const ipcInfo = (channel, log) => {
  console.log(`${new Date().toDateString()} [INFO] IPC[${channel}]: ${log}`, new Date());
}


ipcMain.handle("version", (evt, arg) => {
  console.log(`main.js version ${VERSION}`);
  return VERSION;
})


ipcMain.handle("fetch-file", async (event, path, init) => {
  console.log(path, init);

  return new Promise((resolve, reject) => {
    ipcInfo("fetch-file", `read ${path}`);
    if (init) {
      let headers = init['headers'];
      let range = headers['Range'];
      let match = range.match(/bytes=(\d+)-(\d+)/);
      let start = parseInt(match[1]);
      let end = parseInt(match[2]);

      let buff;
      const fileStream = fs.createReadStream(path, {start, end});
      fileStream.on('data', (chunk)=>{
        buff = chunk;
      })
      fileStream.on('end', () => {
        ipcInfo('fetch-file', `read ${path} from ${start} to ${end}, size: ${buff.length}`);
        resolve(buff);
      })
    }
    else {
      fs.readFile(path, 'utf-8', (err, data) => {
        resolve(data);
      })
    }
  })
})