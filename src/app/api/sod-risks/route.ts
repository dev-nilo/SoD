import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { sodActivities, sodActivityFunctionalities, sodRiskActivities, sodRisks } from "@/db/schema";
import { requireUser } from "@/lib/server/session";
import { toSodRiskMatrix } from "@/lib/sod-risk-matrix";

export async function GET() {
  const guard = await requireUser();
  if (guard.response) return guard.response;

  const db = getDb();

  const [riskRows, activityRows, activityLinkRows, riskLinkRows] = await Promise.all([
    db.select().from(sodRisks),
    db.select().from(sodActivities),
    db.select().from(sodActivityFunctionalities),
    db.select().from(sodRiskActivities),
  ]);

  return NextResponse.json(toSodRiskMatrix(riskRows, activityRows, activityLinkRows, riskLinkRows));
}
