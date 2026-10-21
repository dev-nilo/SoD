"use client";

import { useEffect, useState } from "react";
import { loadResource } from "@/lib/async-resource";
import { parseCatalogSheet } from "@/lib/catalog-upload";
import { readWorkbookRows } from "@/lib/file-import";
import type { ModuleOption, VarCatalogItem } from "@/types";

export interface CatalogImportResult {
  fileName: string;
  added: number;
  updated: number;
  unchanged: number;
  missing: VarCatalogItem[];
  /** Rows of the spreadsheet that were rejected before upload. */
  rowErrors: string[];
}

const DEFAULT_MODULES: ModuleOption[] = [{ id: "0", name: "Todos os Módulos (Sem Filtro)" }];

/**
 * Fetch adapter for the VAR Catalog: loads it from Postgres via /api/catalog
 * on mount, and lets callers add a new entry or import a whole "Base VAR"
 * spreadsheet. Owns nothing about matching or
 * comparison sessions — see src/lib/comparison-session.ts for that.
 */
export function useVarCatalog() {
  const [varCatalog, setVarCatalog] = useState<VarCatalogItem[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleOption[]>(DEFAULT_MODULES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<CatalogImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(
    () =>
      loadResource<{ items: VarCatalogItem[]; modules: ModuleOption[] }>(
        () => fetch("/api/catalog").then((res) => res.json()),
        {
          onData: (data) => {
            setVarCatalog(data.items);
            setAvailableModules(data.modules);
          },
          onError: (err) => {
            console.error("Falha ao carregar catálogo do VAR:", err);
            setError(err);
          },
          onSettled: () => setLoading(false),
        }
      ),
    [reloadKey]
  );

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

  const importCatalogFile = async (file: File) => {
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const { items, errors } = parseCatalogSheet(await readWorkbookRows(file));
      if (items.length === 0) throw new Error("Nenhuma funcionalidade válida na planilha.");

      const res = await fetch("/api/catalog/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, items }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Falha ao importar a planilha.");

      setImportResult({ ...body, rowErrors: errors });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Falha ao importar a planilha.");
    } finally {
      setImporting(false);
    }
  };

  return {
    varCatalog,
    availableModules,
    addCatalogEntry,
    importCatalogFile,
    importing,
    importResult,
    importError,
    loading,
    error,
  };
}
