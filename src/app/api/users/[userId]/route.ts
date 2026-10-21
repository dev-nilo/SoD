import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { logActivity } from "@/lib/server/activity";
import { requireUser } from "@/lib/server/session";
import { listUsers } from "@/lib/server/users";
import { checkUserChange, isUserRole, validateNewPassword, type UserChange } from "@/lib/user-rules";

type Params = { params: Promise<{ userId: string }> };

async function loadTarget(params: Params["params"]) {
  const id = Number((await params).userId);
  const all = await listUsers();
  return { target: all.find((u) => u.id === id), all };
}

/** Edits name, role, active flag and/or resets the password of one user. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireUser("manage-users");
  if (guard.response) return guard.response;

  const { target, all } = await loadTarget(params);
  if (!target) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const body = (await request.json()) as Record<string, unknown>;
  const set: Partial<typeof users.$inferInsert> = {};
  const change: Exclude<UserChange, "delete"> = {};
  const done: string[] = [];

  if (body.fullName !== undefined) {
    const fullName = String(body.fullName).trim();
    if (!fullName) return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });
    set.fullName = fullName;
    done.push("nome");
  }
  if (body.role !== undefined) {
    if (!isUserRole(body.role)) return NextResponse.json({ error: "Perfil de acesso inválido." }, { status: 400 });
    set.role = change.role = body.role;
    done.push(`perfil → ${body.role}`);
  }
  if (body.active !== undefined) {
    set.active = change.active = Boolean(body.active);
    done.push(set.active ? "ativou" : "desativou");
  }
  if (body.password !== undefined) {
    const password = String(body.password);
    const error = validateNewPassword(password);
    if (error) return NextResponse.json({ error }, { status: 400 });
    set.passwordHash = await bcrypt.hash(password, 10);
    done.push("redefiniu a senha");
  }
  if (done.length === 0) return NextResponse.json({ error: "Nada para alterar." }, { status: 400 });

  const blocked = checkUserChange(guard.user, target, change, all);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 409 });

  await getDb().update(users).set(set).where(eq(users.id, target.id));
  await logActivity(guard.user.id, "gestao-usuarios", `Editou o usuário ${target.username}: ${done.join(", ")}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await requireUser("manage-users");
  if (guard.response) return guard.response;

  const { target, all } = await loadTarget(params);
  if (!target) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const blocked = checkUserChange(guard.user, target, "delete", all);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 409 });

  await getDb().delete(users).where(eq(users.id, target.id));
  await logActivity(guard.user.id, "gestao-usuarios", `Excluiu o usuário ${target.username}`);
  return NextResponse.json({ ok: true });
}
