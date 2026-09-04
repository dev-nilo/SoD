import * as path from "path";
import * as XLSX from "xlsx";

import { getDb } from "../src/db";
import { sodActivities, sodRiskActivities, sodRisks } from "../src/db/schema";

/**
 * A Vennx Access "Análise de Risco Perfil" report carries its own risk
 * section ("Riscos SoD para perfil"), listing each triggered risk instance
 * together with the pair of activities that defines it. That's ground
 * truth for the curation matrix (sod_risk_activities) — this script pulls
 * it out and merges it in, instead of requiring a curator to enter by hand
 * what a report already proves. Safe to re-run on the same or a new report:
 * existing (riskId, activityId) links are left untouched.
 */

function readRows(filePath: string): unknown[][] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
}

function extractRiskActivityPairs(rows: unknown[][]): { riskId: string; activityNames: string[] }[] {
  const tableStart = rows.findIndex((r) => r[0] === "Riscos SoD para perfil");
  if (tableStart === -1) {
    throw new Error('Não encontrei a seção "Riscos SoD para perfil" no arquivo.');
  }

  const header = rows[tableStart + 1] as string[];
  const riskCol = header.indexOf("ID Risco");
  const activity1Col = header.indexOf("Atividade");
  const activity2Col = header.indexOf("Atividade2");
  if (riskCol === -1 || activity1Col === -1 || activity2Col === -1) {
    throw new Error("Cabeçalho da seção de riscos não tem o formato esperado (ID Risco / Atividade / Atividade2).");
  }

  const pairs: { riskId: string; activityNames: string[] }[] = [];
  for (let i = tableStart + 2; i < rows.length; i++) {
    const row = rows[i];
    const riskId = String(row[riskCol] ?? "").trim();
    if (!riskId) continue;
    const activityNames = [row[activity1Col], row[activity2Col]]
      .map((v) => String(v ?? "").trim())
      .filter((v) => v.length > 0);
    pairs.push({ riskId, activityNames });
  }
  return pairs;
}

async function main() {
  const filePath = process.argv[2] ?? path.join(__dirname, "..", "samples", "analisar-risco.xlsx");
  const pairs = extractRiskActivityPairs(readRows(filePath));

  const db = getDb();
  const [allActivities, allRisks] = await Promise.all([db.select().from(sodActivities), db.select().from(sodRisks)]);
  const activityIdByName = new Map(allActivities.map((a) => [a.name, a.id]));
  const riskIds = new Set(allRisks.map((r) => r.id));

  const mappingByRisk = new Map<string, Set<number>>();
  const unknownRisks = new Set<string>();
  const unresolvedActivities = new Set<string>();

  for (const { riskId, activityNames } of pairs) {
    if (!riskIds.has(riskId)) {
      unknownRisks.add(riskId);
      continue;
    }
    const set = mappingByRisk.get(riskId) ?? new Set<number>();
    for (const name of activityNames) {
      const activityId = activityIdByName.get(name);
      if (activityId === undefined) {
        unresolvedActivities.add(name);
        continue;
      }
      set.add(activityId);
    }
    mappingByRisk.set(riskId, set);
  }

  const inserts = [...mappingByRisk.entries()].flatMap(([riskId, activityIds]) =>
    [...activityIds].map((activityId) => ({ riskId, activityId }))
  );

  if (inserts.length > 0) {
    await db
      .insert(sodRiskActivities)
      .values(inserts)
      .onConflictDoNothing({ target: [sodRiskActivities.riskId, sodRiskActivities.activityId] });
  }

  console.log(
    `Resolved ${mappingByRisk.size} risk definitions (${inserts.length} risk-activity links) from ${pairs.length} report rows.`
  );
  if (unknownRisks.size > 0) console.log(`Risks not in the catalog, skipped: ${[...unknownRisks].join(", ")}`);
  if (unresolvedActivities.size > 0)
    console.log(`Activity names not in the catalog, skipped: ${[...unresolvedActivities].join(", ")}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
