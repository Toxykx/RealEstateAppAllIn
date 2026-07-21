import {
  Home,
  Pencil,
  Tag,
  Megaphone,
  RefreshCw,
  Milestone,
  UserCog,
  UserPlus,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Eye,
  MessageSquarePlus,
  FileUp,
  KeyRound,
  KeySquare,
  Users,
  Phone,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

export async function logActivity(params: {
  activityType: ActivityType;
  description: string;
  propertyId?: string;
  agentId?: string;
  clientId?: string;
  metadata?: object;
}) {
  await prisma.activityLog.create({
    data: {
      activityType: params.activityType,
      description: params.description,
      propertyId: params.propertyId,
      agentId: params.agentId,
      clientId: params.clientId,
      metadata: params.metadata,
    },
  });
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  PROPERTY_CREATED: "נכס נוצר",
  PROPERTY_EDITED: "נכס נערך",
  PRICE_CHANGED: "מחיר עודכן",
  PROPERTY_PUBLISHED: "נכס פורסם",
  STATUS_CHANGED: "סטטוס עודכן",
  STAGE_CHANGED: "שלב עודכן",
  AGENT_ASSIGNED: "מתווך הוקצה",
  CLIENT_ASSIGNED: "לקוח הוקצה",
  VISIT_SCHEDULED: "ביקור נקבע",
  VISIT_COMPLETED: "ביקור הושלם",
  VISIT_CANCELLED: "ביקור בוטל",
  PROPERTY_VIEWED: "נצפה",
  TIMELINE_UPDATE_ADDED: "עדכון פורסם",
  DOCUMENT_UPLOADED: "מסמך הועלה",
  KEY_CHECKED_OUT: "מפתח נלקח",
  KEY_RETURNED: "מפתח הוחזר",
  MEETING_LOGGED: "פגישה תועדה",
  CALL_LOGGED: "שיחה תועדה",
  DEAL_CLOSED: "עסקה נסגרה",
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, LucideIcon> = {
  PROPERTY_CREATED: Home,
  PROPERTY_EDITED: Pencil,
  PRICE_CHANGED: Tag,
  PROPERTY_PUBLISHED: Megaphone,
  STATUS_CHANGED: RefreshCw,
  STAGE_CHANGED: Milestone,
  AGENT_ASSIGNED: UserCog,
  CLIENT_ASSIGNED: UserPlus,
  VISIT_SCHEDULED: CalendarPlus,
  VISIT_COMPLETED: CalendarCheck,
  VISIT_CANCELLED: CalendarX,
  PROPERTY_VIEWED: Eye,
  TIMELINE_UPDATE_ADDED: MessageSquarePlus,
  DOCUMENT_UPLOADED: FileUp,
  KEY_CHECKED_OUT: KeyRound,
  KEY_RETURNED: KeySquare,
  MEETING_LOGGED: Users,
  CALL_LOGGED: Phone,
  DEAL_CLOSED: Handshake,
};
