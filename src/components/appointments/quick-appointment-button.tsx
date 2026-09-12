"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionForm } from "@/components/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quickScheduleVisit } from "@/lib/actions/properties";

export function QuickAppointmentButton({
  properties,
  className,
  compact,
}: {
  properties: { id: string; title: string; city: string }[];
  className?: string;
  /** Icon-only trigger, for tight spaces like the mobile header. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setKey((k) => k + 1); // reset the form for next time
      }}
    >
      <DialogTrigger
        render={
          <Button
            size={compact ? "icon-sm" : "sm"}
            className={className}
            aria-label={compact ? "הוספת פגישה" : undefined}
          />
        }
      >
        <CalendarPlus className="h-4 w-4" />
        {!compact && "הוספת פגישה"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>קביעת פגישה חדשה</DialogTitle>
        </DialogHeader>
        <ActionForm key={key} action={quickScheduleVisit} className="space-y-3" onSuccess={() => setOpen(false)}>
          <div className="space-y-2">
            <Label htmlFor="qa-propertyId" required>
              נכס
            </Label>
            <Select
              name="propertyId"
              items={properties.map((p) => ({ value: p.id, label: `${p.title} — ${p.city}` }))}
            >
              <SelectTrigger className="w-full" id="qa-propertyId">
                <SelectValue placeholder="בחירת נכס" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} — {p.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-scheduledAt" required>
              שעת פגישה
            </Label>
            <Input id="qa-scheduledAt" type="datetime-local" name="scheduledAt" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-visitorName">שם המבקר (לא חובה)</Label>
            <Input id="qa-visitorName" name="visitorName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-visitorPhone">טלפון המבקר (לא חובה)</Label>
            <Input id="qa-visitorPhone" name="visitorPhone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-notes">הערות (לא חובה)</Label>
            <Input id="qa-notes" name="notes" />
          </div>
          <SubmitButton pendingLabel="קובע..." className="w-full">
            קביעת פגישה
          </SubmitButton>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
