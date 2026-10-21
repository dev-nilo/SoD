"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, KeyRound, Power, Trash2, UserPlus } from "lucide-react";

import { useCurrentUser } from "@/components/auth/current-user-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format-date";
import type { AdminUserView } from "@/lib/server/users";
import type { UserRole } from "@/lib/user-rules";

const EMPTY_FORM = { username: "", fullName: "", password: "", role: "user" as UserRole };

const selectClass =
  "h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function UsersAdmin({ users }: { users: AdminUserView[] }) {
  const me = useCurrentUser();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const call = async (url: string, init: RequestInit): Promise<boolean> => {
    setBusy(true);
    setError(null);
    const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(body.error ?? "A operação falhou.");
      return false;
    }
    router.refresh();
    return true;
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await call("/api/users", { method: "POST", body: JSON.stringify(form) })) setForm(EMPTY_FORM);
  };

  const patch = (u: AdminUserView, body: Record<string, unknown>) =>
    call(`/api/users/${u.id}`, { method: "PATCH", body: JSON.stringify(body) });

  const resetPassword = (u: AdminUserView) => {
    const password = window.prompt(`Nova senha para ${u.username} (mínimo 8 caracteres):`);
    if (password) void patch(u, { password });
  };

  const remove = (u: AdminUserView) => {
    if (window.confirm(`Excluir o usuário ${u.username}? O histórico de atividades dele também será apagado.`)) {
      void call(`/api/users/${u.id}`, { method: "DELETE" });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="new-username">Usuário</Label>
          <Input
            id="new-username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="maria.silva"
            autoCapitalize="none"
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="new-fullname">Nome completo</Label>
          <Input
            id="new-fullname"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Senha inicial</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="flex gap-2 items-end">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="new-role">Perfil</Label>
            <select
              id="new-role"
              className={`${selectClass} w-full`}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={busy}>
            <UserPlus className="w-3.5 h-3.5" />
            Criar
          </Button>
        </div>
      </form>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="w-36">Usuário</TableHead>
            <TableHead className="w-32">Perfil</TableHead>
            <TableHead className="w-24">Situação</TableHead>
            <TableHead className="w-36">Último acesso</TableHead>
            <TableHead className="w-32 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} className={u.active ? undefined : "opacity-60"}>
              <TableCell className="text-sm font-medium">
                {u.fullName}
                {u.id === me.id && <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>}
              </TableCell>
              <TableCell className="font-mono text-xs">{u.username}</TableCell>
              <TableCell>
                <select
                  className={selectClass}
                  value={u.role}
                  disabled={busy}
                  aria-label={`Perfil de ${u.username}`}
                  onChange={(e) => void patch(u, { role: e.target.value })}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </TableCell>
              <TableCell>
                <Badge variant={u.active ? "success" : "outline"}>{u.active ? "Ativo" : "Inativo"}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatDateTime(u.lastLoginAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    title={u.active ? "Desativar" : "Ativar"}
                    aria-label={u.active ? `Desativar ${u.username}` : `Ativar ${u.username}`}
                    onClick={() => void patch(u, { active: !u.active })}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    title="Redefinir senha"
                    aria-label={`Redefinir senha de ${u.username}`}
                    onClick={() => resetPassword(u)}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    title="Excluir"
                    aria-label={`Excluir ${u.username}`}
                    onClick={() => remove(u)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
