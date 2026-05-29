import pool from "../database/database.js";

class ApartmentService {
  async validateFloorForBuilding(building_id, floor) {
    const buildingResult = await pool.query(
      `
        SELECT number_of_floors
        FROM buildings
        WHERE id = $1;
      `,
      [building_id],
    );

    const building = buildingResult.rows[0];
    if (!building) {
      const error = new Error("Будівлю не знайдено");
      error.code = "BUILDING_NOT_FOUND";
      throw error;
    }

    if (Number(floor) < 1) {
      const error = new Error("Поверх має бути не менше 1");
      error.code = "INVALID_APARTMENT_FLOOR";
      throw error;
    }

    if (Number(floor) > Number(building.number_of_floors)) {
      const error = new Error(
        `Не можна створити квартиру на ${floor} поверсі: у будинку лише ${building.number_of_floors} поверхів`,
      );
      error.code = "APARTMENT_FLOOR_TOO_HIGH";
      throw error;
    }
  }

  async createApartment(
    number,
    floor,
    area,
    building_id,
    owned = false,
    user_id = null,
  ) {
    console.log("Building ID:", building_id);
    console.log("number:", number);
    await this.validateFloorForBuilding(building_id, floor);

    const query = `
    INSERT INTO apartments (building_id, number, floor, area, owned, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, building_id, number, floor, area, owned, user_id;
  `;

    const values = [building_id, number, floor, area, owned, user_id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні квартири: " + error.message);
    }
  }

  async getAllApartments() {
    const query = `
        SELECT * FROM apartments;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні квартир: " + error.message);
    }
  }

  async getApartmentById(id) {
    const query = `
        SELECT *
        FROM apartments
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні квартири: " + error.message);
    }
  }
  async updateApartment(id, building_id, number, floor, area, owned) {
    console.log("ID:", id);
    console.log("Building ID:", building_id);
    console.log("number:", number);
    console.log("floor:", floor);
    console.log("area:", area);
    console.log("owned:", owned);
    await this.validateFloorForBuilding(building_id, floor);

    const query = `
        UPDATE apartments
        SET building_id = $1, number = $2, floor = $3, area = $4, owned = $5
        WHERE id = $6
        RETURNING *;
    `;
    const values = [building_id, number, floor, area, owned, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні квартири: " + error.message);
    }
  }

  async deleteApartment(id) {
    const query = `
        DELETE FROM apartments
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rowCount > 0;
    } catch (error) {
      throw new Error("Помилка при видаленні квартири: " + error.message);
    }
  }

  async getAvailableApartments() {
    const query = `
        SELECT *
        FROM apartments
        WHERE owned = false;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні незанятих квартир: " + error.message,
      );
    }
  }

  async getAvailableApartmentsByBuildingId(buildingId) {
    const query = `
    SELECT *
    FROM apartments
    WHERE owned = false AND building_id = $1;
  `;
    const values = [buildingId];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні незанятих квартир по ID будинку: " +
          error.message,
      );
    }
  }

  async updateApartmentStatus(id, owned, user_id = null) {
    const query = `
      UPDATE apartments
      SET owned = $1, user_id = $2
      WHERE id = $3
      RETURNING id, building_id, number, floor, area, owned, user_id;
  `;
    const values = [owned, user_id, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при оновленні статусу квартири: " + error.message,
      );
    }
  }

  async getApartmentByResidentId(residentId) {
    const query = `
      SELECT *
      FROM apartments WHERE user_id = $1;
    `;
    const values = [residentId];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при отриманні квартири за ID резидента: " + error.message,
      );
    }
  }

  async getFreeApartments() {
    const query = `
      SELECT *
      FROM apartments
      WHERE owned = false;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні незанятих квартир: " + error.message,
      );
    }
  }

  async getApartmentsByBuildings() {
    const query = `SELECT b.address, COUNT(a.id) AS apartment_count
    FROM buildings b
    JOIN apartments a ON b.id = a.building_id
    GROUP BY b.address
    ORDER BY apartment_count DESC;`;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні квартир за будинками: " + error.message,
      );
    }
  }

  async getOccupancyByBuilding() {
    const query = `
      SELECT
        b.id AS building_id,
        b.address,
        COUNT(a.id) AS total_apartments,
        COUNT(a.id) FILTER (WHERE a.owned = true) AS occupied_apartments,
        COUNT(a.id) FILTER (WHERE a.owned = false) AS free_apartments,
        COALESCE(
          ROUND(
            100.0 * COUNT(a.id) FILTER (WHERE a.owned = true) / NULLIF(COUNT(a.id), 0),
            2
          ),
          0
        ) AS occupancy_rate
      FROM buildings b
      LEFT JOIN apartments a ON a.building_id = b.id
      GROUP BY b.id, b.address
      ORDER BY occupancy_rate DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні заповненості будинків: " + error.message,
      );
    }
  }
}

export default new ApartmentService();
