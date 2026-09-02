"use client";

import { useState } from "react";
import { FileText, GitCompare, Star, User, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadSlotProps {
  label: string;
  icon: LucideIcon;
  file: File | null;
  onChange: (file: File | null) => void;
}

function UploadSlot({ label, icon: Icon, file, onChange }: UploadSlotProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-foreground/30 rounded-xl p-6 h-40 cursor-pointer hover:bg-accent transition-colors text-center">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground mt-2">{file ? file.name : "Clique ou arraste o PDF"}</span>
        <span className="text-[10px] text-muted-foreground">Somente .pdf</span>
        <input type="file" accept=".pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

export function ProfileComparatorTab() {
  const [mirrorFile, setMirrorFile] = useState<File | null>(null);
  const [requestedFile, setRequestedFile] = useState<File | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparador de Perfis</CardTitle>
        <CardDescription>
          Faça upload de dois PDFs de Funcionalidades do Perfil (TOTVS) e veja o que falta, o que é comum e o que
          sobra.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UploadSlot label="Perfil Espelho (Referência)" icon={Star} file={mirrorFile} onChange={setMirrorFile} />
          <UploadSlot label="Perfil Solicitado" icon={User} file={requestedFile} onChange={setRequestedFile} />
        </div>

        <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
          <Button disabled className="mt-4">
            <GitCompare className="w-3.5 h-3.5" />
            Comparar Perfis
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Em desenvolvimento — aguardando uma amostra de PDF de perfil para implementar o parser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
