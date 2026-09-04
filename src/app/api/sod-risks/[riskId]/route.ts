import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/db";
import { sodRiskActivities } from "@/db/schema";

/**
 * Replaces the full set of activities curated for one risk. The curator
 * always sends the complete list for the risk — simpler than diffing
 * add/remove, and the set per risk is small (a handful of activities).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ riskId: string }> }) {
  const { riskId } = await params;
  const body = (await request.json()) as { activityIds?: unknown };

  if (!Array.isArray(body.activityIds) || !body.activityIds.every((id) => Number.isFinite(id))) {
    return NextResponse.json({ error: "activityIds deve ser uma lista de números." }, { status: 400 });
  }
  const activityIds: number[] = body.activityIds;

  const db = getDb();

  await db.delete(sodRiskActivities).where(eq(sodRiskActivities.riskId, riskId));
  if (activityIds.length > 0) {
    await db.insert(sodRiskActivities).values(activityIds.map((activityId) => ({ riskId, activityId })));
  }

  return NextResponse.json({ riskId, activityIds });
}
