import userService from "../services/userService.js";

class UserController {
  // Функция для проверки украинского номера телефона
  isValidUkrainianPhone(phoneNumber) {
    if (!phoneNumber) return true; // если пусто, это ок (необязательное поле)
    const phoneRegex = /^(\+380|0)[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ""));
  }

  async createUser(req, res) {
    const { username, password_hash, email, role, phone } = req.body;
    try {
      // Проверка формата телефона для мешканцев
      if (role === "resident" && phone && !this.isValidUkrainianPhone(phone)) {
        return res.status(400).json({
          message:
            "Невірний формат телефону. Використовуйте +380XXXXXXXXX або 0XXXXXXXXX",
        });
      }

      const user = await userService.createUser(
        username,
        password_hash,
        email,
        role,
      );
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.message === "Email already exists") {
        return res
          .status(400)
          .json({ message: "Електронна пошта вже використовується" });
      }
      res
        .status(500)
        .json({ message: "Error creating user: " + error.message });
    }
  }

  async getUserById(req, res) {
    const { id } = req.params;
    try {
      const user = await userService.getUserById(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "Користувача не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserByUsername(req, res) {
    const { username } = req.params;
    try {
      const user = await userService.getUserByUsername(username);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "Користувача не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateUser(req, res) {
    const { id } = req.params;
    const { username, email, role } = req.body;
    try {
      const user = await userService.updateUser(id, username, email, role);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "Користувача не знайдено" });
      }
    } catch (error) {
      if (error.message === "Email already exists") {
        return res
          .status(400)
          .json({ message: "Електронна пошта вже використовується" });
      }
      res.status(500).json({ error: error.message });
    }
  }
  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const result = await userService.deleteUser(id);
      if (result) {
        res.status(200).json({ message: "Користувача видалено" });
      } else {
        res.status(404).json({ message: "Користувача не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    const { username, password_hash } = req.body;
    try {
      const user = await userService.login(username, password_hash);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(401).json({ message: "Неправильний логін або пароль" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUsersByRole(req, res) {
    try {
      const roles = await userService.getUsersByRole();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();
