import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import AppSidebar from "../components/AppSidebar";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
