"use client";

import { useState } from "react";
import { Edit3, FileCheck, FileSpreadsheet, SlidersHorizontal } from "lucide-react";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CatalogTab } from "@/components/validator/catalog-tab";
import { ComparisonTab } from "@/components/validator/comparison-tab";
import { FlowStepper, type FlowStep } from "@/components/validator/flow-stepper";
import { ImportVarTab } from "@/components/validator/import-var-tab";
import { InputTab } from "@/components/validator/input-tab";
import { ManualSelectDialog } from "@/components/validator/manual-select-dialog";
import { ProfileSettingsBar } from "@/components/validator/profile-settings-bar";
import { SiteHeader } from "@/components/validator/site-header";
import { StatsCards } from "@/components/validator/stats-cards";
import { useProfileValidator } from "@/hooks/use-profile-validator";
import { exportToCSV } from "@/lib/csv-export";
import type { ComparisonRow } from "@/types";

type FlowTab = "entrada" | "configuracao" | "comparacao" | "exportar";

export function ValidatorApp() {
  const validator = useProfileValidator();
  const [activeTab, setActiveTab] = useState<FlowTab>("entrada");
  const [manualSelectRow, setManualSelectRow] = useState<ComparisonRow | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const handleExport = (type: "importa_var" | "analise") => {
    exportToCSV(type, {
      results: validator.results,
      importaVarData: validator.importaVarData,
      profileCode: validator.profileCode,
    });
    if (type === "importa_var") setHasExported(true);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        validator.setRawInputText(text);
        setActiveTab("comparacao");
      }
    };
    reader.readAsText(file);
  };

  const lineCount = validator.rawInputText.split("\n").filter((l) => l.trim().length > 0).length;
  const entradaComplete = lineCount > 0;
  const configuracaoComplete = validator.profileId.trim().length > 0 && validator.profileCode.trim().length > 0;
  const comparacaoComplete = validator.results.length > 0 && validator.stats.divergent === 0 && validator.stats.notFound === 0;
  const exportarComplete = hasExported;

  const stepState = (id: FlowTab, complete: boolean): FlowStep["state"] =>
    activeTab === id ? "current" : complete ? "complete" : "pending";

  const steps: FlowStep[] = [
    { id: "entrada", label: "Entrada", icon: Edit3, state: stepState("entrada", entradaComplete) },
    { id: "configuracao", label: "Configuração", icon: SlidersHorizontal, state: stepState("configuracao", configuracaoComplete) },
    {
      id: "comparacao",
      label: "Comparação",
      icon: FileCheck,
      state: stepState("comparacao", comparacaoComplete),
      badge: validator.results.length,
    },
    {
      id: "exportar",
      label: "Exportar",
      icon: FileSpreadsheet,
      state: stepState("exportar", exportarComplete),
      badge: validator.importaVarData.length,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        onLoadSample={validator.loadSampleData}
        onExportImportaVar={() => handleExport("importa_var")}
        onOpenCatalog={() => setCatalogOpen(true)}
        importaVarCount={validator.importaVarData.length}
        catalogCount={validator.varCatalog.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <StatsCards stats={validator.stats} />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FlowTab)}>
          <FlowStepper steps={steps} />

          <TabsContent value="entrada">
            <InputTab
              rawInputText={validator.rawInputText}
              onRawInputTextChange={validator.setRawInputText}
              onProcessAndAnalyze={() => {
                validator.executeComparison();
                setActiveTab("comparacao");
              }}
              onFileUpload={handleFileUpload}
            />
          </TabsContent>

          <TabsContent value="configuracao">
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Configuração do Perfil</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Identifique o perfil no VAR e o módulo TOTVS usado para a comparação.
                </p>
              </div>

              <ProfileSettingsBar
                profileId={validator.profileId}
                onProfileIdChange={validator.setProfileId}
                profileCode={validator.profileCode}
                onProfileCodeChange={validator.setProfileCode}
                selectedModule={validator.selectedModule}
                onSelectedModuleChange={validator.setSelectedModule}
                availableModules={validator.availableModules}
                onRerun={validator.executeComparison}
              />
            </div>
          </TabsContent>

          <TabsContent value="comparacao">
            <ComparisonTab
              results={validator.results}
              filteredResults={validator.filteredResults}
              filterStatus={validator.filterStatus}
              onFilterStatusChange={validator.setFilterStatus}
              searchQuery={validator.searchQuery}
              onSearchQueryChange={validator.setSearchQuery}
              stats={validator.stats}
              onAcceptSuggestion={validator.acceptSuggestion}
              onAcceptAllDivergences={validator.acceptAllDivergences}
              onOpenManualSelect={setManualSelectRow}
              onExportAnalise={() => handleExport("analise")}
            />
          </TabsContent>

          <TabsContent value="exportar">
            <ImportVarTab importaVarData={validator.importaVarData} onExportImportaVar={() => handleExport("importa_var")} />
          </TabsContent>
        </Tabs>
      </main>

      <ManualSelectDialog
        row={manualSelectRow}
        varCatalog={validator.varCatalog}
        onOpenChange={(open) => {
          if (!open) setManualSelectRow(null);
        }}
        onSelect={(rowId, item) => {
          validator.assignManualMatch(rowId, item);
          setManualSelectRow(null);
        }}
      />

      <Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
        <SheetContent className="p-0">
          <SheetHeader>
            <SheetTitle>Dicionário do VAR</SheetTitle>
            <SheetDescription>Catálogo de referência das funcionalidades mapeadas no VAR.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <CatalogTab varCatalog={validator.varCatalog} onAddEntry={validator.addCatalogEntry} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
