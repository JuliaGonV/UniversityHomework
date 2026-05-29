import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../configs/config.js";
import { logEvent } from "../../configs/logEvent.js";
import styles from "../css/ServicesPage.module.css";

const ServicesPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("userData") || "{}");

  const [services, setServices] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [serviceIdLookup, setServiceIdLookup] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    monthly_fee: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/services`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Помилка при отриманні послуг");
      }
      setServices(data);
      logEvent(user.id, "fetchServices", "Юзер завантажив послуги");
    } catch (err) {
      setError(err.message);
    }
  }, [user.id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const lookupByName = async () => {
    if (!searchName.trim()) return fetchServices();

    setError("");
    try {
      const response = await fetch(
        `${apiUrl}/services/name/${encodeURIComponent(searchName.trim())}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Послугу не знайдено");
      }
      setServices(data ? [data] : []);
    } catch (err) {
      setError(err.message);
      setServices([]);
    }
  };

  const lookupById = async () => {
    if (!serviceIdLookup.trim()) return;

    setError("");
    try {
      const response = await fetch(`${apiUrl}/services/${serviceIdLookup}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Послугу не знайдено");
      }
      setServices(data ? [data] : []);
    } catch (err) {
      setError(err.message);
      setServices([]);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${apiUrl}/services/${editId}`
        : `${apiUrl}/services`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthly_fee: Number(form.monthly_fee),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при збереженні");
      }

      setForm({ name: "", description: "", monthly_fee: "" });
      setEditId(null);
      await fetchServices();
      logEvent(
        user.id,
        editId ? "updateService" : "createService",
        editId ? "Юзер оновив послугу" : "Юзер створив послугу",
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Видалити цю послугу?")) return;

    setError("");
    try {
      const response = await fetch(`${apiUrl}/services/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при видаленні");
      }

      await fetchServices();
      logEvent(user.id, "deleteService", "Юзер видалив послугу");
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      monthly_fee: item.monthly_fee || "",
    });
  };

  return (
    <div className={styles.page}>
      <h1>Послуги</h1>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        Повернутися назад
      </button>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Пошук за назвою"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button onClick={lookupByName}>Шукати</button>
        <button onClick={fetchServices}>Скинути</button>

        <input
          type="number"
          placeholder="Знайти по ID"
          value={serviceIdLookup}
          onChange={(e) => setServiceIdLookup(e.target.value)}
        />
        <button onClick={lookupById}>Отримати</button>
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        <input
          type="text"
          required
          placeholder="Назва послуги"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Опис"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          required
          step="0.01"
          placeholder="Місячна оплата"
          value={form.monthly_fee}
          onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })}
        />
        <button type="submit">{editId ? "Оновити" : "Додати"}</button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Назва</th>
            <th>Опис</th>
            <th>Місячна оплата</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.description || "-"}</td>
              <td>{item.monthly_fee}</td>
              <td>
                <button onClick={() => startEdit(item)}>Редагувати</button>
                <button onClick={() => onDelete(item.id)}>Видалити</button>
              </td>
            </tr>
          ))}
          {services.length === 0 && (
            <tr>
              <td colSpan="5">Немає даних</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesPage;
