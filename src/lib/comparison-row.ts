import type { ComparisonRow, OverrideKind, VarCatalogItem } from "@/types";

/**
 * A user decision recorded against a row, keyed by rowId. Kept apart from
 * the computed ComparisonRow[] so recomputing matches (catalog or module
 * changed) never has to know about, or accidentally discard, decisions
 * already made — see applyOverrides in comparison-session.ts.
 */
export type Override = { item: VarCatalogItem; kind: OverrideKind };
export type OverrideMap = Record<string, Override>;

/**
 * Folds a user-accepted match into the row itself: status becomes "Exato"
 * and matchedItem becomes the accepted item, immediately. `override` is
 * kept only as provenance (how the row got there), never as a second
 * source of truth callers have to resolve against status/matchedItem.
 */
export function applyOverride(row: ComparisonRow, matchedItem: VarCatalogItem, kind: OverrideKind): ComparisonRow {
  return {
    ...row,
    status: "Exato",
    matchedItem,
    override: kind,
  };
}
