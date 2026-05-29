import React, { useCallback, useState, useEffect } from "react";
import { apiUrl } from "../../configs/config";
import styles from "../css/BuildingsPage.module.css";
import { useNavigate } from "react-router-dom";
import { logEvent } from "../../configs/logEvent.js";

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [newBuilding, setNewBuilding] = useState({
    address: "",
    built_year: "",
    number_of_floors: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const navigate = useNavigate();

  const filterBuildings = useCallback((term) => {
    return buildings.filter(
      (b) =>
        b.address.toLowerCase().includes(term) ||
        (b.built_year && b.built_year.toString().includes(term)) ||
        (b.number_of_floors && b.number_of_floors.toString().includes(term))
    );
  }, [buildings]);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    setFilteredBuildings(filterBuildings(searchTerm));
  }, [searchTerm, buildings, filterBuildings]);

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`${apiUrl}/buildings`);
      const data = await response.json();
      setBuildings(data);
      setFilteredBuildings(data);
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "fetchBuildings",
        "Юзер завантажив будівлі"
      );
    } catch (error) {
      console.error("Помилка при завантаженні будівель:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цю будівлю?")) return;
    try {
      await fetch(`${apiUrl}/buildings/${id}`, { method: "DELETE" });
      fetchBuildings();

      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "deleteBuilding",
        "Юзер видалив будівлю"
      );
    } catch (error) {
      console.error("Помилка при видаленні будівлі:", error);
    }
  };

  const handleEdit = (building) => {
    setIsEditing(true);
    setCurrentBuilding(building);
    setNewBuilding(building);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${apiUrl}/buildings/${currentBuilding.id}`
      : `${apiUrl}/buildings`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBuilding),
      });
      if (response.ok) {
        fetchBuildings();

        logEvent(
          JSON.parse(sessionStorage.getItem("userData")).id,
          isEditing ? "editBuilding" : "addBuilding",
          isEditing ? "Юзер обновил будинок" : "Юзер добавил будинок"
        );
        setNewBuilding({ address: "", built_year: "", number_of_floors: "" });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Помилка при збереженні будівлі:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.buildingsContainer}>
      <h2>Будівлі</h2>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      <div className={styles.buildingsActions}>
        <input
          type="text"
          placeholder="Пошук за адресою, роком побудови, поверхами"
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      <form onSubmit={handleSubmit} className={styles.residentForm}>
        <input
          type="text"
          value={newBuilding.address}
          onChange={(e) =>
            setNewBuilding({ ...newBuilding, address: e.target.value })
          }
          placeholder="Адреса"
          className={styles.styledInput}
        />
        <input
          type="number"
          value={newBuilding.built_year}
          onChange={(e) =>
            setNewBuilding({ ...newBuilding, built_year: e.target.value })
          }
          placeholder="Рік побудови"
          className={styles.styledInput}
        />
        <input
          type="number"
          value={newBuilding.number_of_floors}
          onChange={(e) =>
            setNewBuilding({ ...newBuilding, number_of_floors: e.target.value })
          }
          placeholder="Кількість поверхів"
          className={styles.styledInput}
        />
        <button type="submit" className={styles.submitButton}>
          {isEditing ? "Оновити" : "Додати"}
        </button>
      </form>

      <table className={styles.residentsTable}>
        <thead>
          <tr>
            <th>Адреса</th>
            <th>Рік побудови</th>
            <th>Кількість поверхів</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredBuildings.length === 0 ? (
            <tr>
              <td colSpan="4">Немає даних</td>
            </tr>
          ) : (
            filteredBuildings.map((b) => (
              <tr key={b.id}>
                <td>{b.address}</td>
                <td>{b.built_year}</td>
                <td>{b.number_of_floors}</td>
                <td>
                  <button
                    onClick={() => handleEdit(b)}
                    className={`${styles.editButton} ${styles.actionButton}`}
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className={`${styles.deleteButton} ${styles.actionButton}`}
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BuildingsPage;
