import pool from "../database/database.js";

class ResidentService {
  async createResident(
    user_id,
    full_name,
    apartment_id,
    phone,
    registered_at,
    building_id
  ) {
    const query = `
        INSERT INTO residents (user_id, full_name, apartment_id, phone, registered_at, building_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, full_name, apartment_id, phone, registered_at, building_id;
    `;
    const values = [
      user_id,
      full_name,
      apartment_id,
      phone,
      registered_at,
      building_id,
    ];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні резидента: " + error.message);
    }
  }

  async getAllResidents() {
    const query = `
    SELECT r.*, b.address AS building_address
    FROM residents r
    JOIN buildings b ON r.building_id = b.id;
  `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні всіх резидентів: " + error.message
      );
    }
  }

  async getResidentById(id) {
    const query = `
        SELECT *
        FROM residents
        WHERE user_id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні резидента: " + error.message);
    }
  }

  async updateResident(id, user_id, full_name, apartment_id, phone) {
    const query = `
        UPDATE residents
        SET user_id = $1, full_name = $2, apartment_id = $3, phone = $4
        WHERE id = $5
        RETURNING id, user_id, full_name, apartment_id, phone;
    `;
    const values = [user_id, full_name, apartment_id, phone, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні резидента: " + error.message);
    }
  }
  async deleteResident(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const res = await client.query(
        `SELECT user_id, apartment_id FROM residents WHERE id = $1`,
        [id]
      );

      if (res.rows.length === 0) {
        throw new Error("Резидент не знайдений");
      }

      const { user_id, apartment_id } = res.rows[0];

      await client.query(`DELETE FROM residents WHERE id = $1`, [id]);

      await client.query(`DELETE FROM users WHERE id = $1`, [user_id]);

      await client.query(
        `UPDATE apartments SET owned = false, user_id = null WHERE id = $1`,
        [apartment_id]
      );

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error("Помилка при видаленні резидента: " + error.message);
    } finally {
      client.release();
    }
  }

  async getResidentsByFloor(buildingId, floor) {
    const query = `SELECT r.full_name, a.number AS apartment_number
    FROM residents r
    JOIN apartments a ON r.apartment_id = a.id
    WHERE a.building_id = $1 AND a.floor = $2;`;
    const values = [buildingId, floor];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.log(error);
      throw new Error(
        "Помилка при отриманні резидентів за поверхом: " + error.message
      );
    }
  }
}

export default new ResidentService();
