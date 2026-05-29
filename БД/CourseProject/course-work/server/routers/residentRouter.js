import { Router } from "express";

import residentController from "../controllers/residentController.js";

const residentRouter = Router();

residentRouter.post("/residents", residentController.createResident);
residentRouter.get("/residents", residentController.getAllResidents);
residentRouter.get("/residents/:id", residentController.getResidentById);
residentRouter.put("/residents/:id", residentController.updateResident);
residentRouter.delete("/residents/:id", residentController.deleteResident);
residentRouter.post("/residents/floor", residentController.getResidentsByFloor);
export default residentRouter;
