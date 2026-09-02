import { sql } from "drizzle-orm";
import { getDb } from "../src/db";
import { modules, varCatalogItems } from "../src/db/schema";
import { AVAILABLE_MODULES, INITIAL_VAR_CATALOG } from "../src/data/var-catalog";

async function main() {
  const db = getDb();

  const moduleRows = AVAILABLE_MODULES.filter((m) => m.id !== "0").map((m) => ({
    id: Number(m.id),
    name: m.name,
  }));

  await db
    .insert(modules)
    .values(moduleRows)
    .onConflictDoUpdate({ target: modules.id, set: { name: sql`excluded.name` } });

  const itemRows = INITIAL_VAR_CATALOG.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    moduleId: item.moduleId,
  }));

  await db
    .insert(varCatalogItems)
    .values(itemRows)
    .onConflictDoUpdate({
      target: varCatalogItems.id,
      set: { code: sql`excluded.code`, name: sql`excluded.name`, moduleId: sql`excluded.module_id` },
    });

  console.log(`Seeded ${moduleRows.length} modules and ${itemRows.length} catalog items.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
