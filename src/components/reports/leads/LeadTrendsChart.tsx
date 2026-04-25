"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyLeadTrend } from "@/types/report";

interface LeadTrendsChartProps {
  data: MonthlyLeadTrend[];
}

export const LeadTrendsChart = ({ data }: LeadTrendsChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300} minWidth={1}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="monthName" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="newLeads" name="New" stroke="#3B82F6" strokeWidth={2.2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="qualifiedLeads" name="Qualified" stroke="#10B981" strokeWidth={2.2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="convertedLeads" name="Converted" stroke="#8B6DD0" strokeWidth={2.2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
