"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DashboardStats } from "@/types";

interface DashboardChartProps {
  stats: DashboardStats;
}

/**
 * Unit status breakdown bar chart.
 * Uses Recharts — replace with a different chart library if needed.
 */
export function DashboardChart({ stats }: DashboardChartProps) {
  const data = [
    { name: "Not Started", value: stats.unitsNotStarted, color: "#94a3b8" },
    { name: "In Progress", value: stats.unitsInProgress, color: "#f59e0b" },
    { name: "Blocked", value: stats.unitsBlocked, color: "#ef4444" },
    { name: "Completed", value: stats.unitsCompleted, color: "#22c55e" },
  ];

  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="text-sm font-medium mb-4">Units by Status</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={{
              borderRadius: "6px",
              border: "1px solid hsl(var(--border))",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
