import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

import type { SodActivity, SodRisk } from "../src/types";

/**
 * One-off conversion: reads the SoD reference exports the user dropped in
 * samples/ and writes src/data/sod-catalog.json in app shape. Run again
 * only if the source spreadsheets are replaced with a fresher export —
 * this never runs at request time.
 */

const SAMPLES_DIR = path.join(__dirname, "..", "samples");
const OUT_PATH = path.join(__dirname, "..", "src", "data", "sod-catalog.json");

function readSheetRows(fileName: string): unknown[][] {
  const workbook = XLSX.readFile(path.join(SAMPLES_DIR, fileName));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
}

function readRisks(fileName: string, kind: SodRisk["kind"]): SodRisk[] {
  const rows = readSheetRows(fileName).slice(1); // drop header
  return rows.map((r) => ({
    id: String(r[1]),
    kind,
    description: String(r[2]),
    criticality: Number(r[3]),
  }));
}

function readActivities(): SodActivity[] {
  const rows = readSheetRows(
    "relatorio_atividades-do-sistema_6a86f2da50c21_20260820092810 1.xlsx"
  ).slice(1);

  const byId = new Map<number, SodActivity>();
  for (const r of rows) {
    const [activityId, activityName, functionalityId] = r as [number, string, number | string];
    if (!byId.has(activityId)) {
      byId.set(activityId, { id: activityId, name: activityName, functionalityIds: [] });
    }
    if (typeof functionalityId === "number") {
      byId.get(activityId)!.functionalityIds.push(functionalityId);
    }
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function main() {
  const risks = [
    ...readRisks("riscos_funcoes_20260820092333 1.xlsx", "funcao"),
    ...readRisks("riscos_criticos_20260820092344 1.xlsx", "critico"),
  ];
  const activities = readActivities();

  fs.writeFileSync(OUT_PATH, JSON.stringify({ risks, activities }, null, 2) + "\n");
  console.log(`Wrote ${risks.length} risks and ${activities.length} activities to ${OUT_PATH}`);
}

main();
