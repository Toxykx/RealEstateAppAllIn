import { startOfWeek, startOfMonth, startOfDay, endOfDay, getDaysInMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { WEEKDAY_LABELS } from "@/lib/format";

const ACTIVE_STATUSES = ["AVAILABLE", "IN_PROGRESS"] as const;
const weekStart = () => startOfWeek(new Date(), { weekStartsOn: 0 });
const monthStart = () => startOfMonth(new Date());

export async function getManagerKpis() {
  const from = weekStart();
  const monthFrom = monthStart();

  const [
    activeProperties,
    forSale,
    forRent,
    totalClients,
    totalAgents,
    closedDealsThisMonth,
    visitsThisWeek,
    meetingsThisWeek,
    callsThisWeek,
  ] = await Promise.all([
    prisma.property.count({ where: { listingStatus: { in: [...ACTIVE_STATUSES] } } }),
    prisma.property.count({ where: { listingStatus: { in: [...ACTIVE_STATUSES] }, dealType: "SALE" } }),
    prisma.property.count({ where: { listingStatus: { in: [...ACTIVE_STATUSES] }, dealType: "RENT" } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "AGENT" } }),
    prisma.activityLog.count({ where: { activityType: "DEAL_CLOSED", createdAt: { gte: monthFrom } } }),
    prisma.activityLog.count({ where: { activityType: "VISIT_COMPLETED", createdAt: { gte: from } } }),
    prisma.activityLog.count({ where: { activityType: "MEETING_LOGGED", createdAt: { gte: from } } }),
    prisma.activityLog.count({ where: { activityType: "CALL_LOGGED", createdAt: { gte: from } } }),
  ]);

  return {
    activeProperties,
    forSale,
    forRent,
    totalClients,
    totalAgents,
    closedDealsThisMonth,
    visitsThisWeek,
    meetingsThisWeek,
    callsThisWeek,
  };
}

export async function getPropertyDistribution() {
  const [sale, rent] = await Promise.all([
    prisma.property.count({ where: { dealType: "SALE", listingStatus: { not: "ARCHIVED" } } }),
    prisma.property.count({ where: { dealType: "RENT", listingStatus: { not: "ARCHIVED" } } }),
  ]);
  return { sale, rent };
}

export type AgentPerformanceStats = {
  visits: number;
  meetings: number;
  calls: number;
  propertiesAdded: number;
  timelineUpdates: number;
  closedDeals: number;
  keysReturned: number;
  keysOutstanding: number;
};

export async function getAgentStats(agentId: string, period: "week" | "month"): Promise<AgentPerformanceStats> {
  const from = period === "week" ? weekStart() : monthStart();

  const [counts, keysOutstanding] = await Promise.all([
    prisma.activityLog.groupBy({
      by: ["activityType"],
      where: { agentId, createdAt: { gte: from } },
      _count: true,
    }),
    prisma.property.count({ where: { keyHolderId: agentId, keyStatus: "WITH_AGENT" } }),
  ]);

  const pick = (type: string) => counts.find((c) => c.activityType === type)?._count ?? 0;

  return {
    visits: pick("VISIT_COMPLETED"),
    meetings: pick("MEETING_LOGGED"),
    calls: pick("CALL_LOGGED"),
    propertiesAdded: pick("PROPERTY_CREATED"),
    timelineUpdates: pick("TIMELINE_UPDATE_ADDED"),
    closedDeals: pick("DEAL_CLOSED"),
    keysReturned: pick("KEY_RETURNED"),
    keysOutstanding,
  };
}

export type AgentPerformanceRow = {
  agentId: string;
  agentName: string;
  visits: number;
  meetings: number;
  calls: number;
  closedDeals: number;
};

export async function getAgentPerformanceComparison(period: "week" | "month"): Promise<AgentPerformanceRow[]> {
  const from = period === "week" ? weekStart() : monthStart();

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  if (agents.length === 0) return [];

  const counts = await prisma.activityLog.groupBy({
    by: ["agentId", "activityType"],
    where: { agentId: { in: agents.map((a) => a.id) }, createdAt: { gte: from } },
    _count: true,
  });

  return agents.map((agent) => {
    const forAgent = counts.filter((c) => c.agentId === agent.id);
    const pick = (type: string) => forAgent.find((c) => c.activityType === type)?._count ?? 0;
    return {
      agentId: agent.id,
      agentName: agent.name,
      visits: pick("VISIT_COMPLETED"),
      meetings: pick("MEETING_LOGGED"),
      calls: pick("CALL_LOGGED"),
      closedDeals: pick("DEAL_CLOSED"),
    };
  });
}

export async function getWeeklyActivitySeries() {
  const from = weekStart();
  const logs = await prisma.activityLog.findMany({
    where: { createdAt: { gte: from } },
    select: { createdAt: true },
  });

  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const log of logs) counts[log.createdAt.getDay()]++;

  return WEEKDAY_LABELS.map((label, i) => ({ day: label, count: counts[i] }));
}

export async function getMonthlyActivitySeries() {
  const from = monthStart();
  const daysInMonth = getDaysInMonth(new Date());

  const logs = await prisma.activityLog.findMany({
    where: { createdAt: { gte: from } },
    select: { createdAt: true },
  });

  const counts = Array.from({ length: daysInMonth }, () => 0);
  for (const log of logs) counts[log.createdAt.getDate() - 1]++;

  return counts.map((count, i) => ({ day: String(i + 1), count }));
}

export type DailyBriefingCore = {
  visitsToday: number;
  keysOutstanding: number;
  newClientsThisWeek: number;
  dealsClosedYesterday: number;
};

export async function getDailyBriefingCore(): Promise<DailyBriefingCore> {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const [visitsToday, keysOutstanding, newClientsThisWeek, dealsClosedYesterday] = await Promise.all([
    prisma.visit.count({
      where: { scheduledAt: { gte: startOfDay(today), lte: endOfDay(today) }, status: "SCHEDULED" },
    }),
    prisma.property.count({ where: { keyStatus: "WITH_AGENT" } }),
    prisma.user.count({ where: { role: "CLIENT", createdAt: { gte: weekStart() } } }),
    prisma.activityLog.count({
      where: { activityType: "DEAL_CLOSED", createdAt: { gte: startOfDay(yesterday), lte: endOfDay(yesterday) } },
    }),
  ]);

  return { visitsToday, keysOutstanding, newClientsThisWeek, dealsClosedYesterday };
}
