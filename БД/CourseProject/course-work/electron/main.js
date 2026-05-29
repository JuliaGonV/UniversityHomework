import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultSettings = {
  pdfExportPath: "",
  backupExportPath: "",
};

const getSettingsFilePath = () =>
  path.join(app.getPath("userData"), "settings.json");

const readSettings = async () => {
  try {
    const raw = await fs.readFile(getSettingsFilePath(), "utf-8");
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (err) {
    return { ...defaultSettings };
  }
};

const writeSettings = async (nextSettings) => {
  const filePath = getSettingsFilePath();
  await fs.writeFile(filePath, JSON.stringify(nextSettings, null, 2), "utf-8");
  return nextSettings;
};

const registerIpcHandlers = () => {
  ipcMain.handle("settings:get", async () => readSettings());

  ipcMain.handle("settings:set", async (_event, partial) => {
    const current = await readSettings();
    const next = { ...current, ...(partial || {}) };
    await writeSettings(next);
    return next;
  });

  ipcMain.handle("settings:select-folder", async (_event, { key }) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }

    const selectedPath = result.filePaths[0];
    if (key) {
      const current = await readSettings();
      const next = { ...current, [key]: selectedPath };
      await writeSettings(next);
      return { canceled: false, path: selectedPath, settings: next };
    }

    return { canceled: false, path: selectedPath };
  });

  ipcMain.handle("files:select-backup", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Backup", extensions: ["dump"] }],
    });

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }

    return { canceled: false, path: result.filePaths[0] };
  });

  ipcMain.handle("pdf:save", async (_event, { data, fileName, folderPath }) => {
    const current = await readSettings();
    const targetFolder = folderPath || current.pdfExportPath;
    if (!targetFolder) {
      return { savedPath: "", error: "Missing target folder" };
    }

    const safeName = fileName || `report-${Date.now()}.pdf`;
    const targetPath = path.join(targetFolder, safeName);
    const buffer = Buffer.from(data);
    await fs.writeFile(targetPath, buffer);
    return { savedPath: targetPath };
  });
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:5173/"); // Adjust the URL to your React app's URL
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
