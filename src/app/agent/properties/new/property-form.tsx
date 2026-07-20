"use client";

import { useActionState } from "react";
import { createProperty } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

export function NewPropertyForm() {
  const [state, formAction, isPending] = useActionState(createProperty, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">כותרת</Label>
          <Input id="title" name="title" placeholder="לדוגמה: הרצל 15" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">עיר</Label>
          <Input id="city" name="city" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine">כתובת</Label>
        <Input id="addressLine" name="addressLine" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">תיאור</Label>
        <Textarea id="description" name="description" rows={4} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">מחיר</Label>
          <Input id="price" name="price" type="number" min={0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">מטבע</Label>
          <Input id="currency" name="currency" defaultValue="ILS" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType">סוג נכס</Label>
          <Select
            name="propertyType"
            defaultValue="APARTMENT"
            items={Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">חדרים</Label>
          <Input id="bedrooms" name="bedrooms" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">חדרי רחצה</Label>
          <Input id="bathrooms" name="bathrooms" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="areaSqm">שטח (מ״ר)</Label>
          <Input id="areaSqm" name="areaSqm" type="number" min={0} />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "יוצר..." : "יצירת נכס"}
      </Button>
    </form>
  );
}
