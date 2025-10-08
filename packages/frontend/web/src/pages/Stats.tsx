import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Car, MapPin, DollarSign, TrendingUp, Activity, Star } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import statsService from "../services/stats.service";
import type { DashboardStats } from "../services/stats.service";

export default function Stats() {
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

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon,
    gradient,
    index = 0
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: React.ElementType;
    gradient: string;
    index?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
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
          <BarChart3 className="h-12 w-12 text-violet-600" />
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
      {/* Header */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Statistiques Globales
          </h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble des performances</p>
        </div>
      </motion.div>

      {/* Utilisateurs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-violet-600" />
          Utilisateurs
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            title="Total utilisateurs"
            value={stats.users.total}
            subtitle={`+${stats.users.new_month} ce mois`}
            icon={Users}
            gradient="from-violet-500 to-fuchsia-600"
            index={0}
          />
          <StatCard
            title="Nouveaux (7j)"
            value={stats.users.new_week}
            subtitle={`${stats.users.new_today} aujourd'hui`}
            icon={Activity}
            gradient="from-fuchsia-500 to-pink-600"
            index={1}
          />
          <StatCard
            title="Utilisateurs actifs"
            value={stats.users.active_7days}
            subtitle="Derniers 7 jours"
            icon={Activity}
            gradient="from-pink-500 to-rose-600"
            index={2}
          />
          <StatCard
            title="Taux rétention"
            value={`${stats.users.retention_rate.toFixed(1)}%`}
            subtitle="Actifs / Total"
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Car className="h-6 w-6 text-indigo-600" />
          Chauffeurs
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            title="Total chauffeurs"
            value={stats.drivers.total}
            icon={Car}
            gradient="from-indigo-500 to-purple-600"
            index={0}
          />
          <StatCard
            title="Approuvés"
            value={stats.drivers.approved}
            icon={Users}
            gradient="from-emerald-500 to-green-600"
            index={1}
          />
          <StatCard
            title="En ligne"
            value={stats.drivers.online}
            icon={Activity}
            gradient="from-blue-500 to-cyan-600"
            index={2}
          />
          <StatCard
            title="Note moyenne"
            value={Number(stats.drivers.average_rating).toFixed(1)}
            icon={Star}
            gradient="from-yellow-500 to-amber-600"
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-amber-600" />
            Courses
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              title="Total courses"
              value={stats.trips.total_trips}
              icon={MapPin}
              gradient="from-amber-500 to-orange-600"
              index={0}
            />
            <StatCard
              title="Aujourd'hui"
              value={stats.trips.trips_today}
              subtitle={`+${stats.trips.trips_week} cette semaine`}
              icon={Activity}
              gradient="from-orange-500 to-red-600"
              index={1}
            />
            <StatCard
              title="Complétées"
              value={stats.trips.completed_trips}
              icon={Users}
              gradient="from-emerald-500 to-green-600"
              index={2}
            />
            <StatCard
              title="Taux complétion"
              value={`${stats.trips.completion_rate.toFixed(1)}%`}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-600"
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Revenus
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              title="Total revenus"
              value={`${stats.revenue.total_revenue.toLocaleString()} FG`}
              icon={DollarSign}
              gradient="from-emerald-500 to-green-600"
              index={0}
            />
            <StatCard
              title="Aujourd'hui"
              value={`${stats.revenue.revenue_today.toLocaleString()} FG`}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-600"
              index={1}
            />
            <StatCard
              title="Cette semaine"
              value={`${stats.revenue.revenue_week.toLocaleString()} FG`}
              icon={Activity}
              gradient="from-teal-500 to-cyan-600"
              index={2}
            />
            <StatCard
              title="Ce mois"
              value={`${stats.revenue.revenue_month.toLocaleString()} FG`}
              icon={BarChart3}
              gradient="from-cyan-500 to-blue-600"
              index={3}
            />
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
