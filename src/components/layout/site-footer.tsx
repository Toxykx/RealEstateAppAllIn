import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <BrandLogo />
        <p>&copy; {new Date().getFullYear()} דמיטרי חליקוב. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
}
