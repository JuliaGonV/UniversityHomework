import backupService from "../services/backupService.js";

class BackupController {
  async createBackup(req, res) {
    try {
      const userId = req.body.userId;
      const notes = req.body.notes;
      const backupDir = req.body.backupDir;
      const backup = await backupService.createBackup(userId, notes, backupDir);
      res.status(201).json(backup);
    } catch (error) {
      console.error("Error creating backup:", error);
      res
        .status(500)
        .json({ message: "Помилка при створенні бекапа: " + error.message });
    }
  }

  async restoreBackup(req, res) {
    try {
      const { fileName, userId, backupDir, filePath } = req.body;
      console.log(fileName, userId);
      const result = await backupService.restoreBackup(
        fileName,
        userId,
        backupDir,
        filePath,
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Error restoring backup:", error);
      res
        .status(500)
        .json({ message: "Помилка при відновленні бекапа: " + error.message });
    }
  }

  async getAllBackups(req, res) {
    try {
      const backups = await backupService.getAllBackups();
      res.status(200).json(backups);
    } catch (error) {
      console.error("Error getting all backups:", error);
      res.status(500).json({
        message: "Помилка при отриманні всіх бекапів: " + error.message,
      });
    }
  }

  async deleteBackup(req, res) {
    const { filename } = req.params;
    const backupDir = req.query.dir;
    const filePath = req.query.path;
    console.log(filename);
    try {
      const result = await backupService.deleteBackup(
        filename,
        backupDir,
        filePath,
      );
      if (result) {
        res.status(200).json({ message: "Бекап видалено!" });
      } else {
        res.status(404).json({ message: "Бекап не знайдено!" });
      }
    } catch (error) {
      console.error("Error deleting backup:", error);
      res
        .status(500)
        .json({ message: "Помилка при видаленні бекапа: " + error.message });
    }
  }

  async restoreBackupUpload(req, res) {
    try {
      const fileName = req.query.fileName || "backup.dump";
      const userId = req.query.userId;
      const buffer = req.body;

      if (!buffer || !Buffer.isBuffer(buffer)) {
        return res.status(400).json({ message: "Invalid file payload" });
      }

      const result = await backupService.restoreBackupFromBuffer(
        userId,
        fileName,
        buffer,
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Error restoring backup upload:", error);
      res.status(500).json({
        message: "Помилка при відновленні бекапа: " + error.message,
      });
    }
  }
}

export default new BackupController();
