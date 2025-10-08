import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Finance from "./pages/Finance";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Promotions from "./pages/Promotions";
import Stats from "./pages/Stats";
import Trips from "./pages/Trips";
import Users from "./pages/Users";
import AdminLogs from "./pages/AdminLogs";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/orders" element={<Orders />} />
        <Route path="dashboard/users" element={<Users />} />
        <Route path="dashboard/clients" element={<Clients />} />
        <Route path="dashboard/drivers" element={<Drivers />} />
        <Route path="dashboard/trips" element={<Trips />} />
        <Route path="dashboard/finance" element={<Finance />} />
        <Route path="dashboard/promotions" element={<Promotions />} />
        <Route path="dashboard/logs" element={<AdminLogs />} />
        <Route path="dashboard/stats" element={<Stats />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
