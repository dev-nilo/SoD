export interface VarCatalogItem {
  id: number;
  code: string;
  name: string;
  moduleId: number;
  moduleName: string;
}

export type MatchStatus = "Exato" | "Divergente" | "Não Encontrado";

export interface MatchResult {
  status: MatchStatus;
  rawInput: string;
  matchedItem: VarCatalogItem | null;
  confidence: number;
  reason: string;
}

export type OverrideKind = "aprovado" | "manual";

export interface ComparisonRow extends MatchResult {
  rowId: string;
  originalIndex: number;
  override: OverrideKind | null;
}

export interface ImportaVarRow {
  id: string;
  perfil: string;
  funcionalidadeId: number;
  funcionalidade: string;
}

export interface ModuleOption {
  id: string;
  name: string;
}

export type FilterStatus = "ALL" | MatchStatus;

export type SodRiskKind = "funcao" | "critico";

export interface SodRisk {
  id: string;
  kind: SodRiskKind;
  description: string;
  criticality: number;
}

export interface SodActivity {
  id: number;
  name: string;
  functionalityIds: number[];
}

/** riskId -> activity ids curated as jointly configuring that risk. */
export type SodRiskMappings = Record<string, number[]>;

/** One functionality line from a profile report (e.g. Vennx Access export). */
export interface ProfileFunctionalityRow {
  perfil: string;
  sistema: string;
  funcionalidade: string;
  status: string;
}

/** A profile functionality row once matched against the VAR catalog. */
export interface MatchedProfileFunctionality {
  item: VarCatalogItem;
  status: string;
}

export interface TriggeredRiskMatch {
  activity: SodActivity;
  functionality: VarCatalogItem;
  status: string;
}

/** One concrete combination of profile functionalities that satisfies every activity a risk requires. */
export interface TriggeredRisk {
  risk: SodRisk;
  matches: TriggeredRiskMatch[];
}
