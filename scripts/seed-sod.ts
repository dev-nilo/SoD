import { getDb } from "../src/db";
import { sodActivities, sodActivityFunctionalities, sodRisks } from "../src/db/schema";
import { INITIAL_SOD_ACTIVITIES, INITIAL_SOD_RISKS } from "../src/data/sod-catalog";

async function main() {
  const db = getDb();

  await db
    .insert(sodRisks)
    .values(INITIAL_SOD_RISKS)
    .onConflictDoNothing({ target: sodRisks.id });
  console.log(`Seeded ${INITIAL_SOD_RISKS.length} SoD risks.`);

  await db
    .insert(sodActivities)
    .values(INITIAL_SOD_ACTIVITIES.map(({ id, name }) => ({ id, name })))
    .onConflictDoNothing({ target: sodActivities.id });
  console.log(`Seeded ${INITIAL_SOD_ACTIVITIES.length} SoD activities.`);

  const links = INITIAL_SOD_ACTIVITIES.flatMap((activity) =>
    activity.functionalityIds.map((functionalityId) => ({ activityId: activity.id, functionalityId }))
  );

  const BATCH_SIZE = 500;
  for (let i = 0; i < links.length; i += BATCH_SIZE) {
    const batch = links.slice(i, i + BATCH_SIZE);
    await db
      .insert(sodActivityFunctionalities)
      .values(batch)
      .onConflictDoNothing({ target: [sodActivityFunctionalities.activityId, sodActivityFunctionalities.functionalityId] });
  }
  console.log(`Seeded ${links.length} activity-functionality links.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
