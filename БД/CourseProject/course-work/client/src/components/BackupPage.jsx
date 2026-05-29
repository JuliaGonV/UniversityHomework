import React, { useState, useEffect } from "react";
import styles from "../css/BackupManager.module.css";
import { apiUrl } from "../../configs/config";
import { logEvent } from "../../configs/logEvent";
import { useNavigate } from "react-router-dom";
import {
  getSettings,
  selectBackupFile,
  selectFolder,
} from "../api/settingsApi.js";
const BackupManager = () => {
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    pdfExportPath: "",
    backupExportPath: "",
  });
  const [settingsError, setSettingsError] = useState("");
  const [showRecoveryLogs, setShowRecoveryLogs] = useState(false);
  const navigate = useNavigate();
  const currentUserId = JSON.parse(sessionStorage.getItem("userData")).id;
  console.log(currentUserId);
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${apiUrl}/backups`);
      const data = await response.json();
      setLogs(data);
      console.log(data);
    } catch (err) {
      setError("Помилка при завантаженні подій: " + err.message);
    }
  };

  const loadSettings = async () => {
    setSettingsError("");
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setSettingsError("Не вдалося завантажити налаштування.");
    }
  };

  useEffect(() => {
    fetchLogs();
    loadSettings();
  }, []);

  const handlePickBackupFolder = async () => {
    setSettingsError("");
    try {
      const result = await selectFolder("backupExportPath");
      if (result?.error) {
        setSettingsError(result.error);
        return;
      }
      if (result && !result.canceled) {
        setSettings(
          result.settings || { ...settings, backupExportPath: result.path },
        );
      }
    } catch (err) {
      setSettingsError("Не вдалося вибрати папку.");
    }
  };

  const parseBackupMeta = (logNotes) => {
    const dirMatch = logNotes.match(/\[dir:([^\]]+)\]/);
    const pathMatch = logNotes.match(/\[path:([^\]]+)\]/);
    const directFileMatch = logNotes.match(/hospital_db_backup_[^\s)]+\.dump/);
    const parenMatches = [...logNotes.matchAll(/\(([^)]+)\)/g)];
    let fileName = directFileMatch ? directFileMatch[0] : "";

    if (!fileName && parenMatches.length > 0) {
      fileName = parenMatches[parenMatches.length - 1][1].trim();
    }

    if (!fileName && logNotes.includes(": ")) {
      fileName = logNotes.split(": ")[1]?.trim() || "";
    }

    fileName = fileName.replace(/\s*\[dir:.*\]\s*$/, "").trim();
    fileName = fileName.replace(/\s*\[path:.*\]\s*$/, "").trim();

    return {
      fileName,
      backupDir: dirMatch ? dirMatch[1].trim() : "",
      filePath: pathMatch ? pathMatch[1].trim() : "",
    };
  };

  const handleBackup = async () => {
    console.log("notes: ", notes);
    console.log(currentUserId);
    try {
      let backupDir = settings.backupExportPath || "";
      if (!backupDir) {
        const result = await selectFolder("backupExportPath");
        if (result?.error) {
          setSettingsError(result.error);
          return;
        }
        if (result?.canceled || !result.path) {
          setSettingsError("Папку для бекапів не вибрано.");
          return;
        }
        backupDir = result.path;
        setSettings(
          result.settings || { ...settings, backupExportPath: backupDir },
        );
      }
      const response = await fetch(`${apiUrl}/backups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          userId: currentUserId,
          backupDir,
        }),
      });

      if (!response.ok) throw new Error("Помилка при резервному копіюванні");

      await logEvent(currentUserId, "copy", "Виконано резервне копіювання");
      setMessage("Резервне копіювання виконано успішно.");
      setNotes("");
      fetchLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRecover = async (logEntry) => {
    console.log(currentUserId);
    const { fileName, backupDir, filePath } = parseBackupMeta(
      logEntry.notes || "",
    );
    if (!fileName) {
      setError("Не вдалося визначити файл бекапу для відновлення.");
      return;
    }
    try {
      const effectiveDir = backupDir || settings.backupExportPath || "";
      const effectivePath = filePath || "";

      const response = await fetch(`${apiUrl}/backups/restore/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          userId: currentUserId,
          backupDir: effectivePath ? "" : effectiveDir,
          filePath: effectivePath || "",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data.message || "Помилка при відновленні";
        if (message.toLowerCase().includes("not found")) {
          const picked = await selectBackupFile();
          if (picked?.error) {
            setSettingsError(picked.error);
            return;
          }
          if (picked?.canceled || (!picked.path && !picked.file)) {
            setSettingsError("Файл для відновлення не вибрано.");
            return;
          }

          if (picked.file) {
            const upload = await fetch(
              `${apiUrl}/backups/restore-upload?userId=${encodeURIComponent(
                currentUserId,
              )}&fileName=${encodeURIComponent(picked.name || fileName)}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/octet-stream" },
                body: await picked.file.arrayBuffer(),
              },
            );
            if (!upload.ok) throw new Error("Помилка при відновленні");
          } else {
            const retry = await fetch(`${apiUrl}/backups/restore/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName,
                userId: currentUserId,
                filePath: picked.path,
              }),
            });
            if (!retry.ok) throw new Error("Помилка при відновленні");
          }
        } else {
          throw new Error(message);
        }
      }

      await logEvent(
        currentUserId,
        "recover",
        `Виконано відновлення: ${fileName}`,
      );
      setMessage("Відновлення відбулося успішно.");
      fetchLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleManualRecover = async () => {
    try {
      const picked = await selectBackupFile();
      if (picked?.error) {
        setSettingsError(picked.error);
        return;
      }
      if (picked?.canceled || (!picked.path && !picked.file)) {
        setSettingsError("Файл для відновлення не вибрано.");
        return;
      }

      if (picked.file) {
        const upload = await fetch(
          `${apiUrl}/backups/restore-upload?userId=${encodeURIComponent(
            currentUserId,
          )}&fileName=${encodeURIComponent(picked.name || "backup.dump")}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: await picked.file.arrayBuffer(),
          },
        );
        if (!upload.ok) throw new Error("Помилка при відновленні");
      } else {
        const fileName = picked.path.split(/[/\\]/).pop() || "backup.dump";
        const retry = await fetch(`${apiUrl}/backups/restore/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            userId: currentUserId,
            filePath: picked.path,
          }),
        });
        if (!retry.ok) throw new Error("Помилка при відновленні");
      }

      setMessage("Відновлення відбулося успішно.");
      fetchLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (logEntry) => {
    const { fileName, backupDir, filePath } = parseBackupMeta(
      logEntry.notes || "",
    );
    if (!fileName) {
      setError("Не вдалося визначити файл бекапу для видалення.");
      return;
    }
    try {
      const effectiveDir = backupDir || settings.backupExportPath || "";
      const effectivePath = filePath || "";
      const queryParts = [];
      if (effectiveDir && !effectivePath) {
        queryParts.push(`dir=${encodeURIComponent(effectiveDir)}`);
      }
      if (effectivePath) {
        queryParts.push(`path=${encodeURIComponent(effectivePath)}`);
      }
      const deleteUrl = `${apiUrl}/backups/${encodeURIComponent(
        fileName,
      )}${queryParts.length ? `?${queryParts.join("&")}` : ""}`;
      const response = await fetch(deleteUrl, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Помилка при видаленні");
      console.log(response.message);
      await logEvent(currentUserId, "delete", `Видалено бекап: ${fileName}`);

      setMessage("Бекап успішно видалено.");
      fetchLogs();
    } catch (err) {
      setError(err.message);
    }
  };
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className={styles.container}>
      <h1>Управління бекапами</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>

      <div className={styles.settingsPanel}>
        <div className={styles.settingsRow}>
          <span>Папка для бекапів:</span>
          <span className={styles.pathValue}>
            {settings.backupExportPath || "Не вибрано"}
          </span>
          <button
            type="button"
            onClick={handlePickBackupFolder}
            className={styles.settingsButton}
          >
            Вибрати
          </button>
        </div>
        {settingsError && (
          <p className={styles.settingsError}>{settingsError}</p>
        )}
      </div>

      <textarea
        placeholder="Коментар до операції..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={styles.notes}
      />

      <div className={styles.buttonGroup}>
        <button onClick={handleBackup}>Зробити бекап</button>
        <button onClick={handleManualRecover}>Відновити з файлу</button>
      </div>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <h2>Бекапи</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Тип</th>
            <th>Дата</th>
            <th>Користувач</th>
            <th>Примітка</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {logs
            .filter((log) => log.backup_type === "copy")
            .map((log) => (
              <tr key={log.backup_id}>
                <td>{log.backup_id}</td>
                <td>{log.backup_type}</td>
                <td>{new Date(log.backup_date).toLocaleString()}</td>
                <td>{log.performed_by}</td>
                <td>{log.notes}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleRecover(log)}
                  >
                    Відновити
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(log)}
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className={styles.recoveryHeader}>
        <h2>Відновлення</h2>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setShowRecoveryLogs((prev) => !prev)}
        >
          {showRecoveryLogs ? "Приховати" : "Показати"}
        </button>
      </div>

      {showRecoveryLogs && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип</th>
              <th>Дата</th>
              <th>Користувач</th>
              <th>Примітка</th>
            </tr>
          </thead>
          <tbody>
            {logs
              .filter((log) => log.backup_type === "recover")
              .map((log) => (
                <tr key={log.backup_id}>
                  <td>{log.backup_id}</td>
                  <td>{log.backup_type}</td>
                  <td>{new Date(log.backup_date).toLocaleString()}</td>
                  <td>{log.performed_by}</td>
                  <td>{log.notes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BackupManager;
