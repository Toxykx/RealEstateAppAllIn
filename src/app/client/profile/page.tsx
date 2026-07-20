import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

export default async function ProfilePage() {
  const sessionUser = await requireUser(["CLIENT"]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">פרופיל</h1>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <Badge variant="secondary">לקוח</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">אימייל</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">טלפון</p>
            <p className="font-medium">{user.phone ?? "לא צויין"}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            כדי לעדכן את פרטי הקשר שלך, פנה/י לסוכן שלך.
          </p>
        </CardContent>
      </Card>

      <form action={signOutAction}>
        <Button type="submit" variant="outline" className="w-full">
          התנתקות
        </Button>
      </form>
    </div>
  );
}
