"use client";

import { useState } from "react";
import { Database, Edit3, FileCheck, FileSpreadsheet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatalogTab } from "@/components/validator/catalog-tab";
import { ComparisonTab } from "@/components/validator/comparison-tab";
import { ImportVarTab } from "@/components/validator/import-var-tab";
import { InputTab } from "@/components/validator/input-tab";
import { ManualSelectDialog } from "@/components/validator/manual-select-dialog";
import { ProfileSettingsBar } from "@/components/validator/profile-settings-bar";
import { SiteHeader } from "@/components/validator/site-header";
import { StatsCards } from "@/components/validator/stats-cards";
import { useProfileValidator } from "@/hooks/use-profile-validator";
import { exportToCSV } from "@/lib/csv-export";
import type { ComparisonRow } from "@/types";

export function ValidatorApp() {
  const validator = useProfileValidator();
  const [activeTab, setActiveTab] = useState("comparison");
  const [manualSelectRow, setManualSelectRow] = useState<ComparisonRow | null>(null);

  const handleExport = (type: "importa_var" | "analise") => {
    exportToCSV(type, {
      results: validator.results,
      importaVarData: validator.importaVarData,
      profileCode: validator.profileCode,
    });
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        validator.setRawInputText(text);
        setActiveTab("comparison");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        onLoadSample={validator.loadSampleData}
        onExportImportaVar={() => handleExport("importa_var")}
        importaVarCount={validator.importaVarData.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
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

        <StatsCards stats={validator.stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="comparison">
              <FileCheck className="w-4 h-4" />
              Comparação &amp; Análise de Divergências
              <Badge>{validator.results.length}</Badge>
            </TabsTrigger>

            <TabsTrigger value="import_var">
              <FileSpreadsheet className="w-4 h-4" />
              Planilha Importa VAR (Pronta para Carga)
              <Badge variant="success">{validator.importaVarData.length}</Badge>
            </TabsTrigger>

            <TabsTrigger value="input">
              <Edit3 className="w-4 h-4" />
              Funcionalidades - RM (Editor)
            </TabsTrigger>

            <TabsTrigger value="catalog">
              <Database className="w-4 h-4" />
              Dicionário do VAR ({validator.varCatalog.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
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

          <TabsContent value="import_var">
            <ImportVarTab importaVarData={validator.importaVarData} onExportImportaVar={() => handleExport("importa_var")} />
          </TabsContent>

          <TabsContent value="input">
            <InputTab
              rawInputText={validator.rawInputText}
              onRawInputTextChange={validator.setRawInputText}
              onProcessAndAnalyze={() => {
                validator.executeComparison();
                setActiveTab("comparison");
              }}
              onFileUpload={handleFileUpload}
            />
          </TabsContent>

          <TabsContent value="catalog">
            <CatalogTab varCatalog={validator.varCatalog} onAddEntry={validator.addCatalogEntry} />
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
    </div>
  );
}
