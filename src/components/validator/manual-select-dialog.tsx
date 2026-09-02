"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ComparisonRow, VarCatalogItem } from "@/types";

interface ManualSelectDialogProps {
  row: ComparisonRow | null;
  varCatalog: VarCatalogItem[];
  onOpenChange: (open: boolean) => void;
  onSelect: (rowId: string, item: VarCatalogItem) => void;
}

export function ManualSelectDialog({ row, varCatalog, onOpenChange, onSelect }: ManualSelectDialogProps) {
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    const query = term.toLowerCase();
    if (!query) return varCatalog;
    return varCatalog.filter((c) => c.name.toLowerCase().includes(query) || String(c.id).includes(query));
  }, [term, varCatalog]);

  const handleOpenChange = (open: boolean) => {
    if (!open) setTerm("");
    onOpenChange(open);
  };

  return (
    <Dialog open={row !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular Funcionalidade Manualmente</DialogTitle>
          <DialogDescription>Original: {row?.rawInput}</DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Pesquisar por nome ou ID no catálogo do VAR..."
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => row && onSelect(row.rowId, item)}
              className="p-3 rounded-xl hover:bg-accent border border-transparent hover:border-border cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-sm font-semibold text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Módulo: {item.moduleName}</div>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-muted border border-border text-foreground">
                ID: {item.id}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
