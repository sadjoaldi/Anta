import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import apiClient from "../../services/api.client";

interface TripCompletionData {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  completion_rate: string;
}

export function TripCompletionChart() {
  const [data, setData] = useState<TripCompletionData[]>([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<TripCompletionData[]>(`/stats/trip-completion?period=${period}`);
        setData(response);
      } catch (error) {
        console.error("Error fetching trip completion data:", error);
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
          <CardTitle>Taux de complétion des courses</CardTitle>
          <select
            className="border rounded-md px-3 py-1 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels = {
                    completed: 'Complétées',
                    cancelled: 'Annulées',
                    total: 'Total'
                  };
                  return [value, labels[name as keyof typeof labels] || name];
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels = {
                    completed: 'Complétées',
                    cancelled: 'Annulées',
                    total: 'Total'
                  };
                  return labels[value as keyof typeof labels] || value;
                }}
              />
              <Bar dataKey="completed" fill="#10b981" name="completed" />
              <Bar dataKey="cancelled" fill="#ef4444" name="cancelled" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
