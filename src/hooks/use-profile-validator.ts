"use client";

import { useEffect, useMemo, useState } from "react";
import { matchFunctionality } from "@/lib/match-engine";
import type { ComparisonRow, FilterStatus, ImportaVarRow, ModuleOption, VarCatalogItem } from "@/types";

export function useProfileValidator() {
  // Configuração do perfil
  const [profileCode, setProfileCode] = useState("");
  const [selectedModule, setSelectedModule] = useState("0");

  // Base de dados do VAR (carregada do Postgres via /api/catalog)
  const [varCatalog, setVarCatalog] = useState<VarCatalogItem[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleOption[]>([
    { id: "0", name: "Todos os Módulos (Sem Filtro)" },
  ]);

  // Entrada de dados RM
  const [rawInputText, setRawInputText] = useState("");

  // Estado de processamento e resultados
  const [results, setResults] = useState<ComparisonRow[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const executeComparison = (textOverride?: string, moduleOverride?: string) => {
    const text = textOverride ?? rawInputText;
    const activeModule = moduleOverride ?? selectedModule;

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const moduleId = activeModule === "0" ? null : activeModule;
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

  // Carrega o catálogo do VAR a partir do banco na montagem
  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data: { items: VarCatalogItem[]; modules: ModuleOption[] }) => {
        if (cancelled) return;
        setVarCatalog(data.items);
        setAvailableModules(data.modules);
      })
      .catch((err) => console.error("Falha ao carregar catálogo do VAR:", err));
    return () => {
      cancelled = true;
    };
  }, []);

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
          perfil: profileCode || "PERFIL_SEM_NOME",
          funcionalidadeId: matched.id,
          funcionalidade: matched.name,
        };
      })
      .filter((row): row is ImportaVarRow => row !== null);
  }, [results, profileCode]);

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

  const addCatalogEntry = async (entry: VarCatalogItem) => {
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      console.error("Falha ao salvar item do catálogo:", await res.text());
      return;
    }
    const saved: VarCatalogItem = await res.json();
    setVarCatalog((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
    setAvailableModules((prev) =>
      prev.some((m) => m.id === String(saved.moduleId))
        ? prev
        : [{ id: String(saved.moduleId), name: saved.moduleName }, ...prev]
    );
  };

  return {
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
    acceptAllDivergences,
    assignManualMatch,
  };
}

export type ProfileValidator = ReturnType<typeof useProfileValidator>;
