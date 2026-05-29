import announcementController from "../controllers/announcementController.js";

import { Router } from "express";

const announcementRouter = Router();

announcementRouter.post(
  "/announcements",
  announcementController.createAnnouncement
);
announcementRouter.get(
  "/announcements",
  announcementController.getAllAnnouncements
);
announcementRouter.get(
  "/announcements/author/:authorId",
  announcementController.getAnnouncementsByAuthorId
);
announcementRouter.get(
  "/announcements/:id",
  announcementController.getAnnouncementById
);
announcementRouter.put(
  "/announcements/:id",
  announcementController.updateAnnouncement
);
announcementRouter.delete(
  "/announcements/:id",
  announcementController.deleteAnnouncement
);

export default announcementRouter;
