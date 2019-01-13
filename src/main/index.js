import os from "os";
import fs from "fs-extra";
import { join, basename } from "path";
import axios from "axios";
import decompress from "decompress";
import { app, BrowserWindow, Menu } from "electron";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: "FRP UI",
    height: 513,
    useContentSize: true,
    width: 375,
    resizable: false,
    webSecurity: false
  });

  mainWindow.loadURL(winURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const template = [
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click() {
            require("electron").shell.openExternal("https://xudong.cc");
          }
        }
      ]
    }
  ];

  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    });

    // Edit menu
    template[1].submenu.push(
      { type: "separator" },
      {
        label: "Speech",
        submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
      }
    );

    // Window menu
    template[3].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

(async () => {
  console.log(join(app.getPath("userData"), "frp"));
  const frpDir = join(app.getPath("userData"), "frp");
  const version = "0.22.0";

  let filename;
  switch (os.type()) {
    case "Linux":
      filename = `frp_${version}_linux_amd64.tar.gz`;
      break;

    case "Darwin":
      filename = `frp_${version}_darwin_amd64.tar.gz`;
      break;

    case "Windows_NT":
      filename = `frp_${version}_windows_amd64.zip`;
      break;
  }

  const { data: stream } = await axios.get(
    `https://github.com/fatedier/frp/releases/download/v${version}/${filename}`,
    {
      responseType: "stream"
    }
  );

  if (!(await fs.exists(frpDir))) {
    await fs.mkdirp(frpDir);
  }

  if (
    !(await fs.exists(join(frpDir, "frpc"))) &&
    !(await fs.exists(join(frpDir, "frpc.exe")))
  ) {
    await new Promise((resolve, reject) => {
      stream.on("close", resolve);
      stream.on("error", reject);
      stream.pipe(fs.createWriteStream(join(frpDir, filename)));
    });

    await decompress(join(frpDir, filename), frpDir, {
      strip: 1,
      filter: file =>
        basename(file.path) === "frpc" || basename(file.path) === "frpc.exe"
    });

    await fs.unlink(join(frpDir, filename));
  }
})();
