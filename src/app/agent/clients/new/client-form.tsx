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
        <p className="text-xs text-muted-foreground">
          Share this with the client directly so they can sign in.
        </p>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create client"}
      </Button>
    </form>
  );
}
