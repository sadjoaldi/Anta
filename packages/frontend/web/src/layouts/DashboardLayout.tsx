import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
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
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-violet-50 to-fuchsia-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <RefreshCw className="h-12 w-12 text-rose-600" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            Chargement...
          </motion.p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-rose-50/50 via-violet-50/30 to-fuchsia-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
