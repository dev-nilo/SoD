import type { SodActivity, SodRisk } from "@/types";
import sodCatalogData from "./sod-catalog.json";

/**
 * Riscos de SoD (335) e atividades do sistema TOTVS (245), extraídos dos
 * relatórios de riscos e do relatório de atividades fornecidos pelo usuário.
 * Não inclui a ligação risco -> atividades: essa é a curadoria feita à mão
 * na tela do Analisador SoD, persistida em sod_risk_activities.
 */
export const INITIAL_SOD_RISKS: SodRisk[] = sodCatalogData.risks as SodRisk[];

export const INITIAL_SOD_ACTIVITIES: SodActivity[] = sodCatalogData.activities;
