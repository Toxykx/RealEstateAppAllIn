import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          <span>אופק נכסים</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/properties" className="text-muted-foreground transition-colors hover:text-foreground">
            נכסים
          </Link>
          <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
            צור קשר
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/properties"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "sm:hidden" })}
          >
            נכסים
          </Link>
          <Link href="/login" className={buttonVariants({ size: "sm" })}>
            התחברות
          </Link>
        </div>
      </div>
    </header>
  );
}
