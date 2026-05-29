import React, { useState, useEffect } from "react";
import styles from "../css/ExpensesPage.module.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
import { logEvent } from "../../configs/logEvent.js";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${apiUrl}/expenses`);
      const data = await response.json();
      setExpenses(data);
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "fetchExpenses",
        "Юзер завантажив витрати"
      );
    } catch (err) {
      setError("Помилка при завантаженні даних: " + err.message);
    }
  };

  const addExpense = async () => {
    if (!description || !amount || !date || !category) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, amount, date, category }),
      });

      const data = await response.json();
      setExpenses([...expenses, data]);
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "addExpense",
        "Юзер добавил витрату"
      );
      resetForm();
    } catch (err) {
      setError("Помилка при додаванні витрати: " + err.message);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const editExpense = async () => {
    if (!description || !amount || !date || !category) {
      setError("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/expenses/${currentExpense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, amount, date, category }),
      });

      const data = await response.json();
      setExpenses(
        expenses.map((expense) =>
          expense.id === currentExpense.id ? data : expense
        )
      );
      resetForm();
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "editExpense",
        "Юзер обновил витрату"
      );
    } catch (err) {
      setError("Помилка при редагуванні витрати: " + err.message);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей витрат?")) return;
    try {
      await fetch(`${apiUrl}/expenses/${id}`, {
        method: "DELETE",
      });
      logEvent(
        JSON.parse(sessionStorage.getItem("userData")).id,
        "deleteExpense",
        "Юзер удалил витрату"
      );
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (err) {
      setError("Помилка при видаленні витрати: " + err.message);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate("");
    setCategory("");
    setEditing(false);
    setCurrentExpense(null);
  };

  const startEditing = (expense) => {
    setDescription(expense.description);
    setAmount(expense.amount);
    setDate(expense.date);
    setCategory(expense.category);
    setEditing(true);
    setCurrentExpense(expense);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    console.log(expense.date);
    return (
      expense.description.toLowerCase().includes(normalizedSearchTerm) ||
      expense.amount.toString().includes(normalizedSearchTerm) ||
      expense.date.includes(normalizedSearchTerm) ||
      expense.category.toLowerCase().includes(normalizedSearchTerm)
    );
  });

  return (
    <div className={styles.expensesPage}>
      <h1>Управління витратами</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Пошук витрат"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.expensesForm}>
        <h2>{editing ? "Редагувати витрату" : "Додати витрату"}</h2>
        <label>Опис:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.inputField}
        />
        <label>Сума:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.inputField}
        />
        <label>Дата:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.inputField}
        />
        <label>Категорія:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.inputField}
        />

        <button
          onClick={editing ? editExpense : addExpense}
          className={styles.submitButton}
        >
          {editing ? "Оновити" : "Додати"}
        </button>
      </div>

      <h2>Список витрат</h2>
      <div className={styles.expensesList}>
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className={styles.expenseItem}>
            <p>Опис: {expense.description}</p>
            <p>Сума: {expense.amount}</p>
            <p>Дата: {new Date(expense.date).toLocaleDateString()}</p>
            <p>Категорія: {expense.category}</p>
            <div>
              <button
                onClick={() => startEditing(expense)}
                className={styles.editButton}
              >
                Редагувати
              </button>
              <button
                onClick={() => deleteExpense(expense.id)}
                className={styles.editButton}
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesPage;
