"use client";

import { useEffect, useMemo, useState } from "react";
import { useVarCatalog } from "@/hooks/use-var-catalog";
import * as ComparisonSession from "@/lib/comparison-session";
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
  const [results, setResults] = useState<ComparisonRow[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const executeComparison = (textOverride?: string, moduleOverride?: string) => {
    const text = textOverride ?? rawInputText;
    const activeModule = moduleOverride ?? selectedModule;
    const moduleId = activeModule === "0" ? null : activeModule;
    setResults(ComparisonSession.buildComparisonRows(text, varCatalog, moduleId));
  };

  // Executa automaticamente quando módulo ou catálogo mudam
  useEffect(() => {
    executeComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, varCatalog]);

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
    setResults((prev) => ComparisonSession.acceptSuggestion(prev, rowId));
  };

  const acceptHighConfidenceDivergences = () => {
    setResults((prev) => ComparisonSession.acceptHighConfidenceDivergences(prev));
  };

  const assignManualMatch = (rowId: string, item: VarCatalogItem) => {
    setResults((prev) => ComparisonSession.assignManualMatch(prev, rowId, item));
  };

  const resetFlow = () => {
    setProfileId("");
    setProfileCode("");
    setRawInputText("");
    setResults([]);
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
