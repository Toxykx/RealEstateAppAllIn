import { ActionForm, type ActionResult } from "@/components/action-form";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KEY_STATUS_LABELS, formatDateTime } from "@/lib/format";
import type { KeyStatus } from "@prisma/client";

export function KeyManagementCard({
  keyStatus,
  keyHolderName,
  keyLastTakenAt,
  keyLastReturnedAt,
  isManager,
  onTakeKey,
  onReturnKey,
  onSetStatus,
}: {
  keyStatus: KeyStatus;
  keyHolderName: string | null;
  keyLastTakenAt: Date | null;
  keyLastReturnedAt: Date | null;
  isManager: boolean;
  onTakeKey: (formData: FormData) => Promise<ActionResult>;
  onReturnKey: (formData: FormData) => Promise<ActionResult>;
  onSetStatus: (formData: FormData) => Promise<ActionResult>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{KEY_STATUS_LABELS[keyStatus]}</Badge>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        {keyStatus === "WITH_AGENT" && keyHolderName && (
          <p>
            אצל: <span className="text-foreground">{keyHolderName}</span>
          </p>
        )}
        {keyLastTakenAt && <p>נלקח: {formatDateTime(keyLastTakenAt)}</p>}
        {keyLastReturnedAt && <p>הוחזר: {formatDateTime(keyLastReturnedAt)}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {keyStatus !== "WITH_AGENT" && (
          <ActionForm action={onTakeKey}>
            <SubmitButton size="sm" pendingLabel="לוקח...">
              קחת מפתח
            </SubmitButton>
          </ActionForm>
        )}
        {keyStatus === "WITH_AGENT" && (
          <ActionForm action={onReturnKey}>
            <SubmitButton size="sm" variant="outline" pendingLabel="מחזיר...">
              החזרת מפתח
            </SubmitButton>
          </ActionForm>
        )}
      </div>

      {isManager && (
        <ActionForm action={onSetStatus} className="flex gap-2 border-t border-border pt-3">
          <Select
            name="keyStatus"
            defaultValue={keyStatus}
            items={Object.entries(KEY_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(KEY_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SubmitButton size="sm" variant="ghost" pendingLabel="מעדכן...">
            עדכון סטטוס
          </SubmitButton>
        </ActionForm>
      )}
    </div>
  );
}
