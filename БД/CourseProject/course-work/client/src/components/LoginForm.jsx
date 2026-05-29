import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../configs/config.js";
import "../css/LoginForm.css";
import { logEvent } from "../../configs/logEvent.js";
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password_hash, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password_hash }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Помилка при вході");
      }

      console.log("Пользователь авторизован:", data);
      sessionStorage.setItem("userData", JSON.stringify(data));
      sessionStorage.setItem("userRole", data.role);
      logEvent(data.id, "login", "Юзер залогінився в систему");

      if (data.role === "resident") {
        const residentResponse = await fetch(`${apiUrl}/residents/${data.id}`);
        const residentData = await residentResponse.json();

        if (!residentResponse.ok) {
          throw new Error("Помилка при отриманні даних про мешканця");
        }

        console.log("Данные о резиденте:", residentData);

        sessionStorage.setItem("userData", JSON.stringify(residentData));
      }

      navigate("/main");
    } catch (error) {
      setError("Помилка: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h1 className="login-form-title">Вхід</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ім'я користувача:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password_hash}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Завантаження..." : "Вхід"}
        </button>

        <div>
          Нет аккаунта? <a href="/register">Зареєструйтесь тут</a>
        </div>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
