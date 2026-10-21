"use client";

import { useMemo, useState } from "react";

import { useCurrentUser } from "@/components/auth/current-user-context";
import {
  buildProfileComparisonSheets,
  compareProfiles,
  profileComparisonFileName,
  type ProfileComparison,
} from "@/lib/profile-comparison";
import { parseProfileReport } from "@/lib/profile-report-import";
import { reportActivity } from "@/lib/report-activity";
import { downloadWorkbook } from "@/lib/xlsx-export";
import type { ProfileFunctionalityRow } from "@/types";

export interface LoadedProfile {
  fileName: string;
  rows: ProfileFunctionalityRow[];
}

function useProfileSlot() {
  const [profile, setProfile] = useState<LoadedProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (file: File) => {
    setError(null);
    try {
      const rows = await parseProfileReport(file);
      if (rows.length === 0) throw new Error("Nenhuma funcionalidade encontrada no relatório.");
      setProfile({ fileName: file.name, rows });
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : "Falha ao processar o relatório.");
    }
  };

  return { profile, error, load, profileName: profile?.rows[0]?.perfil ?? "" };
}

/**
 * Composition root for the Comparador de Perfis: loads the mirror and the
 * requested profile reports, compares them on demand and exports the result.
 */
export function useProfileComparison() {
  const user = useCurrentUser();
  const mirror = useProfileSlot();
  const requested = useProfileSlot();
  const [result, setResult] = useState<ProfileComparison | null>(null);

  const canCompare = mirror.profile !== null && requested.profile !== null;

  const compare = () => {
    if (!mirror.profile || !requested.profile) return;
    const comparison = compareProfiles(mirror.profile.rows, requested.profile.rows);
    setResult(comparison);
    reportActivity(
      "comparacao-perfis",
      `Comparou ${mirror.profileName} (espelho) × ${requested.profileName} (solicitado): ` +
        `${comparison.faltantes.length} faltantes, ${comparison.extras.length} extras, ${comparison.comuns.length} comuns`
    );
  };

  // Uma nova planilha em qualquer lado invalida o resultado anterior.
  const loadMirror = async (file: File) => {
    setResult(null);
    await mirror.load(file);
  };
  const loadRequested = async (file: File) => {
    setResult(null);
    await requested.load(file);
  };

  const exportXlsx = async () => {
    if (!result || !mirror.profile || !requested.profile) return;
    const sheets = buildProfileComparisonSheets(result, {
      mirrorProfile: mirror.profileName,
      requestedProfile: requested.profileName,
      mirrorTotal: mirror.profile.rows.length,
      requestedTotal: requested.profile.rows.length,
      date: new Date().toLocaleDateString("pt-BR"),
      analyst: user.fullName,
    });
    await downloadWorkbook(
      sheets,
      profileComparisonFileName(mirror.profileName, requested.profileName, new Date().toISOString().slice(0, 10))
    );
  };

  const totals = useMemo(
    () => ({ mirror: mirror.profile?.rows.length ?? 0, requested: requested.profile?.rows.length ?? 0 }),
    [mirror.profile, requested.profile]
  );

  return { mirror, requested, loadMirror, loadRequested, canCompare, compare, result, totals, exportXlsx };
}
