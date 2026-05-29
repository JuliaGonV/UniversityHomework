import React, { useState, useEffect } from "react";
import "../css/RegisterForm.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
import { logEvent } from "../../configs/logEvent.js";
const RegisterForm = () => {
  const [role, setRole] = useState("мешканець");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [phone, setPhone] = useState("");
  const [registeredAt, setRegisteredAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [availableApartments, setAvailableApartments] = useState([]);
  const [apartmentsError, setApartmentsError] = useState("");
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [buildingsError, setBuildingsError] = useState("");

  const navigate = useNavigate();

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  useEffect(() => {
    if (role === "мешканець") {
      const fetchBuildings = async () => {
        try {
          const response = await fetch(`${apiUrl}/buildings`);
          if (!response.ok) throw new Error("Не вдалося завантажити будівлі");
          const data = await response.json();
          setAvailableBuildings(data);
          data.map((building) => {
            console.log(building);
          });
          console.log(data);
          // logEvent(
          //   JSON.parse(sessionStorage.getItem("userData")).id,
          //   "fetchBuildings",
          //   "Юзер завантажив будівлі"
          // );
          setBuildingsError("");
        } catch (error) {
          setBuildingsError("Помилка: " + error.message);
        }
      };

      fetchBuildings();
    }
  }, [role]);

  useEffect(() => {
    const fetchAvailableApartments = async () => {
      if (role === "мешканець" && buildingId) {
        try {
          const response = await fetch(
            `${apiUrl}/apartments/available/${buildingId}`,
          );
          if (!response.ok)
            throw new Error("Не вдалося завантажити квартири по будівлі");
          const data = await response.json();
          // logEvent(
          //   JSON.parse(sessionStorage.getItem("userData")).id,
          //   "fetchAvailableApartments",
          //   "Юзер завантажив доступні квартири"
          // );
          if (data.length === 0) {
            setApartmentsError("Немає вільних квартир.");
            setAvailableApartments([]);
          } else {
            setAvailableApartments(data);
            setApartmentsError("");
            // logEvent(
            //   JSON.parse(sessionStorage.getItem("userData")).id,
            //   "fetchAvailableApartments",
            //   "Юзер завантажив доступні квартири"
            // );
          }
        } catch (error) {
          setApartmentsError("Помилка: " + error.message);
        }
      } else {
        setAvailableApartments([]);
        setApartmentId("");
      }
    };

    fetchAvailableApartments();
  }, [buildingId, role]);

  const isValidUkrainianPhone = (phoneNumber) => {
    if (!phoneNumber) return true;
    const phoneRegex = /^(\+380|0)[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ""));
  };

  const validatePassword = (value) => {
    if (/[^\u0020-\u007E]/.test(value)) {
      return "Пароль має містити лише латинські символи.";
    }
    if (value.length < 6) {
      return "Пароль має містити мінімум 6 символів.";
    }
    if (!/[A-Z]/.test(value)) {
      return "Пароль має містити хоча б одну велику літеру.";
    }
    if (!/[0-9]/.test(value)) {
      return "Пароль має містити хоча б одну цифру.";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Пароль має містити хоча б один спецсимвол.";
    }
    return "";
  };

  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (role === "мешканець" && phone && !isValidUkrainianPhone(phone)) {
      setError(
        "Невірний формат телефону. Використовуйте +380XXXXXXXXX або 0XXXXXXXXX",
      );
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      setError(passwordValidation);
      setLoading(false);
      return;
    }

    let roleForRequest = "";
    if (role === "мешканець") roleForRequest = "resident";
    else if (role === "адмін") roleForRequest = "admin";
    else if (role === "працівник") roleForRequest = "worker";

    const userData = {
      username,
      password_hash: password,
      email,
      role: roleForRequest,
    };

    if (role === "мешканець") {
      userData.fullName = fullName;
      userData.apartmentId = apartmentId;
      userData.buildingId = buildingId;
      userData.phone = phone;
      userData.registeredAt = registeredAt;
    }

    try {
      const userResponse = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(
          errorData.message || "Помилка при створенні користувача",
        );
      }

      const userDataResponse = await userResponse.json();
      logEvent(
        userDataResponse.id,
        "createUser",
        "Юзер створив нового користувача",
      );
      if (role === "мешканець") {
        const residentData = {
          user_id: userDataResponse.id,
          full_name: fullName,
          apartment_id: apartmentId,
          phone,
          registered_at: registeredAt,
          building_id: buildingId,
        };

        console.log(residentData);

        const residentResponse = await fetch(`${apiUrl}/residents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(residentData),
        });

        if (!residentResponse.ok)
          throw new Error("Помилка при створенні жильця");

        const residentDataResponse = await residentResponse.json();
        console.log("Жилец создан:", residentDataResponse);

        logEvent(
          residentDataResponse.id,
          "createResident",
          "Юзер створив нового мешканця",
        );
        sessionStorage.setItem(
          "userData",
          JSON.stringify(residentDataResponse),
        );
        console.log(apartmentId, userDataResponse.id);

        const apartmentStatusResponse = await fetch(
          `${apiUrl}/apartments/status/${apartmentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owned: true, user_id: userDataResponse.id }),
          },
        );

        if (!apartmentStatusResponse.ok)
          throw new Error("Помилка при оновленні статусу квартири");

        const apartmentStatusResponseData =
          await apartmentStatusResponse.json();
        console.log("Статус квартиры обновлен:", apartmentStatusResponseData);
        logEvent(
          apartmentStatusResponseData.id,
          "updateApartmentStatus",
          "Юзер оновив статус квартири",
        );
      }

      sessionStorage.setItem("userRole", userDataResponse.role);

      alert("Користувач та юзер успішно створені!");
      navigate("/main");

      setUsername("");
      setPassword("");
      setEmail("");
      setFullName("");
      setApartmentId("");
      setBuildingId("");
      setPhone("");
      setRegisteredAt("");
    } catch (error) {
      setError("Ошибка: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <h1 className="register-form-title">Реєстрація</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Оберіть роль:</label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="input-field"
          >
            <option value="мешканець">Мешканець</option>
            <option value="адмін">Адмін</option>
            <option value="працівник">Працівник</option>
          </select>
        </div>

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
            value={password}
            onChange={(e) => {
              const rawValue = e.target.value;
              const nextValue = rawValue.replace(/[^\u0020-\u007E]/g, "");
              setPassword(nextValue);
              if (rawValue !== nextValue) {
                setPasswordError("Пароль має містити лише латинські символи.");
              } else {
                setPasswordError(validatePassword(nextValue));
              }
            }}
            required
            className="input-field"
          />
          <ul className="password-hints">
            <li className={passwordChecks.length ? "ok" : ""}>
              Мінімум 6 символів
            </li>
            <li className={passwordChecks.uppercase ? "ok" : ""}>
              Одна велика літера
            </li>
            <li className={passwordChecks.digit ? "ok" : ""}>Одна цифра</li>
            <li className={passwordChecks.special ? "ok" : ""}>
              Один спецсимвол
            </li>
          </ul>
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>

        <div className="form-group">
          <label>Електронна пошта:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>

        {role === "мешканець" && (
          <>
            <div className="form-group">
              <label>ФІО:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Оберіть будівлю:</label>
              {buildingsError ? (
                <p className="error-message">{buildingsError}</p>
              ) : (
                <select
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Оберіть будівлю</option>
                  {availableBuildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      №{building.id} (Адреса: {building.address}, Поверхів:{" "}
                      {building.number_of_floors})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Оберіть квартиру:</label>
              {apartmentsError ? (
                <p className="error-message">{apartmentsError}</p>
              ) : (
                <select
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Оберіть квартиру</option>
                  {availableApartments.map((apartment) => (
                    <option key={apartment.id} value={apartment.id}>
                      №{apartment.number} (Поверх {apartment.floor}, Площа{" "}
                      {apartment.area} м²)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Телефон:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (
                    e.target.value &&
                    !isValidUkrainianPhone(e.target.value)
                  ) {
                    setPhoneError(
                      "Формат: +380XXXXXXXXX або 0XXXXXXXXX (9 цифр)",
                    );
                  } else {
                    setPhoneError("");
                  }
                }}
                className="input-field"
                placeholder="+380XXXXXXXXX"
              />
              {phoneError && <p className="error-message">{phoneError}</p>}
            </div>

            <div className="form-group">
              <label>Дата реєстрації:</label>
              <input
                type="date"
                value={registeredAt}
                onChange={(e) => setRegisteredAt(e.target.value)}
                className="input-field"
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Завантаження..." : "Зареєструватися"}
        </button>

        <div>
          Вже є аккаунт? <a href="/login">Увійдіть тут</a>
        </div>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterForm;
