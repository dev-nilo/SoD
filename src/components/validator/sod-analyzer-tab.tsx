"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SodAnalysisTab } from "@/components/validator/sod-analysis-tab";
import { SodCurationTab } from "@/components/validator/sod-curation-tab";

type SodTab = "analisar" | "curadoria";

export function SodAnalyzerTab() {
  const [tab, setTab] = useState<SodTab>("analisar");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as SodTab)}>
      <TabsList>
        <TabsTrigger value="analisar">Analisar Perfil</TabsTrigger>
        <TabsTrigger value="curadoria">Curadoria da Matriz</TabsTrigger>
      </TabsList>

      <TabsContent value="analisar">
        <SodAnalysisTab />
      </TabsContent>

      <TabsContent value="curadoria">
        <SodCurationTab />
      </TabsContent>
    </Tabs>
  );
}
