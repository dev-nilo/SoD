import { redirect } from "next/navigation";

import { CurrentUserProvider } from "@/components/auth/current-user-context";
import { ValidatorApp } from "@/components/validator/validator-app";
import { getCurrentUser } from "@/lib/server/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <CurrentUserProvider user={user}>
      <ValidatorApp />
    </CurrentUserProvider>
  );
}
