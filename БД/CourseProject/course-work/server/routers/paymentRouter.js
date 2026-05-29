import paymentController from "../controllers/paymentController.js";

import { Router } from "express";

const paymentRouter = Router();

paymentRouter.post("/payments", paymentController.createPayment);
paymentRouter.get("/payments", paymentController.getAllPayments);
paymentRouter.get(
  "/payments/resident/:resident_id",
  paymentController.getPaymentsByResidentId,
);
paymentRouter.get(
  "/payments/month/:month",
  paymentController.getPaymentsByMonth,
);
paymentRouter.get(
  "/payments/status/:status",
  paymentController.getPaymentsByStatus,
);

paymentRouter.put(
  "/payments/status/:id",
  paymentController.updatePaymentStatus,
);

paymentRouter.get("/payment/unpaid", paymentController.getSumPaymentsUnpaid);

paymentRouter.get(
  "/payments/residents/paid",
  paymentController.getResidentsByPaidPayments,
);

paymentRouter.get(
  "/payments/debt/by-building",
  paymentController.getDebtByBuilding,
);

paymentRouter.get(
  "/payments/debt/by-resident",
  paymentController.getDebtByResident,
);

paymentRouter.get("/payments/debtors", paymentController.getAllDebtors);

paymentRouter.get("/payments/debt/top", paymentController.getTopDebtors);

paymentRouter.put(
  "/payments/resident/:resident_id/pay-all-debts",
  paymentController.payAllDebtsByResidentId,
);

paymentRouter.get(
  "/payments/collection-rate/by-month",
  paymentController.getCollectionRateByMonth,
);

paymentRouter.get("/payments/:id", paymentController.getPaymentById);
paymentRouter.put("/payments/:id", paymentController.updatePayment);
paymentRouter.delete("/payments/:id", paymentController.deletePayment);

export default paymentRouter;
