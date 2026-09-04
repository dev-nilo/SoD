"use client";

import { useEffect, useMemo, useState } from "react";
import { useVarCatalog } from "@/hooks/use-var-catalog";
import * as ComparisonSession from "@/lib/comparison-session";
import type { OverrideMap } from "@/lib/comparison-session";
import type { ComparisonRow, FilterStatus, VarCatalogItem } from "@/types";

/**
 * Composition root: wires the VAR Catalog adapter to the pure comparison
 * session in src/lib/comparison-session.ts, plus the profile form fields.
 * Callers should only ever need this hook — the split behind it is internal.
 */
export function useProfileValidator() {
  // Configuração do perfil
  const [profileId, setProfileId] = useState("");
  const [profileCode, setProfileCode] = useState("");
  const [selectedModule, setSelectedModule] = useState("0");

  const { varCatalog, availableModules, addCatalogEntry } = useVarCatalog();

  // Sessão de comparação
  const [rawInputText, setRawInputText] = useState("");
  // baseRows: matches recomputados sempre que módulo/catálogo mudam.
  // overrides: decisões do usuário, mantidas à parte para nunca serem
  // perdidas por um recompute (ex: adicionar item ao catálogo mid-sessão).
  const [baseRows, setBaseRows] = useState<ComparisonRow[]>([]);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const executeComparison = (textOverride?: string) => {
    const text = textOverride ?? rawInputText;
    const moduleId = selectedModule === "0" ? null : selectedModule;
    setBaseRows(ComparisonSession.buildComparisonRows(text, varCatalog, moduleId));
  };

  // Executa automaticamente quando módulo ou catálogo mudam
  useEffect(() => {
    executeComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, varCatalog]);

  const results = useMemo(
    () => ComparisonSession.applyOverrides(baseRows, overrides),
    [baseRows, overrides]
  );

  const stats = useMemo(() => ComparisonSession.selectStats(results), [results]);

  const filteredResults = useMemo(
    () => ComparisonSession.selectFilteredResults(results, filterStatus, searchQuery),
    [results, filterStatus, searchQuery]
  );

  const importaVarData = useMemo(
    () => ComparisonSession.selectImportaVarData(results, profileId, profileCode),
    [results, profileId, profileCode]
  );

  const acceptSuggestion = (rowId: string) => {
    setOverrides((prev) => ComparisonSession.acceptSuggestion(baseRows, prev, rowId));
  };

  const acceptHighConfidenceDivergences = () => {
    setOverrides((prev) => ComparisonSession.acceptHighConfidenceDivergences(baseRows, prev));
  };

  const assignManualMatch = (rowId: string, item: VarCatalogItem) => {
    setOverrides((prev) => ComparisonSession.assignManualMatch(prev, rowId, item));
  };

  const resetFlow = () => {
    setProfileId("");
    setProfileCode("");
    setRawInputText("");
    setBaseRows([]);
    setOverrides({});
    setFilterStatus("ALL");
    setSearchQuery("");
  };

  return {
    profileId,
    setProfileId,
    profileCode,
    setProfileCode,
    selectedModule,
    setSelectedModule,
    availableModules,
    varCatalog,
    addCatalogEntry,
    rawInputText,
    setRawInputText,
    results,
    filteredResults,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    stats,
    importaVarData,
    executeComparison,
    acceptSuggestion,
    acceptHighConfidenceDivergences,
    assignManualMatch,
    resetFlow,
  };
}

export type ProfileValidator = ReturnType<typeof useProfileValidator>;
