import { canonicalKey } from "@/lib/normalize";
import { safeFileSegment, type SheetData } from "@/lib/xlsx-export";
import type { ProfileFunctionalityRow } from "@/types";

export interface ProfileComparison {
  /** In the mirror profile but not requested. */
  faltantes: ProfileFunctionalityRow[];
  /** Requested but not in the mirror profile. */
  extras: ProfileFunctionalityRow[];
  /** In both (as listed in the requested profile). */
  comuns: ProfileFunctionalityRow[];
}

const isRemoved = (row: ProfileFunctionalityRow) => /^removid[oa]$/i.test(row.status.trim());

function byKey(rows: ProfileFunctionalityRow[]): Map<string, ProfileFunctionalityRow> {
  const map = new Map<string, ProfileFunctionalityRow>();
  for (const row of rows) {
    if (isRemoved(row)) continue;
    const key = canonicalKey(row.funcionalidade);
    if (!map.has(key)) map.set(key, row);
  }
  return map;
}

/**
 * Compares a reference ("espelho") profile with a requested one, both read
 * from profile reports. Functionalities are matched by canonicalKey — the
 * same case/spacing/code-padding normalization the Validador uses — and
 * rows the report marks as removed are not part of either profile.
 */
export function compareProfiles(mirror: ProfileFunctionalityRow[], requested: ProfileFunctionalityRow[]): ProfileComparison {
  const mirrorByKey = byKey(mirror);
  const requestedByKey = byKey(requested);

  return {
    faltantes: [...mirrorByKey].filter(([key]) => !requestedByKey.has(key)).map(([, row]) => row),
    extras: [...requestedByKey].filter(([key]) => !mirrorByKey.has(key)).map(([, row]) => row),
    comuns: [...requestedByKey].filter(([key]) => mirrorByKey.has(key)).map(([, row]) => row),
  };
}

export interface ProfileComparisonMeta {
  mirrorProfile: string;
  requestedProfile: string;
  mirrorTotal: number;
  requestedTotal: number;
  date: string;
  analyst: string;
}

const LIST_HEADER = ["Funcionalidade", "Sistema", "Status no relatório"];
const listRows = (rows: ProfileFunctionalityRow[]) => [LIST_HEADER, ...rows.map((r) => [r.funcionalidade, r.sistema, r.status])];

export function buildProfileComparisonSheets(result: ProfileComparison, meta: ProfileComparisonMeta): SheetData[] {
  return [
    {
      name: "Resumo",
      rows: [
        ["Perfil espelho", meta.mirrorProfile],
        ["Perfil solicitado", meta.requestedProfile],
        ["Funcionalidades no espelho", meta.mirrorTotal],
        ["Funcionalidades no solicitado", meta.requestedTotal],
        ["Faltantes (no espelho, não solicitadas)", result.faltantes.length],
        ["Extras (solicitadas, fora do espelho)", result.extras.length],
        ["Comuns", result.comuns.length],
        ["Data", meta.date],
        ["Analista", meta.analyst],
      ],
    },
    { name: "Faltantes", rows: listRows(result.faltantes) },
    { name: "Extras", rows: listRows(result.extras) },
    { name: "Comuns", rows: listRows(result.comuns) },
  ];
}

export function profileComparisonFileName(mirrorProfile: string, requestedProfile: string, isoDate: string): string {
  return `Comparacao_${safeFileSegment(mirrorProfile, "espelho")}_x_${safeFileSegment(requestedProfile, "solicitado")}_${isoDate}.xlsx`;
}
