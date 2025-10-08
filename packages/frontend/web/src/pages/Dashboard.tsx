import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Activity, 
  TrendingUp, 
  Car, 
  CheckCircle, 
  Clock, 
  Radio,
  MapPin,
  DollarSign,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { RevenueChart } from "../components/charts/RevenueChart";
import { PaymentMethodsChart } from "../components/charts/PaymentMethodsChart";
import { UserRegistrationsChart } from "../components/charts/UserRegistrationsChart";
import { TripCompletionChart } from "../components/charts/TripCompletionChart";
import statsService from "../services/stats.service";
import type { DashboardStats } from "../services/stats.service";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Composant de card moderne avec animations
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    onClick, 
    icon: Icon,
    gradient = "from-blue-500 to-indigo-600",
    index = 0
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    onClick: () => void;
    icon: React.ElementType;
    gradient?: string;
    index?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative bg-gradient-to-br from-white to-gray-50">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {subtitle}
                </p>
              )}
            </div>
            <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-12 w-12 text-rose-600" />
        </motion.div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        Impossible de charger les statistiques
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      {/* Header moderne */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre plateforme</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchStats}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </motion.button>
      </div>

      {/* Utilisateurs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg shadow-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Utilisateurs</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            title="Total inscrits"
            value={stats.users.total}
            subtitle={`+${stats.users.new_month} ce mois`}
            onClick={() => navigate('/dashboard/users')}
            icon={Users}
            gradient="from-violet-500 to-fuchsia-600"
            index={0}
          />

          <StatCard
            title="Nouveaux aujourd'hui"
            value={stats.users.new_today}
            subtitle={`+${stats.users.new_week} cette semaine`}
            onClick={() => navigate('/dashboard/users?filter=new_today')}
            icon={UserPlus}
            gradient="from-fuchsia-500 to-pink-600"
            index={1}
          />

          <StatCard
            title="Utilisateurs actifs"
            value={stats.users.active_7days}
            subtitle="Derniers 7 jours"
            onClick={() => navigate('/dashboard/users?filter=active')}
            icon={Activity}
            gradient="from-pink-500 to-rose-600"
            index={2}
          />

          <StatCard
            title="Taux de rétention"
            value={`${stats.users.retention_rate.toFixed(1)}%`}
            subtitle="Actifs / Total"
            onClick={() => navigate('/dashboard/users?filter=active')}
            icon={TrendingUp}
            gradient="from-rose-500 to-red-600"
            index={3}
          />
        </div>
      </motion.section>

      {/* Chauffeurs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-lg shadow-lg">
            <Car className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Chauffeurs</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            title="Total chauffeurs"
            value={stats.drivers.total}
            onClick={() => navigate('/dashboard/drivers')}
            icon={Car}
            gradient="from-fuchsia-500 to-pink-600"
            index={0}
          />

          <StatCard
            title="Approuvés"
            value={stats.drivers.approved}
            onClick={() => navigate('/dashboard/drivers?kyc=approved')}
            icon={CheckCircle}
            gradient="from-emerald-500 to-green-600"
            index={1}
          />

          <StatCard
            title="En attente"
            value={stats.drivers.pending}
            onClick={() => navigate('/dashboard/drivers?kyc=pending')}
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
            index={2}
          />

          <StatCard
            title="En ligne"
            value={stats.drivers.online}
            subtitle={`⭐ ${stats.drivers.average_rating} note moy.`}
            onClick={() => navigate('/dashboard/drivers')}
            icon={Radio}
            gradient="from-violet-500 to-purple-600"
            index={3}
          />
        </div>
      </motion.section>

      {/* Courses */}
      {stats.trips.total_trips > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Courses</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              title="Total courses"
              value={stats.trips.total_trips}
              onClick={() => navigate('/dashboard/trips')}
              icon={MapPin}
              gradient="from-amber-500 to-orange-600"
              index={0}
            />

            <StatCard
              title="Aujourd'hui"
              value={stats.trips.trips_today}
              subtitle={`+${stats.trips.trips_week} cette semaine`}
              onClick={() => navigate('/dashboard/trips')}
              icon={Activity}
              gradient="from-orange-500 to-red-600"
              index={1}
            />

            <StatCard
              title="Complétées"
              value={stats.trips.completed_trips}
              onClick={() => navigate('/dashboard/trips?status=completed')}
              icon={CheckCircle}
              gradient="from-emerald-500 to-green-600"
              index={2}
            />

            <StatCard
              title="Taux complétion"
              value={`${stats.trips.completion_rate.toFixed(1)}%`}
              onClick={() => navigate('/dashboard/trips')}
              icon={TrendingUp}
              gradient="from-pink-500 to-rose-600"
              index={3}
            />
          </div>
        </motion.section>
      )}

      {/* Revenus */}
      {stats.revenue.total_revenue > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Revenus</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              title="Total revenus"
              value={`${stats.revenue.total_revenue.toLocaleString()} FG`}
              onClick={() => navigate('/dashboard/finance')}
              icon={DollarSign}
              gradient="from-emerald-500 to-green-600"
              index={0}
            />

            <StatCard
              title="Aujourd'hui"
              value={`${stats.revenue.revenue_today.toLocaleString()} FG`}
              onClick={() => navigate('/dashboard/finance')}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-600"
              index={1}
            />

            <StatCard
              title="Cette semaine"
              value={`${stats.revenue.revenue_week.toLocaleString()} FG`}
              onClick={() => navigate('/dashboard/finance')}
              icon={Activity}
              gradient="from-teal-500 to-cyan-600"
              index={2}
            />

            <StatCard
              title="Ce mois"
              value={`${stats.revenue.revenue_month.toLocaleString()} FG`}
              onClick={() => navigate('/dashboard/finance')}
              icon={BarChart3}
              gradient="from-cyan-500 to-blue-600"
              index={3}
            />
          </div>
        </motion.section>
      )}

      {/* Analytics Section */}
      {stats && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Analytics</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <RevenueChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <PaymentMethodsChart />
            </motion.div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <UserRegistrationsChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <TripCompletionChart />
            </motion.div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
