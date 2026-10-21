import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/server/activity";
import { requireUser } from "@/lib/server/session";
import { listUsers } from "@/lib/server/users";
import { validateNewUser } from "@/lib/user-rules";

export async function GET() {
  const guard = await requireUser("manage-users");
  if (guard.response) return guard.response;
  return NextResponse.json(await listUsers());
}

export async function POST(request: NextRequest) {
  const guard = await requireUser("manage-users");
  if (guard.response) return guard.response;

  const body = (await request.json()) as Record<string, unknown>;
  const input = {
    username: String(body.username ?? "").trim().toLowerCase(),
    fullName: String(body.fullName ?? "").trim(),
    password: String(body.password ?? ""),
    role: String(body.role ?? "user"),
  };
  const error = validateNewUser(input);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, input.username));
  if (existing) return NextResponse.json({ error: `O usuário "${input.username}" já existe.` }, { status: 409 });

  const [created] = await db
    .insert(users)
    .values({
      username: input.username,
      fullName: input.fullName,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: input.role,
    })
    .returning({ id: users.id });

  await logActivity(guard.user.id, "gestao-usuarios", `Criou o usuário ${input.username} (${input.role})`);
  return NextResponse.json({ id: created.id }, { status: 201 });
}
