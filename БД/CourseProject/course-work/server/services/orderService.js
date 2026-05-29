import pool from "../database/database.js";

class OrderService {
  async createWorkOrder(request_id, worker_id, scheduled_date, notes) {
    const query = `
        INSERT INTO work_orders (request_id, worker_id, scheduled_date, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id, request_id, worker_id, scheduled_date, completed_at, notes;
    `;
    const values = [request_id, worker_id, scheduled_date, notes];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при створенні замовлення на роботу: " + error.message,
      );
    }
  }

  async getAllWorkOrders() {
    const query = `
        SELECT
            work_orders.id AS work_order_id,
            work_orders.scheduled_date,
            work_orders.completed_at,
            work_orders.notes,
            work_orders.worker_id,
            maintenance_requests.id AS request_id,
            maintenance_requests.resident_id,
            maintenance_requests.apartment_id,
            maintenance_requests.description AS request_description,
            maintenance_requests.status AS request_status,
            maintenance_requests.created_at AS request_created_at,
            maintenance_requests.updated_at AS request_updated_at
        FROM
            work_orders
        JOIN
            maintenance_requests
        ON
            work_orders.request_id = maintenance_requests.id;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні всіх замовлень: " + error.message);
    }
  }

  async getWorkOrderById(id) {
    const query = `
        SELECT id, request_id, worker_id, scheduled_date, completed_at, notes
        FROM work_orders
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні замовлення: " + error.message);
    }
  }

  async updateWorkOrder(id, request_id, worker_id, scheduled_date, notes) {
    const query = `
        UPDATE work_orders
        SET request_id = $1, worker_id = $2, scheduled_date = $3, notes = $4
        WHERE id = $5
        RETURNING id, request_id, worker_id, scheduled_date, completed_at, notes;
    `;
    const values = [request_id, worker_id, scheduled_date, notes, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні замовлення: " + error.message);
    }
  }
  async deleteWorkOrder(id) {
    const query = `
        DELETE FROM work_orders
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Замовлення успішно видалено." };
    } catch (error) {
      throw new Error("Помилка при видаленні замовлення: " + error.message);
    }
  }

  async completeWorkOrder(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const workOrderResult = await client.query(
        `
          UPDATE work_orders
          SET completed_at = COALESCE(completed_at, NOW())
          WHERE id = $1
          RETURNING id, request_id, worker_id, scheduled_date, completed_at, notes;
        `,
        [id],
      );

      const workOrder = workOrderResult.rows[0];
      if (!workOrder) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `
          UPDATE maintenance_requests
          SET status = 'completed', updated_at = NOW()
          WHERE id = $1;
        `,
        [workOrder.request_id],
      );

      await client.query("COMMIT");
      return workOrder;
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error("Помилка при завершенні замовлення: " + error.message);
    } finally {
      client.release();
    }
  }

  async getWorkloadByWorker() {
    const query = `
      SELECT
        u.id AS worker_id,
        u.username,
        COUNT(wo.id) AS total_work_orders,
        COUNT(wo.id) FILTER (WHERE wo.completed_at IS NOT NULL) AS completed_work_orders,
        COUNT(wo.id) FILTER (WHERE wo.completed_at IS NULL) AS open_work_orders
      FROM users u
      LEFT JOIN work_orders wo ON wo.worker_id = u.id
      WHERE u.role = 'worker'
      GROUP BY u.id, u.username
      ORDER BY total_work_orders DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні навантаження по працівниках: " + error.message,
      );
    }
  }
}

export default new OrderService();
