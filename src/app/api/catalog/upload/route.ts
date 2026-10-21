import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { modules, varCatalogItems } from "@/db/schema";
import { codeFromName, diffCatalog } from "@/lib/catalog-upload";
import { logActivity } from "@/lib/server/activity";
import { requireUser } from "@/lib/server/session";
import type { VarCatalogItem } from "@/types";

export const maxDuration = 60;

const BATCH_SIZE = 500;

function isCatalogItem(value: unknown): value is VarCatalogItem {
  const v = value as VarCatalogItem;
  return (
    !!v &&
    Number.isInteger(v.id) &&
    v.id > 0 &&
    typeof v.name === "string" &&
    v.name.trim() !== "" &&
    Number.isInteger(v.moduleId) &&
    typeof v.moduleName === "string" &&
    v.moduleName.trim() !== ""
  );
}

/**
 * Upserts a whole "Base VAR" spreadsheet (already parsed in the browser by
 * parseCatalogSheet) into the catalog. Items absent from the upload are
 * reported back as "missing" but never deleted: SoD curation references
 * catalog ids, and removing one is a decision for the admin to make.
 */
export async function POST(request: NextRequest) {
  const guard = await requireUser("edit-catalog");
  if (guard.response) return guard.response;

  const body = (await request.json()) as { fileName?: unknown; items?: unknown };
  const fileName = typeof body.fileName === "string" ? body.fileName : "planilha";
  if (!Array.isArray(body.items) || body.items.length === 0 || !body.items.every(isCatalogItem)) {
    return NextResponse.json({ error: "Nenhuma funcionalidade válida na planilha." }, { status: 400 });
  }
  const incoming: VarCatalogItem[] = body.items.map((i) => ({
    id: i.id,
    name: i.name.trim(),
    code: codeFromName(i.name.trim()),
    moduleId: i.moduleId,
    moduleName: i.moduleName.trim(),
  }));

  const db = getDb();
  const existing = await db
    .select({
      id: varCatalogItems.id,
      code: varCatalogItems.code,
      name: varCatalogItems.name,
      moduleId: varCatalogItems.moduleId,
      moduleName: modules.name,
    })
    .from(varCatalogItems)
    .innerJoin(modules, eq(varCatalogItems.moduleId, modules.id));

  const diff = diffCatalog(existing, incoming);

  const moduleRows = [...new Map(incoming.map((i) => [i.moduleId, { id: i.moduleId, name: i.moduleName }])).values()];
  await db
    .insert(modules)
    .values(moduleRows)
    .onConflictDoUpdate({ target: modules.id, set: { name: sql`excluded.name` } });

  const changed = [...diff.added, ...diff.updated].map(({ id, code, name, moduleId }) => ({ id, code, name, moduleId }));
  for (let i = 0; i < changed.length; i += BATCH_SIZE) {
    await db
      .insert(varCatalogItems)
      .values(changed.slice(i, i + BATCH_SIZE))
      .onConflictDoUpdate({
        target: varCatalogItems.id,
        set: { code: sql`excluded.code`, name: sql`excluded.name`, moduleId: sql`excluded.module_id` },
      });
  }

  await logActivity(
    guard.user.id,
    "upload-base-var",
    `Importou "${fileName}": ${diff.added.length} novas, ${diff.updated.length} alteradas, ` +
      `${diff.unchanged} sem mudança, ${diff.missing.length} ausentes na planilha`
  );

  return NextResponse.json({
    fileName,
    added: diff.added.length,
    updated: diff.updated.length,
    unchanged: diff.unchanged,
    missing: diff.missing,
  });
}
