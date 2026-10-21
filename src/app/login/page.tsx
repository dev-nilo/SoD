import { redirect } from "next/navigation";
import { Workflow } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/server/session";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
            <Workflow className="w-[18px] h-[18px]" />
          </div>
          <div>
            <CardTitle>Barril Valida</CardTitle>
            <CardDescription>Entre com o usuário criado pelo administrador.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
