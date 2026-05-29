import pool from "../database/database.js";

class UserService {
  async getAllUsers() {
    const query = `
        SELECT id, username, email, role, created_at
        FROM users;
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error(
        "Помилка при отриманні всіх користувачів: " + error.message,
      );
    }
  }

  async createUser(username, password_hash, email, role) {
    // If an email is provided, ensure it's not already used
    if (email) {
      const checkQuery = `SELECT id FROM users WHERE email = $1;`;
      try {
        const checkRes = await pool.query(checkQuery, [email]);
        if (checkRes.rows.length > 0) {
          throw new Error("Email already exists");
        }
      } catch (err) {
        if (err.message === "Email already exists") throw err;
        console.error("Error checking email uniqueness:", err);
        throw new Error(
          "Помилка при перевірці електронної пошти: " + err.message,
        );
      }
    }

    const query = `
        INSERT INTO users (username, password_hash, email, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, role, created_at;
    `;
    const values = [username, password_hash, email, role];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      // If DB unique constraint somehow triggered, convert to friendly message
      if (error.code === "23505") throw new Error("Email already exists");
      throw new Error("Помилка при створенні користувача: " + error.message);
    }
  }

  async getUserById(id) {
    console.log(id);
    const query = `
        SELECT id, username, email, role, created_at
        FROM users
        WHERE id = $1;
    `;
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Помилка при отриманні користувача: " + error.message);
    }
  }

  async getUserByUsername(username) {
    const query = `
        SELECT id, username, email, role, created_at
        FROM users
        WHERE username = $1;
    `;
    const values = [username];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw new Error("Помилка при отриманні користувача: " + error.message);
    }
  }

  async updateUser(id, username, email, role) {
    // If email provided, ensure it's not used by another user
    if (email) {
      const checkQuery = `SELECT id FROM users WHERE email = $1 AND id <> $2;`;
      try {
        const checkRes = await pool.query(checkQuery, [email, id]);
        if (checkRes.rows.length > 0) {
          throw new Error("Email already exists");
        }
      } catch (err) {
        if (err.message === "Email already exists") throw err;
        console.error("Error checking email uniqueness:", err);
        throw new Error(
          "Помилка при перевірці електронної пошти: " + err.message,
        );
      }
    }

    const query = `
        UPDATE users
        SET username = $1, email = $2, role = $3
        WHERE id = $4
        RETURNING id, username, email, role, created_at;
    `;
    const values = [username, email, role, id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.code === "23505") throw new Error("Email already exists");
      throw new Error("Помилка при оновленні користувача: " + error.message);
    }
  }
  async deleteUser(id) {
    const query = `
        DELETE FROM users
        WHERE id = $1;
    `;
    const values = [id];
    try {
      await pool.query(query, values);
      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Помилка при видаленні користувача: " + error.message);
    }
  }

  async login(username, password_hash) {
    const query = `
        SELECT id, username, email, role, created_at
        FROM users
        WHERE username = $1 AND password_hash = $2;
    `;
    const values = [username, password_hash];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error logging in user:", error);
      throw new Error("Помилка при вході користувача: " + error.message);
    }
  }

  async getUsersByRole() {
    const query = `SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER By count DESC;`;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw new Error(
        "Помилка при отриманні користувачів за роллю: " + error.message,
      );
    }
  }
}

export default new UserService();
