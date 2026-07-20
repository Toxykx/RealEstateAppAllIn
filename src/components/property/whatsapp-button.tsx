import { buttonVariants } from "@/components/ui/button";

function buildWhatsAppMessage(propertyReference: string) {
  return `שלום,\nהגעתי דרך אפליקציית ALL IN.\n\nאני מתעניין בנכס מספר: ${propertyReference}\n\nאשמח לקבל פרטים נוספים.\nתודה.`;
}

function buildWhatsAppLink(phone: string, propertyReference: string) {
  const digits = phone.replace(/[^0-9]/g, "").replace(/^0/, "972");
  const message = buildWhatsAppMessage(propertyReference);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppButton({
  phone,
  propertyReference,
  className,
}: {
  phone: string;
  propertyReference: string;
  className?: string;
}) {
  return (
    <a
      href={buildWhatsAppLink(phone, propertyReference)}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ variant: "outline", className: `w-full ${className ?? ""}` })}
    >
      💬 שליחת הודעה למתווך
    </a>
  );
}
