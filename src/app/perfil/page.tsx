import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { ActivityTable } from "@/components/admin/activity-table";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { CurrentUserProvider } from "@/components/auth/current-user-context";
import { PageShell } from "@/components/auth/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { formatDateTime } from "@/lib/format-date";
import { listActivity } from "@/lib/server/activity-query";
import { getCurrentUser } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [[row], activity] = await Promise.all([
    getDb().select().from(users).where(eq(users.id, user.id)),
    listActivity({ userId: user.id }),
  ]);

  const facts = [
    { label: "Nome", value: user.fullName },
    { label: "Usuário", value: user.username },
    { label: "Perfil de acesso", value: user.role === "admin" ? "Administrador" : "Usuário" },
    { label: "Último acesso", value: formatDateTime(row?.lastLoginAt?.toISOString()) },
    { label: "Conta criada em", value: formatDateTime(row?.createdAt.toISOString()) },
  ];

  return (
    <CurrentUserProvider user={user}>
      <PageShell title="Meu perfil">
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="text-sm font-medium text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trocar senha</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas atividades</CardTitle>
            <CardDescription>As 200 mais recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTable entries={activity} showUser={false} />
          </CardContent>
        </Card>
      </PageShell>
    </CurrentUserProvider>
  );
}
