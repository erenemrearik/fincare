"use client";

import React from 'react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserSettings } from "@prisma/client";

type PieChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
    icon?: string;
    type?: string;
  }>;
  currency?: string;
  getTooltip?: (category: any) => string;
};

const CustomTooltip = ({ active, payload, currency = 'TRY', getTooltip }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    const value = payload[0].value || 0;
    const typeLabel = getTooltip ? getTooltip(entry) : (entry.type === "expense" ? "Gider" : "Gelir");
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p>
          {new Intl.NumberFormat('tr-TR', { 
            style: 'currency', 
            currency: currency 
          }).format(value)}
        </p>
        <p className={entry.type === "expense" ? "text-red-500" : "text-green-600"}>
          {typeLabel}
        </p>
      </div>
    );
  }

  return null;
};

const PieChart: React.FC<PieChartProps> = ({ data, currency = 'TRY', getTooltip }) => {
  const validData = Array.isArray(data)
    ? data.filter(item => item && item.name && typeof item.value === 'number' && !isNaN(item.value) && item.value >= 0)
    : [];

  // Eğer hiç veri yoksa, kullanıcıya bilgi ver
  if (!validData || validData.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <p className="text-muted-foreground text-sm">Bu gün için işlem kaydı bulunamadı</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} getTooltip={getTooltip} />} />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;