import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

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

/**
 * Riscos de Segregação de Função (SoD), sem as atividades que os configuram
 * — essa ligação é o que sod_risk_activities registra, curada à mão.
 */
export const sodRisks = pgTable("sod_risks", {
  id: text("id").primaryKey(), // código natural do risco, ex: "SOD_001", "SAT_004.2"
  kind: text("kind").notNull(), // "funcao" | "critico"
  description: text("description").notNull(),
  criticality: integer("criticality").notNull(),
});

/**
 * Atividades do sistema TOTVS (dado de referência, não curado).
 */
export const sodActivities = pgTable("sod_activities", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

/**
 * Quais funcionalidades do VAR cada atividade exige (dado de referência,
 * vindo do relatório de atividades do sistema — não curado).
 */
export const sodActivityFunctionalities = pgTable(
  "sod_activity_functionalities",
  {
    activityId: integer("activity_id")
      .notNull()
      .references(() => sodActivities.id),
    functionalityId: integer("functionality_id")
      .notNull()
      .references(() => varCatalogItems.id),
  },
  (t) => [primaryKey({ columns: [t.activityId, t.functionalityId] })]
);

/**
 * A curadoria em si: quais atividades, combinadas, configuram cada risco.
 * Tabela vazia até alguém com conhecimento de negócio mapear os riscos.
 */
export const sodRiskActivities = pgTable(
  "sod_risk_activities",
  {
    riskId: text("risk_id")
      .notNull()
      .references(() => sodRisks.id),
    activityId: integer("activity_id")
      .notNull()
      .references(() => sodActivities.id),
  },
  (t) => [primaryKey({ columns: [t.riskId, t.activityId] })]
);
