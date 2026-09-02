"use client";

import { useState } from "react";
import { FileText, PlusCircle, ShieldAlert, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SodScenario = "manutencao" | "criacao";

export function SodAnalyzerTab() {
  const [scenario, setScenario] = useState<SodScenario>("manutencao");
  const [file, setFile] = useState<File | null>(null);
  const [ticketNumber, setTicketNumber] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisador SoD</CardTitle>
        <CardDescription>Detecte conflitos de Segregação de Função na matriz de riscos TOTVS.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>1. Cenário de Análise</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScenario("manutencao")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                scenario === "manutencao"
                  ? "border-foreground/40 bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <UserCog className="w-4 h-4" />
              Manutenção
            </button>
            <button
              type="button"
              onClick={() => setScenario("criacao")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                scenario === "criacao"
                  ? "border-foreground/40 bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <PlusCircle className="w-4 h-4" />
              Criação
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>2. Matriz de Risco</Label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-foreground/30 rounded-xl p-6 cursor-pointer hover:bg-accent transition-colors text-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground mt-2">
              {file ? file.name : "Clique ou arraste o arquivo"}
            </span>
            <span className="text-[10px] text-muted-foreground">.xlsx, .xls ou .pdf</span>
            <input
              type="file"
              accept=".xlsx,.xls,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticket">
            3. Nº do Chamado <span className="text-muted-foreground font-normal">(opcional — usado no e-mail)</span>
          </Label>
          <Input
            id="ticket"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="Ex: 0001234"
            className="max-w-xs font-mono"
          />
        </div>

        <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
          <Button disabled className="mt-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            Analisar SoD
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Em desenvolvimento — aguardando uma matriz de risco de exemplo para implementar a análise de conflitos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
