"use client";

import { useEffect, useState } from "react";
import { loadResource } from "@/lib/async-resource";
import type { ModuleOption, VarCatalogItem } from "@/types";

const DEFAULT_MODULES: ModuleOption[] = [{ id: "0", name: "Todos os Módulos (Sem Filtro)" }];

/**
 * Fetch adapter for the VAR Catalog: loads it from Postgres via /api/catalog
 * on mount, and lets callers add a new entry. Owns nothing about matching or
 * comparison sessions — see src/lib/comparison-session.ts for that.
 */
export function useVarCatalog() {
  const [varCatalog, setVarCatalog] = useState<VarCatalogItem[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleOption[]>(DEFAULT_MODULES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

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
    []
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

  return { varCatalog, availableModules, addCatalogEntry, loading, error };
}
