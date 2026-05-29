import { apiUrl } from "../../configs/config.js";

const getJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || "Помилка при запиті до API");
  }
  return data;
};

export const analyticsApi = {
  getDebtByBuilding: () => getJson(`${apiUrl}/payments/debt/by-building`),
  getDebtByResident: () => getJson(`${apiUrl}/payments/debt/by-resident`),
  getTopDebtors: (limit = 10) =>
    getJson(`${apiUrl}/payments/debt/top?limit=${limit}`),
  getAllDebtors: () => getJson(`${apiUrl}/payments/debtors`),
  payAllDebtsByResidentId: (residentId) =>
    getJson(`${apiUrl}/payments/resident/${residentId}/pay-all-debts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    }),
  getCollectionRateByMonth: () =>
    getJson(`${apiUrl}/payments/collection-rate/by-month`),
  getOverdueRequests: (days = 7) =>
    getJson(`${apiUrl}/requests/overdue?days=${days}`),
  getRequestStatsByStatus: () => getJson(`${apiUrl}/requests/stats/by-status`),
  getAverageCloseTime: () => getJson(`${apiUrl}/requests/avg-close-time`),
  getWorkloadByWorker: () => getJson(`${apiUrl}/orders/workload/by-worker`),
  getOccupancyByBuilding: () =>
    getJson(`${apiUrl}/apartments/occupancy/by-building`),
  getUserActivity: (days = 30) =>
    getJson(`${apiUrl}/audit/activity/users?days=${days}`),
};
