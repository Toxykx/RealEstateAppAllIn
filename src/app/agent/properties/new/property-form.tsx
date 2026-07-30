"use client";

import { useActionState, useRef } from "react";
import { createProperty } from "@/lib/actions/properties";
import { useFocusOnError } from "@/lib/use-focus-on-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

export function NewPropertyForm() {
  const [state, formAction] = useActionState(createProperty, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusOnError(formRef, state?.error);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" required>כותרת</Label>
          <Input id="title" name="title" placeholder="לדוגמה: הרצל 15" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" required>עיר</Label>
          <Input id="city" name="city" placeholder="לדוגמה: תל אביב" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine" required>כתובת</Label>
        <Input id="addressLine" name="addressLine" placeholder="רחוב ומספר" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" required>תיאור</Label>
        <TextareaWithCounter
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          placeholder="תארו את הנכס — חדרים, שיפוצים, נוף, קרבה לתחבורה ציבורית..."
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price" required>מחיר</Label>
          <Input id="price" name="price" type="number" min={0} placeholder="0" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency" required>מטבע</Label>
          <Input id="currency" name="currency" defaultValue="ILS" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType" required>סוג נכס</Label>
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
      <SubmitButton pendingLabel="יוצר...">יצירת נכס</SubmitButton>
    </form>
  );
}
