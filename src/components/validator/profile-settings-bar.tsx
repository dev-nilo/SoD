"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ModuleOption } from "@/types";

interface ProfileSettingsBarProps {
  profileCode: string;
  onProfileCodeChange: (value: string) => void;
  selectedModule: string;
  onSelectedModuleChange: (value: string) => void;
  availableModules: ModuleOption[];
  onRerun: () => void;
}

export function ProfileSettingsBar({
  profileCode,
  onProfileCodeChange,
  selectedModule,
  onSelectedModuleChange,
  availableModules,
  onRerun,
}: ProfileSettingsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border">
      <div>
        <Label htmlFor="profileCode">Código / Nome do Perfil</Label>
        <Input
          id="profileCode"
          value={profileCode}
          onChange={(e) => onProfileCodeChange(e.target.value)}
          placeholder="Ex: Z_COORDPERMARET"
          className="font-mono uppercase"
        />
      </div>

      <div>
        <Label htmlFor="module">Módulo TOTVS para Comparação</Label>
        <Select value={selectedModule} onValueChange={onSelectedModuleChange}>
          <SelectTrigger id="module">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableModules.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="secondary" onClick={onRerun} className="w-full justify-center py-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          Re-executar Comparação
        </Button>
      </div>
    </div>
  );
}
