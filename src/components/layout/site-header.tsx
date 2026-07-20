import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium tracking-wide sm:flex">
          <Link href="/properties" className="text-muted-foreground transition-colors hover:text-primary">
            נכסים
          </Link>
          <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
            יצירת קשר
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/properties"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "sm:hidden" })}
          >
            נכסים
          </Link>
          <Link href="/login" className={buttonVariants({ size: "sm", className: "tracking-wide" })}>
            התחברות
          </Link>
        </div>
      </div>
    </header>
  );
}
