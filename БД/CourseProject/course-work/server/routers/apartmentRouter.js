import { Router } from "express";

import apartmentController from "../controllers/apartmentController.js";

const apartmentRouter = Router();

apartmentRouter.post("/apartments", apartmentController.createApartment);
apartmentRouter.get("/apartments", apartmentController.getAllApartments);
apartmentRouter.get(
  "/apartments/available",
  apartmentController.getAvailableApartments,
);
apartmentRouter.get(
  "/apartments/available/:buildingId",
  apartmentController.getAvailableApartmentsByBuildingId,
);

apartmentRouter.post(
  "/apartments/status/:apartmentId",
  apartmentController.updateApartmentStatus,
);

apartmentRouter.get(
  "/apartments/resident/:residentId",
  apartmentController.getApartmentByResidentId,
);

apartmentRouter.get("/apartments/free", apartmentController.getFreeApartments);
apartmentRouter.get(
  "/apartments/buildings",
  apartmentController.getApartmentsByBuildings,
);
apartmentRouter.get(
  "/apartments/occupancy/by-building",
  apartmentController.getOccupancyByBuilding,
);
apartmentRouter.get("/apartments/:id", apartmentController.getApartmentById);
apartmentRouter.put("/apartments/:id", apartmentController.updateApartment);
apartmentRouter.delete("/apartments/:id", apartmentController.deleteApartment);
export default apartmentRouter;
