import React, { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../../configs/config.js";
import styles from "../css/MaintenanceRequestsPage.module.css";
import { useNavigate } from "react-router-dom";
import { logEvent } from "../../configs/logEvent.js";

const MaintenanceRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [newRequest, setNewRequest] = useState({
    description: "",
    apartmentId: "",
    repairType: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(sessionStorage.getItem("userData"));
  const residentId = user?.user_id || user.id;
  const userIdForRequests = user?.id || user.id;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/requests/${userIdForRequests}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Не знайдено жодної заяви");
        }
        const errorData = await response.text();
        throw new Error(errorData || "Помилка при отриманні заявок");
      }

      const data = await response.json().catch(() => null);
      console.log(data);
      if (!data) {
        throw new Error("Порожній відповідь від сервера");
      }

      setRequests(Array.isArray(data) ? data : [data]);
      logEvent(residentId, "fetchRequests", "Юзер завантажив заявки");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [residentId, userIdForRequests]);

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/apartments/resident/${residentId}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Помилка при отриманні квартир");
      }

      setApartments(Array.isArray(data) ? data : [data]);
      logEvent(residentId, "fetchApartments", "Юзер завантажив квартири");
    } catch (err) {
      setError("Помилка: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [residentId]);

  useEffect(() => {
    fetchRequests();
    fetchApartments();
  }, [fetchRequests, fetchApartments]);

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newRequest, userIdForRequests }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Помилка при створенні заявки",
        );
      }
      fetchRequests();
      logEvent(residentId, "createRequest", "Юзер створив заявку");
      setNewRequest({ description: "", apartmentId: "", repairType: "medium" });
    } catch (err) {
      setError("Помилка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const translateStatus = (status) => {
    const statuses = {
      new: "Нове",
      "in work": "В роботі",
      completed: "Завершено",
    };
    return statuses[status] || status;
  };

  const translateRepairType = (repairType) => {
    const repairTypes = {
      cosmetic: "Косметичний",
      medium: "Середній",
      major: "Капітальний",
      emergency: "Аварійний",
    };
    return repairTypes[repairType] || repairType;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filteredRequests = Array.isArray(requests)
    ? requests.filter((req) =>
        req.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  return (
    <div className={styles.maintenanceRequestsPage}>
      <h1 className="page-title">Завдання на обслуговування</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleCreateRequest} className={styles.requestForm}>
        <label className="form-label">Опис:</label>
        <textarea
          value={newRequest.description}
          onChange={(e) =>
            setNewRequest({ ...newRequest, description: e.target.value })
          }
          required
          className={styles.styledTextarea}
        />

        <label className="form-label">Квартира:</label>
        <select
          value={newRequest.apartmentId}
          onChange={(e) =>
            setNewRequest({ ...newRequest, apartmentId: e.target.value })
          }
          className={styles.styledSelect}
          required
        >
          <option value="">Оберіть квартиру</option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              №{apartment.number}
            </option>
          ))}
        </select>

        <label className="form-label">Тип ремонту:</label>
        <select
          value={newRequest.repairType}
          onChange={(e) =>
            setNewRequest({ ...newRequest, repairType: e.target.value })
          }
          className={styles.styledSelect}
          required
        >
          <option value="cosmetic">Косметичний</option>
          <option value="medium">Середній</option>
          <option value="major">Капітальний</option>
          <option value="emergency">Аварійний</option>
        </select>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          Створити заявку
        </button>
      </form>

      {/* Строка поиска */}
      <input
        type="text"
        placeholder="Пошук за описом..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      <h2 className={styles.requestListTitle}>Список завданнь</h2>
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <div className={styles.requestsGrid}>
          {filteredRequests.length === 0 ? (
            <p>Не знайдено жодної заявки, що відповідає пошуковому запиту</p>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className={styles.requestItem}>
                <p>
                  <strong>Опис:</strong> {request.description}
                </p>
                <p>
                  <strong>Квартира:</strong> {request.apartment_name}
                </p>
                <p>
                  <strong>Статус:</strong> {translateStatus(request.status)}
                </p>
                <p>
                  <strong>Тип ремонту:</strong>{" "}
                  {translateRepairType(request.repair_type)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequestsPage;
