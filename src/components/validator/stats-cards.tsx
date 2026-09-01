import { AlertTriangle, CheckCircle2, Layers, Sparkles, XCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    total: number;
    exact: number;
    divergent: number;
    notFound: number;
    successRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <Card className="p-3.5">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Total RM
        </p>
        <p className="text-xl font-bold text-foreground mt-1">{stats.total}</p>
      </Card>

      <Card className="p-3.5">
        <p className="text-xs text-success flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Matches Exatos
        </p>
        <p className="text-xl font-bold text-success mt-1">{stats.exact}</p>
      </Card>

      <Card className="p-3.5">
        <p className="text-xs text-warning flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Divergências (Fuzzy)
        </p>
        <p className="text-xl font-bold text-warning mt-1">{stats.divergent}</p>
      </Card>

      <Card className="p-3.5">
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5" /> Não Encontrados
        </p>
        <p className="text-xl font-bold text-destructive mt-1">{stats.notFound}</p>
      </Card>

      <Card className="p-3.5 col-span-2 sm:col-span-1">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-success" /> Taxa de Validação
        </p>
        <p className="text-xl font-bold text-foreground mt-1">{stats.successRate}%</p>
      </Card>
    </div>
  );
}
