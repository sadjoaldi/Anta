import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import apiClient from "../../services/api.client";

interface RevenueData {
  date: string;
  revenue: number;
  count: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<RevenueData[]>(`/stats/revenue-chart?period=${period}`);
        setData(response);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}k FG`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Revenus</CardTitle>
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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} FG`, 'Revenus']}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
