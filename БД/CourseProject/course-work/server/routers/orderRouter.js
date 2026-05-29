import orderController from "../controllers/orderController.js";
import { Router } from "express";

const orderRouter = Router();

orderRouter.post("/orders", orderController.createWorkOrder);
orderRouter.get("/orders", orderController.getAllWorkOrders);
orderRouter.get(
  "/orders/workload/by-worker",
  orderController.getWorkloadByWorker,
);

// 1. Сначала специфичный роут (сначала проверится этот точный паттерн)
orderRouter.put("/orders/:id/complete", orderController.completeWorkOrder);

// 2. И только потом универсальный роут для ID
orderRouter.get("/orders/:id", orderController.getWorkOrderById);
orderRouter.put("/orders/:id", orderController.updateWorkOrder);
orderRouter.delete("/orders/:id", orderController.deleteWorkOrder);

export default orderRouter;
