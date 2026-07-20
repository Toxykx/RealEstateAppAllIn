import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Post-login landing pad: sends each role to its own dashboard. */
export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  switch (session.user.role) {
    case "CLIENT":
      redirect("/client");
    case "AGENT":
      redirect("/agent");
    case "MANAGER":
      redirect("/manager");
  }
}
