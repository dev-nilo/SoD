"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, Download, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IMPORTA_VAR_COLUMNS, buildImportaVarRows, copyToClipboard } from "@/lib/csv-export";
import type { ImportaVarRow } from "@/types";

interface ImportVarTabProps {
  importaVarData: ImportaVarRow[];
  onExportImportaVar: () => void;
  hasExported: boolean;
  onFinish: () => void;
}

const HEADER_CLASS: Record<keyof ImportaVarRow, string> = {
  id: "w-24",
  perfil: "w-44",
  funcionalidadeId: "w-36",
  funcionalidade: "",
};

const CELL_CLASS: Record<keyof ImportaVarRow, string> = {
  id: "text-foreground font-medium",
  perfil: "font-semibold text-foreground",
  funcionalidadeId: "text-foreground font-medium",
  funcionalidade: "text-foreground",
};

export function ImportVarTab({
  importaVarData,
  onExportImportaVar,
  hasExported,
  onFinish,
}: ImportVarTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const tsv = buildImportaVarRows(importaVarData)
      .map((row) => row.join("\t"))
      .join("\n");
    await copyToClipboard(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-4 rounded-xl border border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Planilha de Carga do VAR
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar para Excel (Ctrl+V)
              </>
            )}
          </Button>

          <Button onClick={onExportImportaVar}>
            <Download className="w-3.5 h-3.5" />
            Baixar Arquivo .XLSX
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {IMPORTA_VAR_COLUMNS.map((col) => (
                  <TableHead key={col.key} className={HEADER_CLASS[col.key]}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-[12px]">
              {importaVarData.map((row, idx) => (
                <TableRow key={idx}>
                  {IMPORTA_VAR_COLUMNS.map((col) => (
                    <TableCell key={col.key} className={CELL_CLASS[col.key]}>
                      {row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          {hasExported ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Arquivo baixado. Validação concluída.
            </>
          ) : (
            "Baixe ou copie a planilha acima para concluir a validação."
          )}
        </p>

        <Button variant="secondary" onClick={onFinish}>
          <RotateCcw className="w-3.5 h-3.5" />
          Iniciar Nova Validação
        </Button>
      </div>
    </div>
  );
}
