export function formatPrice(price: number | string, currency = "ILS") {
  const value = typeof price === "string" ? Number(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  VILLA: "Villa",
  LAND: "Land",
  COMMERCIAL: "Commercial",
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  AVAILABLE: "Available",
  IN_PROGRESS: "In Progress",
  SOLD: "Sold",
  RENTED: "Rented",
  ARCHIVED: "Archived",
};

export const DEAL_STAGE_STEPS = [
  { value: "CONTRACT_SIGNED", label: "Contract signed" },
  { value: "PHOTOS_COMPLETED", label: "Photos completed" },
  { value: "PUBLISHED", label: "Published" },
  { value: "VISITS", label: "Visits" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "SOLD", label: "Sold" },
] as const;

export function dealStageIndex(stage: string) {
  return DEAL_STAGE_STEPS.findIndex((s) => s.value === stage);
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
