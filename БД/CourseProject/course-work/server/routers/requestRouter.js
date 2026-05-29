import requestController from "../controllers/requestController.js";

import { Router } from "express";

const requestRouter = Router();

requestRouter.post("/requests", requestController.createMaintenanceRequest);
requestRouter.get("/requests", requestController.getAllMaintenanceRequests);
requestRouter.get("/requests/overdue", requestController.getOverdueRequests);
requestRouter.get(
  "/requests/stats/by-status",
  requestController.getRequestStatsByStatus,
);
requestRouter.get(
  "/requests/avg-close-time",
  requestController.getAverageCloseTime,
);
requestRouter.get("/requests/:id", requestController.getMaintenanceRequestById);
requestRouter.put("/requests/:id", requestController.updateMaintenanceRequest);
requestRouter.delete(
  "/requests/:id",
  requestController.deleteMaintenanceRequest,
);
requestRouter.post(
  "/requests/status",
  requestController.getMaintenanceRequestByStatus,
);

requestRouter.put(
  "/requests/status/:id",
  requestController.updateMaintenanceRequestStatus,
);
export default requestRouter;
