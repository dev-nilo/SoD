import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "../src/db";
import { users } from "../src/db/schema";
import { validateNewUser } from "../src/lib/user-rules";

/**
 * Creates the first administrator from ADMIN_USERNAME / ADMIN_PASSWORD /
 * ADMIN_FULL_NAME. Does nothing once any admin exists, so it's safe to re-run.
 */
async function main() {
  const db = getDb();

  const [existingAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  if (existingAdmin) {
    console.log("Já existe um administrador — nada a fazer.");
    return;
  }

  const input = {
    username: (process.env.ADMIN_USERNAME ?? "").trim().toLowerCase(),
    fullName: (process.env.ADMIN_FULL_NAME ?? "Administrador").trim(),
    password: process.env.ADMIN_PASSWORD ?? "",
    role: "admin",
  };
  const error = validateNewUser(input);
  if (error) throw new Error(`ADMIN_USERNAME/ADMIN_PASSWORD inválidos: ${error}`);

  await db.insert(users).values({
    username: input.username,
    fullName: input.fullName,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: "admin",
  });
  console.log(`Administrador "${input.username}" criado.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
