import pool from "../database/database.js";

class ExpenseService {
  async createExpense(description, amount, date, category) {
    const query = `
        INSERT INTO expenses (description, amount, date, category)
        VALUES ($1, $2, $3, $4)
        RETURNING id, description, amount, date, category;
    `;
    const values = [description, amount, date, category];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні витрати: " + error.message);
    }
  }

  async getAllExpenses() {
    const query = `
        SELECT id, description, amount, date, category
        FROM expenses;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні витрат: " + error.message);
    }
  }

  async getExpenseById(id) {
    const query = `
        SELECT id, description, amount, date, category
        FROM expenses
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні витрати: " + error.message);
    }
  }
  async updateExpense(id, description, amount, date, category) {
    const query = `
        UPDATE expenses
        SET description = $1, amount = $2, date = $3, category = $4
        WHERE id = $5
        RETURNING id, description, amount, date, category;
    `;
    const values = [description, amount, date, category, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні витрати: " + error.message);
    }
  }

  async deleteExpense(id) {
    const query = `
        DELETE FROM expenses
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Витрату успішно видалено." };
    } catch (error) {
      throw new Error("Помилка при видаленні витрати: " + error.message);
    }
  }
}

export default new ExpenseService();
