import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { activityLog, users } from "@/db/schema";
import type { ActivityEntry } from "@/lib/activity-kinds";

/** Most recent activity, newest first — one user's, or everyone's when userId is omitted. */
export async function listActivity({ userId, limit = 200 }: { userId?: number; limit?: number }): Promise<ActivityEntry[]> {
  const query = getDb()
    .select({
      id: activityLog.id,
      userId: activityLog.userId,
      userName: users.fullName,
      kind: activityLog.kind,
      description: activityLog.description,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .innerJoin(users, eq(activityLog.userId, users.id))
    .orderBy(desc(activityLog.createdAt), desc(activityLog.id))
    .limit(limit);

  const rows = userId === undefined ? await query : await query.where(eq(activityLog.userId, userId));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}
