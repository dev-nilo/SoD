import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { modules, varCatalogItems } from "@/db/schema";
import { toAvailableModules } from "@/lib/catalog-modules";
import { logActivity } from "@/lib/server/activity";
import { requireUser } from "@/lib/server/session";
import type { VarCatalogItem } from "@/types";

export async function GET() {
  const guard = await requireUser();
  if (guard.response) return guard.response;

  const db = getDb();

  const [items, moduleRows] = await Promise.all([
    db
      .select({
        id: varCatalogItems.id,
        code: varCatalogItems.code,
        name: varCatalogItems.name,
        moduleId: varCatalogItems.moduleId,
        moduleName: modules.name,
      })
      .from(varCatalogItems)
      .innerJoin(modules, eq(varCatalogItems.moduleId, modules.id)),
    db.select().from(modules).orderBy(modules.id),
  ]);

  return NextResponse.json({ items, modules: toAvailableModules(moduleRows) });
}

export async function POST(request: NextRequest) {
  const guard = await requireUser("edit-catalog");
  if (guard.response) return guard.response;

  const body = (await request.json()) as Partial<VarCatalogItem>;

  const id = Number(body.id);
  const moduleId = Number(body.moduleId);
  const name = body.name?.trim();
  const moduleName = body.moduleName?.trim();
  const code = body.code?.trim() ?? "";

  if (!Number.isFinite(id) || !Number.isFinite(moduleId) || !name || !moduleName) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes ou inválidos." }, { status: 400 });
  }

  const db = getDb();

  await db
    .insert(modules)
    .values({ id: moduleId, name: moduleName })
    .onConflictDoUpdate({ target: modules.id, set: { name: sql`excluded.name` } });

  await db
    .insert(varCatalogItems)
    .values({ id, code, name, moduleId })
    .onConflictDoUpdate({
      target: varCatalogItems.id,
      set: { code: sql`excluded.code`, name: sql`excluded.name`, moduleId: sql`excluded.module_id` },
    });

  await logActivity(guard.user.id, "edicao-catalogo", `Salvou a funcionalidade ${id} — ${name}`);

  const saved: VarCatalogItem = { id, code, name, moduleId, moduleName };
  return NextResponse.json(saved, { status: 201 });
}
