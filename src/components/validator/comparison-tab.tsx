"use client";

import { Check, CheckCheck, Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/validator/status-badge";
import type { ComparisonRow, FilterStatus } from "@/types";

interface ComparisonTabProps {
  results: ComparisonRow[];
  filteredResults: ComparisonRow[];
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  stats: { exact: number; divergent: number; notFound: number };
  onAcceptSuggestion: (rowId: string) => void;
  onAcceptAllDivergences: () => void;
  onOpenManualSelect: (row: ComparisonRow) => void;
  onExportAnalise: () => void;
}

const FILTERS: { value: FilterStatus; label: (stats: ComparisonTabProps["stats"], total: number) => string }[] = [
  { value: "ALL", label: (_s, total) => `Todos (${total})` },
  { value: "Divergente", label: (s) => `Divergentes (${s.divergent})` },
  { value: "Não Encontrado", label: (s) => `Pendentes (${s.notFound})` },
  { value: "Exato", label: (s) => `Exatos (${s.exact})` },
];

export function ComparisonTab({
  results,
  filteredResults,
  filterStatus,
  onFilterStatusChange,
  searchQuery,
  onSearchQueryChange,
  stats,
  onAcceptSuggestion,
  onAcceptAllDivergences,
  onOpenManualSelect,
  onExportAnalise,
}: ComparisonTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Filtrar por texto, código ou ID..."
              className="pl-9 h-8 text-xs w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border text-xs">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterStatusChange(f.value)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterStatus === f.value
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label(stats, results.length)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.divergent > 0 && (
            <Button variant="warning" onClick={onAcceptAllDivergences} title="Aprova todas as correspondências sugeridas pelo algoritmo inteligente">
              <CheckCheck className="w-3.5 h-3.5" />
              Aceitar Todas Divergências
            </Button>
          )}

          <Button variant="secondary" onClick={onExportAnalise}>
            <Download className="w-3.5 h-3.5" />
            Exportar Análise (.csv)
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="min-w-[200px]">Funcionalidade Original (RM)</TableHead>
              <TableHead className="min-w-[260px]">Funcionalidade Sugerida (VAR)</TableHead>
              <TableHead className="w-24">ID VAR</TableHead>
              <TableHead className="w-28 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Nenhum registro encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((row) => {
                const effectiveStatus = row.acceptedOverride ? row.acceptedOverride.status : row.status;
                const matched = row.acceptedOverride?.matchedItem ?? row.matchedItem;

                return (
                  <TableRow key={row.rowId}>
                    <TableCell className="text-center text-muted-foreground font-mono">{row.originalIndex}</TableCell>

                    <TableCell>
                      <StatusBadge status={effectiveStatus} confidence={row.confidence} />
                    </TableCell>

                    <TableCell className="text-foreground font-mono text-[12px] whitespace-pre-line">
                      {row.rawInput}
                    </TableCell>

                    <TableCell>
                      {matched ? (
                        <div>
                          <span className="font-mono text-[12px] text-foreground font-medium">{matched.name}</span>
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <span>Módulo:</span> {matched.moduleName}
                            {row.reason && <span className="hidden lg:inline">• {row.reason}</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Nenhum correspondente no catálogo</span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono font-semibold">
                      {matched ? (
                        <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border text-xs">
                          {matched.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {row.status === "Divergente" && !row.acceptedOverride && (
                          <Button
                            variant="success"
                            size="icon"
                            onClick={() => onAcceptSuggestion(row.rowId)}
                            title="Aprovar e associar ao ID do VAR"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onOpenManualSelect(row)}
                          title="Buscar e Vincular Manualmente"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
