import { describe, expect, it } from "vitest";

import { toAvailableModules } from "@/lib/catalog-modules";

describe("toAvailableModules", () => {
  it("appends the no-filter sentinel after the real modules", () => {
    const result = toAvailableModules([
      { id: 1, name: "Financeiro" },
      { id: 2, name: "Compras" },
    ]);
    expect(result).toEqual([
      { id: "1", name: "Financeiro" },
      { id: "2", name: "Compras" },
      { id: "0", name: "Todos os Módulos (Sem Filtro)" },
    ]);
  });

  it("returns just the sentinel when there are no modules", () => {
    expect(toAvailableModules([])).toEqual([{ id: "0", name: "Todos os Módulos (Sem Filtro)" }]);
  });
});
