import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/server/activity";
import { isUserRole } from "@/lib/user-rules";

class InactiveUserError extends CredentialsSignin {
  code = "inactive";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;

        const db = getDb();
        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
        if (!user.active) throw new InactiveUserError();

        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
        await logActivity(user.id, "login", "Entrou no sistema");

        return {
          id: String(user.id),
          name: user.fullName,
          role: isUserRole(user.role) ? user.role : "user",
        };
      },
    }),
  ],
});
