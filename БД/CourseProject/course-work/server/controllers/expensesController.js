import expensesService from "../services/expensesService.js";

class ExpensesController {
  async createExpense(req, res) {
    const { description, amount, date, category } = req.body;
    try {
      const expense = await expensesService.createExpense(
        description,
        amount,
        date,
        category
      );
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllExpenses(req, res) {
    try {
      const expenses = await expensesService.getAllExpenses();
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getExpenseById(req, res) {
    const { id } = req.params;
    try {
      const expense = await expensesService.getExpenseById(id);
      if (expense) {
        res.status(200).json(expense);
      } else {
        res.status(404).json({ message: "Expense not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateExpense(req, res) {
    const { id } = req.params;
    const { description, amount, date, category } = req.body;
    try {
      const expense = await expensesService.updateExpense(
        id,
        description,
        amount,
        date,
        category
      );
      if (expense) {
        res.status(200).json(expense);
      } else {
        res.status(404).json({ message: "Expense not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async deleteExpense(req, res) {
    const { id } = req.params;
    try {
      const result = await expensesService.deleteExpense(id);
      if (result) {
        res.status(200).json({ message: "Expense deleted" });
      } else {
        res.status(404).json({ message: "Expense not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ExpensesController();
