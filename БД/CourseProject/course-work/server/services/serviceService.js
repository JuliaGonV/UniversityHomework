import pool from "../database/database.js";

class ServiceService {
  async createService(name, description, monthly_fee) {
    const query = `
        INSERT INTO services (name, description, monthly_fee)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, monthly_fee;
    `;
    const values = [name, description, monthly_fee];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні послуги: " + error.message);
    }
  }

  async getAllServices() {
    const query = `
        SELECT id, name, description, monthly_fee
        FROM services;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні послуг: " + error.message);
    }
  }

  async getServiceById(id) {
    const query = `
        SELECT id, name, description, monthly_fee
        FROM services
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні послуги: " + error.message);
    }
  }
  async updateService(id, name, description, monthly_fee) {
    const query = `
        UPDATE services
        SET name = $1, description = $2, monthly_fee = $3
        WHERE id = $4
        RETURNING id, name, description, monthly_fee;
    `;
    const values = [name, description, monthly_fee, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні послуги: " + error.message);
    }
  }

  async deleteService(id) {
    const query = `
        DELETE FROM services
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Service deleted successfully." };
    } catch (error) {
      throw new Error("Помилка при видаленні послуги: " + error.message);
    }
  }
  async getServiceByName(name) {
    const query = `
        SELECT id, name, description, monthly_fee
        FROM services
        WHERE name = $1;
    `;
    const values = [name];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні послуги: " + error.message);
    }
  }
}
export default new ServiceService();
