import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { can, isUserRole, type Permission, type UserRole } from "@/lib/user-rules";

export interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

/**
 * Re-reads the signed-in user from the DB rather than trusting the JWT
 * alone, so deactivating someone or changing their role takes effect on
 * their very next request instead of when their session expires.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const [row] = await getDb().select().from(users).where(eq(users.id, id));
  if (!row || !row.active) return null;
  return { id: row.id, username: row.username, fullName: row.fullName, role: isUserRole(row.role) ? row.role : "user" };
}

type Guarded = { user: CurrentUser; response?: undefined } | { user?: undefined; response: NextResponse };

/** For route handlers: the current user, or the 401/403 response to return instead. */
export async function requireUser(permission?: Permission): Promise<Guarded> {
  const user = await getCurrentUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 }) };
  }
  if (permission && !can(user.role, permission)) {
    return { response: NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 }) };
  }
  return { user };
}
