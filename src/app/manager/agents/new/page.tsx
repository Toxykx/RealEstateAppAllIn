import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewAgentForm } from "./agent-form";

export default function NewAgentPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">סוכן חדש</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">פרטי החשבון</CardTitle>
        </CardHeader>
        <CardContent>
          <NewAgentForm />
        </CardContent>
      </Card>
    </div>
  );
}
