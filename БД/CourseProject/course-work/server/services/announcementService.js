import pool from "../database/database.js";

class AnnouncementService {
  async createAnnouncement(title, message, authorId) {
    const query = `
        INSERT INTO announcements (title, message, author_id)
        VALUES ($1, $2, $3)
        RETURNING id, title, message, created_at, author_id;
    `;
    const values = [title, message, authorId];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при створенні оголошення: " + error.message);
    }
  }

  async getAllAnnouncements() {
    const query = `
        SELECT id, title, message, created_at, author_id
        FROM announcements;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Помилка при отриманні всіх оголошень: " + error.message);
    }
  }

  async getAnnouncementById(id) {
    const query = `
        SELECT id, title, message, created_at, author_id
        FROM announcements
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при отриманні оголошення: " + error.message);
    }
  }
  async updateAnnouncement(id, title, message) {
    const query = `
        UPDATE announcements
        SET title = $1, message = $2
        WHERE id = $3
        RETURNING id, title, message, created_at, author_id;
    `;
    const values = [title, message, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Помилка при оновленні оголошення: " + error.message);
    }
  }

  async deleteAnnouncement(id) {
    const query = `
        DELETE FROM announcements
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "Оголошення успішно видалено!" };
    } catch (error) {
      throw new Error("Помилка при видаленні оголошення: " + error.message);
    }
  }
  async getAnnouncementsByAuthorId(authorId) {
    const query = `
        SELECT id, title, message, created_at, author_id
        FROM announcements
        WHERE author_id = $1;
    `;
    const values = [authorId];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(
        "Помилка при отриманні оголошень по автору: " + error.message
      );
    }
  }
}

export default new AnnouncementService();
