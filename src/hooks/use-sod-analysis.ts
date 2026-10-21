"use client";

import { useEffect, useMemo, useState } from "react";

import { useCurrentUser } from "@/components/auth/current-user-context";
import { useVarCatalog } from "@/hooks/use-var-catalog";
import { copyToClipboard } from "@/lib/csv-export";
import { loadResource } from "@/lib/async-resource";
import { reportActivity } from "@/lib/report-activity";
import { exportSodAnalysisXlsx } from "@/lib/sod-export";
import { buildChamadoNote, buildEmailNote, NO_CONFLICT_NOTE, SCENARIO_LABEL, type SodScenario } from "@/lib/sod-notes";
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
  const { varCatalog, loading: loadingCatalog, error: catalogError } = useVarCatalog();

  const [risks, setRisks] = useState<SodRisk[]>([]);
  const [activities, setActivities] = useState<SodActivity[]>([]);
  const [mappings, setMappings] = useState<SodRiskMappings>({});
  const [loadingMatrix, setLoadingMatrix] = useState(true);
  const [matrixError, setMatrixError] = useState<unknown>(null);

  useEffect(
    () =>
      loadResource<{ risks: SodRisk[]; activities: SodActivity[]; mappings: SodRiskMappings }>(
        () => fetch("/api/sod-risks").then((res) => res.json()),
        {
          onData: (data) => {
            setRisks(data.risks);
            setActivities(data.activities);
            setMappings(data.mappings);
          },
          onError: (err) => {
            console.error("Falha ao carregar a matriz de riscos SoD:", err);
            setMatrixError(err);
          },
          onSettled: () => setLoadingMatrix(false),
        }
      ),
    []
  );

  const [profileRows, setProfileRows] = useState<ProfileFunctionalityRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyAdded, setOnlyAdded] = useState(true);
  const [cenario, setCenario] = useState<SodScenario>("manutencao");
  const [ticket, setTicket] = useState("");
  const user = useCurrentUser();

  const loadFile = async (file: File) => {
    setError(null);
    try {
      const rows = await parseProfileReport(file);
      setProfileRows(rows);
      setFileName(file.name);
      reportActivity(
        "analise-sod",
        `Analisou o perfil ${rows[0]?.perfil ?? file.name} (${rows.length} funcionalidades, ${SCENARIO_LABEL[cenario]})`
      );
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

  // Na criação de perfil tudo é novo, então o filtro "só adicionadas" não se aplica.
  const filterOnlyAdded = cenario === "manutencao" && onlyAdded;
  const triggeredRisks = useMemo(
    () => (filterOnlyAdded ? selectRisksWithAddedFunctionality(allTriggeredRisks) : allTriggeredRisks),
    [allTriggeredRisks, filterOnlyAdded]
  );

  const profileName = profileRows[0]?.perfil ?? null;
  const modulo = [...new Set(profileRows.map((r) => r.sistema).filter(Boolean))].join(", ");

  const noteInput = () => ({
    date: new Date().toLocaleDateString("pt-BR"),
    perfil: profileName ?? "",
    modulo,
    cenario,
    ticket,
    triggeredRisks,
  });

  const copyNote = async (kind: "chamado" | "email" | "aprovado") => {
    const text =
      kind === "aprovado"
        ? NO_CONFLICT_NOTE
        : kind === "chamado"
          ? buildChamadoNote(noteInput())
          : buildEmailNote(noteInput());
    await copyToClipboard(text);
  };

  const exportXlsx = async () => {
    await exportSodAnalysisXlsx(
      { ...noteInput(), analyst: user.fullName, profileRows },
      new Date().toISOString().slice(0, 10)
    );
    reportActivity(
      "exportacao-sod",
      `Exportou a análise SoD do perfil ${profileName ?? ""} (${triggeredRisks.length} combinações de risco)`
    );
  };

  const curatedRiskCount = risks.filter((r) => (mappings[r.id]?.length ?? 0) > 0).length;

  return {
    // Whether the catalog and risk matrix are both in — matching and risk
    // evaluation give misleadingly low numbers (everything unmatched, 0
    // curated risks) until both have landed, so callers gate their results
    // display on this rather than showing those numbers mid-fetch.
    loadingReferenceData: loadingCatalog || loadingMatrix,
    referenceDataError: catalogError ?? matrixError,
    risks,
    curatedRiskCount,
    fileName,
    error,
    loadFile,
    profileRows,
    profileName,
    modulo,
    cenario,
    setCenario,
    ticket,
    setTicket,
    copyNote,
    exportXlsx,
    addedCount: profileRows.filter((r) => r.status === "Adicionado").length,
    unmatchedCount: profileRows.length - matchedFunctionalities.length,
    triggeredRisks,
    allTriggeredRisksCount: allTriggeredRisks.length,
    onlyAdded,
    setOnlyAdded,
  };
}
