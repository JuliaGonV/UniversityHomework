import "./App.css";
import RegisterForm from "./components/RegisterForm";
import LoginPage from "./components/LoginForm";
import MainPage from "./components/MainPage";
import ResidentsPage from "./components/ResidentPage";
import ApartmentPage from "./components/ApartmentPage";
import BuildingsPage from "./components/BuildingsPage";
import Payments from "./components/PaymentsPage";
import MaintenanceRequestsPage from "./components/MaintenanceRequestsPage";
import WorkOrdersPage from "./components/WorkOrderPage";
import ExpensesPage from "./components/ExpensesPage";
import AnnouncementsPage from "./components/AnnouncementsPage";
import EventLogPage from "./components/EventLogPage";
import BackupManager from "./components/BackupPage";
import ReportsPage from "./components/ReportsPage";
import AnalyticsPage from "./components/AnalyticsPage";
import ServicesPage from "./components/ServicesPage";
import UsersPage from "./components/UsersPage";
import { useAuthCheck } from "./hooks/useAuthCheck";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const ProtectedRoute = ({ roles, children }) => {
  const isAuthorized = useAuthCheck(roles);

  if (isAuthorized === null) return null;
  if (!isAuthorized) {
    return <Navigate to={sessionStorage.getItem("userRole") ? "/main" : "/login"} />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Основные страницы */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/main"
          element={
            <ProtectedRoute roles="loggedIn">
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/residents"
          element={
            <ProtectedRoute roles="admin">
              <ResidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apartments"
          element={
            <ProtectedRoute roles="admin">
              <ApartmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buildings"
          element={
            <ProtectedRoute roles="admin">
              <BuildingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute roles={["resident", "admin"]}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-requests"
          element={
            <ProtectedRoute roles="resident">
              <MaintenanceRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-orders"
          element={
            <ProtectedRoute roles="worker">
              <WorkOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute roles={["admin", "worker"]}>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute roles={["admin", "resident"]}>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-log"
          element={
            <ProtectedRoute roles="admin">
              <EventLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <ProtectedRoute roles="admin">
              <BackupManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles="admin">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute roles="admin">
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        {/* Редирект на главную страницу для несуществующих маршрутов */}
      </Routes>
    </Router>
  );
}

export default App;
