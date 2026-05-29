import React, { useEffect, useState } from "react";
import { apiUrl } from "../../configs/config";
import { useNavigate } from "react-router-dom";
import styles from "../css/ResidentsPage.module.css";
import { logEvent } from "../../configs/logEvent.js";
const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResidents, setFilteredResidents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch(`${apiUrl}/residents`);
      const data = await response.json();
      setResidents(data);
      setFilteredResidents(data);
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "fetchResidents",
        "Юзер завантажив жителів"
      );
    } catch (error) {
      console.error("Помилка при завантаженні жителів:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredResidents(
      residents.filter(
        (r) =>
          r.full_name.toLowerCase().includes(term) ||
          (r.phone && r.phone.includes(term)) ||
          (r.registered_at && r.registered_at.includes(term))
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цього жителя?")) return;
    try {
      await fetch(`${apiUrl}/residents/${id}`, { method: "DELETE" });
      fetchResidents();

      logEvent(id, "deleteResident", "Юзер видалив жителя");
    } catch (error) {
      console.error("Помилка при видаленні жителя:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.residentsContainer}>
      <h2>Мешканці</h2>
      <div className={styles.residentsActions}>
        <input
          type="text"
          placeholder="Пошук за іменем, телефоном, датою реєстрації"
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>

      <table className={styles.residentsTable}>
        <thead>
          <tr>
            <th>ФІО</th>
            <th>Квартира</th>
            <th>Будівля</th>
            <th>Телефон</th>

            <th>Дата реєстрації</th>

            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredResidents.map((r) => (
            <tr key={r.id}>
              <td>{r.full_name}</td>
              <td>{r.apartment_id}</td>
              <td>{r.building_address}</td>
              <td>{r.phone}</td>
              <td>{new Date(r.registered_at).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleDelete(r.id)}
                  className={styles.deleteButton}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
          {filteredResidents.length === 0 && (
            <tr>
              <td colSpan="4">Немає даних</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResidentsPage;
