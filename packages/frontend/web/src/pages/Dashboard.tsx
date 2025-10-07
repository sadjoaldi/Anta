import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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

  // Helper pour créer une card cliquable
  const ClickableCard = ({ 
    title, 
    value, 
    subtitle, 
    onClick, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    onClick: () => void;
    color?: string;
  }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color || ''}`}>{value}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Utilisateurs */}
      <div>
        <h2 className="text-lg font-semibold mb-3">📱 Utilisateurs</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <ClickableCard
            title="Total inscrits"
            value={stats.users.total}
            subtitle={`+${stats.users.new_month} ce mois`}
            onClick={() => navigate('/dashboard/users')}
          />

          <ClickableCard
            title="Nouveaux aujourd'hui"
            value={stats.users.new_today}
            subtitle={`+${stats.users.new_week} cette semaine`}
            color="text-green-600"
            onClick={() => navigate('/dashboard/users?filter=new_today')}
          />

          <ClickableCard
            title="Utilisateurs actifs"
            value={stats.users.active_7days}
            subtitle="Derniers 7 jours"
            color="text-blue-600"
            onClick={() => navigate('/dashboard/users?filter=active')}
          />

          <ClickableCard
            title="Taux de rétention"
            value={`${stats.users.retention_rate.toFixed(1)}%`}
            subtitle="Actifs / Total"
            color="text-purple-600"
            onClick={() => navigate('/dashboard/users?filter=active')}
          />
        </div>
      </div>

      {/* Répartition par rôle */}
      <div>
        <h2 className="text-lg font-semibold mb-3">👥 Répartition par rôle</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ClickableCard
            title="Passagers"
            value={stats.users.by_role.passengers}
            onClick={() => navigate('/dashboard/users?role=passenger')}
          />

          <ClickableCard
            title="Chauffeurs"
            value={stats.users.by_role.drivers}
            onClick={() => navigate('/dashboard/users?role=driver')}
          />

          <ClickableCard
            title="Administrateurs"
            value={stats.users.by_role.admins}
            onClick={() => navigate('/dashboard/users?role=admin')}
          />
        </div>
      </div>

      {/* Drivers */}
      <div>
        <h2 className="text-lg font-semibold mb-3">🚗 Chauffeurs</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <ClickableCard
            title="Total chauffeurs"
            value={stats.drivers.total}
            onClick={() => navigate('/dashboard/drivers')}
          />

          <ClickableCard
            title="Approuvés"
            value={stats.drivers.approved}
            color="text-green-600"
            onClick={() => navigate('/dashboard/drivers?kyc=approved')}
          />

          <ClickableCard
            title="En attente"
            value={stats.drivers.pending}
            color="text-orange-600"
            onClick={() => navigate('/dashboard/drivers?kyc=pending')}
          />

          <ClickableCard
            title="En ligne"
            value={stats.drivers.online}
            subtitle={`⭐ ${stats.drivers.average_rating} note moy.`}
            color="text-blue-600"
            onClick={() => navigate('/dashboard/drivers')}
          />
        </div>
      </div>

      {/* Courses (si disponible) */}
      {stats.trips.total_trips > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">🚕 Courses</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Total courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.trips.total_trips}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.trips.trips_today}</div>
                <div className="text-xs text-gray-500 mt-1">
                  +{stats.trips.trips_week} cette semaine
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Complétées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.trips.completed_trips}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Taux complétion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.trips.completion_rate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Revenus (si disponible) */}
      {stats.revenue.total_revenue > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">💰 Revenus</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Total revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.revenue.total_revenue.toLocaleString()} FG
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.revenue.revenue_today.toLocaleString()} FG
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Cette semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.revenue.revenue_week.toLocaleString()} FG
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">Ce mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.revenue.revenue_month.toLocaleString()} FG
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
