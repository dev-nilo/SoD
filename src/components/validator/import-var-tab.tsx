"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildImportaVarRows, copyToClipboard } from "@/lib/csv-export";
import type { ImportaVarRow } from "@/types";

interface ImportVarTabProps {
  importaVarData: ImportaVarRow[];
  onExportImportaVar: () => void;
}

export function ImportVarTab({ importaVarData, onExportImportaVar }: ImportVarTabProps) {
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
            <Badge variant="success">{importaVarData.length} itens vinculados com sucesso</Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Estrutura pronta nos padrões da aba <strong className="text-foreground">Importa VAR</strong> (Colunas: id,
            perfil, funcionalidade id, funcionalidade).
          </p>
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
            Baixar Arquivo .CSV
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">id (Perfil VAR)</TableHead>
                <TableHead className="w-44">perfil</TableHead>
                <TableHead className="w-36">funcionalidade id</TableHead>
                <TableHead>funcionalidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-[12px]">
              {importaVarData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-foreground">{row.id}</TableCell>
                  <TableCell className="text-foreground">{row.perfil}</TableCell>
                  <TableCell className="text-foreground font-medium">{row.funcionalidadeId}</TableCell>
                  <TableCell className="text-foreground">{row.funcionalidade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
