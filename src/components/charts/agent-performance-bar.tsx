"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import type { AgentPerformanceRow } from "@/lib/stats";
import { EmptyState } from "@/components/ui/empty-state";

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

export function AgentPerformanceBar({ data }: { data: AgentPerformanceRow[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        message="אין נתוני מתווכים להצגה"
        description="הנתונים יופיעו לאחר שיתווספו מתווכים לצוות."
        compact
      />
    );
  }

  const chartData = data.map((row) => ({ ...row, name: row.agentName }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }} />
        <Bar dataKey="visits" name="ביקורים" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="meetings" name="פגישות" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="calls" name="שיחות" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="closedDeals" name="עסקאות סגורות" fill="var(--color-chart-4)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
