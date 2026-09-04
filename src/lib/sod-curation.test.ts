import { describe, expect, it } from "vitest";

import {
  selectFilteredRisks,
  selectImpliedFunctionalityIds,
  selectStats,
  toggleActivity,
} from "@/lib/sod-curation";
import type { SodActivity, SodRisk } from "@/types";

const risks: SodRisk[] = [
  { id: "SOD_001", kind: "funcao", description: "Alterar cadastro e aprovar baixa", criticality: 2 },
  { id: "SOD_002", kind: "funcao", description: "Lançar e conciliar", criticality: 2 },
  { id: "SAT_001", kind: "critico", description: "Gerenciar jobs", criticality: 2 },
];

const activities: SodActivity[] = [
  { id: 1, name: "Manter cadastro", functionalityIds: [10, 11] },
  { id: 2, name: "Aprovar baixa", functionalityIds: [11, 12] },
];

describe("toggleActivity", () => {
  it("adds an id not yet present", () => {
    expect(toggleActivity([1], 2)).toEqual([1, 2]);
  });

  it("removes an id already present", () => {
    expect(toggleActivity([1, 2], 1)).toEqual([2]);
  });
});

describe("selectStats", () => {
  it("counts a risk as mapped only once it has at least one activity", () => {
    const stats = selectStats(risks, { SOD_001: [1, 2] });
    expect(stats).toEqual({ total: 3, mapped: 1, pending: 2 });
  });

  it("does not count an empty activity list as mapped", () => {
    const stats = selectStats(risks, { SOD_001: [] });
    expect(stats).toEqual({ total: 3, mapped: 0, pending: 3 });
  });
});

describe("selectFilteredRisks", () => {
  it("filters to pending risks", () => {
    const result = selectFilteredRisks(risks, { SOD_001: [1] }, "Pendente", "");
    expect(result.map((r) => r.id)).toEqual(["SOD_002", "SAT_001"]);
  });

  it("filters to mapped risks", () => {
    const result = selectFilteredRisks(risks, { SOD_001: [1] }, "Mapeado", "");
    expect(result.map((r) => r.id)).toEqual(["SOD_001"]);
  });

  it("matches search against id or description", () => {
    expect(selectFilteredRisks(risks, {}, "ALL", "jobs").map((r) => r.id)).toEqual(["SAT_001"]);
    expect(selectFilteredRisks(risks, {}, "ALL", "sod_002").map((r) => r.id)).toEqual(["SOD_002"]);
  });
});

describe("selectImpliedFunctionalityIds", () => {
  it("unions functionalities across every selected activity, without duplicates", () => {
    expect(selectImpliedFunctionalityIds([1, 2], activities).sort()).toEqual([10, 11, 12]);
  });

  it("is empty for no activities selected", () => {
    expect(selectImpliedFunctionalityIds([], activities)).toEqual([]);
  });
});
