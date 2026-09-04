"use client";

import { AlertCircle, Check, Save, Search, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSodCuration } from "@/hooks/use-sod-curation";
import { cn } from "@/lib/utils";
import type { SodCurationFilter } from "@/lib/sod-curation";

const FILTERS: { value: SodCurationFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "Pendente", label: "Pendentes" },
  { value: "Mapeado", label: "Mapeados" },
];

const KIND_LABEL: Record<string, string> = {
  funcao: "SoD",
  critico: "Crítico",
};

export function SodAnalyzerTab() {
  const curation = useSodCuration();

  if (curation.loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Carregando riscos de SoD...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Curadoria da Matriz de Riscos SoD
          </CardTitle>
          <CardDescription>
            Para cada risco, selecione as atividades do sistema que, combinadas, o configuram. Essa matriz é o que
            vai faltando para a análise automática de conflitos funcionar — ainda não existe pronta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="success">{curation.stats.mapped} mapeados</Badge>
            <Badge variant="warning">{curation.stats.pending} pendentes</Badge>
            <span className="text-muted-foreground text-xs">de {curation.stats.total} riscos</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="space-y-3 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <Input
                value={curation.riskSearchQuery}
                onChange={(e) => curation.setRiskSearchQuery(e.target.value)}
                placeholder="Buscar por código ou descrição..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border text-sm w-fit">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => curation.setFilterStatus(f.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors text-xs",
                    curation.filterStatus === f.value
                      ? "bg-secondary text-secondary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[520px] divide-y divide-border">
            {curation.filteredRisks.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Nenhum risco encontrado.</p>
            ) : (
              curation.filteredRisks.map((risk) => {
                const isMapped = (curation.mappings[risk.id]?.length ?? 0) > 0;
                const isSelected = curation.selectedRisk?.id === risk.id;
                return (
                  <button
                    key={risk.id}
                    onClick={() => curation.selectRisk(risk.id)}
                    className={cn(
                      "w-full text-left p-3 transition-colors hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">{risk.id}</span>
                      <Badge variant="outline">{KIND_LABEL[risk.kind] ?? risk.kind}</Badge>
                      {isMapped ? (
                        <Check className="w-3.5 h-3.5 text-success ml-auto shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-warning ml-auto shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{risk.description}</p>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          {!curation.selectedRisk ? (
            <CardContent className="flex-1 flex items-center justify-center py-16 text-sm text-muted-foreground">
              Selecione um risco à esquerda para mapear suas atividades.
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{curation.selectedRisk.id}</span>
                  <Badge variant="outline">{KIND_LABEL[curation.selectedRisk.kind] ?? curation.selectedRisk.kind}</Badge>
                </div>
                <CardDescription>{curation.selectedRisk.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 flex flex-col min-h-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    value={curation.activitySearchQuery}
                    onChange={(e) => curation.setActivitySearchQuery(e.target.value)}
                    placeholder="Buscar atividade..."
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="flex-1 overflow-y-auto max-h-[280px] border border-border rounded-lg divide-y divide-border">
                  {curation.filteredActivities.map((activity) => {
                    const checked = curation.draftActivityIds.includes(activity.id);
                    return (
                      <label
                        key={activity.id}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 text-sm cursor-pointer hover:bg-accent transition-colors",
                          checked && "bg-accent"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => curation.toggleDraftActivity(activity.id)}
                          className="shrink-0"
                        />
                        <span className="text-foreground flex-1">{activity.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {activity.functionalityIds.length} func.
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">
                    {curation.draftActivityIds.length} atividade(s) selecionada(s) · implicam{" "}
                    {curation.impliedFunctionalityIds.length} funcionalidade(s) do VAR
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Um perfil que possua todas essas funcionalidades caracteriza o risco {curation.selectedRisk.id}.
                  </p>
                </div>

                <Button onClick={curation.saveMapping} disabled={curation.saving} className="self-end">
                  <Save className="w-3.5 h-3.5" />
                  {curation.saving ? "Salvando..." : "Salvar Mapeamento"}
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
