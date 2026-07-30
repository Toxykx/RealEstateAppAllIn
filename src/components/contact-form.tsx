"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/contact";
import { useFocusOnError } from "@/lib/use-focus-on-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";

const initialState: ContactFormState = { success: false };

export function ContactForm({ propertyId }: { propertyId?: string }) {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);
  const toasted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusOnError(formRef, state.error);

  useEffect(() => {
    if (state.success && !toasted.current) {
      toasted.current = true;
      toast.success("ההודעה נשלחה בהצלחה");
    }
  }, [state.success]);

  if (state.success) {
    return (
      <p className="rounded-md bg-secondary p-4 text-sm">
        תודה על פנייתך — מתווך מטעם ALL IN Real Estate יצור איתך קשר בהקדם.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" required>שם מלא</Label>
          <Input id="name" name="name" placeholder="השם שלך" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" required>כתובת אימייל</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">טלפון (לא חובה)</Label>
        <Input id="phone" name="phone" type="tel" placeholder="05X-XXXXXXX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" required>הודעה</Label>
        <TextareaWithCounter id="message" name="message" rows={4} maxLength={500} placeholder="איך נוכל לעזור?" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "שולח..." : "שליחת הודעה"}
      </Button>
    </form>
  );
}
