import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Contact Horizon Realty</CardTitle>
              <CardDescription>
                Tell us what you&apos;re looking for and an agent will reach out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
