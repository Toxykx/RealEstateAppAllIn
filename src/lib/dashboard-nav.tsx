import { LayoutDashboard, Users, Building, UserCog, Mail, UserCircle, Search, Activity, KeyRound } from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/dashboard-shell";

export const agentNavItems: DashboardNavItem[] = [
  { href: "/agent", label: "לוח בקרה", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/agent/clients", label: "לקוחות", icon: <Users className="h-4 w-4" /> },
  { href: "/agent/properties", label: "נכסים", icon: <Building className="h-4 w-4" /> },
  { href: "/agent/keys", label: "מפתחות", icon: <KeyRound className="h-4 w-4" /> },
  { href: "/agent/profile", label: "פרופיל", icon: <UserCircle className="h-4 w-4" /> },
];

export const managerNavItems: DashboardNavItem[] = [
  { href: "/manager", label: "סקירה כללית", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/manager/agents", label: "מתווכים", icon: <UserCog className="h-4 w-4" /> },
  { href: "/agent/clients", label: "לקוחות", icon: <Users className="h-4 w-4" /> },
  { href: "/agent/properties", label: "נכסים", icon: <Building className="h-4 w-4" /> },
  { href: "/agent/keys", label: "מפתחות", icon: <KeyRound className="h-4 w-4" /> },
  { href: "/manager/search", label: "חיפוש", icon: <Search className="h-4 w-4" /> },
  { href: "/manager/activity", label: "מרכז פעילות", icon: <Activity className="h-4 w-4" /> },
  { href: "/manager/inquiries", label: "פניות", icon: <Mail className="h-4 w-4" /> },
  { href: "/agent/profile", label: "פרופיל", icon: <UserCircle className="h-4 w-4" /> },
];
