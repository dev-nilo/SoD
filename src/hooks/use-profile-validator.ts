"use client";

import { useEffect, useMemo, useState } from "react";
import { AVAILABLE_MODULES, INITIAL_VAR_CATALOG } from "@/data/var-catalog";
import { SAMPLE_RM_TEXT } from "@/data/sample-rm-text";
import { matchFunctionality } from "@/lib/match-engine";
import type { ComparisonRow, FilterStatus, ImportaVarRow, VarCatalogItem } from "@/types";

export function useProfileValidator() {
  // Configuração do perfil
  const [profileId, setProfileId] = useState("3144");
  const [profileCode, setProfileCode] = useState("Z_COORDPERMARET");
  const [selectedModule, setSelectedModule] = useState("2"); // 2 = TOTVS Gestão Financeira

  // Base de dados do VAR
  const [varCatalog, setVarCatalog] = useState<VarCatalogItem[]>(INITIAL_VAR_CATALOG);

  // Entrada de dados RM
  const [rawInputText, setRawInputText] = useState(SAMPLE_RM_TEXT);

  // Estado de processamento e resultados
  const [results, setResults] = useState<ComparisonRow[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const executeComparison = () => {
    const lines = rawInputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const moduleId = selectedModule === "0" ? null : selectedModule;
    const evaluated: ComparisonRow[] = lines.map((line, index) => {
      const match = matchFunctionality(line, varCatalog, moduleId)!;
      return {
        rowId: `row-${index}`,
        originalIndex: index + 1,
        ...match,
        acceptedOverride: null,
      };
    });

    setResults(evaluated);
  };

  // Executa automaticamente quando módulo ou catálogo mudam
  useEffect(() => {
    executeComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, varCatalog]);

  const stats = useMemo(() => {
    const total = results.length;
    const exact = results.filter((r) => (r.acceptedOverride ? r.acceptedOverride.status === "Exato" : r.status === "Exato")).length;
    const divergent = results.filter((r) => (r.acceptedOverride ? r.acceptedOverride.status === "Divergente" : r.status === "Divergente")).length;
    const notFound = results.filter((r) => (r.acceptedOverride ? false : r.status === "Não Encontrado")).length;
    const successRate = total > 0 ? Math.round(((exact + divergent) / total) * 100) : 0;
    return { total, exact, divergent, notFound, successRate };
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const currentStatus = item.acceptedOverride ? item.acceptedOverride.status : item.status;
      const effectiveName = item.acceptedOverride ? item.acceptedOverride.matchedItem.name : item.matchedItem?.name ?? "";

      const matchesFilter = filterStatus === "ALL" || currentStatus === filterStatus;
      const matchesSearch =
        item.rawInput.toLowerCase().includes(searchQuery.toLowerCase()) ||
        effectiveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.matchedItem?.id !== undefined && String(item.matchedItem.id).includes(searchQuery));

      return matchesFilter && matchesSearch;
    });
  }, [results, filterStatus, searchQuery]);

  const importaVarData: ImportaVarRow[] = useMemo(() => {
    return results
      .map((item) => {
        const matched = item.acceptedOverride?.matchedItem ?? item.matchedItem;
        if (!matched) return null;
        return {
          id: profileId || "0000",
          perfil: profileCode || "PERFIL_SEM_NOME",
          funcionalidadeId: matched.id,
          funcionalidade: matched.name,
        };
      })
      .filter((row): row is ImportaVarRow => row !== null);
  }, [results, profileId, profileCode]);

  const acceptSuggestion = (rowId: string) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId && r.matchedItem) {
          return {
            ...r,
            acceptedOverride: { status: "Exato (Aprovado)", matchedItem: r.matchedItem },
          };
        }
        return r;
      })
    );
  };

  const acceptAllDivergences = () => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.status === "Divergente" && r.matchedItem) {
          return {
            ...r,
            acceptedOverride: { status: "Exato (Aprovado)", matchedItem: r.matchedItem },
          };
        }
        return r;
      })
    );
  };

  const assignManualMatch = (rowId: string, item: VarCatalogItem) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId) {
          return {
            ...r,
            acceptedOverride: { status: "Exato (Manual)", matchedItem: item },
          };
        }
        return r;
      })
    );
  };

  const addCatalogEntry = (entry: VarCatalogItem) => {
    setVarCatalog((prev) => [entry, ...prev]);
  };

  const loadSampleData = () => {
    setRawInputText(SAMPLE_RM_TEXT);
    setProfileId("3144");
    setProfileCode("Z_COORDPERMARET");
    setSelectedModule("2");
  };

  return {
    profileId,
    setProfileId,
    profileCode,
    setProfileCode,
    selectedModule,
    setSelectedModule,
    availableModules: AVAILABLE_MODULES,
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
    acceptAllDivergences,
    assignManualMatch,
    loadSampleData,
  };
}

export type ProfileValidator = ReturnType<typeof useProfileValidator>;
