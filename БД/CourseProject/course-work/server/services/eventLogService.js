import pool from "../database/database.js";

class EventLogService {
  async createEventLog(userId, eventType, details) {
    const query = `
        INSERT INTO event_log (user_id, event_type, details)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, event_type, event_time, details;
    `;
    const values = [userId, eventType, details];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при створенні запису в журналі подій: " + error.message,
      );
    }
  }

  async getAllEventLogs() {
    const query = `
        SELECT id, user_id, event_type, event_time, details
        FROM event_log ORDER BY event_time DESC;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні записів з журналу подій: " + error.message,
      );
    }
  }

  async getEventLogById(id) {
    const query = `
        SELECT id, user_id, event_type, event_time, details
        FROM event_log
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(
        "Помилка при отриманні запису з журналу подій: " + error.message,
      );
    }
  }
  async deleteEventLog(id) {
    const query = `
        DELETE FROM event_log
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Запис успішно видалено." };
    } catch (error) {
      throw new Error(
        "Помилка при видаленні запису з журналу подій: " + error.message,
      );
    }
  }

  async getUserActivity(days = 30) {
    const query = `
      SELECT
        e.user_id,
        u.username,
        COUNT(e.id) AS events_count,
        MAX(e.event_time) AS last_event_at
      FROM event_log e
      LEFT JOIN users u ON u.id = e.user_id
      WHERE e.event_time >= NOW() - ($1 || ' days')::interval
      GROUP BY e.user_id, u.username
      ORDER BY events_count DESC;
    `;
    try {
      const result = await pool.query(query, [days]);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні активності користувачів: " + error.message,
      );
    }
  }
}

export default new EventLogService();
