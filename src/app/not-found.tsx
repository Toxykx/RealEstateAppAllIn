import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">הדף המבוקש לא נמצא.</p>
      <Link href="/" className={buttonVariants()}>
        חזרה לדף הבית
      </Link>
    </div>
  );
}
