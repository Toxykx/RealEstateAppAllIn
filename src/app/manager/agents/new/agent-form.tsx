"use client";

import { useActionState, useRef } from "react";
import { createAgent } from "@/lib/actions/agents";
import { useFocusOnError } from "@/lib/use-focus-on-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewAgentForm() {
  const [state, formAction] = useActionState(createAgent, undefined);
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" required>תפקיד</Label>
        <Select
          name="role"
          defaultValue="AGENT"
          items={[
            { value: "AGENT", label: "מתווך" },
            { value: "MANAGER", label: "מנהל" },
          ]}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENT">מתווך</SelectItem>
            <SelectItem value="MANAGER">מנהל</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton pendingLabel="יוצר...">יצירת חשבון</SubmitButton>
    </form>
  );
}
