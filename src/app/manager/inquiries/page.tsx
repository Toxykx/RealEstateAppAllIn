import Link from "next/link";
import { Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateInquiry } from "@/lib/actions/inquiries";
import { ActionForm } from "@/components/action-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";

const CONTACT_STATUS_LABELS: Record<string, string> = {
  NEW: "חדש",
  CONTACTED: "נוצר קשר",
  CLOSED: "סגור",
};

export default async function InquiriesPage() {
  await requireUser(["MANAGER"]);

  const inquiries = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, id: true } }, assignedAgent: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">פניות ממבקרים</h1>
      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{inquiry.name}</p>
                  <Badge variant={inquiry.status === "NEW" ? "default" : "secondary"}>
                    {CONTACT_STATUS_LABELS[inquiry.status] ?? inquiry.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {inquiry.email} {inquiry.phone && `· ${inquiry.phone}`}
                </p>
                {inquiry.property && (
                  <Link
                    href={`/agent/properties/${inquiry.property.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    בנוגע ל: {inquiry.property.title}
                  </Link>
                )}
                <p className="text-sm">{inquiry.message}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(inquiry.createdAt)}</p>
              </div>
              <ActionForm action={updateInquiry.bind(null, inquiry.id)} className="flex items-center gap-2">
                <Select
                  name="status"
                  defaultValue={inquiry.status}
                  items={[
                    { value: "NEW", label: "חדש" },
                    { value: "CONTACTED", label: "נוצר קשר" },
                    { value: "CLOSED", label: "סגור" },
                  ]}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">חדש</SelectItem>
                    <SelectItem value="CONTACTED">נוצר קשר</SelectItem>
                    <SelectItem value="CLOSED">סגור</SelectItem>
                  </SelectContent>
                </Select>
                <SubmitButton size="sm">
                  שמירה
                </SubmitButton>
              </ActionForm>
            </CardContent>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <EmptyState
            icon={Mail}
            message="עדיין אין פניות"
            description="פניות שיישלחו מטופס יצירת הקשר באתר הציבורי יופיעו כאן."
          />
        )}
      </div>
    </div>
  );
}
