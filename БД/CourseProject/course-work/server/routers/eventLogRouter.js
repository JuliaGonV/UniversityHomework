import eventLogController from "../controllers/eventLogController.js";

import { Router } from "express";

const eventLogRouter = Router();

eventLogRouter.get("/audit/activity/users", eventLogController.getUserActivity);
eventLogRouter.post("/event-logs", eventLogController.createEventLog);
eventLogRouter.get("/event-logs", eventLogController.getAllEventLogs);
eventLogRouter.get("/event-logs/:id", eventLogController.getEventLogById);
eventLogRouter.put("/event-logs/:id", eventLogController.updateEventLog);
eventLogRouter.delete("/event-logs/:id", eventLogController.deleteEventLog);

export default eventLogRouter;
