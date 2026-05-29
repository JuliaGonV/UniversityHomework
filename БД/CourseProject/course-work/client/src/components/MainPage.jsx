import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "../hooks/useAuthCheck";
import "../css/Main.css";

const SectionCard = ({ section }) => {
  const isAuthorized = useAuthCheck(section.roles);

  if (!isAuthorized) return null;

  return (
    <div className="card">
      <h3>{section.name}</h3>
      <p>{section.description}</p>
      <button
        className="submit-button"
        onClick={() => section.navigate(section.path)}
      >
        Перейти
      </button>
    </div>
  );
};

const MainPage = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("userData");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.username) {
        setUsername(parsed.username);
      } else {
        setUsername(parsed.full_name);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    navigate("/login");
  };

  const sections = [
    {
      name: "Жителі",
      path: "/residents",
      description: "Перегляд та керування мешканцями будинку.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Квартири",
      path: "/apartments",
      description: "Інформація про квартири, поверхи, площу та власників.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Будинки",
      path: "/buildings",
      description: "Перелік будинків з адресами та характеристиками.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Платежі",
      path: "/payments",
      description: "Контроль оплати послуг мешканцями.",
      roles: ["resident", "admin"],
      navigate,
    },
    {
      name: "Заявки на обслуговування",
      path: "/maintenance-requests",
      description: "Звернення мешканців щодо ремонту або техобслуговування.",
      roles: ["resident"],
      navigate,
    },
    {
      name: "Робочі наряди",
      path: "/work-orders",
      description: "Наряди для працівників за заявками.",
      roles: ["worker"],
      navigate,
    },
    {
      name: "Витрати",
      path: "/expenses",
      description: "Фіксація витрат компанії за категоріями.",
      roles: ["admin", "worker"],
      navigate,
    },
    {
      name: "Оголошення",
      path: "/announcements",
      description: "Повідомлення та новини для мешканців.",
      roles: ["admin", "resident"],
      navigate,
    },
    {
      name: "Журнал подій",
      path: "/event-log",
      description: "Лог змін та дій користувачів у системі.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Резервні копії",
      path: "/backup",
      description: "Історія резервного копіювання та відновлення.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Звіти",
      path: "/reports",
      description: "Генерація звітів за різними категоріями.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Послуги",
      path: "/services",
      description: "Тарифи та довідник послуг для нарахувань.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Користувачі",
      path: "/users",
      description: "Керування акаунтами, ролями та пошук користувачів.",
      roles: ["admin"],
      navigate,
    },
    {
      name: "Аналітика",
      path: "/analytics",
      description: "Борги, ремонти, навантаження працівників та активність.",
      roles: ["admin"],
      navigate,
    },
  ];

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <div className="header">
          <h1 className="homepage-title">Ласкаво просимо, {username}!</h1>
          <button className="logout-button" onClick={handleLogout}>
            Вийти з акаунту
          </button>
        </div>
        <p className="homepage-subtitle">
          Система керуючої компанії для багатоквартирного будинку. Оберіть
          розділ:
        </p>

        <div className="cards-grid">
          {sections.map((section) => (
            <SectionCard key={section.path} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
