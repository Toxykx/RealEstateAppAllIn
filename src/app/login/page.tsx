import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLE_HOME: Record<string, string> = {
  CLIENT: "/client",
  AGENT: "/agent",
  MANAGER: "/manager",
};

async function loginAction(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;

  try {
    // redirect: false + a direct role-based redirect below avoids bouncing
    // through an intermediate /dashboard hop, which added an extra
    // client-side navigation that could get stuck mid-transition.
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1`);
    }
    throw error;
  }

  // auth() can't be re-read within the same request signIn() just set the
  // session cookie in (it only sees the incoming request's cookies), so the
  // role is looked up directly instead of round-tripping through the session.
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  redirect(user?.role ? ROLE_HOME[user.role] : "/login");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">התחברות</CardTitle>
          <CardDescription>
            השתמשו באימייל ובסיסמה שקיבלתם מהמתווך שלכם.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">
                אימייל או סיסמה שגויים. נסו שוב.
              </p>
            )}
            <Button type="submit" className="w-full">
              התחברות
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            רק מסתכלים?{" "}
            <Link href="/properties" className="underline underline-offset-2">
              צפו בקטלוג הנכסים
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
