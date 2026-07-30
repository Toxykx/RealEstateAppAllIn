import { WifiOff } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <BrandLogo />
      <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 text-primary">
        <WifiOff className="h-5 w-5" />
      </span>
      <h1 className="font-heading text-xl text-foreground">אין חיבור לאינטרנט</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        לא ניתן לטעון את הדף כרגע. בדקו את החיבור לרשת ונסו שוב.
      </p>
    </div>
  );
}
