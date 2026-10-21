"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  FileSpreadsheet,
  FileWarning,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSodAnalysis } from "@/hooks/use-sod-analysis";
import { SCENARIO_LABEL, type SodScenario } from "@/lib/sod-notes";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<string, string> = {
  funcao: "SoD",
  critico: "Crítico",
};

const SCENARIOS: SodScenario[] = ["manutencao", "criacao"];

type NoteKind = "chamado" | "email" | "aprovado";

const NOTE_LABEL: Record<NoteKind, string> = {
  chamado: "Copiar nota (chamado)",
  email: "Copiar nota (e-mail)",
  aprovado: "Copiar nota (sem conflitos)",
};

export function SodAnalysisTab() {
  const analysis = useSodAnalysis();
  const [copied, setCopied] = useState<NoteKind | null>(null);

  const copy = async (kind: NoteKind) => {
    try {
      await analysis.copyNote(kind);
      setCopied(kind);
      window.setTimeout(() => setCopied((c) => (c === kind ? null : c)), 2000);
    } catch {
      window.alert("Não foi possível copiar a nota.");
    }
  };

  const noteButton = (kind: NoteKind) => (
    <Button key={kind} variant="secondary" onClick={() => void copy(kind)}>
      {copied === kind ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
      {copied === kind ? "Copiada!" : NOTE_LABEL[kind]}
    </Button>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Analisar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cenário</Label>
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border w-fit">
                {SCENARIOS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => analysis.setCenario(c)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      analysis.cenario === c
                        ? "bg-background text-foreground border border-border shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {SCENARIO_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sod-ticket">Ticket</Label>
              <Input
                id="sod-ticket"
                placeholder="Nº do chamado"
                value={analysis.ticket}
                onChange={(e) => analysis.setTicket(e.target.value)}
              />
            </div>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-foreground/30 rounded-xl p-6 cursor-pointer hover:bg-accent transition-colors text-center">
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground mt-2">
              {analysis.fileName
                ? analysis.fileName
                : "Clique ou arraste o relatório do perfil (.xlsx)"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Colunas esperadas: Perfil, Sistema, Funcionalidade, Status
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) analysis.loadFile(file);
              }}
            />
          </label>

          {analysis.error && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" />
              {analysis.error}
            </p>
          )}

          {analysis.profileRows.length > 0 && analysis.loadingReferenceData && (
            <p className="text-xs text-muted-foreground">
              Carregando catálogo VAR e matriz de riscos...
            </p>
          )}

          {analysis.profileRows.length > 0 &&
            !analysis.loadingReferenceData && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {analysis.profileName}
                </span>
                {analysis.modulo && <span>{analysis.modulo}</span>}
                <span>
                  {analysis.profileRows.length} funcionalidades no relatório
                </span>
                <span>{analysis.addedCount} adicionadas</span>
                {analysis.unmatchedCount > 0 && (
                  <span className="flex items-center gap-1 text-warning">
                    <FileWarning className="w-3.5 h-3.5" />
                    {analysis.unmatchedCount} não reconhecidas no catálogo VAR
                  </span>
                )}
                <span>
                  {analysis.curatedRiskCount} de {analysis.risks.length} riscos
                  têm matriz curada
                </span>
              </div>
            )}
        </CardContent>
      </Card>

      {analysis.profileRows.length > 0 && !analysis.loadingReferenceData && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Riscos Encontrados</CardTitle>
            </div>
            {analysis.cenario === "manutencao" && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <input
                  type="checkbox"
                  checked={analysis.onlyAdded}
                  onChange={(e) => analysis.setOnlyAdded(e.target.checked)}
                />
                Só com funcionalidade adicionada
              </label>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 pb-1">
              {analysis.triggeredRisks.length > 0
                ? [noteButton("chamado"), noteButton("email")]
                : noteButton("aprovado")}
              <Button variant="secondary" onClick={() => void analysis.exportXlsx()}>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Exportar Excel da análise
              </Button>
            </div>

            {analysis.triggeredRisks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {analysis.allTriggeredRisksCount === 0
                  ? "Nenhum risco mapeado foi encontrado neste perfil."
                  : "Nenhum dos riscos encontrados envolve uma funcionalidade adicionada — desmarque o filtro para ver todos."}
              </p>
            ) : (
              analysis.triggeredRisks.map((t, idx) => (
                <div
                  key={`${t.risk.id}-${idx}`}
                  className="rounded-xl border border-border p-3.5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {t.risk.id}
                    </span>
                    <Badge variant="outline">
                      {KIND_LABEL[t.risk.kind] ?? t.risk.kind}
                    </Badge>
                    <Badge variant="warning">
                      Criticidade {t.risk.criticality}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">
                    {t.risk.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {t.matches.map((m, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted/40 border border-border p-2 text-xs space-y-0.5"
                      >
                        <p className="font-medium text-foreground">
                          {m.activity.name}
                        </p>
                        <p className="text-muted-foreground font-mono">
                          {m.functionality.name}
                        </p>
                        {m.status === "Adicionado" && (
                          <Badge variant="destructive">
                            Adicionado neste ticket
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
