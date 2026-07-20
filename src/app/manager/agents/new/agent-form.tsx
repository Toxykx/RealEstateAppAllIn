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
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Temporary password</Label>
        <Input id="password" name="password" type="text" required minLength={6} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          name="role"
          defaultValue="AGENT"
          items={[
            { value: "AGENT", label: "Agent" },
            { value: "MANAGER", label: "Manager" },
          ]}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
