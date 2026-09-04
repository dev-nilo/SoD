import type { SodActivity, SodRisk, SodRiskMappings } from "@/types";

interface RiskRow {
  id: string;
  kind: string;
  description: string;
  criticality: number;
}

interface ActivityRow {
  id: number;
  name: string;
}

interface ActivityFunctionalityRow {
  activityId: number;
  functionalityId: number;
}

interface RiskActivityRow {
  riskId: string;
  activityId: number;
}

/**
 * Shapes the four SoD reference tables (risks, activities, and their two
 * link tables) into the risks/activities/mappings triple the curation and
 * analysis screens work with. Pure: takes already-fetched rows, no db.
 */
export function toSodRiskMatrix(
  riskRows: RiskRow[],
  activityRows: ActivityRow[],
  activityLinkRows: ActivityFunctionalityRow[],
  riskLinkRows: RiskActivityRow[]
): { risks: SodRisk[]; activities: SodActivity[]; mappings: SodRiskMappings } {
  const functionalityIdsByActivity = new Map<number, number[]>();
  for (const link of activityLinkRows) {
    const list = functionalityIdsByActivity.get(link.activityId) ?? [];
    list.push(link.functionalityId);
    functionalityIdsByActivity.set(link.activityId, list);
  }

  const activities: SodActivity[] = activityRows.map((a) => ({
    id: a.id,
    name: a.name,
    functionalityIds: functionalityIdsByActivity.get(a.id) ?? [],
  }));

  const mappings: SodRiskMappings = {};
  for (const link of riskLinkRows) {
    const list = mappings[link.riskId] ?? [];
    list.push(link.activityId);
    mappings[link.riskId] = list;
  }

  const risks: SodRisk[] = riskRows.map((r) => ({
    id: r.id,
    kind: r.kind as SodRisk["kind"],
    description: r.description,
    criticality: r.criticality,
  }));

  return { risks, activities, mappings };
}
