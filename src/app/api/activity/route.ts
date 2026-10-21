import { NextRequest, NextResponse } from "next/server";

import { isClientActivityKind } from "@/lib/activity-kinds";
import { logActivity } from "@/lib/server/activity";
import { listActivity } from "@/lib/server/activity-query";
import { requireUser } from "@/lib/server/session";
import { can } from "@/lib/user-rules";

/** The caller's own history; ?scope=all returns everyone's (admin only). */
export async function GET(request: NextRequest) {
  const guard = await requireUser();
  if (guard.response) return guard.response;

  const all = request.nextUrl.searchParams.get("scope") === "all";
  if (all && !can(guard.user.role, "view-all-activity")) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }
  return NextResponse.json(await listActivity({ userId: all ? undefined : guard.user.id }));
}

/** Records an analysis that ran entirely in the browser (see CLIENT_ACTIVITY_KINDS). */
export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (guard.response) return guard.response;

  const body = (await request.json()) as { kind?: unknown; description?: unknown };
  if (!isClientActivityKind(body.kind) || typeof body.description !== "string" || !body.description.trim()) {
    return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
  }
  await logActivity(guard.user.id, body.kind, body.description.trim());
  return NextResponse.json({ ok: true }, { status: 201 });
}
