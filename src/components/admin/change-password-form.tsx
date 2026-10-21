"use client";

import { useState } from "react";
import { AlertTriangle, Check, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmation) {
      setMessage({ ok: false, text: "A confirmação não confere com a nova senha." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage({ ok: false, text: body.error ?? "Falha ao trocar a senha." });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmation("");
    setMessage({ ok: true, text: "Senha alterada." });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Senha atual</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-password">Nova senha</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-3 flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          <KeyRound className="w-3.5 h-3.5" />
          {saving ? "Salvando..." : "Trocar senha"}
        </Button>
        {message && (
          <p className={`flex items-center gap-1.5 text-xs ${message.ok ? "text-success" : "text-destructive"}`}>
            {message.ok ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
