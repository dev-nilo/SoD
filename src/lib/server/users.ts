import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { isUserRole, type UserRole } from "@/lib/user-rules";

export interface AdminUserView {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Every user, without password hashes — the shape the admin screen lists. */
export async function listUsers(): Promise<AdminUserView[]> {
  const rows = await getDb().select().from(users).orderBy(desc(users.active), users.fullName);
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    fullName: r.fullName,
    role: isUserRole(r.role) ? r.role : "user",
    active: r.active,
    lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}
