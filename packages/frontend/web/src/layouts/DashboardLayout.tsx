import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  return (
    <div className="h-screen w-screen grid grid-rows-[56px_1fr]">
      <Topbar />
      <div className="grid grid-cols-[256px_1fr] h-full overflow-hidden">
        <AppSidebar />
        <main className="h-full overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
