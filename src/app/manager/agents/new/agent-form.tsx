"use client";

import { useActionState } from "react";
import { createAgent } from "@/lib/actions/agents";
import { Button } from "@/components/ui/button";
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
  const [state, formAction, isPending] = useActionState(createAgent, undefined);

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
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">תפקיד</Label>
        <Select
          name="role"
          defaultValue="AGENT"
          items={[
            { value: "AGENT", label: "סוכן" },
            { value: "MANAGER", label: "מנהל" },
          ]}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENT">סוכן</SelectItem>
            <SelectItem value="MANAGER">מנהל</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "יוצר..." : "יצירת חשבון"}
      </Button>
    </form>
  );
}
