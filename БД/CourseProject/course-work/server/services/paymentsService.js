import pool from "../database/database.js";

class BuildingService {
  async createPayment(
    resident_id,
    month,
    amount,
    paid_at,
    status = "не оплачено",
  ) {
    const query = `
        INSERT INTO payments (resident_id, month, amount, paid_at, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, resident_id, month, amount, paid_at, status;
    `;
    const values = [resident_id, month, amount, paid_at, status];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні платежу: " + error.message);
    }
  }

  async getAllPayments() {
    const query = `
        SELECT id, resident_id, month, amount, paid_at, status
        FROM payments;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні платежів: " + error.message);
    }
  }

  async getPaymentById(id) {
    const query = `
        SELECT id, resident_id, month, amount, paid_at, status
        FROM payments
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні платежу: " + error.message);
    }
  }

  async updatePayment(id, resident_id, month, amount) {
    const query = `
        UPDATE payments
        SET resident_id = $1, month = $2, amount = $3
        WHERE id = $4
        RETURNING id, resident_id, month, amount;
    `;
    const values = [resident_id, month, amount, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні платежу: " + error.message);
    }
  }
  async deletePayment(id) {
    const query = `
        DELETE FROM payments
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Платіж успішно видалено." };
    } catch (error) {
      throw new Error("Помилка при видаленні платежу: " + error.message);
    }
  }

  async getPaymentsByResidentId(resident_id) {
    const query = `
        SELECT id, resident_id, month, amount, paid_at, status
        FROM payments
        WHERE resident_id = $1;
    `;
    const values = [resident_id];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні платежів: " + error.message);
    }
  }
  async getPaymentsByMonth(month) {
    const query = `
        SELECT id, resident_id, month, amount, paid_at, status
        FROM payments
        WHERE month = $1;
    `;
    const values = [month];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні платежів: " + error.message);
    }
  }

  async getPaymentsByStatus(status) {
    const query = `
        SELECT id, resident_id, month, amount, paid_at, status
        FROM payments
        WHERE status = $1;
    `;
    const values = [status];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні платежів: " + error.message);
    }
  }

  async updatePaymentStatus(id, status, paid_at = null) {
    const query = `
      UPDATE payments
      SET status = $1, paid_at = $2
      WHERE id = $3
      RETURNING id, resident_id, month, amount, paid_at, status;
  `;
    const values = [status, paid_at, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при оновленні статусу платежу: " + error.message,
      );
    }
  }

  async getSuPaymentsNotPaid() {
    const query = `SELECT SUM(amount) as total_unpaid
        FROM payments
        WHERE status = 'not payed';`;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw new Error(
        "Помилка при отриманні незакритих платежів: " + error.message,
      );
    }
  }

  async getResidentsByPaidPayments() {
    const query = `SELECT
          r.full_name,
          a.number AS apartment_number,
          COUNT(p.id) AS total_paid_payments
      FROM
          payments p
      JOIN
          residents r ON p.resident_id = r.id
      JOIN
          apartments a ON r.apartment_id = a.id
      WHERE
          p.status = 'payed'
      GROUP BY
          r.full_name, a.number
      ORDER BY
          total_paid_payments DESC; 
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні мешканців з оплачуваними платежами: " +
          error.message,
      );
    }
  }

async getDebtByBuilding() {
  const query = `
    SELECT
      b.id AS building_id,
      b.address,
      COALESCE(SUM(p.amount), 0) AS total_debt
    FROM buildings b
    LEFT JOIN apartments a ON a.building_id = b.id
    LEFT JOIN residents r ON r.apartment_id = a.id
    LEFT JOIN payments p ON p.resident_id = r.id AND p.status = 'not payed'
    GROUP BY b.id, b.address
    ORDER BY total_debt DESC;
  `;

  const timerLabel = "getDebtByBuilding query time";

  try {
    console.time(timerLabel);

    const result = await pool.query(query);

    console.timeEnd(timerLabel);

    return result.rows;
  } catch (error) {
    console.timeEnd(timerLabel);

    throw new Error(
      "Помилка при отриманні боргу по будинках: " + error.message,
    );
  }
}

  async getDebtByResident() {
    const query = `
      SELECT
        r.id AS resident_id,
        r.full_name,
        COALESCE(SUM(p.amount), 0) AS total_debt
      FROM residents r
      LEFT JOIN payments p ON p.resident_id = r.id AND p.status = 'not payed'
      GROUP BY r.id, r.full_name
      ORDER BY total_debt DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні боргу по мешканцях: " + error.message,
      );
    }
  }

  async getTopDebtors(limit = 10) {
    const query = `
      SELECT
        r.id AS resident_id,
        r.full_name,
        COALESCE(SUM(p.amount), 0) AS total_debt
      FROM residents r
      LEFT JOIN payments p ON p.resident_id = r.id AND p.status = 'not payed'
      GROUP BY r.id, r.full_name
      ORDER BY total_debt DESC
      LIMIT $1;
    `;
    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні топу боржників: " + error.message);
    }
  }

  async getCollectionRateByMonth() {
    const query = `
      SELECT
        DATE_TRUNC('month', month)::date AS month,
        COUNT(*) AS total_payments,
        COUNT(*) FILTER (WHERE status = 'payed') AS paid_payments,
        COALESCE(
          ROUND(
            100.0 * COUNT(*) FILTER (WHERE status = 'payed') / NULLIF(COUNT(*), 0),
            2
          ),
          0
        ) AS collection_rate,
        COALESCE(SUM(amount), 0) AS total_amount,
        COALESCE(SUM(CASE WHEN status = 'payed' THEN amount ELSE 0 END), 0) AS paid_amount
      FROM payments
      GROUP BY DATE_TRUNC('month', month)
      ORDER BY month DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні рівня оплат по місяцях: " + error.message,
      );
    }
  }

  async getAllDebtors() {
    const query = `
      SELECT
        r.id AS resident_id,
        r.full_name,
        COUNT(p.id) AS unpaid_payments_count,
        COALESCE(SUM(p.amount), 0) AS total_debt
      FROM residents r
      JOIN payments p ON p.resident_id = r.id
      WHERE p.status = 'not payed'
      GROUP BY r.id, r.full_name
      ORDER BY total_debt DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні всіх боржників: " + error.message);
    }
  }

  async payAllDebtsByResidentId(resident_id) {
    const query = `
      WITH updated AS (
        UPDATE payments
        SET status = 'payed', paid_at = NOW()
        WHERE resident_id = $1 AND status = 'not payed'
        RETURNING amount
      )
      SELECT
        COUNT(*)::int AS paid_count,
        COALESCE(SUM(amount), 0) AS paid_total
      FROM updated;
    `;
    try {
      const result = await pool.query(query, [resident_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при оплаті всіх боргів мешканця: " + error.message,
      );
    }
  }
}

export default new BuildingService();
