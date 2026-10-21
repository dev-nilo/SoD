"use client";

import { AlertTriangle, Database, FileSpreadsheet, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CatalogImportResult } from "@/hooks/use-var-catalog";
import { codeFromName } from "@/lib/catalog-upload";
import type { VarCatalogItem } from "@/types";

interface CatalogTabProps {
  varCatalog: VarCatalogItem[];
  /** Only admins change the catalog; everyone else just reads it. */
  canEdit: boolean;
  onAddEntry: (entry: VarCatalogItem) => void;
  onImportFile: (file: File) => void;
  importing: boolean;
  importResult: CatalogImportResult | null;
  importError: string | null;
}

function ImportSummary({ result }: { result: CatalogImportResult }) {
  return (
    <div className="rounded-xl border border-border p-3.5 space-y-2 text-xs">
      <p className="font-semibold text-foreground">Importação de &quot;{result.fileName}&quot; concluída</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="success">{result.added} novas</Badge>
        <Badge variant="warning">{result.updated} alteradas</Badge>
        <Badge>{result.unchanged} sem mudança</Badge>
        <Badge variant={result.missing.length > 0 ? "destructive" : "outline"}>
          {result.missing.length} ausentes na planilha
        </Badge>
      </div>
      {result.missing.length > 0 && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">
            Estão no dicionário mas não vieram na planilha (mantidas — remova manualmente se for o caso)
          </summary>
          <ul className="mt-1.5 max-h-40 overflow-y-auto font-mono space-y-0.5">
            {result.missing.map((m) => (
              <li key={m.id}>
                {m.id} · {m.name} · {m.moduleName}
              </li>
            ))}
          </ul>
        </details>
      )}
      {result.rowErrors.length > 0 && (
        <details>
          <summary className="cursor-pointer text-warning">{result.rowErrors.length} linha(s) ignorada(s)</summary>
          <ul className="mt-1.5 max-h-40 overflow-y-auto space-y-0.5">
            {result.rowErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function CatalogTab({
  varCatalog,
  canEdit,
  onAddEntry,
  onImportFile,
  importing,
  importResult,
  importError,
}: CatalogTabProps) {
  const handleAdd = () => {
    const newEntry = window.prompt(
      "Adicione no formato: ID,Nome,ID_Modulo,Nome_Modulo\nEx: 9999,[01.02.03] Minha Nova Funcionalidade,2,TOTVS Gestão Financeira"
    );
    if (!newEntry) return;

    const [id, name, moduleId, moduleName] = newEntry.split(",");
    if (!id || !name) return;

    onAddEntry({
      id: Number(id.trim()),
      code: codeFromName(name),
      name: name.trim(),
      moduleId: Number(moduleId?.trim() || 2),
      moduleName: moduleName?.trim() || "TOTVS Gestão Financeira",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-foreground" />
          <span className="text-sm font-semibold text-foreground">Catálogo Master de Funcionalidades do VAR</span>
          <Badge>{varCatalog.length} funcionalidades mapeadas</Badge>
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild disabled={importing}>
              <label className="cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {importing ? "Importando..." : "Importar planilha da Base VAR"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  disabled={importing}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) onImportFile(file);
                  }}
                />
              </label>
            </Button>
            <Button variant="secondary" onClick={handleAdd}>
              <Plus className="w-3.5 h-3.5" />
              Adicionar Nova ao Dicionário
            </Button>
          </div>
        )}
      </div>

      {canEdit && (
        <p className="text-xs text-muted-foreground">
          A planilha precisa das colunas ID Funcionalidade, Funcionalidade, ID Módulo e Módulo. Itens existentes são
          atualizados pelo ID; nada é apagado.
        </p>
      )}

      {importError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          {importError}
        </p>
      )}

      {importResult && <ImportSummary result={importResult} />}

      <Card className="overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">ID Funcionalidade</TableHead>
                <TableHead>Funcionalidade</TableHead>
                <TableHead className="w-28">ID Módulo</TableHead>
                <TableHead className="w-64">Módulo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-[12px]">
              {varCatalog.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">{item.id}</TableCell>
                  <TableCell className="text-foreground font-sans">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.moduleId}</TableCell>
                  <TableCell className="text-muted-foreground font-sans">{item.moduleName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
