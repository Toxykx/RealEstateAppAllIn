"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const COLORS = ["var(--color-chart-1)", "var(--color-chart-3)"];

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

export function PropertyDistributionPie({ sale, rent }: { sale: number; rent: number }) {
  if (sale === 0 && rent === 0) {
    return (
      <EmptyState
        icon={PieChartIcon}
        message="אין נתונים להצגה"
        description="ההתפלגות תופיע לאחר הוספת נכסים למערכת."
        compact
      />
    );
  }

  const data = [
    { name: "למכירה", value: sale },
    { name: "להשכרה", value: rent },
  ];

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="var(--color-card)" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 text-sm">
        {data.map((entry, i) => (
          <span key={entry.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </div>
  );
}
