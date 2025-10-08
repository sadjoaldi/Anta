import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import apiClient from "../../services/api.client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type PaymentMethodType = 'cash' | 'mobile_money' | 'card';

interface PaymentMethodData {
  method: PaymentMethodType;
  count: number;
  total: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  total: number;
}

const COLORS: Record<PaymentMethodType, string> = {
  cash: '#10b981',
  mobile_money: '#3b82f6',
  card: '#8b5cf6',
};

const METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Cash',
  mobile_money: 'Mobile Money',
  card: 'Carte',
};

export function PaymentMethodsChart() {
  const [data, setData] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<PaymentMethodData[]>('/stats/payment-methods');
        setData(response);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = data.map(item => ({
    name: METHOD_LABELS[item.method],
    value: item.count,
    total: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Méthodes de paiement</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_entry, index) => {
                    const method = data[index]?.method;
                    const color = method ? COLORS[method] : '#94a3b8';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: Payload<number, string>) => {
                    const payload = props.payload as ChartDataItem;
                    return [
                      `${value} paiements (${payload.total.toLocaleString()} FG)`,
                      name
                    ];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              {data.map((item, index) => {
                const color = COLORS[item.method];
                const label = METHOD_LABELS[item.method];
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span>{label}: {item.count}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
