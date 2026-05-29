import React, { useState, useEffect } from "react";
import styles from "../css/WorkOrdersPage.module.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
import { logEvent } from "../../configs/logEvent.js";
const WorkOrdersPage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetchWorkOrders();
    fetchMaintenanceRequests();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/orders`);
      const data = await response.json();
      setWorkOrders(data);
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "fetchWorkOrders",
        "Юзер завантажив робочі замовлення",
      );
      console.log(data);
    } catch (err) {
      setError("Помилка завантаження: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch(`${apiUrl}/requests/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "new" }),
      });
      const data = await response.json();
      setMaintenanceRequests(data);
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "fetchMaintenanceRequests",
        "завантажив заявки на обслуговування",
      );
    } catch (err) {
      setError("Помилка при завантаженні заявок: " + err.message);
    }
  };

  const createWorkOrder = async () => {
    if (!selectedRequest || !scheduledDate || !notes) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: selectedRequest,
          scheduled_date: scheduledDate,
          notes: notes,
          worker_id: JSON.parse(sessionStorage.getItem("userData")).id,
        }),
      });

      await response.json();
      // Refresh full work orders list so UI has all joined request fields
      await fetchWorkOrders();
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "createWorkOrder",
        "Юзер створив робочий замовлення",
      );

      await fetch(`${apiUrl}/requests/status/${selectedRequest}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "in work" }),
      });

      // Refresh maintenance requests to remove the taken one from the list
      await fetchMaintenanceRequests();

      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "fetchMaintenanceRequests",
        "Юзер завантажив заявки на обслуговування",
      );

      setIsCreating(false);
      setError("");
    } catch (err) {
      setError(
        "Помилка при створенні робочого замовлення або оновленні статусу: " +
          err.message,
      );
    }
  };

  const completeWorkOrder = async (workOrderId) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${workOrderId}/complete`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || data.message || "Не вдалося завершити роботу",
        );
      }

      // Refresh lists so analytics/UI reflect completed orders
      await fetchWorkOrders();
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "completeWorkOrder",
        "Юзер завершив робоче замовлення",
      );
      await fetchMaintenanceRequests();
    } catch (err) {
      setError("Помилка при завершенні роботи: " + err.message);
    }
  };

  if (loading) return <div>Завантаження...</div>;
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className={styles.container}>
      <h1>Список робочих замовлень</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      {error && <div className={styles.error}>{error}</div>}

      {isCreating && (
        <div className={styles.createForm}>
          <h2>Створити робоче замовлення</h2>
          <label>Оберіть заявку:</label>
          <select
            value={selectedRequest || ""}
            onChange={(e) => setSelectedRequest(e.target.value)}
            className={styles.select}
          >
            <option value="">--Оберіть заявку--</option>
            {maintenanceRequests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.description}
              </option>
            ))}
          </select>

          <label>Дата закінчення:</label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className={styles.input}
          />

          <label>Примітки:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textarea}
          ></textarea>

          <button onClick={createWorkOrder} className={styles.submitButton}>
            Створити замовлення
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className={styles.cancelButton}
          >
            Скасувати
          </button>
        </div>
      )}

      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className={styles.createButton}
        >
          Взятися за роботу
        </button>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Номер заявки</th>
            <th>Мешканець</th>
            <th>Дата призначення</th>

            <th>Примітки</th>
            <th>Опис заявки</th>
            <th>Статус заявки</th>
            <th>Дата створення заявки</th>
            <th>Завершити роботу</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((order) => (
            <tr key={order.work_order_id}>
              <td>{order.request_id}</td>
              <td>{order.worker_id}</td>
              <td>{new Date(order.scheduled_date).toLocaleDateString()}</td>

              <td>{order.notes}</td>
              <td>{order.request_description}</td>
              <td>{order.request_status}</td>
              <td>{new Date(order.request_created_at).toLocaleDateString()}</td>
              <td>
                {order.request_status === "completed" || order.completed_at ? (
                  <span className={styles.completedLabel}>Завершено</span>
                ) : (
                  <button
                    onClick={() => completeWorkOrder(order.work_order_id)}
                    className={styles.completeButton}
                  >
                    Завершити роботу
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkOrdersPage;
