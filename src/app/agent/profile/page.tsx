import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateOwnProfile, uploadOwnAvatar } from "@/lib/actions/profile";
import { ActionForm } from "@/components/action-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOutAction } from "@/lib/actions/auth";

export default async function AgentProfilePage() {
  const sessionUser = await requireUser(["AGENT", "MANAGER"]);
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
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <Badge variant="secondary">{user.role === "MANAGER" ? "מנהל" : "מתווך"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActionForm action={uploadOwnAvatar} className="flex flex-wrap items-end gap-2">
            <div className="space-y-2">
              <Label htmlFor="avatar-file">תמונת פרופיל</Label>
              <Input id="avatar-file" type="file" name="file" accept="image/*" required className="max-w-xs" />
            </div>
            <SubmitButton pendingLabel="מעלה...">העלאת תמונה</SubmitButton>
          </ActionForm>

          <ActionForm action={updateOwnProfile} className="space-y-4 border-t border-border pt-4 text-sm">
            <div className="space-y-2">
              <Label htmlFor="name" required>שם מלא</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" name="phone" defaultValue={user.phone ?? ""} placeholder="05X-XXXXXXX" />
            </div>
            <div>
              <p className="text-muted-foreground">כתובת אימייל</p>
              <p className="font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">כתובת האימייל משמשת לכניסה למערכת ואינה ניתנת לעריכה כאן.</p>
            </div>
            <SubmitButton pendingLabel="שומר...">שמירת שינויים</SubmitButton>
          </ActionForm>
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
