import { notFound, redirect } from "next/navigation";

import { ActivityTable } from "@/components/admin/activity-table";
import { UsersAdmin } from "@/components/admin/users-admin";
import { CurrentUserProvider } from "@/components/auth/current-user-context";
import { PageShell } from "@/components/auth/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listActivity } from "@/lib/server/activity-query";
import { getCurrentUser } from "@/lib/server/session";
import { listUsers } from "@/lib/server/users";
import { can } from "@/lib/user-rules";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user.role, "manage-users")) notFound();

  const [users, activity] = await Promise.all([listUsers(), listActivity({})]);

  return (
    <CurrentUserProvider user={user}>
      <PageShell title="Gerenciar usuários">
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Só administradores criam contas. Desativar bloqueia o login e mantém o histórico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersAdmin users={users} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades de todos os usuários</CardTitle>
            <CardDescription>As 200 mais recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTable entries={activity} showUser />
          </CardContent>
        </Card>
      </PageShell>
    </CurrentUserProvider>
  );
}
