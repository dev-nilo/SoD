import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/server/activity";
import { requireUser } from "@/lib/server/session";
import { validateNewPassword } from "@/lib/user-rules";

export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (guard.response) return guard.response;

  const body = (await request.json()) as Record<string, unknown>;
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  const error = validateNewPassword(newPassword);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, guard.user.id));
  if (!row || !(await bcrypt.compare(currentPassword, row.passwordHash))) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(newPassword, 10) })
    .where(eq(users.id, guard.user.id));
  await logActivity(guard.user.id, "troca-senha", "Trocou a própria senha");
  return NextResponse.json({ ok: true });
}
