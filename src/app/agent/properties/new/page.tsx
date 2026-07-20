import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewPropertyForm } from "./property-form";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">נכס חדש</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">פרטי הנכס</CardTitle>
        </CardHeader>
        <CardContent>
          <NewPropertyForm />
        </CardContent>
      </Card>
    </div>
  );
}
