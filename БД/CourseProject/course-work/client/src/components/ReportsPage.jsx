import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import styles from "../css/ReportsPage.module.css";
import { apiUrl } from "../../configs/config.js";
import { useNavigate } from "react-router-dom";
import { getSettings, savePdf, selectFolder } from "../api/settingsApi.js";
import "@fontsource/roboto/400.css";
import "../assets/Roboto-Regular-normal.js";
const reportTypes = [
  "Звіт по ролях користувачів",
  "Мешканці за поверхами",
  "Неоплачені платежі",
  "Мешканці з оплаченими платежами",
  "Незайняті квартири",
  "Кількість квартир по будинках",
];

const ReportsPage = () => {
  const [reportContent, setReportContent] = useState("");
  const [printMode, setPrintMode] = useState(false);
  const [buildingId, setBuildingId] = useState("");
  const [floor, setFloor] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [pendingReportType, setPendingReportType] = useState("");
  const [settings, setSettings] = useState({
    pdfExportPath: "",
    backupExportPath: "",
  });
  const [settingsError, setSettingsError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const navigate = useNavigate();
  const fetchBuildings = async () => {
    try {
      const res = await fetch(`${apiUrl}/buildings`);
      if (!res.ok) throw new Error("Проблема з отриманням зданий");
      const data = await res.json();
      setBuildings(data);
    } catch (err) {
      console.error("Помилка при отриманні зданий:", err);
    }
  };

  const fetchReportData = async (reportType) => {
    try {
      let response, data;

      switch (reportType) {
        case "Звіт по ролях користувачів":
          response = await fetch(`${apiUrl}/is/roles`);
          if (!response.ok) throw new Error("Проблема з отриманням даних");
          data = await response.json();
          return formatTenantsReport(data);

        case "Мешканці за поверхами":
          if (!buildingId || !floor) {
            return "Будь ласка, виберіть будинок і вкажіть поверх.";
          }
          response = await fetch(`${apiUrl}/residents/floor`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ buildingId, floor }),
          });
          if (!response.ok) {
            throw new Error("Помилка при отриманні резидентів");
          }

          data = await response.json();
          return formatResidentsByFloorReport(data, buildingId, floor);
        case "Неоплачені платежі":
          response = await fetch(`${apiUrl}/payment/unpaid`);
          if (!response.ok) throw new Error("Помилка при отриманні даних");
          data = await response.json();
          return formatUnpaidPaymentsReport(data);
        case "Мешканці з оплаченими платежами":
          response = await fetch(`${apiUrl}/payments/residents/paid`);
          if (!response.ok) throw new Error("Помилка при отриманні даних");
          data = await response.json();
          return formatResidentsByPaidPaymentsReport(data);
        case "Незайняті квартири":
          response = await fetch(`${apiUrl}/apartments/free`);
          if (!response.ok) throw new Error("Помилка при отриманні даних");
          data = await response.json();
          return formatFreeApartmentsReport(data);
        case "Кількість квартир по будинках":
          response = await fetch(`${apiUrl}/apartments/buildings`);
          if (!response.ok) throw new Error("Помилка при отриманні даних");
          data = await response.json();
          return formatApartmentsByBuildingsReport(data);

        default:
          return `Отчет: ${reportType}\nДата: ${new Date().toLocaleDateString()}\n\n[Заглушка — нет обработчика]`;
      }
    } catch (error) {
      console.error("Помилка при отриманні звіту:", error);
      return "Помилка при завантаженні даних звіту.";
    }
  };
  const formatApartmentsByBuildingsReport = (data) => {
    let result = `Звіт: Кількість квартир по будинках\nДата: ${new Date().toLocaleDateString()}\n\n`;

    if (!data || data.length === 0) return result + "Даних не знайдено.";

    data.forEach(({ address, apartment_count }, index) => {
      result += `${index + 1}. ${address} — ${apartment_count} квартир\n`;
    });

    return result;
  };

  const formatFreeApartmentsReport = (apartments) => {
    let result = `Звіт: Незайняті квартири\nДата: ${new Date().toLocaleDateString()}\n\n`;
    if (!apartments || apartments.length === 0)
      return result + "Всі квартири зайняті.";

    apartments.forEach((apartment, index) => {
      result += `${index + 1}. Квартира №${apartment.number}, Поверх: ${
        apartment.floor
      }, Площа: ${apartment.area} м²\n`;
    });

    return result;
  };

  const formatResidentsByPaidPaymentsReport = (residents) => {
    let result = `Звіт: Мешканці з оплаченими платежами\nДата: ${new Date().toLocaleDateString()}\n\n`;
    if (!residents || residents.length === 0)
      return result + "Немає мешканців з оплатами.";
    console.log(residents);
    residents.forEach(
      ({ full_name, apartment_number, total_paid_payments }, index) => {
        result += `${
          index + 1
        }. ФІО: ${full_name} — кв. ${apartment_number}. Кількість оплачених платежів: ${total_paid_payments}\n`;
      },
    );

    return result;
  };

  const formatUnpaidPaymentsReport = (data) => {
    const total = data.total_unpaid || 0;
    return `Звіт: Неоплачені платежі\nДата: ${new Date().toLocaleDateString()}\n\nЗагальна сума: ${total} грн`;
  };

  const formatTenantsReport = (roles) => {
    let result = `Звіт по ролях користувачів\nДата: ${new Date().toLocaleDateString()}\n\n`;
    if (!roles || roles.length === 0) return result + "Немає даних.";

    roles.forEach(({ role, count }, index) => {
      result += `${index + 1}. Роль: ${role} — ${count} людей\n`;
    });

    return result;
  };

  const formatResidentsByFloorReport = (residents, buildingId, floor) => {
    let result = `Звіт: Мешканці за поверхами\nДата: ${new Date().toLocaleDateString()}\n`;
    result += `Будівля ID: ${buildingId}, Поверх: ${floor}\n\n`;

    if (!residents || residents.length === 0) {
      return result + "Немає даних.";
    }

    residents.forEach(({ full_name, apartment_number }, index) => {
      result += `${index + 1}. ${full_name} — кв. ${apartment_number}\n`;
    });

    return result;
  };

  const loadSettings = async () => {
    setSettingsError("");
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setSettingsError(
        `Не вдалося завантажити налаштування. Помилка: ${err.message}`,
      );
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handlePickPdfFolder = async () => {
    setSettingsError("");
    setSettingsMessage("");
    try {
      const result = await selectFolder("pdfExportPath");
      if (result?.error) {
        setSettingsError(result.error);
        return;
      }
      if (result && !result.canceled) {
        setSettings(
          result.settings || { ...settings, pdfExportPath: result.path },
        );
      }
    } catch (err) {
      setSettingsError(`Не вдалося вибрати папку. Помилка: ${err.message}`);
    }
  };

  const ensurePdfFolder = async () => {
    if (settings.pdfExportPath) {
      return settings.pdfExportPath;
    }
    const result = await selectFolder("pdfExportPath");
    if (result?.error) {
      setSettingsError(result.error);
      return "";
    }
    if (result && !result.canceled && result.path) {
      setSettings(
        result.settings || { ...settings, pdfExportPath: result.path },
      );
      return result.path;
    }
    return "";
  };

  const generatePDF = async (text) => {
    const doc = new jsPDF();
    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(12);
    doc.text(text, 10, 10);

    const fileName = `report-${new Date().toISOString().slice(0, 10)}.pdf`;
    if (window.electronApi && window.electronApi.savePdf) {
      const folderPath = await ensurePdfFolder();
      if (folderPath) {
        const pdfData = doc.output("arraybuffer");
        const result = await savePdf(pdfData, fileName, folderPath);
        if (result && result.savedPath) {
          setSettingsMessage(`Збережено у: ${result.savedPath}`);
          return;
        }
      }
    }

    doc.save(fileName);
  };

  const askToPrintAndDownload = async (text) => {
    const wantsToPrint = window.confirm("Хотите роздрукувати звіт?");
    if (wantsToPrint) {
      setPrintMode(true);
    }

    const wantsToDownload = window.confirm("Скачати PDF файл?");
    if (wantsToDownload) {
      await generatePDF(text);
    }
  };

  const handleGenerate = async (type) => {
    if (type === "Мешканці за поверхами") {
      setPendingReportType(type);
      setShowFloorForm(true);
      await fetchBuildings();
      return;
    }

    const data = await fetchReportData(type);
    setReportContent(data);
    await askToPrintAndDownload(data);
  };

  const handleFloorSubmit = async () => {
    const data = await fetchReportData(pendingReportType);
    setReportContent(data);
    setShowFloorForm(false);
    await askToPrintAndDownload(data);
  };

  useEffect(() => {
    if (printMode && reportContent) {
      setTimeout(() => {
        window.print();
        setPrintMode(false);
      }, 300);
    }
  }, [printMode, reportContent]);
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div
      className={`${styles.reportsPage} ${printMode ? styles.printMode : ""}`}
    >
      <h1>Звіти</h1>
      <button onClick={handleBack} className={styles.backButton}>
        Повернутися назад
      </button>

      <div className={styles.settingsPanel}>
        <div className={styles.settingsRow}>
          <span>Папка для PDF:</span>
          <span className={styles.pathValue}>
            {settings.pdfExportPath || "Не вибрано"}
          </span>
          <button
            type="button"
            onClick={handlePickPdfFolder}
            className={styles.settingsButton}
          >
            Вибрати
          </button>
        </div>
        {settingsMessage && (
          <p className={styles.settingsMessage}>{settingsMessage}</p>
        )}
        {settingsError && (
          <p className={styles.settingsError}>{settingsError}</p>
        )}
      </div>

      <div className={styles.actions}>
        {reportTypes.map((type, index) => (
          <button
            key={index}
            onClick={() => handleGenerate(type)}
            className={styles.reportButton}
          >
            {type}
          </button>
        ))}
      </div>

      {showFloorForm && (
        <div className={styles.inputRow}>
          <label>
            Здание:
            <select
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
            >
              <option value="">Виберіть будинок</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || `Будинок №${b.id}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Поверх:
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </label>
          <button onClick={handleFloorSubmit}>Сгенерувати звіт</button>
        </div>
      )}

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={printMode}
          onChange={() => setPrintMode(!printMode)}
        />
        Режим друку
      </label>

      {reportContent && (
        <div className={styles.reportPreview}>
          <h2>Огляд звіту</h2>
          <pre>{reportContent}</pre>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
