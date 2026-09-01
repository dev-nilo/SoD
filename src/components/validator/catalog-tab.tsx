"use client";

import { Database, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { VarCatalogItem } from "@/types";

interface CatalogTabProps {
  varCatalog: VarCatalogItem[];
  onAddEntry: (entry: VarCatalogItem) => void;
}

export function CatalogTab({ varCatalog, onAddEntry }: CatalogTabProps) {
  const handleAdd = () => {
    const newEntry = window.prompt(
      "Adicione no formato: ID,Nome,ID_Modulo,Nome_Modulo\nEx: 9999,[01.02.03] Minha Nova Funcionalidade,2,TOTVS Gestão Financeira"
    );
    if (!newEntry) return;

    const [id, name, moduleId, moduleName] = newEntry.split(",");
    if (!id || !name) return;

    onAddEntry({
      id: Number(id.trim()),
      code: name.match(/\[(.*?)\]/)?.[0] ?? "",
      name: name.trim(),
      moduleId: Number(moduleId?.trim() || 2),
      moduleName: moduleName?.trim() || "TOTVS Gestão Financeira",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Catálogo Master de Funcionalidades do VAR</span>
          <Badge>{varCatalog.length} funcionalidades mapeadas</Badge>
        </div>

        <Button variant="secondary" onClick={handleAdd}>
          <Plus className="w-3.5 h-3.5" />
          Adicionar Nova ao Dicionário
        </Button>
      </div>

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
                  <TableCell className="font-bold text-warning">{item.id}</TableCell>
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
