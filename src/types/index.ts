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
