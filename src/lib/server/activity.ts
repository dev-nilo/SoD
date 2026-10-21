import { getDb } from "@/db";
import { activityLog } from "@/db/schema";
import type { ActivityKind } from "@/lib/activity-kinds";

/**
 * Appends one entry to the audit trail. Never throws: a failed log write
 * must not fail the action it's describing.
 */
export async function logActivity(userId: number, kind: ActivityKind, description: string): Promise<void> {
  try {
    await getDb().insert(activityLog).values({ userId, kind, description: description.slice(0, 1000) });
  } catch (err) {
    console.error("Falha ao registrar atividade:", err);
  }
}
