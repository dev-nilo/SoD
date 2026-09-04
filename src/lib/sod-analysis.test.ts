import { describe, expect, it } from "vitest";

import { analyzeProfileRisks, matchProfileFunctionalities, selectRisksWithAddedFunctionality } from "@/lib/sod-analysis";
import type { MatchedProfileFunctionality, ProfileFunctionalityRow, SodActivity, SodRisk, VarCatalogItem } from "@/types";

const catalog: VarCatalogItem[] = [
  { id: 1, code: "01", name: "[01] Manter cadastro", moduleId: 1, moduleName: "Financeiro" },
  { id: 2, code: "02", name: "[02] Aprovar baixa", moduleId: 1, moduleName: "Financeiro" },
  { id: 3, code: "03", name: "[03] Sem relação", moduleId: 1, moduleName: "Financeiro" },
];

const activities: SodActivity[] = [
  { id: 10, name: "Manter cadastro", functionalityIds: [1] },
  { id: 20, name: "Aprovar baixa", functionalityIds: [2] },
];

const risk: SodRisk = { id: "SOD_001", kind: "funcao", description: "desc", criticality: 2 };

describe("matchProfileFunctionalities", () => {
  it("keeps only rows that match the catalog", () => {
    const rows: ProfileFunctionalityRow[] = [
      { perfil: "P", sistema: "S", funcionalidade: "[01] Manter cadastro", status: "Adicionado" },
      { perfil: "P", sistema: "S", funcionalidade: "Nada a ver com nada", status: "Não alterado" },
    ];
    const result = matchProfileFunctionalities(rows, catalog);
    expect(result).toHaveLength(1);
    expect(result[0].item.id).toBe(1);
    expect(result[0].status).toBe("Adicionado");
  });
});

describe("analyzeProfileRisks", () => {
  it("fires a risk once every one of its activities has a matching functionality", () => {
    const profile: MatchedProfileFunctionality[] = [
      { item: catalog[0], status: "Adicionado" },
      { item: catalog[1], status: "Não alterado" },
    ];
    const result = analyzeProfileRisks(profile, [risk], activities, { SOD_001: [10, 20] });
    expect(result).toHaveLength(1);
    expect(result[0].matches.map((m) => m.activity.id).sort()).toEqual([10, 20]);
  });

  it("does not fire when only one side of the risk is present", () => {
    const profile: MatchedProfileFunctionality[] = [{ item: catalog[0], status: "Adicionado" }];
    const result = analyzeProfileRisks(profile, [risk], activities, { SOD_001: [10, 20] });
    expect(result).toHaveLength(0);
  });

  it("does not fire for a risk with no curated activities", () => {
    const profile: MatchedProfileFunctionality[] = [
      { item: catalog[0], status: "Adicionado" },
      { item: catalog[1], status: "Adicionado" },
    ];
    const result = analyzeProfileRisks(profile, [risk], activities, {});
    expect(result).toHaveLength(0);
  });

  it("emits one row per combination when an activity has multiple matches", () => {
    const richActivities: SodActivity[] = [
      { id: 10, name: "Manter cadastro", functionalityIds: [1, 3] },
      { id: 20, name: "Aprovar baixa", functionalityIds: [2] },
    ];
    const profile: MatchedProfileFunctionality[] = [
      { item: catalog[0], status: "Adicionado" },
      { item: catalog[2], status: "Adicionado" },
      { item: catalog[1], status: "Não alterado" },
    ];
    const result = analyzeProfileRisks(profile, [risk], richActivities, { SOD_001: [10, 20] });
    expect(result).toHaveLength(2);
  });
});

describe("selectRisksWithAddedFunctionality", () => {
  it("keeps only combinations involving at least one Adicionado functionality", () => {
    const triggered = [
      { risk, matches: [{ activity: activities[0], functionality: catalog[0], status: "Adicionado" }] },
      { risk, matches: [{ activity: activities[0], functionality: catalog[0], status: "Não alterado" }] },
    ];
    expect(selectRisksWithAddedFunctionality(triggered)).toHaveLength(1);
  });
});
