import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe auth config: no Prisma import here. This is shared between
 * middleware.ts (Edge runtime) and the full auth.ts (Node runtime, which adds
 * the Credentials provider). Keeping Prisma out of this file is what lets
 * middleware.ts decode the JWT without crashing on Edge.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = request.nextUrl;

      const roleForPath = (path: string): Role | null => {
        if (path.startsWith("/client")) return "CLIENT";
        if (path.startsWith("/agent")) return "AGENT";
        if (path.startsWith("/manager")) return "MANAGER";
        return null;
      };

      const requiredRole = roleForPath(pathname);
      if (!requiredRole) return true;
      if (!isLoggedIn) return false;
      if (role === "MANAGER") return true; // manager has full access everywhere
      return role === requiredRole;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts (Node runtime only)
} satisfies NextAuthConfig;
