import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routers/userRouter.js";
import residentRouter from "./routers/residentRouter.js";
import announcementRouter from "./routers/announcementRouter.js";
import apartmentRouter from "./routers/apartmentRouter.js";
import backupRouter from "./routers/backupRouter.js";
import paymentRouter from "./routers/paymentRouter.js";
import buildingRouter from "./routers/buildingRouter.js";
import eventLogRouter from "./routers/eventLogRouter.js";
import expensesRouter from "./routers/expensesRouter.js";
import orderRouter from "./routers/orderRouter.js";
import requestRouter from "./routers/requestRouter.js";
import serviceRouter from "./routers/serviceRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", residentRouter);
app.use("/api", paymentRouter);
app.use("/api", buildingRouter);
app.use("/api", eventLogRouter);
app.use("/api", expensesRouter);
app.use("/api", orderRouter);
app.use("/api", requestRouter);
app.use("/api", serviceRouter);
app.use("/api", apartmentRouter);
app.use("/api", backupRouter);
app.use("/api", announcementRouter);
const PORT = process.env.PORT || 5000;
const IP = process.env.IP;

app.listen(PORT, IP, () => {
  console.log(`Server is running on http://${IP}:${PORT}`);
});
