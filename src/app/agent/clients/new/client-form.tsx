"use client";

import { useActionState } from "react";
import { createClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewClientForm() {
  const [state, formAction, isPending] = useActionState(createClient, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">שם מלא</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">טלפון (לא חובה)</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">סיסמה זמנית</Label>
        <Input id="password" name="password" type="text" required minLength={6} />
        <p className="text-xs text-muted-foreground">
          שתפו זאת עם הלקוח ישירות כדי שיוכל להתחבר.
        </p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "יוצר..." : "יצירת לקוח"}
      </Button>
    </form>
  );
}
