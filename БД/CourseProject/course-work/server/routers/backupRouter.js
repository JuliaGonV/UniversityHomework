import backupController from "../controllers/backupController.js";

import express, { Router } from "express";

const backupRouter = Router();
const rawBackupParser = express.raw({
  type: "application/octet-stream",
  limit: "1024mb",
});

backupRouter.post("/backups", backupController.createBackup);
backupRouter.get("/backups", backupController.getAllBackups);
backupRouter.delete("/backups/:filename", backupController.deleteBackup);
backupRouter.post("/backups/restore", backupController.restoreBackup);
backupRouter.post(
  "/backups/restore-upload",
  rawBackupParser,
  backupController.restoreBackupUpload,
);

export default backupRouter;
