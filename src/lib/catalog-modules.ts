import type { ModuleOption } from "@/types";

/**
 * Appends the "no filter" sentinel every module dropdown in the app needs,
 * after the modules actually present in the VAR Catalog.
 */
export function toAvailableModules(moduleRows: { id: number; name: string }[]): ModuleOption[] {
  return [...moduleRows.map((m) => ({ id: String(m.id), name: m.name })), { id: "0", name: "Todos os Módulos (Sem Filtro)" }];
}
