"use client";

import { Database, Download, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  onLoadSample: () => void;
  onExportImportaVar: () => void;
  onOpenCatalog: () => void;
  importaVarCount: number;
  catalogCount: number;
}

export function SiteHeader({
  onLoadSample,
  onExportImportaVar,
  onOpenCatalog,
  importaVarCount,
  catalogCount,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground flex flex-wrap items-center gap-2">
            Validador de Perfil &amp; Gerador de Importa VAR
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              v2.5 Pro
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">Automação de De-Para e Conciliação TOTVS RM &amp; VAR</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <Button variant="secondary" onClick={onOpenCatalog}>
          <Database className="w-3.5 h-3.5" />
          Dicionário do VAR ({catalogCount})
        </Button>

        <Button variant="secondary" onClick={onLoadSample}>
          <RefreshCw className="w-3.5 h-3.5" />
          Carregar Dados de Exemplo
        </Button>

        <Button onClick={onExportImportaVar} disabled={importaVarCount === 0}>
          <Download className="w-3.5 h-3.5" />
          Exportar Importa VAR ({importaVarCount})
        </Button>
      </div>
    </header>
  );
}
