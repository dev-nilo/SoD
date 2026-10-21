import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

import type { UserRole } from "@/lib/user-rules";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: { id: string; name: string; role: UserRole };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

/**
 * The edge-safe half of the Auth.js setup: no DB, no bcrypt, so the
 * middleware can import it. src/auth.ts adds the Credentials provider on top.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/login" || pathname.startsWith("/api/auth")) return true;
      if (auth?.user) return true;
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
      }
      return false; // redireciona para /login
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = token.role ?? "user";
      return session;
    },
  },
} satisfies NextAuthConfig;
