"use client";

import { useState } from "react";
import { CheckSquare, Database, Edit3, FileCheck, FileSpreadsheet, GitCompare, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CatalogTab } from "@/components/validator/catalog-tab";
import { ComparisonTab } from "@/components/validator/comparison-tab";
import { FlowStepper, type FlowStep } from "@/components/validator/flow-stepper";
import { ImportVarTab } from "@/components/validator/import-var-tab";
import { InputTab } from "@/components/validator/input-tab";
import { ManualSelectDialog } from "@/components/validator/manual-select-dialog";
import { ProfileComparatorTab } from "@/components/validator/profile-comparator-tab";
import { ProfileSettingsBar } from "@/components/validator/profile-settings-bar";
import type { AppSection } from "@/components/validator/section-nav";
import { SiteHeader } from "@/components/validator/site-header";
import { SodAnalyzerTab } from "@/components/validator/sod-analyzer-tab";
import { StatsCards } from "@/components/validator/stats-cards";
import { useProfileValidator } from "@/hooks/use-profile-validator";
import { exportToCSV } from "@/lib/csv-export";
import { parseSpreadsheetFile } from "@/lib/xlsx-import";
import type { ComparisonRow } from "@/types";

type FlowTab = "entrada" | "comparacao" | "exportar";

const SECTION_ITEMS: { id: AppSection; label: string; icon: typeof CheckSquare }[] = [
  { id: "validador", label: "Validador", icon: CheckSquare },
  { id: "sod", label: "Analisador SoD", icon: ShieldAlert },
  { id: "comparador", label: "Comparador", icon: GitCompare },
];

export function ValidatorApp() {
  const validator = useProfileValidator();
  const [section, setSection] = useState<AppSection>("validador");
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

  const goToComparacao = (textOverride?: string) => {
    validator.executeComparison(textOverride);
    setActiveTab("comparacao");
  };

  const applyUploadedText = (text: string) => {
    validator.setRawInputText(text);
    goToComparacao(text);
  };

  const handleFinish = () => {
    validator.resetFlow();
    setHasExported(false);
    setActiveTab("entrada");
  };

  const handleFileUpload = (file: File) => {
    if (/\.xlsx?$/i.test(file.name)) {
      parseSpreadsheetFile(file)
        .then(applyUploadedText)
        .catch((err) => {
          window.alert(err instanceof Error ? err.message : "Falha ao processar a planilha.");
        });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        applyUploadedText(text);
      }
    };
    reader.readAsText(file);
  };

  const lineCount = validator.rawInputText.split("\n").filter((l) => l.trim().length > 0).length;
  const entradaComplete = lineCount > 0 && validator.profileCode.trim().length > 0;
  const comparacaoComplete = validator.results.length > 0 && validator.stats.divergent === 0 && validator.stats.notFound === 0;
  const exportarComplete = hasExported;

  const stepState = (id: FlowTab, complete: boolean): FlowStep["state"] =>
    activeTab === id ? "current" : complete ? "complete" : "pending";

  const steps: FlowStep[] = [
    { id: "entrada", label: "Entrada & Configuração", icon: Edit3, state: stepState("entrada", entradaComplete) },
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
      <SiteHeader section={section} onSectionChange={setSection} sectionItems={SECTION_ITEMS} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {section === "validador" && (
          <>
            <StatsCards stats={validator.stats} />

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FlowTab)}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                <div className="flex-1 min-w-0">
                  <FlowStepper steps={steps} />
                </div>
                <Button
                  variant="secondary"
                  className="shrink-0 self-start lg:self-center"
                  onClick={() => setCatalogOpen(true)}
                >
                  <Database className="w-3.5 h-3.5" />
                  Dicionário do VAR ({validator.varCatalog.length})
                </Button>
              </div>

              <TabsContent value="entrada" className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Configuração do Perfil</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identifique o perfil no VAR e o módulo TOTVS usado para a comparação.
                    </p>
                  </div>

                  <ProfileSettingsBar
                    profileCode={validator.profileCode}
                    onProfileCodeChange={validator.setProfileCode}
                    selectedModule={validator.selectedModule}
                    onSelectedModuleChange={validator.setSelectedModule}
                    availableModules={validator.availableModules}
                    onContinue={() => goToComparacao()}
                  />
                </div>

                <InputTab
                  rawInputText={validator.rawInputText}
                  onRawInputTextChange={validator.setRawInputText}
                  onFileUpload={handleFileUpload}
                />
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
                  onAcceptHighConfidenceDivergences={validator.acceptHighConfidenceDivergences}
                  onOpenManualSelect={setManualSelectRow}
                  onExportAnalise={() => handleExport("analise")}
                  onGoToExport={() => setActiveTab("exportar")}
                />
              </TabsContent>

              <TabsContent value="exportar">
                <ImportVarTab
                  importaVarData={validator.importaVarData}
                  onExportImportaVar={() => handleExport("importa_var")}
                  hasExported={hasExported}
                  onFinish={handleFinish}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {section === "sod" && <SodAnalyzerTab />}
        {section === "comparador" && <ProfileComparatorTab />}
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
