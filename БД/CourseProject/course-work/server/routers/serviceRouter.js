import serviceController from "../controllers/serviceController.js";

import { Router } from "express";

const serviceRouter = Router();

serviceRouter.post("/services", serviceController.createService);
serviceRouter.get("/services", serviceController.getAllServices);
serviceRouter.get("/services/:id", serviceController.getServiceById);
serviceRouter.put("/services/:id", serviceController.updateService);
serviceRouter.delete("/services/:id", serviceController.deleteService);
serviceRouter.get("/services/name/:name", serviceController.getServiceByName);

export default serviceRouter;
