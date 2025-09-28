import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import AppSidebar from "../components/AppSidebar";

export default function DashboardLayout() {
  return (
    <div className="h-screen w-screen grid grid-rows-[56px_1fr]">
      <Topbar />
      <div className="grid grid-cols-[256px_1fr] h-full overflow-hidden">
        <AppSidebar />
        <main className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
