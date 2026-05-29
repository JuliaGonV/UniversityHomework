import buildingController from "../controllers/buildingController.js";

import { Router } from "express";

const buildingRouter = Router();

buildingRouter.post("/buildings", buildingController.createBuilding);
buildingRouter.get("/buildings", buildingController.getAllBuildings);
buildingRouter.get("/buildings/:id", buildingController.getBuildingById);
buildingRouter.put("/buildings/:id", buildingController.updateBuilding);
buildingRouter.delete("/buildings/:id", buildingController.deleteBuilding);

export default buildingRouter;
