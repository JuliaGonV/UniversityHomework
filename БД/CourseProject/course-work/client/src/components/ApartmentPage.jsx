import React, { useCallback, useState, useEffect } from "react";
import { apiUrl } from "../../configs/config.js";
import styles from "../css/ApartmentPage.module.css";
import { logEvent } from "../../configs/logEvent.js";
import { useNavigate } from "react-router-dom";

const ApartmentPage = () => {
  const [apartments, setApartments] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [area, setArea] = useState("");
  const [owned, setOwned] = useState(false);
  const [buildingId, setBuildingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [lookupId, setLookupId] = useState("");
  const userId = JSON.parse(sessionStorage.getItem("userData")).id;
  const selectedBuilding = buildings.find(
    (building) => Number(building.id) === Number(buildingId),
  );
  const maxFloor = selectedBuilding?.number_of_floors || "";

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/apartments`);
      if (!response.ok) {
        throw new Error("Помилка при завантаженні квартир");
      }
      const data = await response.json();
      setApartments(data);
      setFilteredApartments(data);
      logEvent(userId, "fetchApartments", "Юзер завантажив квартири");
    } catch (error) {
      setError("Помилка: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    if (search) {
      setFilteredApartments(
        apartments.filter((apartment) => {
          return (
            apartment.number.toLowerCase().includes(search.toLowerCase()) ||
            apartment.building_id.toString().includes(search)
          );
        })
      );
    } else {
      setFilteredApartments(apartments);
    }
  }, [search, apartments]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildings = async () => {
      const response = await fetch(`${apiUrl}/buildings`);
      const data = await response.json();
      setBuildings(data);
    };
    fetchBuildings();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteApartment = async (apartmentId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю квартиру?")) {
      try {
        const response = await fetch(`${apiUrl}/apartments/${apartmentId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Помилка при видаленні квартири");
        }
        setApartments(
          apartments.filter((apartment) => apartment.id !== apartmentId)
        );
        setFilteredApartments(
          filteredApartments.filter((apartment) => apartment.id !== apartmentId)
        );
        logEvent(userId, "deleteApartment", "Юзер видалив квартиру");
      } catch (error) {
        setError("Помилка: " + error.message);
      }
    }
  };

  const fetchAvailableApartments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/apartments/available`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Помилка при отриманні вільних квартир");
      }
      setApartments(data);
      setFilteredApartments(data);
      logEvent(userId, "fetchAvailableApartments", "Юзер завантажив вільні квартири");
    } catch (error) {
      setError("Помилка: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const lookupApartmentById = async () => {
    if (!lookupId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/apartments/${lookupId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Квартиру не знайдено");
      }
      setApartments(data ? [data] : []);
      setFilteredApartments(data ? [data] : []);
    } catch (error) {
      setApartments([]);
      setFilteredApartments([]);
      setError("Помилка: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (selectedBuilding && Number(floor) > Number(selectedBuilding.number_of_floors)) {
      setError(
        `Помилка: у вибраному будинку лише ${selectedBuilding.number_of_floors} поверхів`,
      );
      return;
    }

    const apartmentData = {
      number,
      floor: parseInt(floor),
      area: parseFloat(area),
      owned,
      building_id: buildingId ? parseInt(buildingId) : null,
    };

    console.log(apartmentData);

    try {
      let response;
      if (selectedApartment) {
        response = await fetch(`${apiUrl}/apartments/${selectedApartment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apartmentData),
        });
      } else {
        response = await fetch(`${apiUrl}/apartments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apartmentData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Помилка при збереженні квартири",
        );
      }

      const data = await response.json();
      logEvent(
        userId,
        selectedApartment ? "updateApartment" : "createApartment",
        `Юзер ${selectedApartment ? "оновив" : "додав"} квартиру`
      );
      setApartments((prevApartments) => [
        ...prevApartments.filter((apartment) => apartment.id !== data.id),
        data,
      ]);
      resetForm();
      setSelectedApartment(null);
    } catch (error) {
      setError("Помилка: " + error.message);
    }
  };

  const resetForm = () => {
    setNumber("");
    setFloor("");
    setArea("");
    setOwned(false);
    setBuildingId("");
    setError("");
  };

  const ApartmentItem = ({ apartment, onEdit, onDelete }) => (
    <div className={styles.apartmentItem}>
      <p>Номер: {apartment.number}</p>
      <p>Поверх: {apartment.floor}</p>
      <p>Площа: {apartment.area} м²</p>
      <p>Приватизовано: {apartment.owned ? "Так" : "Ні"}</p>
      <p>Здание: {apartment.building_id}</p>
      <button onClick={onEdit} className={styles.editButton}>
        Редагувати
      </button>
      <button
        onClick={() => onDelete(apartment.id)}
        className={styles.deleteButton}
      >
        Видалити
      </button>
    </div>
  );

  return (
    <div className={styles.apartmentPage}>
      <h1>Управління квартирами</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      <input
        type="text"
        placeholder="Пошук за номером або адресою"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.filtersRow}>
        <button type="button" onClick={fetchAvailableApartments} className={styles.submitButton}>
          Вільні квартири
        </button>
        <button type="button" onClick={fetchApartments} className={styles.submitButton}>
          Всі квартири
        </button>
        <input
          type="number"
          placeholder="Квартира ID"
          value={lookupId}
          onChange={(event) => setLookupId(event.target.value)}
          className={styles.inputField}
        />
        <button type="button" onClick={lookupApartmentById} className={styles.submitButton}>
          Отримати по ID
        </button>
      </div>
      <div className={styles.apartmentForm}>
        <h2>{selectedApartment ? "Редагувати квартиру" : "Додати квартиру"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputField}>
            <label>Номер квартири:</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputField}>
            <label>Поверх:</label>
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              min="1"
              max={maxFloor}
              required
              className={styles.inputField}
            />
            {selectedBuilding && (
              <small>Доступно поверхів: {selectedBuilding.number_of_floors}</small>
            )}
          </div>
          <div className={styles.inputField}>
            <label>Площа (м²):</label>
            <input
              type="number"
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputField}>
            <label>Приватизовано:</label>
            <input
              type="checkbox"
              checked={owned}
              onChange={(e) => setOwned(e.target.checked)}
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputField}>
            <select
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              required
            >
              <option value="">Оберіть будівлю</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.address || `Будівля №${b.id}`}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.submitButton}>
            {selectedApartment ? "Зберегти зміни" : "Додати квартиру"}
          </button>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
      </div>

      {loading && <p>Завантаження...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      <div className={styles.apartmentList}>
        {filteredApartments.map((apartment) => (
          <ApartmentItem
            key={apartment.id}
            apartment={apartment}
            onEdit={() => {
              setSelectedApartment(apartment);
              setNumber(apartment.number);
              setFloor(apartment.floor);
              setArea(apartment.area);
              setOwned(apartment.owned);
              setBuildingId(apartment.building_id);
            }}
            onDelete={handleDeleteApartment}
          />
        ))}
      </div>
    </div>
  );
};

export default ApartmentPage;
