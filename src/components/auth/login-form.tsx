"use client";

import { useActionState } from "react";
import { AlertTriangle, LogIn } from "lucide-react";

import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Usuário</Label>
        <Input id="username" name="username" autoComplete="username" autoCapitalize="none" required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        <LogIn className="w-3.5 h-3.5" />
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
