import { describe, expect, it } from "vitest";

import { toSodRiskMatrix } from "@/lib/sod-risk-matrix";

describe("toSodRiskMatrix", () => {
  it("groups link rows into functionalityIds and mappings by their owning row", () => {
    const result = toSodRiskMatrix(
      [{ id: "SOD_001", kind: "funcao", description: "desc", criticality: 2 }],
      [
        { id: 10, name: "Manter cadastro" },
        { id: 20, name: "Aprovar baixa" },
      ],
      [
        { activityId: 10, functionalityId: 1 },
        { activityId: 10, functionalityId: 3 },
        { activityId: 20, functionalityId: 2 },
      ],
      [
        { riskId: "SOD_001", activityId: 10 },
        { riskId: "SOD_001", activityId: 20 },
      ]
    );

    expect(result.risks).toEqual([{ id: "SOD_001", kind: "funcao", description: "desc", criticality: 2 }]);
    expect(result.activities).toEqual([
      { id: 10, name: "Manter cadastro", functionalityIds: [1, 3] },
      { id: 20, name: "Aprovar baixa", functionalityIds: [2] },
    ]);
    expect(result.mappings).toEqual({ SOD_001: [10, 20] });
  });

  it("gives activities with no functionality link an empty list, and risks with no mapping no key", () => {
    const result = toSodRiskMatrix(
      [{ id: "SOD_001", kind: "critico", description: "desc", criticality: 1 }],
      [{ id: 10, name: "Sem vínculo" }],
      [],
      []
    );

    expect(result.activities).toEqual([{ id: 10, name: "Sem vínculo", functionalityIds: [] }]);
    expect(result.mappings).toEqual({});
  });
});
