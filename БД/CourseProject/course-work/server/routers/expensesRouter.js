import expensesController from "../controllers/expensesController.js";

import { Router } from "express";

const expensesRouter = Router();

expensesRouter.post("/expenses", expensesController.createExpense);
expensesRouter.get("/expenses", expensesController.getAllExpenses);
expensesRouter.get("/expenses/:id", expensesController.getExpenseById);
expensesRouter.put("/expenses/:id", expensesController.updateExpense);
expensesRouter.delete("/expenses/:id", expensesController.deleteExpense);

export default expensesRouter;
