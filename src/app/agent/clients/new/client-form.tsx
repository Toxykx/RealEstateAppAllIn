"use client";

import { useActionState, useRef } from "react";
import { createClient } from "@/lib/actions/clients";
import { useFocusOnError } from "@/lib/use-focus-on-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewClientForm() {
  const [state, formAction] = useActionState(createClient, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusOnError(formRef, state?.error);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" required>שם מלא</Label>
        <Input id="name" name="name" placeholder="לדוגמה: דנה כהן" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" required>כתובת אימייל</Label>
        <Input id="email" name="email" type="email" placeholder="name@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">טלפון (לא חובה)</Label>
        <Input id="phone" name="phone" type="tel" placeholder="05X-XXXXXXX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" required>סיסמה זמנית</Label>
        <Input id="password" name="password" type="text" required minLength={6} />
        <p className="text-xs text-muted-foreground">
          שתפו זאת עם הלקוח ישירות כדי שיוכל להתחבר.
        </p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton pendingLabel="יוצר...">יצירת לקוח</SubmitButton>
    </form>
  );
}
