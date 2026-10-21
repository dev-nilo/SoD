"use client";

import { useState } from "react";
import { AlertTriangle, FileSpreadsheet, GitCompare, Star, UploadCloud, User, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfileComparison, type LoadedProfile } from "@/hooks/use-profile-comparison";
import type { ProfileComparison } from "@/lib/profile-comparison";
import { cn } from "@/lib/utils";

interface UploadSlotProps {
  label: string;
  icon: LucideIcon;
  profile: LoadedProfile | null;
  profileName: string;
  error: string | null;
  onFile: (file: File) => void;
}

function UploadSlot({ label, icon: Icon, profile, profileName, error, onFile }: UploadSlotProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-foreground/30 rounded-xl p-6 h-40 cursor-pointer hover:bg-accent transition-colors text-center">
        <UploadCloud className="w-8 h-8 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground mt-2">
          {profile ? profile.fileName : "Clique para enviar o relatório do perfil (.xlsx)"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {profile
            ? `${profileName} · ${profile.rows.length} funcionalidades`
            : "Colunas esperadas: Perfil, Sistema, Funcionalidade, Status"}
        </span>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onFile(file);
          }}
        />
      </label>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

type ListKey = keyof ProfileComparison;

const LISTS: { key: ListKey; label: string; hint: string; variant: "destructive" | "warning" | "success" }[] = [
  { key: "faltantes", label: "Faltantes", hint: "No espelho, mas não solicitadas", variant: "destructive" },
  { key: "extras", label: "Extras", hint: "Solicitadas, mas fora do espelho", variant: "warning" },
  { key: "comuns", label: "Comuns", hint: "Presentes nos dois perfis", variant: "success" },
];

export function ProfileComparatorTab() {
  const comparison = useProfileComparison();
  const [list, setList] = useState<ListKey>("faltantes");
  const { result } = comparison;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Comparador de Perfis</CardTitle>
          <CardDescription>
            Envie o relatório de funcionalidades de dois perfis e veja o que falta, o que sobra e o que é comum.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UploadSlot
              label="Perfil Espelho (Referência)"
              icon={Star}
              profile={comparison.mirror.profile}
              profileName={comparison.mirror.profileName}
              error={comparison.mirror.error}
              onFile={(f) => void comparison.loadMirror(f)}
            />
            <UploadSlot
              label="Perfil Solicitado"
              icon={User}
              profile={comparison.requested.profile}
              profileName={comparison.requested.profileName}
              error={comparison.requested.error}
              onFile={(f) => void comparison.loadRequested(f)}
            />
          </div>

          <div className="flex justify-center pt-2 border-t border-border">
            <Button className="mt-4" disabled={!comparison.canCompare} onClick={comparison.compare}>
              <GitCompare className="w-3.5 h-3.5" />
              Comparar Perfis
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>
                {comparison.mirror.profileName} × {comparison.requested.profileName}
              </CardTitle>
              <CardDescription>
                {comparison.totals.mirror} funcionalidades no espelho · {comparison.totals.requested} no solicitado
              </CardDescription>
            </div>
            <Button variant="secondary" onClick={() => void comparison.exportXlsx()}>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Exportar Excel
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LISTS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setList(l.key)}
                  className={cn(
                    "rounded-xl border p-3.5 text-left transition-colors",
                    list === l.key ? "border-foreground/40 bg-muted/60" : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{l.label}</span>
                    <Badge variant={l.variant}>{result[l.key].length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{l.hint}</p>
                </button>
              ))}
            </div>

            {result[list].length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma funcionalidade nesta lista.</p>
            ) : (
              <div className="max-h-[480px] overflow-y-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionalidade</TableHead>
                      <TableHead className="w-64">Sistema</TableHead>
                      <TableHead className="w-36">Status no relatório</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result[list].map((r) => (
                      <TableRow key={r.funcionalidade}>
                        <TableCell className="text-sm text-foreground">{r.funcionalidade}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.sistema}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
