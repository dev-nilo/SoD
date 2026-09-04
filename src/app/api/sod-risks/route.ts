import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { sodActivities, sodActivityFunctionalities, sodRiskActivities, sodRisks } from "@/db/schema";
import type { SodActivity, SodRisk, SodRiskMappings } from "@/types";

export async function GET() {
  const db = getDb();

  const [riskRows, activityRows, activityLinkRows, riskLinkRows] = await Promise.all([
    db.select().from(sodRisks),
    db.select().from(sodActivities),
    db.select().from(sodActivityFunctionalities),
    db.select().from(sodRiskActivities),
  ]);

  const functionalityIdsByActivity = new Map<number, number[]>();
  for (const link of activityLinkRows) {
    const list = functionalityIdsByActivity.get(link.activityId) ?? [];
    list.push(link.functionalityId);
    functionalityIdsByActivity.set(link.activityId, list);
  }

  const activities: SodActivity[] = activityRows.map((a) => ({
    id: a.id,
    name: a.name,
    functionalityIds: functionalityIdsByActivity.get(a.id) ?? [],
  }));

  const mappings: SodRiskMappings = {};
  for (const link of riskLinkRows) {
    const list = mappings[link.riskId] ?? [];
    list.push(link.activityId);
    mappings[link.riskId] = list;
  }

  const risks: SodRisk[] = riskRows.map((r) => ({
    id: r.id,
    kind: r.kind as SodRisk["kind"],
    description: r.description,
    criticality: r.criticality,
  }));

  return NextResponse.json({ risks, activities, mappings });
}
