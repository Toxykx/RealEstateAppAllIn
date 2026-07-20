export function formatPrice(price: number | string, currency = "ILS") {
  const value = typeof price === "string" ? Number(price) : price;
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "דירה",
  HOUSE: "בית פרטי",
  VILLA: "וילה",
  LAND: "מגרש",
  COMMERCIAL: "מסחרי",
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "טיוטה",
  AVAILABLE: "זמין",
  IN_PROGRESS: "בתהליך",
  SOLD: "נמכר",
  RENTED: "הושכר",
  ARCHIVED: "בארכיון",
};

export const DEAL_STAGE_STEPS = [
  { value: "CONTRACT_SIGNED", label: "חוזה נחתם" },
  { value: "PHOTOS_COMPLETED", label: "צילומים הושלמו" },
  { value: "PUBLISHED", label: "פורסם" },
  { value: "VISITS", label: "ביקורים" },
  { value: "NEGOTIATION", label: "משא ומתן" },
  { value: "SOLD", label: "נמכר" },
] as const;

export function dealStageIndex(stage: string) {
  return DEAL_STAGE_STEPS.findIndex((s) => s.value === stage);
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
