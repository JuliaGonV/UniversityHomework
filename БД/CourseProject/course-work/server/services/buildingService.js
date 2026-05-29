import pool from "../database/database.js";

class BuildingService {
  async createBuilding(address, built_year, number_of_floors) {
    const query = `
        INSERT INTO buildings (address, built_year, number_of_floors)
        VALUES ($1, $2, $3)
        RETURNING id, address, built_year, number_of_floors;
    `;
    const values = [address, built_year, number_of_floors];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні будівлі: " + error.message);
    }
  }

  async getAllBuildings() {
    const query = `
        SELECT *
        FROM buildings;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні будівель: " + error.message);
    }
  }

  async getBuildingById(id) {
    const query = `
        SELECT id, address, built_year, number_of_floors
        FROM buildings
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні будівлі: " + error.message);
    }
  }
  async updateBuilding(id, address, built_year, number_of_floors) {
    const query = `
        UPDATE buildings
        SET address = $1, built_year = $2, number_of_floors = $3
        WHERE id = $4
        RETURNING id, address, built_year, number_of_floors;
    `;
    const values = [address, built_year, number_of_floors, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні будівлі: " + error.message);
    }
  }

  async deleteBuilding(id) {
    const query = `
        DELETE FROM buildings
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Будівля видалена успішно" };
    } catch (error) {
      throw new Error("Помилка при видаленні будівлі: " + error.message);
    }
  }
}

export default new BuildingService();
