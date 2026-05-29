import React, { useCallback, useState, useEffect } from "react";
import styles from "../css/AnnouncementsPage.module.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
import { logEvent } from "../../configs/logEvent.js";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const userRole = sessionStorage.getItem("userRole");
  const authorId = user?.user_id || user?.id || null;
  const canManageAnnouncement = (announcement) =>
    userRole === "admin" || Number(announcement.author_id) === Number(authorId);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredAnnouncements(announcements);
    } else {
      setFilteredAnnouncements(
        announcements.filter(
          (announcement) =>
            announcement.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            announcement.message
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, announcements]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/announcements`);
      const data = await response.json();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
      logEvent(authorId, "fetchAnnouncements", "Юзер завантажив об’яви");
    } catch (err) {
      setError("Ошибка при загрузке данных: " + err.message);
    }
  }, [authorId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const fetchAnnouncementsByAuthor = async () => {
    if (!authorFilter.trim()) return fetchAnnouncements();

    try {
      const response = await fetch(`${apiUrl}/announcements/author/${authorFilter}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Оголошення автора не знайдено");
      }
      setAnnouncements(data);
      setFilteredAnnouncements(data);
      logEvent(authorId, "filterAnnouncementsByAuthor", "Юзер відфільтрував оголошення за автором");
    } catch (err) {
      setAnnouncements([]);
      setFilteredAnnouncements([]);
      setError("Помилка при фільтрації оголошень: " + err.message);
    }
  };

  const addAnnouncement = async () => {
    if (!title || !message || !authorId) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, message, authorId }),
      });

      const data = await response.json();
      setAnnouncements([...announcements, data]);
      logEvent(authorId, "addAnnouncements", "Юзер створив об’яву");
      resetForm();
    } catch (err) {
      setError("Помилка при добавленні оголошення: " + err.message);
    }
  };

  const editAnnouncement = async () => {
    if (!title || !message || !authorId) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/announcements/${currentAnnouncement.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            message,
            authorId,
            actorId: authorId,
            actorRole: userRole,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Помилка при редагуванні оголошення");
      }
      setAnnouncements(
        announcements.map((announcement) =>
          announcement.id === currentAnnouncement.id ? data : announcement
        )
      );
      logEvent(authorId, "editAnnouncements", "Юзер редагував об’яву");
      resetForm();
    } catch (err) {
      setError("Помилка при редагуванні оголошення: " + err.message);
    }
  };

  const deleteAnnouncement = async (id) => {
    const announcement = announcements.find((item) => item.id === id);
    if (!announcement || !canManageAnnouncement(announcement)) {
      setError("Не можна видаляти чуже оголошення.");
      return;
    }
    if (!window.confirm("Видалити це оголошення?")) return;
    try {
      const response = await fetch(
        `${apiUrl}/announcements/${id}?actorId=${authorId}&actorRole=${userRole}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || "Помилка при видаленні оголошення");
      }
      setAnnouncements(
        announcements.filter((announcement) => announcement.id !== id)
      );
      logEvent(authorId, "deleteAnnouncements", "Юзер видалив об’яву");
    } catch (err) {
      setError("Помилка при видаленні оголошення: " + err.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setEditing(false);
    setCurrentAnnouncement(null);
  };

  const startEditing = (announcement) => {
    if (!canManageAnnouncement(announcement)) {
      setError("Не можна редагувати чуже оголошення.");
      return;
    }
    setTitle(announcement.title);
    setMessage(announcement.message);
    setEditing(true);
    setCurrentAnnouncement(announcement);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.announcementsPage}>
      <h1>Управління оголошеннями</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.searchBox}>
        <label>Пошук:</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук по заголовку або повідомленню..."
          className={styles.inputField}
        />
        <input
          type="number"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          placeholder="Автор ID"
          className={styles.inputField}
        />
        <button onClick={fetchAnnouncementsByAuthor} className={styles.submitButton}>
          За автором
        </button>
        <button onClick={fetchAnnouncements} className={styles.submitButton}>
          Скинути
        </button>
      </div>

      <div className={styles.announcementsForm}>
        <h2>{editing ? "Редагувати оголошення" : "Додати оголошення"}</h2>
        <label>Назва:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.inputField}
        />
        <label>Повідомлення:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.inputField}
        />

        <button
          onClick={editing ? editAnnouncement : addAnnouncement}
          className={styles.submitButton}
        >
          {editing ? "Оновити" : "Додати"}
        </button>
      </div>

      <h2>Список оголошень</h2>

      <div className={styles.announcementsList}>
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className={styles.announcementItem}>
            <h3>{announcement.title}</h3>
            <p>{announcement.message}</p>
            <p>Автор ID: {announcement.author_id}</p>
            <p>
              Дата: {new Date(announcement.created_at).toLocaleDateString()}
            </p>
            {canManageAnnouncement(announcement) && (
              <div>
                <button
                  onClick={() => startEditing(announcement)}
                  className={styles.editButton}
                >
                  Редагувати
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className={styles.deleteButton}
                >
                  Видалити
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
