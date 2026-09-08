import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { importPropertiesFromFile } from "@/lib/actions/import";
import { ActionForm } from "@/components/action-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function ImportPropertiesPage() {
  await requireUser(["AGENT", "MANAGER"]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/agent/properties" className="text-sm text-muted-foreground hover:underline">
          &rarr; חזרה לנכסים
        </Link>
        <h1 className="mt-1 text-2xl font-bold">ייבוא נכסים מ-Excel</h1>
        <p className="text-muted-foreground">
          מתאים לייבוא מ-Monday.com: בלוח שלכם, פתחו את התפריט ובחרו &quot;Export board to Excel&quot;, ואז העלו את הקובץ שהתקבל כאן.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">עמודות נדרשות בקובץ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>שורה ראשונה = כותרות עמודות. חובה: <span className="text-foreground">כותרת, רחוב, תיאור, מחיר</span>.</p>
          <p>
            אופציונלי: <span className="text-foreground">סוג נכס</span> (דירה/בית/וילה/מגרש/מסחרי — ברירת מחדל: דירה),{" "}
            <span className="text-foreground">תמונות</span> (קישורים מופרדים בפסיק או נקודה-פסיק),{" "}
            <span className="text-foreground">חדרים, חדרי רחצה, שטח</span>.
          </p>
          <p>העיר משותפת לכל הנכסים בקובץ, ונקבעת כאן למטה — לא בעמודה נפרדת.</p>
          <p>נכסים עם כותרת זהה לנכס קיים שלכם ידולגו אוטומטית, כדי למנוע כפילויות בהעלאות חוזרות.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ActionForm action={importPropertiesFromFile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city" required>עיר</Label>
              <Input id="city" name="city" placeholder="לדוגמה: תל אביב" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file" required>קובץ Excel</Label>
              <Input id="file" type="file" name="file" accept=".xlsx" required />
            </div>
            <SubmitButton pendingLabel="מייבא...">ייבוא נכסים</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
    </div>
  );
}
