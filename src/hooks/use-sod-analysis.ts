"use client";

import { useEffect, useMemo, useState } from "react";

import { useVarCatalog } from "@/hooks/use-var-catalog";
import { parseProfileReport } from "@/lib/profile-report-import";
import { analyzeProfileRisks, matchProfileFunctionalities, selectRisksWithAddedFunctionality } from "@/lib/sod-analysis";
import type { ProfileFunctionalityRow, SodActivity, SodRisk, SodRiskMappings } from "@/types";

/**
 * Composition root for the "Analisar Perfil" screen: fetches the VAR
 * catalog and the curated risk matrix, parses an uploaded profile report,
 * and wires the pure functions in src/lib/sod-analysis.ts. Callers should
 * only ever need this hook.
 */
export function useSodAnalysis() {
  const { varCatalog } = useVarCatalog();

  const [risks, setRisks] = useState<SodRisk[]>([]);
  const [activities, setActivities] = useState<SodActivity[]>([]);
  const [mappings, setMappings] = useState<SodRiskMappings>({});
  const [loadingMatrix, setLoadingMatrix] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sod-risks")
      .then((res) => res.json())
      .then((data: { risks: SodRisk[]; activities: SodActivity[]; mappings: SodRiskMappings }) => {
        if (cancelled) return;
        setRisks(data.risks);
        setActivities(data.activities);
        setMappings(data.mappings);
      })
      .catch((err) => console.error("Falha ao carregar a matriz de riscos SoD:", err))
      .finally(() => {
        if (!cancelled) setLoadingMatrix(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [profileRows, setProfileRows] = useState<ProfileFunctionalityRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyAdded, setOnlyAdded] = useState(true);

  const loadFile = async (file: File) => {
    setError(null);
    try {
      const rows = await parseProfileReport(file);
      setProfileRows(rows);
      setFileName(file.name);
    } catch (err) {
      setProfileRows([]);
      setFileName(null);
      setError(err instanceof Error ? err.message : "Falha ao processar o relatório.");
    }
  };

  const matchedFunctionalities = useMemo(
    () => matchProfileFunctionalities(profileRows, varCatalog),
    [profileRows, varCatalog]
  );

  const allTriggeredRisks = useMemo(
    () => analyzeProfileRisks(matchedFunctionalities, risks, activities, mappings),
    [matchedFunctionalities, risks, activities, mappings]
  );

  const triggeredRisks = useMemo(
    () => (onlyAdded ? selectRisksWithAddedFunctionality(allTriggeredRisks) : allTriggeredRisks),
    [allTriggeredRisks, onlyAdded]
  );

  const curatedRiskCount = risks.filter((r) => (mappings[r.id]?.length ?? 0) > 0).length;

  return {
    loadingMatrix,
    risks,
    curatedRiskCount,
    fileName,
    error,
    loadFile,
    profileRows,
    profileName: profileRows[0]?.perfil ?? null,
    addedCount: profileRows.filter((r) => r.status === "Adicionado").length,
    unmatchedCount: profileRows.length - matchedFunctionalities.length,
    triggeredRisks,
    allTriggeredRisksCount: allTriggeredRisks.length,
    onlyAdded,
    setOnlyAdded,
  };
}
