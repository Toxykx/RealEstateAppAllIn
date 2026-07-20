import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: only decodes the JWT via authConfig.callbacks.authorized.
// Never import "@/auth" (Prisma) here.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/client/:path*", "/agent/:path*", "/manager/:path*"],
};
