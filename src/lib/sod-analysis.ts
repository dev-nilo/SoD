import { matchFunctionality } from "@/lib/match-engine";
import type {
  MatchedProfileFunctionality,
  ProfileFunctionalityRow,
  SodActivity,
  SodRisk,
  SodRiskMappings,
  TriggeredRisk,
  VarCatalogItem,
} from "@/types";

/**
 * Matches each profile functionality line against the VAR catalog, reusing
 * the same matching cascade the Validador uses. A line with no acceptable
 * match can't be evaluated against the risk matrix, so it's dropped here
 * rather than carried through as a null.
 */
export function matchProfileFunctionalities(
  rows: ProfileFunctionalityRow[],
  catalog: VarCatalogItem[]
): MatchedProfileFunctionality[] {
  return rows
    .map((row) => {
      const match = matchFunctionality(row.funcionalidade, catalog, null);
      return match.matchedItem ? { item: match.matchedItem, status: row.status } : null;
    })
    .filter((m): m is MatchedProfileFunctionality => m !== null);
}

function cartesianProduct<T>(lists: T[][]): T[][] {
  return lists.reduce<T[][]>((acc, list) => acc.flatMap((combo) => list.map((item) => [...combo, item])), [[]]);
}

/**
 * Evaluates the curated risk matrix against a profile's matched
 * functionalities: a risk fires once every one of its required activities
 * has at least one matching functionality present in the profile. Emits
 * one TriggeredRisk per concrete combination found — mirroring how a Vennx
 * Access report lists one row per functionality pair, never collapsed —
 * so the caller can show exactly which functionalities are responsible.
 * A risk with no curated activities yet (mappings[risk.id] is empty or
 * absent) can never fire — that's the curation gap, not a false negative.
 */
export function analyzeProfileRisks(
  profileFunctionalities: MatchedProfileFunctionality[],
  risks: SodRisk[],
  activities: SodActivity[],
  mappings: SodRiskMappings
): TriggeredRisk[] {
  const activityById = new Map(activities.map((a) => [a.id, a]));
  const triggered: TriggeredRisk[] = [];

  for (const risk of risks) {
    const activityIds = mappings[risk.id];
    if (!activityIds || activityIds.length === 0) continue;

    const perActivityMatches = activityIds.map((activityId) => {
      const activity = activityById.get(activityId);
      if (!activity) return [];
      const functionalityIds = new Set(activity.functionalityIds);
      return profileFunctionalities
        .filter((pf) => functionalityIds.has(pf.item.id))
        .map((pf) => ({ activity, functionality: pf.item, status: pf.status }));
    });

    if (perActivityMatches.some((matches) => matches.length === 0)) continue;

    for (const matches of cartesianProduct(perActivityMatches)) {
      triggered.push({ risk, matches });
    }
  }

  return triggered;
}

export function selectRisksWithAddedFunctionality(triggered: TriggeredRisk[]): TriggeredRisk[] {
  return triggered.filter((t) => t.matches.some((m) => m.status === "Adicionado"));
}
