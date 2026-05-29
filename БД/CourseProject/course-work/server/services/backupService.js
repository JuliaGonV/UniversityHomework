import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { exec } from "child_process";
dotenv.config();
const BACKUP_DIR = "backups";
const LOG_FILE = path.join(BACKUP_DIR, "backup-log.json");
const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;
class BackupService {
  ensureBackupDir(targetDir) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }

  readLog() {
    try {
      if (!fs.existsSync(LOG_FILE)) {
        return [];
      }
      const raw = fs.readFileSync(LOG_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  writeLog(entries) {
    this.ensureBackupDir(BACKUP_DIR);
    fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), "utf-8");
  }

  appendLogEntry(entry) {
    const entries = this.readLog();
    entries.push(entry);
    this.writeLog(entries);
  }

  createLogEntry(type, userId, notes) {
    return {
      backup_id: Date.now(),
      backup_type: type,
      backup_date: new Date().toISOString(),
      performed_by: userId,
      notes,
    };
  }

  resolveBackupDir(backupDir) {
    if (backupDir && String(backupDir).trim()) {
      return String(backupDir).trim();
    }
    return BACKUP_DIR;
  }

  async createBackup(userId, description, backupDir) {
    console.log(userId, description);
    const targetDir = this.resolveBackupDir(backupDir);
    this.ensureBackupDir(targetDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `db_backup_${timestamp}.dump`;
    const filepath = path.join(targetDir, filename);
    const command = `pg_dump -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} -F c -b -v -f "${filepath}"`;

    return new Promise((resolve, reject) => {
      exec(
        command,
        { env: { ...process.env, PGPASSWORD: DB_PASSWORD } },
        async (err) => {
          if (err) {
            return reject(
              new Error(`Помилка при створенні копії: ${err.message}`),
            );
          }

          this.appendLogEntry(
            this.createLogEntry(
              "copy",
              userId,
              `Резервна копія: ${description} (${filename}) [dir:${targetDir}] [path:${filepath}]`,
            ),
          );

          resolve({ message: "Резервна копія створена", filename });
        },
      );
    });
  }

  async getAllBackups() {
    const entries = this.readLog();
    return entries.sort(
      (a, b) => new Date(b.backup_date) - new Date(a.backup_date),
    );
  }

  async deleteBackup(filename, backupDir, filePath) {
    console.log("Deleting backup:", filename);
    const filepath = filePath
      ? String(filePath).trim()
      : path.join(this.resolveBackupDir(backupDir), filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    const entries = this.readLog();
    const nextEntries = entries.filter(
      (entry) => !String(entry.notes || "").includes(filename),
    );
    const removed = nextEntries.length !== entries.length;
    if (removed) {
      this.writeLog(nextEntries);
    }
    return removed;
  }

  async restoreBackup(filename, userId, backupDir, filePath) {
    const targetDir = backupDir
      ? this.resolveBackupDir(backupDir)
      : filePath
        ? path.dirname(String(filePath))
        : this.resolveBackupDir(backupDir);
    const filepath = filePath
      ? String(filePath).trim()
      : path.join(targetDir, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error("Backup file not found");
    }

    const dropTablesCommand = `
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN 
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP 
          EXECUTE 'DROP TABLE IF EXISTS public.' || r.tablename || ' CASCADE'; 
        END LOOP; 
      END $$;
    `;

    return new Promise((resolve, reject) => {
      exec(
        `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -c "${dropTablesCommand}"`,
        { env: { ...process.env, PGPASSWORD: DB_PASSWORD } },
        (err) => {
          if (err) {
            return reject(
              new Error(`Помилка при видаленні таблиць: ${err.message}`),
            );
          }

          const restoreCommand = `pg_restore --clean -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -F c "${filepath}"`;

          exec(
            restoreCommand,
            { env: { ...process.env, PGPASSWORD: DB_PASSWORD } },
            async (err) => {
              if (err) {
                return reject(
                  new Error(`Помилка при відновленні: ${err.message}`),
                );
              }

              this.appendLogEntry(
                this.createLogEntry(
                  "recover",
                  userId,
                  `Відновлення з: ${filename} [dir:${targetDir}] [path:${filepath}]`,
                ),
              );

              resolve({
                message: "Відновлення завершено",
                filename,
              });
            },
          );
        },
      );
    });
  }

  async restoreBackupFromBuffer(userId, fileName, buffer) {
    const safeName = path.basename(fileName || "backup.dump");
    const tempDir = path.join(process.cwd(), "backups_upload");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(
      tempDir,
      `${Date.now()}-${safeName.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
    );

    await fs.promises.writeFile(tempPath, buffer);
    try {
      return await this.restoreBackup(safeName, userId, "", tempPath);
    } finally {
      await fs.promises.unlink(tempPath).catch(() => null);
    }
  }
}

export default new BackupService();
