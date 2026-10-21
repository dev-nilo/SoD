"use client";

import { useState } from "react";

import { useCurrentUser } from "@/components/auth/current-user-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SodAnalysisTab } from "@/components/validator/sod-analysis-tab";
import { SodCurationTab } from "@/components/validator/sod-curation-tab";
import { can } from "@/lib/user-rules";

type SodTab = "analisar" | "curadoria";

export function SodAnalyzerTab() {
  const [tab, setTab] = useState<SodTab>("analisar");
  // A curadoria muda o resultado das análises de todos — só admins editam.
  const canCurate = can(useCurrentUser().role, "edit-sod-curation");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as SodTab)}>
      <TabsList>
        <TabsTrigger value="analisar">Analisar Perfil</TabsTrigger>
        {canCurate && <TabsTrigger value="curadoria">Curadoria da Matriz</TabsTrigger>}
      </TabsList>

      <TabsContent value="analisar">
        <SodAnalysisTab />
      </TabsContent>

      {canCurate && (
        <TabsContent value="curadoria">
          <SodCurationTab />
        </TabsContent>
      )}
    </Tabs>
  );
}
