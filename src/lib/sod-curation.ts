import type { SodActivity, SodRisk, SodRiskMappings } from "@/types";

export type SodCurationFilter = "ALL" | "Mapeado" | "Pendente";

/**
 * Pure curation-session helpers: no React, no fetch. Mirrors the shape of
 * comparison-session.ts — mappings are the analogue of overrides, kept
 * apart from the risk/activity reference data they're curated against.
 */

export function toggleActivity(activityIds: number[], activityId: number): number[] {
  return activityIds.includes(activityId)
    ? activityIds.filter((id) => id !== activityId)
    : [...activityIds, activityId];
}

export function selectStats(risks: SodRisk[], mappings: SodRiskMappings) {
  const total = risks.length;
  const mapped = risks.filter((r) => (mappings[r.id]?.length ?? 0) > 0).length;
  return { total, mapped, pending: total - mapped };
}

export function selectFilteredRisks(
  risks: SodRisk[],
  mappings: SodRiskMappings,
  filterStatus: SodCurationFilter,
  searchQuery: string
): SodRisk[] {
  const query = searchQuery.trim().toLowerCase();
  return risks.filter((risk) => {
    const isMapped = (mappings[risk.id]?.length ?? 0) > 0;
    const matchesFilter =
      filterStatus === "ALL" || (filterStatus === "Mapeado" ? isMapped : !isMapped);
    const matchesSearch =
      query.length === 0 ||
      risk.id.toLowerCase().includes(query) ||
      risk.description.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

export function selectFilteredActivities(activities: SodActivity[], searchQuery: string): SodActivity[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return activities;
  return activities.filter((a) => a.name.toLowerCase().includes(query));
}

/**
 * The functionalities a set of selected activities jointly requires — the
 * preview that lets a curator sanity-check their pick before saving.
 */
export function selectImpliedFunctionalityIds(activityIds: number[], activities: SodActivity[]): number[] {
  const byId = new Map(activities.map((a) => [a.id, a]));
  const ids = new Set<number>();
  for (const activityId of activityIds) {
    for (const functionalityId of byId.get(activityId)?.functionalityIds ?? []) {
      ids.add(functionalityId);
    }
  }
  return [...ids];
}
