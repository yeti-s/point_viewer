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


ipcMain.handle("fetch-file", async (event, filePath, init) => {
  filePath = path.join(filePath)

  return new Promise((resolve, reject) => {
    ipcInfo("fetch-file", `read ${filePath}`);
    if (init) {
      let headers = init['headers'];
      let range = headers['Range'];
      let match = range.match(/bytes=(\d+)-(\d+)/);
      let start = parseInt(match[1]);
      let end = parseInt(match[2]);

      let chunks = []
      const fileStream = fs.createReadStream(filePath, {start, end});
      fileStream.on('data', (chunk)=>{
        chunks.push(chunk)
      })
      fileStream.on('end', () => {
        let buffer = Buffer.concat(chunks)
        ipcInfo('fetch-file', `read ${filePath} from ${start} to ${end}, size: ${buffer.length}`);
        resolve(buffer);
      })
    }
    else {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        resolve(data);
      })
    }
  })
})