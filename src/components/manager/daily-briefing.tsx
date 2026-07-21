import {
  CalendarDays,
  KeyRound,
  UserPlus,
  Handshake,
  AlertTriangle,
  ImageOff,
  MessageCircleQuestion,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 18) return "צהריים טובים";
  return "ערב טוב";
}

export function DailyBriefing({
  name,
  visitsToday,
  keysOutstanding,
  newClientsThisWeek,
  dealsClosedYesterday,
  staleProperties,
  missingImages,
  openInquiries,
}: {
  name: string;
  visitsToday: number;
  keysOutstanding: number;
  newClientsThisWeek: number;
  dealsClosedYesterday: number;
  staleProperties: number;
  missingImages: number;
  openInquiries: number;
}) {
  const items = [
    { icon: CalendarDays, text: `${visitsToday} סיורים מתוכננים היום` },
    { icon: KeyRound, text: `${keysOutstanding} מפתחות מחוץ למשרד` },
    { icon: UserPlus, text: `${newClientsThisWeek} לקוחות חדשים השבוע` },
    { icon: Handshake, text: `${dealsClosedYesterday} עסקאות נסגרו אתמול` },
    { icon: AlertTriangle, text: `${staleProperties} נכסים לא עודכנו מעל 14 ימים` },
    { icon: ImageOff, text: `${missingImages} נכסים ללא תמונות` },
    { icon: MessageCircleQuestion, text: `${openInquiries} פניות ממתינות למענה` },
  ];

  return (
    <Card className="border-primary/25 bg-gradient-to-b from-primary/[0.06] to-transparent">
      <CardHeader>
        <CardTitle className="font-heading text-xl">
          {greeting()}, {name}!
        </CardTitle>
        <p className="text-sm text-muted-foreground">הנה מה שמחכה לך היום:</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                <item.icon className="h-4 w-4" />
              </span>
              {item.text}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
