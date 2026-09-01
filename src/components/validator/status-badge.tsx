import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status, confidence }: { status: string; confidence?: number }) {
  if (status.startsWith("Exato")) {
    return (
      <Badge variant="success">
        <CheckCircle2 className="w-3 h-3" />
        {status}
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
