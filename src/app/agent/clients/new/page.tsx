import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewClientForm } from "./client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">New client</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewClientForm />
        </CardContent>
      </Card>
    </div>
  );
}
