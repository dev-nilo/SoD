import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const modules = pgTable("modules", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const varCatalogItems = pgTable("var_catalog_items", {
  id: integer("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id),
});
