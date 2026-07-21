import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { CreatedToast } from "@/components/created-toast";
import { DealProgress } from "@/components/property/deal-progress";
import { KeyManagementCard } from "@/components/manager/key-management-card";
import { ActivityLogList } from "@/components/manager/activity-log-list";
import { prisma } from "@/lib/prisma";
import { requireUser, agentScope } from "@/lib/authz";
import { getSignedDocumentUrl } from "@/lib/storage";
import {
  updateProperty,
  assignPropertyToClient,
  changeListingStatus,
  changeDealStage,
  postPropertyUpdate,
  scheduleVisit,
  updateVisitStatus,
  reassignPropertyAgent,
} from "@/lib/actions/properties";
import { uploadImageAction, deleteImageAction, uploadDocumentAction, deleteDocumentAction } from "@/lib/actions/uploads";
import { takeKey, returnKey, setKeyStatus } from "@/lib/actions/keys";
import { logManualActivity } from "@/lib/actions/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEAL_STAGE_STEPS,
  LISTING_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  dealStageIndex,
  formatDateTime,
} from "@/lib/format";

const DOC_TYPE_LABELS: Record<string, string> = {
  CONTRACT: "חוזה",
  ID: "תעודה מזהה",
  OTHER: "אחר",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(["AGENT", "MANAGER"]);

  const property = await prisma.property.findFirst({
    where: { id, ...agentScope(user, "agentId") },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      updates: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
      visits: { orderBy: { scheduledAt: "asc" } },
      ownerClient: true,
      agent: { select: { name: true, phone: true, email: true } },
      keyHolder: { select: { name: true } },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        include: { agent: { select: { name: true } } },
      },
    },
  });
  if (!property) notFound();

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", ...agentScope(user, "managingAgentId") },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const agents = user.role === "MANAGER"
    ? await prisma.user.findMany({
        where: { role: "AGENT" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const documentsWithUrls = await Promise.all(
    property.documents.map(async (doc) => ({
      ...doc,
      signedUrl: await getSignedDocumentUrl(doc.storageKey).catch(() => null),
    })),
  );

  const boundUpdateProperty = updateProperty.bind(null, property.id);
  const boundAssign = assignPropertyToClient.bind(null, property.id);
  const boundListingStatus = changeListingStatus.bind(null, property.id);
  const boundDealStage = changeDealStage.bind(null, property.id);
  const boundPostUpdate = postPropertyUpdate.bind(null, property.id);
  const boundScheduleVisit = scheduleVisit.bind(null, property.id);
  const boundUploadImage = uploadImageAction.bind(null, property.id);
  const boundUploadDoc = uploadDocumentAction.bind(null, property.id);
  const boundTakeKey = takeKey.bind(null, property.id);
  const boundReturnKey = returnKey.bind(null, property.id);
  const boundSetKeyStatus = setKeyStatus.bind(null, property.id);
  const boundReassignAgent = reassignPropertyAgent.bind(null, property.id);

  const currentStageIndex = dealStageIndex(property.dealStage);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <CreatedToast message="הנכס נוצר בהצלחה" />
      </Suspense>
      <div>
        <Link href="/agent/properties" className="text-sm text-muted-foreground hover:underline">
          &rarr; חזרה לנכסים
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <Badge variant="secondary">{LISTING_STATUS_LABELS[property.listingStatus]}</Badge>
          {property.source !== "MANUAL" && <Badge variant="outline">{property.source}</Badge>}
        </div>
        <p className="text-muted-foreground">
          {property.addressLine}, {property.city}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Basic info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">עריכת נכס</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={boundUpdateProperty} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">כותרת</Label>
                  <Input id="title" name="title" defaultValue={property.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">עיר</Label>
                  <Input id="city" name="city" defaultValue={property.city} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine">כתובת</Label>
                <Input id="addressLine" name="addressLine" defaultValue={property.addressLine} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">תיאור</Label>
                <Textarea id="description" name="description" rows={4} defaultValue={property.description} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">מחיר</Label>
                  <Input id="price" name="price" type="number" defaultValue={property.price.toString()} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">מטבע</Label>
                  <Input id="currency" name="currency" defaultValue={property.currency} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">סוג נכס</Label>
                  <Select
                    name="propertyType"
                    defaultValue={property.propertyType}
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
                  <Input id="bedrooms" name="bedrooms" type="number" defaultValue={property.bedrooms ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">חדרי רחצה</Label>
                  <Input id="bathrooms" name="bathrooms" type="number" defaultValue={property.bathrooms ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaSqm">שטח (מ״ר)</Label>
                  <Input id="areaSqm" name="areaSqm" type="number" defaultValue={property.areaSqm ?? ""} />
                </div>
              </div>
              <Button type="submit">שמירת פרטים</Button>
            </ActionForm>
          </CardContent>
        </Card>

        {/* Status, stage, assignment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">סטטוס פרסום</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={boundListingStatus} className="flex gap-2">
                <Select
                  name="listingStatus"
                  defaultValue={property.listingStatus}
                  items={Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">שמירה</Button>
              </ActionForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">התקדמות העסקה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DealProgress currentStageIndex={currentStageIndex} />
              <ActionForm action={boundDealStage} className="flex gap-2">
                <Select name="dealStage" defaultValue={property.dealStage} items={[...DEAL_STAGE_STEPS]}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGE_STEPS.map((step) => (
                      <SelectItem key={step.value} value={step.value}>
                        {step.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">עדכון</Button>
              </ActionForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">לקוח מוקצה (בעלים)</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={boundAssign} className="flex gap-2">
                <Select
                  name="clientId"
                  defaultValue={property.ownerClientId ?? "none"}
                  items={[{ value: "none", label: "לא מוקצה" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="לא מוקצה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">לא מוקצה</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">שמירה</Button>
              </ActionForm>
            </CardContent>
          </Card>

          {user.role === "MANAGER" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">מתווך אחראי</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionForm action={boundReassignAgent} className="flex gap-2">
                  <Select
                    name="agentId"
                    defaultValue={property.agentId}
                    items={agents.map((a) => ({ value: a.id, label: a.name }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit">שמירה</Button>
                </ActionForm>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ניהול מפתח</CardTitle>
            </CardHeader>
            <CardContent>
              <KeyManagementCard
                keyStatus={property.keyStatus}
                keyHolderName={property.keyHolder?.name ?? null}
                keyLastTakenAt={property.keyLastTakenAt}
                keyLastReturnedAt={property.keyLastReturnedAt}
                isManager={user.role === "MANAGER"}
                onTakeKey={boundTakeKey}
                onReturnKey={boundReturnKey}
                onSetStatus={boundSetKeyStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent + Client contact cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">כרטיס מתווך</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{property.agent.name}</p>
            {property.agent.phone && <p className="text-muted-foreground">{property.agent.phone}</p>}
            <p className="text-muted-foreground">{property.agent.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">כרטיס לקוח</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {property.ownerClient ? (
              <>
                <p className="font-medium">{property.ownerClient.name}</p>
                {property.ownerClient.phone && (
                  <p className="text-muted-foreground">{property.ownerClient.phone}</p>
                )}
                <p className="text-muted-foreground">{property.ownerClient.email}</p>
              </>
            ) : (
              <p className="text-muted-foreground">לא הוקצה לקוח לנכס זה עדיין.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">תמונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {property.images.map((image) => (
              <div key={image.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                <Image src={image.url} alt="" fill className="object-cover" />
                {image.isCover && <Badge className="absolute start-1 top-1">תמונת נושא</Badge>}
                <ActionForm action={deleteImageAction.bind(null, property.id, image.id)}>
                  <Button
                    type="submit"
                    size="icon-sm"
                    variant="destructive"
                    aria-label="מחיקת תמונה"
                    className="absolute end-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </ActionForm>
              </div>
            ))}
          </div>
          <ActionForm action={boundUploadImage} className="flex flex-wrap items-end gap-2">
            <Input type="file" name="file" accept="image/*" required className="max-w-xs" />
            <Button type="submit">העלאת תמונה</Button>
          </ActionForm>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">מסמכים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {documentsWithUrls.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div className="flex items-center gap-2">
                  {doc.signedUrl ? (
                    <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                      {doc.name}
                    </a>
                  ) : (
                    <span>{doc.name}</span>
                  )}
                  <Badge variant="outline">{DOC_TYPE_LABELS[doc.docType] ?? doc.docType}</Badge>
                  {doc.visibleToClient && <Badge variant="secondary">גלוי ללקוח</Badge>}
                </div>
                <ActionForm action={deleteDocumentAction.bind(null, property.id, doc.id)}>
                  <Button type="submit" size="icon-sm" variant="ghost" aria-label="מחיקת מסמך">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </ActionForm>
              </li>
            ))}
            {property.documents.length === 0 && (
              <p className="text-sm text-muted-foreground">עדיין לא הועלו מסמכים.</p>
            )}
          </ul>
          <ActionForm
            action={boundUploadDoc}
            className="flex flex-wrap items-end gap-2"
          >
            <Input type="file" name="file" required className="max-w-xs" />
            <Select
              name="docType"
              defaultValue="OTHER"
              items={[
                { value: "CONTRACT", label: "חוזה" },
                { value: "ID", label: "תעודה מזהה" },
                { value: "OTHER", label: "אחר" },
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTRACT">חוזה</SelectItem>
                <SelectItem value="ID">תעודה מזהה</SelectItem>
                <SelectItem value="OTHER">אחר</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="visibleToClient" />
              גלוי ללקוח
            </label>
            <Button type="submit">העלאת מסמך</Button>
          </ActionForm>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ציר זמן</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActionForm action={boundPostUpdate} className="space-y-2">
            <Textarea name="message" placeholder="כתבו עדכון עבור נכס זה..." rows={2} required />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox name="isInternal" />
                הערה פנימית (לא מוצגת ללקוח)
              </label>
              <Button type="submit">פרסום עדכון</Button>
            </div>
          </ActionForm>
          <ul className="space-y-3">
            {property.updates.map((update) => (
              <li key={update.id} className="rounded-md border p-3 text-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {update.createdBy.name} · {formatDateTime(update.createdAt)}
                  </span>
                  {update.isInternal && <Badge variant="outline">פנימי</Badge>}
                </div>
                <p>{update.message}</p>
              </li>
            ))}
            {property.updates.length === 0 && (
              <p className="text-sm text-muted-foreground">עדיין לא פורסמו עדכונים.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ביקורים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActionForm action={boundScheduleVisit} className="grid gap-2 sm:grid-cols-2">
            <Input type="datetime-local" name="scheduledAt" required />
            <Input name="visitorName" placeholder="שם המבקר (לא חובה)" />
            <Input name="visitorPhone" placeholder="טלפון המבקר (לא חובה)" />
            <Input name="notes" placeholder="הערות (לא חובה)" />
            <Button type="submit" className="sm:col-span-2">
              קביעת ביקור
            </Button>
          </ActionForm>
          <ul className="space-y-2">
            {property.visits.map((visit) => (
              <li key={visit.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <p className="font-medium">{formatDateTime(visit.scheduledAt)}</p>
                  <p className="text-muted-foreground">{visit.visitorName ?? property.ownerClient?.name ?? "—"}</p>
                </div>
                <ActionForm action={updateVisitStatus.bind(null, property.id, visit.id)} className="flex items-center gap-2">
                  <Select
                    name="status"
                    defaultValue={visit.status}
                    items={[
                      { value: "SCHEDULED", label: "מתוכנן" },
                      { value: "COMPLETED", label: "הושלם" },
                      { value: "CANCELLED", label: "בוטל" },
                    ]}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">מתוכנן</SelectItem>
                      <SelectItem value="COMPLETED">הושלם</SelectItem>
                      <SelectItem value="CANCELLED">בוטל</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" size="sm">
                    עדכון
                  </Button>
                </ActionForm>
              </li>
            ))}
            {property.visits.length === 0 && (
              <p className="text-sm text-muted-foreground">עדיין לא נקבעו ביקורים.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Manual call/meeting logging */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">תיעוד שיחה או פגישה</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={logManualActivity} className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
            <input type="hidden" name="propertyId" value={property.id} />
            {property.ownerClientId && <input type="hidden" name="clientId" value={property.ownerClientId} />}
            <Select
              name="activityType"
              defaultValue="CALL_LOGGED"
              items={[
                { value: "CALL_LOGGED", label: "שיחת טלפון" },
                { value: "MEETING_LOGGED", label: "פגישה" },
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CALL_LOGGED">שיחת טלפון</SelectItem>
                <SelectItem value="MEETING_LOGGED">פגישה</SelectItem>
              </SelectContent>
            </Select>
            <Input name="note" placeholder="פרטי השיחה או הפגישה" required />
            <Button type="submit">תיעוד</Button>
          </ActionForm>
        </CardContent>
      </Card>

      {/* Activity history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">היסטוריית פעילות</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLogList logs={property.activityLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
