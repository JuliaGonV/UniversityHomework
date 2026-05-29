import pool from "../database/database.js";

const ALLOWED_REPAIR_TYPES = ["cosmetic", "medium", "major", "emergency"];
const MAX_UNPAID_PAYMENTS_FOR_REPAIR = Number(
  process.env.MAX_UNPAID_PAYMENTS_FOR_REPAIR || 3,
);

class RequestService {
  async createMaintenanceRequest(
    resident_id,
    apartment_id,
    description,
    repair_type = "medium",
  ) {
    if (!ALLOWED_REPAIR_TYPES.includes(repair_type)) {
      const error = new Error("Некоректний тип ремонту");
      error.code = "INVALID_REPAIR_TYPE";
      throw error;
    }

    const unpaidQuery = `
      SELECT COUNT(*)::int AS unpaid_count
      FROM payments
      WHERE resident_id = $1 AND status = 'not payed';
    `;

    const unpaidResult = await pool.query(unpaidQuery, [resident_id]);
    const unpaidCount = unpaidResult.rows[0]?.unpaid_count || 0;

    if (unpaidCount >= MAX_UNPAID_PAYMENTS_FOR_REPAIR) {
      const error = new Error(
        "Заборгованість занадто велика для створення заявки на ремонт",
      );
      error.code = "REPAIR_BLOCKED_DUE_TO_DEBT";
      throw error;
    }

    const apartmentOwnerQuery = `
      SELECT 1
      FROM apartments a
      JOIN residents r ON r.user_id = a.user_id
      WHERE a.id = $1 AND r.id = $2;
    `;
    const apartmentOwnerResult = await pool.query(apartmentOwnerQuery, [
      apartment_id,
      resident_id,
    ]);

    if (apartmentOwnerResult.rowCount === 0) {
      const error = new Error(
        "Не можна створити заявку для квартири іншого мешканця",
      );
      error.code = "APARTMENT_FORBIDDEN";
      throw error;
    }

    const query = `
        INSERT INTO maintenance_requests (resident_id, apartment_id, description, repair_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, resident_id, apartment_id, description, repair_type, status, created_at, updated_at;
    `;
    const values = [resident_id, apartment_id, description, repair_type];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при створенні запиту на обслуговування: " + error.message,
      );
    }
  }

  async getAllMaintenanceRequests() {
    const query = `
    SELECT 
      maintenance_requests.*, 
      apartments.number AS apartment_name
    FROM maintenance_requests
    LEFT JOIN apartments 
    ON maintenance_requests.apartment_id = apartments.id;
  `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні всіх запитів на обслуговування: " +
          error.message,
      );
    }
  }

  async getMaintenanceRequestById(id) {
    const query = `
  SELECT 
    maintenance_requests.*, 
    apartments.number AS apartment_name
  FROM maintenance_requests
  LEFT JOIN apartments 
    ON maintenance_requests.apartment_id = apartments.id
  WHERE maintenance_requests.resident_id = $1;
`;

    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні запиту на обслуговування: " + error.message,
      );
    }
  }

  async updateMaintenanceRequest(id, status) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const completedAt = status === "completed" ? new Date() : null;

      const query = `
          UPDATE maintenance_requests
          SET status = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id, resident_id, apartment_id, description, status, created_at, updated_at;
      `;
      const values = [status, id];
      const result = await client.query(query, values);

      if (status === "completed") {
        await client.query(
          `
            UPDATE work_orders
            SET completed_at = COALESCE(completed_at, $2)
            WHERE request_id = $1;
          `,
          [id, completedAt],
        );
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(
        "Помилка при оновленні запиту на обслуговування: " + error.message,
      );
    } finally {
      client.release();
    }
  }
  async deleteMaintenanceRequest(id) {
    const query = `
        DELETE FROM maintenance_requests
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Запит на обслуговування успішно видалено." };
    } catch (error) {
      throw new Error(
        "Помилка при видаленні запиту на обслуговування: " + error.message,
      );
    }
  }

  async getMaintenanceRequestByStatus(status) {
    const query = `
        SELECT * 
        FROM maintenance_requests 
        WHERE status = $1;
    `;
    const values = [status];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні запитів на обслуговування за статусом: " +
          error.message,
      );
    }
  }

  async updateMaintenanceRequestStatus(id, status) {
    const client = await pool.connect();
    try {
      console.log("updateMaintenanceRequestStatus start:", { id, status });
      await client.query("BEGIN");
      const completedAt = status === "completed" ? new Date() : null;

      const query = `
          UPDATE maintenance_requests
          SET status = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING *;
      `;
      const values = [status, id];
      const result = await client.query(query, values);
      console.log("maintenance_requests updated row:", result.rows[0]);

      if (status === "completed") {
        const workOrderUpdateResult = await client.query(
          `
            UPDATE work_orders
            SET completed_at = COALESCE(completed_at, $2)
            WHERE request_id = $1;
            
          `,
          [id, completedAt],
        );
        console.log("work_orders completed_at update result:", {
          rowCount: workOrderUpdateResult.rowCount,
          requestId: id,
          status,
        });
      }

      await client.query("COMMIT");
      console.log("updateMaintenanceRequestStatus committed:", { id, status });
      return result.rows[0];
    } catch (error) {
      console.log(error);
      await client.query("ROLLBACK");
      console.log("updateMaintenanceRequestStatus rolled back:", {
        id,
        status,
        error: error.message,
      });
      throw new Error(
        "Помилка при оновленні статусу запиту на обслуговування: " +
          error.message,
      );
    } finally {
      client.release();
    }
  }

  async getOverdueRequests(days = 7) {
    const query = `
      SELECT *
      FROM maintenance_requests
      WHERE status IN ('new', 'in work')
      AND created_at < NOW() - ($1 || ' days')::interval
      ORDER BY created_at ASC;
    `;
    try {
      const result = await pool.query(query, [days]);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні прострочених заявок: " + error.message,
      );
    }
  }

  async getRequestStatsByStatus() {
    const query = `
      SELECT status, COUNT(*) AS total
      FROM maintenance_requests
      GROUP BY status
      ORDER BY total DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні статистики заявок: " + error.message,
      );
    }
  }

  async getAverageCloseTime() {
    const query = `
      SELECT
        COUNT(*) AS completed_requests,
        COALESCE(
          ROUND(EXTRACT(EPOCH FROM AVG(updated_at - created_at)) / 3600, 2),
          0
        ) AS avg_close_hours
      FROM maintenance_requests
      WHERE status = 'completed' AND updated_at IS NOT NULL;
    `;
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при отриманні середнього часу закриття: " + error.message,
      );
    }
  }
}

export default new RequestService();
