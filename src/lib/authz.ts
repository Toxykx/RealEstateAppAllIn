import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Not allowed") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Requires a signed-in user, optionally restricted to a set of roles.
 * Throws rather than returning null so callers (server actions/route
 * handlers) fail loudly instead of silently leaking data on a missed check.
 */
export async function requireUser(allowedRoles?: Role[]) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session.user;
}

/**
 * Layout-friendly variant of requireUser: redirects instead of throwing.
 * Middleware already gates these routes, so this only fires as a defense-in-depth
 * fallback (e.g. session expired between the middleware check and the render).
 */
export async function requireUserOrRedirect(allowedRoles?: Role[]) {
  try {
    return await requireUser(allowedRoles);
  } catch {
    redirect("/login");
  }
}

/**
 * Prisma `where` fragment that scopes an Agent's own records while letting a
 * Manager see everything. Use for properties/clients queries:
 *   prisma.property.findMany({ where: agentScope(user, "agentId") })
 */
export function agentScope(
  user: { id: string; role: Role },
  agentField: string,
): Record<string, string> {
  if (user.role === "MANAGER") return {};
  return { [agentField]: user.id };
}
