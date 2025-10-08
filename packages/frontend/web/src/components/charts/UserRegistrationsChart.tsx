import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import apiClient from "../../services/api.client";

interface RegistrationData {
  date: string;
  count: number;
  passengers: number;
  drivers: number;
}

export function UserRegistrationsChart() {
  const [data, setData] = useState<RegistrationData[]>([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<RegistrationData[]>(`/stats/user-registrations?period=${period}`);
        setData(response);
      } catch (error) {
        console.error("Error fetching registrations data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Inscriptions utilisateurs</CardTitle>
          <select
            className="border rounded-md px-3 py-1 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="12m">12 derniers mois</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="passengers"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                name="Passagers"
              />
              <Area
                type="monotone"
                dataKey="drivers"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                name="Chauffeurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
