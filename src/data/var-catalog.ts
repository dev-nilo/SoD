import type { ModuleOption, VarCatalogItem } from "@/types";
import catalogData from "./var-catalog.json";

/**
 * Base completa do catálogo VAR (11.277 funcionalidades, todos os módulos TOTVS),
 * extraída da planilha "Base Var 25 agosto 2026" fornecida pelo usuário.
 */
export const INITIAL_VAR_CATALOG: VarCatalogItem[] = catalogData.items;

export const AVAILABLE_MODULES: ModuleOption[] = catalogData.modules;
