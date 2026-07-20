import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { updateInquiry } from "@/lib/actions/inquiries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";

export default async function InquiriesPage() {
  await requireUser(["MANAGER"]);

  const inquiries = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, id: true } }, assignedAgent: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guest inquiries</h1>
      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{inquiry.name}</p>
                  <Badge variant={inquiry.status === "NEW" ? "default" : "secondary"}>
                    {inquiry.status}
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
                    Re: {inquiry.property.title}
                  </Link>
                )}
                <p className="text-sm">{inquiry.message}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(inquiry.createdAt)}</p>
              </div>
              <form action={updateInquiry.bind(null, inquiry.id)} className="flex items-center gap-2">
                <Select
                  name="status"
                  defaultValue={inquiry.status}
                  items={[
                    { value: "NEW", label: "New" },
                    { value: "CONTACTED", label: "Contacted" },
                    { value: "CLOSED", label: "Closed" },
                  ]}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <p className="text-sm text-muted-foreground">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
