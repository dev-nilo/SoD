import { boolean, integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

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

/**
 * Quem pode entrar no app. Sem auto-cadastro: um admin cria cada conta, e
 * desativar (active = false) bloqueia o login sem apagar o histórico.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // "admin" | "user"
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Trilha de auditoria: o que cada usuário fez (login, upload da base VAR,
 * comparações, exportações, análises SoD, curadoria, gestão de usuários).
 */
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
