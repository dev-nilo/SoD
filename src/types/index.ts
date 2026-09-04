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

export interface AcceptedOverride {
  status: string;
  matchedItem: VarCatalogItem;
}

export interface ComparisonRow extends MatchResult {
  rowId: string;
  originalIndex: number;
  acceptedOverride: AcceptedOverride | null;
}

export interface ImportaVarRow {
  perfil: string;
  funcionalidadeId: number;
  funcionalidade: string;
}

export interface ModuleOption {
  id: string;
  name: string;
}

export type FilterStatus = "ALL" | MatchStatus;
