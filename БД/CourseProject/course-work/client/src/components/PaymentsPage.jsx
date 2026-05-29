import React, { useEffect, useState, useCallback } from "react";
import styles from "../css/Payments.module.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { logEvent } from "../../configs/logEvent.js";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({
    resident_id: "",
    month: "",
    amount: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  const isResident = useAuthCheck("resident");

  const user = JSON.parse(sessionStorage.getItem("userData"));
  const residentId = user?.id ? user.id : null;

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(
        isResident
          ? `${apiUrl}/payments/resident/${residentId}`
          : `${apiUrl}/payments`,
      );
      const data = await res.json();
      setPayments(data);
      logEvent(user.id, "fetchPayments", "Юзер завантажив платежі");
    } catch (error) {
      console.error("Помилка при отриманні платежів:", error);
    }
  }, [isResident, residentId, user?.id]);

  const fetchResidents = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/residents`);
      const data = await res.json();
      setResidents(data);
      logEvent(user.id, "fetchResidents", "Юзер завантажив резидентів");
    } catch (error) {
      console.error("Помилка при отриманні резидентів:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isResident === null) return;
    if (isResident && !residentId) return;

    fetchPayments();
    if (!isResident) fetchResidents();
  }, [fetchPayments, fetchResidents, isResident, residentId]);

  const translateStatus = (status) => {
    switch (status) {
      case "payed":
        return "Оплачено";
      case "not payed":
        return "Не оплачено";
      default:
        return status;
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${apiUrl}/payments/${editId}`
        : `${apiUrl}/payments`;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          month: form.month + "-01",
        }),
      });

      setForm({ resident_id: "", month: "", amount: "" });
      setEditId(null);
      logEvent(user.id, "submitPayment", "Юзер зберіг платіж");
      fetchPayments();
    } catch (error) {
      console.error("Помилка при збереженні платежу:", error);
    }
  };

  const handleEdit = (payment) => {
    setEditId(payment.id);
    setForm({
      resident_id: payment.resident_id,
      month: payment.month.slice(0, 7),
      amount: payment.amount,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей платіж?")) return;
    try {
      await fetch(`${apiUrl}/payments/${id}`, {
        method: "DELETE",
      });
      logEvent(user.id, "deletePayment", "Юзер видалив платіж");
      fetchPayments();
    } catch (error) {
      console.error("Помилка при видаленні:", error);
    }
  };

  const getResidentNameById = (id) => {
    const resident = residents.find((r) => r.id === id);
    return resident ? `${resident.full_name}` : `ID ${id}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const markAsPaid = async (id) => {
    if (!window.confirm("Підтвердити оплату?")) return;
    try {
      await fetch(`${apiUrl}/payments/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "payed",
          paid_at: new Date().toISOString(),
        }),
      });
      fetchPayments();
      logEvent(user.id, "markAsPaid", "Юзер підтвердив оплату");
    } catch (error) {
      console.error("Помилка при оновленні статусу:", error);
    }
  };

  const markAsNotPaid = async (id) => {
    try {
      await fetch(`${apiUrl}/payments/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "not payed",
          paid_at: null,
        }),
      });
      fetchPayments();
      logEvent(user.id, "markAsNotPaid", "Юзер скасував оплату");
    } catch (error) {
      console.error("Помилка при оновленні статусу:", error);
    }
  };

  const payAllDebts = async () => {
    if (!window.confirm("Оплатити одразу всі ваші борги?")) return;
    try {
      const response = await fetch(
        `${apiUrl}/payments/resident/${residentId}/pay-all-debts`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Помилка при оплаті всіх боргів");
      }

      alert(
        `Оплачено боргів: ${data.paid_count}. Загальна сума: ${data.paid_total} грн.`,
      );
      fetchPayments();
      logEvent(user.id, "payAllDebts", "Юзер оплатив усі борги");
    } catch (error) {
      console.error("Помилка при оплаті всіх боргів:", error);
      alert(error.message);
    }
  };

  const fetchPaymentsByMonth = async () => {
    if (!filterMonth) return fetchPayments();

    try {
      const response = await fetch(`${apiUrl}/payments/month/${filterMonth}-01`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при фільтрації по місяцю");
      }
      setPayments(data);
      logEvent(user.id, "filterPaymentsByMonth", "Юзер відфільтрував платежі за місяцем");
    } catch (error) {
      console.error("Помилка при фільтрації за місяцем:", error);
      alert(error.message);
    }
  };

  const fetchPaymentsByStatus = async () => {
    if (!filterStatus) return fetchPayments();

    try {
      const response = await fetch(`${apiUrl}/payments/status/${filterStatus}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при фільтрації по статусу");
      }
      setPayments(data);
      logEvent(user.id, "filterPaymentsByStatus", "Юзер відфільтрував платежі за статусом");
    } catch (error) {
      console.error("Помилка при фільтрації за статусом:", error);
      alert(error.message);
    }
  };

  const resetPaymentFilters = () => {
    setFilterMonth("");
    setFilterStatus("");
    fetchPayments();
  };

  const filteredPayments = payments.filter((payment) => {
    const normalizedSearchTerm = searchTerm.toLowerCase();

    const statusTranslation = {
      оплачено: "payed",
      "не оплачено": "not payed",
    };

    const searchStatus =
      statusTranslation[normalizedSearchTerm] || normalizedSearchTerm;

    return (
      payment.id.toString().includes(searchTerm) ||
      getResidentNameById(payment.resident_id)
        .toLowerCase()
        .includes(normalizedSearchTerm) ||
      payment.month.includes(searchTerm) ||
      payment.amount.toString().includes(searchTerm) ||
      payment.status.toLowerCase().includes(searchStatus)
    );
  });

  return (
    <div className={styles.buildingsContainer}>
      <h2>Керування платежами</h2>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>

      {/* Search input */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Пошук..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {!isResident && (
        <div className={styles.filtersRow}>
          <input
            type="month"
            value={filterMonth}
            onChange={(event) => setFilterMonth(event.target.value)}
            className={styles.styledInput}
          />
          <button className={styles.submitButton} onClick={fetchPaymentsByMonth}>
            За місяцем
          </button>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className={styles.styledInput}
          >
            <option value="">Оберіть статус</option>
            <option value="payed">Оплачено</option>
            <option value="not payed">Не оплачено</option>
          </select>
          <button className={styles.submitButton} onClick={fetchPaymentsByStatus}>
            За статусом
          </button>
          <button className={styles.submitButton} onClick={resetPaymentFilters}>
            Скинути
          </button>
        </div>
      )}

      {isResident && (
        <button
          className={`${styles.actionButton} ${styles.editButton}`}
          onClick={payAllDebts}
        >
          Оплатити всі борги
        </button>
      )}

      {!isResident && (
        <form onSubmit={handleSubmit} className={styles.residentForm}>
          <select
            name="resident_id"
            value={form.resident_id}
            onChange={handleChange}
            className={styles.styledInput}
            required
          >
            <option value="">Оберіть резидента</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {resident.full_name}
              </option>
            ))}
          </select>

          <input
            className={styles.styledInput}
            type="month"
            name="month"
            value={form.month}
            onChange={handleChange}
            required
          />
          <input
            className={styles.styledInput}
            type="number"
            name="amount"
            placeholder="Сума"
            value={form.amount}
            onChange={handleChange}
            step="0.01"
            required
          />
          <button type="submit" className={styles.submitButton}>
            {editId ? "Оновити платіж" : "Додати платіж"}
          </button>
        </form>
      )}

      <table className={styles.residentsTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Резидент</th>
            <th>Місяць</th>
            <th>Сума</th>
            <th>Статус</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                {isResident
                  ? user.full_name
                  : getResidentNameById(p.resident_id)}
              </td>
              <td>
                {new Date(p.month).toLocaleDateString("uk-UA", {
                  year: "numeric",
                  month: "long",
                })}
              </td>
              <td>{p.amount} ₴</td>
              <td>{translateStatus(p.status)}</td>
              <td>
                {isResident ? (
                  p.status !== "payed" ? (
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => markAsPaid(p.id)}
                    >
                      Позначити як оплачено
                    </button>
                  ) : (
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => markAsNotPaid(p.id)}
                    >
                      Скасувати оплату
                    </button>
                  )
                ) : (
                  <>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => handleEdit(p)}
                    >
                      Редагувати
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(p.id)}
                    >
                      Видалити
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
