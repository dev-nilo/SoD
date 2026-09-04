"use client";

import { ArrowRight, Check, CheckCheck, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/validator/status-badge";
import { isHighConfidenceDivergence } from "@/lib/match-engine";
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
  onAcceptHighConfidenceDivergences: () => void;
  onOpenManualSelect: (row: ComparisonRow) => void;
  onGoToExport: () => void;
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
  onAcceptHighConfidenceDivergences,
  onOpenManualSelect,
  onGoToExport,
}: ComparisonTabProps) {
  const highConfidenceCount = results.filter(isHighConfidenceDivergence).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Filtrar por texto, código ou ID..."
              className="pl-9 h-9 text-sm w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border text-sm">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterStatusChange(f.value)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
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
          {highConfidenceCount > 0 && (
            <Button
              variant="warning"
              onClick={onAcceptHighConfidenceDivergences}
              title={`Aprova as ${highConfidenceCount} divergências de alta confiança (mesmo item do catálogo, só formatação ou código)`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Aceitar Alta Confiança ({highConfidenceCount})
            </Button>
          )}

          <Button onClick={onGoToExport}>
            Ir para Exportar
            <ArrowRight className="w-4 h-4" />
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
              <TableHead className="w-8 hidden lg:table-cell" aria-hidden />
              <TableHead className="min-w-[260px]">Funcionalidade Sugerida (VAR)</TableHead>
              <TableHead className="w-24">ID VAR</TableHead>
              <TableHead className="w-28 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Nenhum registro encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((row) => {
                const matched = row.matchedItem;

                return (
                  <TableRow key={row.rowId}>
                    <TableCell className="text-center text-muted-foreground font-mono">{row.originalIndex}</TableCell>

                    <TableCell>
                      <StatusBadge status={row.status} override={row.override} confidence={row.confidence} />
                    </TableCell>

                    <TableCell className="text-foreground font-mono text-[12px] whitespace-pre-line">
                      {row.rawInput}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-center text-muted-foreground">
                      <ArrowRight className="w-3.5 h-3.5 inline" />
                    </TableCell>

                    <TableCell>
                      {matched ? (
                        <div className="space-y-1">
                          <span className="font-mono text-[12px] text-foreground font-medium block">
                            {matched.name}
                          </span>
                          <span className="inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                            {matched.moduleName}
                          </span>
                          {row.reason && (
                            <p className="text-[11px] text-muted-foreground italic">{row.reason}</p>
                          )}
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
                        {row.status === "Divergente" && (
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
