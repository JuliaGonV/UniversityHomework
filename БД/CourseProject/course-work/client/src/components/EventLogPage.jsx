import React, { useState, useEffect } from "react";
import styles from "../css/EventLogPage.module.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
const EventLogPage = () => {
  const [eventLogs, setEventLogs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDetails, setSearchDetails] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEventLogs();
  }, []);
  const navigate = useNavigate();
  const fetchEventLogs = async () => {
    try {
      const response = await fetch(`${apiUrl}/event-logs`);
      const data = await response.json();
      setEventLogs(data);
    } catch (err) {
      setError("Помилка при завантаженні даних: " + err.message);
    }
  };

  const filteredLogs = eventLogs.filter((log) => {
    const nameQuery = searchName.trim().toLowerCase();
    const detailsQuery = searchDetails.trim().toLowerCase();
    const dateQuery = searchDate.trim().toLowerCase();

    const eventType = (log.event_type || "").toLowerCase();
    const details = (log.details || "").toLowerCase();
    const eventDate = log.event_time
      ? new Date(log.event_time).toLocaleString().toLowerCase()
      : "";

    if (nameQuery && !eventType.includes(nameQuery)) return false;
    if (detailsQuery && !details.includes(detailsQuery)) return false;
    if (dateQuery && !eventDate.includes(dateQuery)) return false;

    return true;
  });
  const handleBack = () => {
    navigate(-1);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchDetails("");
    setSearchDate("");
  };
  return (
    <div className={styles.container}>
      <h1>Журнал подій</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Пошук за назвою події"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />
        <input
          type="text"
          placeholder="Пошук за деталями"
          value={searchDetails}
          onChange={(e) => setSearchDetails(e.target.value)}
          className={styles.searchInput}
        />
        <input
          type="text"
          placeholder="Пошук за датою"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className={styles.searchInput}
        />
        <button
          type="button"
          onClick={handleClearFilters}
          className={styles.searchButton}
        >
          Очистити
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Тип події</th>
            <th>Дата події</th>
            <th>Деталі</th>
            <th>Користувач ID</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.event_type}</td>
              <td>{new Date(log.event_time).toLocaleString()}</td>
              <td>{log.details}</td>
              <td>{log.user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.actionButtons}></div>
    </div>
  );
};

export default EventLogPage;
