import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MatchStatus, OverrideKind } from "@/types";

const OVERRIDE_LABEL: Record<OverrideKind, string> = {
  aprovado: "Exato (Aprovado)",
  manual: "Exato (Manual)",
};

export function StatusBadge({
  status,
  override,
  confidence,
}: {
  status: MatchStatus;
  override?: OverrideKind | null;
  confidence?: number;
}) {
  if (status === "Exato") {
    return (
      <Badge variant="success">
        <CheckCircle2 className="w-3 h-3" />
        {override ? OVERRIDE_LABEL[override] : "Exato"}
      </Badge>
    );
  }

  if (status === "Divergente") {
    return (
      <Badge variant="warning">
        <AlertTriangle className="w-3 h-3" />
        Divergente {confidence !== undefined ? `(${confidence}%)` : ""}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <XCircle className="w-3 h-3" />
      Não Encontrado
    </Badge>
  );
}
