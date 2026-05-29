import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsApi } from "../api/analyticsApi.js";
import styles from "../css/AnalyticsPage.module.css";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [topLimit, setTopLimit] = useState(10);
  const [overdueDays, setOverdueDays] = useState(7);
  const [activityDays, setActivityDays] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [debtByBuilding, setDebtByBuilding] = useState([]);
  const [debtByResident, setDebtByResident] = useState([]);
  const [topDebtors, setTopDebtors] = useState([]);
  const [allDebtors, setAllDebtors] = useState([]);
  const [collectionRate, setCollectionRate] = useState([]);

  const [overdueRequests, setOverdueRequests] = useState([]);
  const [requestStats, setRequestStats] = useState([]);
  const [avgClose, setAvgClose] = useState(null);

  const [workloadByWorker, setWorkloadByWorker] = useState([]);
  const [occupancyByBuilding, setOccupancyByBuilding] = useState([]);
  const [userActivity, setUserActivity] = useState([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        debtBuildingData,
        debtResidentData,
        topDebtorsData,
        allDebtorsData,
        collectionRateData,
        overdueData,
        requestStatsData,
        avgCloseData,
        workloadData,
        occupancyData,
        userActivityData,
      ] = await Promise.all([
        analyticsApi.getDebtByBuilding(),
        analyticsApi.getDebtByResident(),
        analyticsApi.getTopDebtors(topLimit),
        analyticsApi.getAllDebtors(),
        analyticsApi.getCollectionRateByMonth(),
        analyticsApi.getOverdueRequests(overdueDays),
        analyticsApi.getRequestStatsByStatus(),
        analyticsApi.getAverageCloseTime(),
        analyticsApi.getWorkloadByWorker(),
        analyticsApi.getOccupancyByBuilding(),
        analyticsApi.getUserActivity(activityDays),
      ]);

      setDebtByBuilding(debtBuildingData);
      setDebtByResident(debtResidentData);
      setTopDebtors(topDebtorsData);
      setAllDebtors(allDebtorsData);
      setCollectionRate(collectionRateData);
      setOverdueRequests(overdueData);
      setRequestStats(requestStatsData);
      setAvgClose(avgCloseData);
      setWorkloadByWorker(workloadData);
      setOccupancyByBuilding(occupancyData);
      setUserActivity(userActivityData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topLimit, overdueDays, activityDays]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handlePayAllDebts = async (residentId) => {
    if (!window.confirm("Оплатити всі борги цього мешканця?")) return;
    try {
      const result = await analyticsApi.payAllDebtsByResidentId(residentId);
      alert(
        `Оплачено ${result.paid_count} платежів на суму ${result.paid_total} грн`,
      );
      loadAnalytics();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1>Аналітика</h1>
        <div className={styles.headerActions}>
          <button onClick={loadAnalytics} className={styles.primaryButton}>
            Оновити
          </button>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            Повернутися назад
          </button>
        </div>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {loading && <p>Завантаження...</p>}

      <section className={styles.section}>
        <h2>Дебіторка та оплати</h2>
        <div className={styles.controlsRow}>
          <label>
            Топ боржників:
            <input
              type="number"
              min="1"
              max="100"
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value) || 10)}
            />
          </label>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Борг по будинках</h3>
            <table>
              <thead>
                <tr>
                  <th>Будинок</th>
                  <th>Борг</th>
                </tr>
              </thead>
              <tbody>
                {debtByBuilding.map((item) => (
                  <tr key={item.building_id}>
                    <td>{item.address}</td>
                    <td>{item.total_debt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <h3>Борг по мешканцях</h3>
            <table>
              <thead>
                <tr>
                  <th>Мешканець</th>
                  <th>Борг</th>
                </tr>
              </thead>
              <tbody>
                {debtByResident.map((item) => (
                  <tr key={item.resident_id}>
                    <td>{item.full_name}</td>
                    <td>{item.total_debt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Топ боржників</h3>
            <table>
              <thead>
                <tr>
                  <th>Мешканець</th>
                  <th>Борг</th>
                </tr>
              </thead>
              <tbody>
                {topDebtors.map((item) => (
                  <tr key={item.resident_id}>
                    <td>{item.full_name}</td>
                    <td>{item.total_debt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <h3>Список усіх боржників</h3>
            <table>
              <thead>
                <tr>
                  <th>Мешканець</th>
                  <th>К-сть боргів</th>
                  <th>Сума</th>
                  <th>Дія</th>
                </tr>
              </thead>
              <tbody>
                {allDebtors.map((item) => (
                  <tr key={item.resident_id}>
                    <td>{item.full_name}</td>
                    <td>{item.unpaid_payments_count}</td>
                    <td>{item.total_debt}</td>
                    <td>
                      <button
                        className={styles.inlineButton}
                        onClick={() => handlePayAllDebts(item.resident_id)}
                      >
                        Оплатити всі
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Рівень оплат по місяцях</h3>
          <table>
            <thead>
              <tr>
                <th>Місяць</th>
                <th>Усього</th>
                <th>Оплачено</th>
                <th>% оплат</th>
              </tr>
            </thead>
            <tbody>
              {collectionRate.map((item) => (
                <tr key={item.month}>
                  <td>{new Date(item.month).toLocaleDateString("uk-UA")}</td>
                  <td>{item.total_payments}</td>
                  <td>{item.paid_payments}</td>
                  <td>{item.collection_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Ремонти та заявки</h2>
        <div className={styles.controlsRow}>
          <label>
            Прострочка (днів):
            <input
              type="number"
              min="1"
              max="365"
              value={overdueDays}
              onChange={(e) => setOverdueDays(Number(e.target.value) || 7)}
            />
          </label>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Статистика заявок</h3>
            <table>
              <thead>
                <tr>
                  <th>Статус</th>
                  <th>Кількість</th>
                </tr>
              </thead>
              <tbody>
                {requestStats.map((item) => (
                  <tr key={item.status}>
                    <td>{item.status}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <h3>Середній час закриття</h3>
            <p>Закрито заявок: {avgClose?.completed_requests || 0}</p>
            <p>Середній час: {avgClose?.avg_close_hours || 0} год</p>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Прострочені заявки</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Resident ID</th>
                <th>Тип ремонту</th>
                <th>Статус</th>
                <th>Створено</th>
              </tr>
            </thead>
            <tbody>
              {overdueRequests.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.resident_id}</td>
                  <td>{item.repair_type}</td>
                  <td>{item.status}</td>
                  <td>
                    {new Date(item.created_at).toLocaleDateString("uk-UA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Операційна аналітика</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Навантаження по працівниках</h3>
            <table>
              <thead>
                <tr>
                  <th>Працівник</th>
                  <th>Усього</th>
                  <th>Відкриті</th>
                  <th>Закриті</th>
                </tr>
              </thead>
              <tbody>
                {workloadByWorker.map((item) => (
                  <tr key={item.worker_id}>
                    <td>{item.username}</td>
                    <td>{item.total_work_orders}</td>
                    <td>{item.open_work_orders}</td>
                    <td>{item.completed_work_orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <h3>Заповненість будинків</h3>
            <table>
              <thead>
                <tr>
                  <th>Будинок</th>
                  <th>Квартир</th>
                  <th>Зайнято</th>
                  <th>Вільно</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {occupancyByBuilding.map((item) => (
                  <tr key={item.building_id}>
                    <td>{item.address}</td>
                    <td>{item.total_apartments}</td>
                    <td>{item.occupied_apartments}</td>
                    <td>{item.free_apartments}</td>
                    <td>{item.occupancy_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.controlsRow}>
          <label>
            Активність за днів:
            <input
              type="number"
              min="1"
              max="365"
              value={activityDays}
              onChange={(e) => setActivityDays(Number(e.target.value) || 30)}
            />
          </label>
        </div>

        <div className={styles.card}>
          <h3>Активність користувачів</h3>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Подій</th>
                <th>Остання подія</th>
              </tr>
            </thead>
            <tbody>
              {userActivity.map((item) => (
                <tr key={`${item.user_id}-${item.username}`}>
                  <td>{item.user_id}</td>
                  <td>{item.username}</td>
                  <td>{item.events_count}</td>
                  <td>
                    {item.last_event_at
                      ? new Date(item.last_event_at).toLocaleString("uk-UA")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
