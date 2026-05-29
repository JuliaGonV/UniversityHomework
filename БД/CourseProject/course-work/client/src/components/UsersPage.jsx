import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../configs/config.js";
import { logEvent } from "../../configs/logEvent.js";
import styles from "../css/UsersPage.module.css";

const emptyForm = {
  username: "",
  email: "",
  password_hash: "",
  role: "resident",
};

const UsersPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("userData") || "{}");

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/users`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при отриманні користувачів");
      }
      setUsers(data);
      logEvent(user.id, "fetchUsers", "Юзер завантажив користувачів");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const body = editId
      ? {
          username: form.username,
          email: form.email,
          role: form.role,
        }
      : form;

    try {
      const response = await fetch(
        editId ? `${apiUrl}/users/${editId}` : `${apiUrl}/users`,
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при збереженні користувача");
      }

      resetForm();
      await fetchUsers();
      logEvent(
        user.id,
        editId ? "updateUser" : "createUser",
        editId ? "Юзер оновив користувача" : "Юзер створив користувача",
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const lookupByUsername = async () => {
    if (!searchUsername.trim()) return fetchUsers();

    setError("");
    try {
      const response = await fetch(
        `${apiUrl}/users/username/${encodeURIComponent(searchUsername.trim())}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Користувача не знайдено");
      }
      setUsers(data ? [data] : []);
    } catch (err) {
      setUsers([]);
      setError(err.message);
    }
  };

  const lookupById = async () => {
    if (!lookupId.trim()) return;

    setError("");
    try {
      const response = await fetch(`${apiUrl}/users/${lookupId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Користувача не знайдено");
      }
      setUsers(data ? [data] : []);
    } catch (err) {
      setUsers([]);
      setError(err.message);
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm({
      username: item.username || "",
      email: item.email || "",
      password_hash: "",
      role: item.role || "resident",
    });
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Видалити цього користувача?")) return;

    setError("");
    try {
      const response = await fetch(`${apiUrl}/users/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при видаленні користувача");
      }
      await fetchUsers();
      logEvent(user.id, "deleteUser", "Юзер видалив користувача");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Користувачі</h1>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        Повернутися назад
      </button>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p>Завантаження...</p>}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Пошук за username"
          value={searchUsername}
          onChange={(event) => setSearchUsername(event.target.value)}
        />
        <button onClick={lookupByUsername}>Шукати</button>
        <button onClick={fetchUsers}>Скинути</button>
        <input
          type="number"
          placeholder="Знайти по ID"
          value={lookupId}
          onChange={(event) => setLookupId(event.target.value)}
        />
        <button onClick={lookupById}>Отримати</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {!editId && (
          <input
            name="password_hash"
            type="password"
            placeholder="Пароль"
            value={form.password_hash}
            onChange={handleChange}
            required
          />
        )}
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="resident">Resident</option>
          <option value="admin">Admin</option>
          <option value="worker">Worker</option>
        </select>
        <button type="submit">{editId ? "Оновити" : "Додати"}</button>
        {editId && (
          <button type="button" onClick={resetForm}>
            Скасувати
          </button>
        )}
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Створено</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.username}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>{new Date(item.created_at).toLocaleDateString("uk-UA")}</td>
              <td>
                <button onClick={() => startEdit(item)}>Редагувати</button>
                <button onClick={() => deleteUser(item.id)}>Видалити</button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="6">Користувачів не знайдено</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
