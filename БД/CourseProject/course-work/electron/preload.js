const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setSettings: (partial) => ipcRenderer.invoke("settings:set", partial),
  selectFolder: (key) => ipcRenderer.invoke("settings:select-folder", { key }),
  selectBackupFile: () => ipcRenderer.invoke("files:select-backup"),
  savePdf: (payload) => ipcRenderer.invoke("pdf:save", payload),
});
