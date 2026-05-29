const defaultSettings = {
  pdfExportPath: "",
  backupExportPath: "",
};

const isElectron =
  typeof window !== "undefined" &&
  window.electronApi &&
  typeof window.electronApi.getSettings === "function";

const directoryHandles = {};

const readLocalSettings = () => {
  try {
    const raw = window.localStorage.getItem("appSettings");
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...defaultSettings, ...parsed };
  } catch (err) {
    return { ...defaultSettings };
  }
};

const writeLocalSettings = (partial) => {
  const current = readLocalSettings();
  const next = { ...current, ...partial };
  window.localStorage.setItem("appSettings", JSON.stringify(next));
  return next;
};

export const getSettings = async () => {
  if (isElectron) {
    return window.electronApi.getSettings();
  }
  return readLocalSettings();
};

export const setSettings = async (partial) => {
  if (isElectron) {
    return window.electronApi.setSettings(partial);
  }
  return writeLocalSettings(partial);
};

export const selectFolder = async (key) => {
  if (isElectron) {
    return window.electronApi.selectFolder(key);
  }
  if (typeof window !== "undefined" && window.showDirectoryPicker) {
    try {
      const handle = await window.showDirectoryPicker();
      if (key) {
        directoryHandles[key] = handle;
      }
      const next = key
        ? writeLocalSettings({ [key]: handle.name })
        : readLocalSettings();
      return { canceled: false, path: handle.name, settings: next };
    } catch (err) {
      return { canceled: true, error: err?.message || "Canceled" };
    }
  }
  return {
    canceled: true,
    error: "Folder picker is not supported in this browser.",
  };
};

export const selectBackupFile = async () => {
  if (isElectron) {
    return window.electronApi.selectBackupFile();
  }
  if (typeof window !== "undefined" && window.showOpenFilePicker) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Backup",
            accept: { "application/octet-stream": [".dump"] },
          },
        ],
      });
      const file = await handle.getFile();
      return { canceled: false, file, name: file.name };
    } catch (err) {
      return { canceled: true, error: err?.message || "Canceled" };
    }
  }
  return {
    canceled: true,
    error: "File picker is not supported in this browser.",
  };
};

export const savePdf = async (data, fileName, folderPath) => {
  if (isElectron) {
    return window.electronApi.savePdf({ data, fileName, folderPath });
  }
  if (typeof window !== "undefined" && window.showSaveFilePicker) {
    const settings = readLocalSettings();
    const handle = directoryHandles.pdfExportPath;

    if (handle && handle.getFileHandle) {
      const permission = await handle.queryPermission({ mode: "readwrite" });
      if (permission === "granted") {
        const targetName = fileName || "report.pdf";
        const fileHandle = await handle.getFileHandle(targetName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(new Blob([data], { type: "application/pdf" }));
        await writable.close();
        return { savedPath: targetName };
      }
    }

    const options = {
      suggestedName: fileName || "report.pdf",
      types: [
        {
          description: "PDF",
          accept: { "application/pdf": [".pdf"] },
        },
      ],
    };
    if (handle) {
      options.startIn = handle;
    } else if (settings.pdfExportPath) {
      options.suggestedName = fileName || `${settings.pdfExportPath}.pdf`;
    }

    const fileHandle = await window.showSaveFilePicker(options);
    const writable = await fileHandle.createWritable();
    await writable.write(new Blob([data], { type: "application/pdf" }));
    await writable.close();
    return { savedPath: fileHandle.name };
  }
  return { savedPath: "" };
};
