"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

export function WeeklyActivityChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="count" name="פעילות" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
