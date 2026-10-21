import type { ActivityKind } from "@/lib/activity-kinds";

/**
 * Fire-and-forget: tells the server about an analysis the browser just ran,
 * for the activity log. A failure here is logged and otherwise ignored.
 */
export function reportActivity(kind: ActivityKind, description: string): void {
  fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, description }),
  }).catch((err) => console.error("Falha ao registrar atividade:", err));
}
