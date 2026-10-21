import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ACTIVITY_LABELS, type ActivityEntry } from "@/lib/activity-kinds";
import { formatDateTime } from "@/lib/format-date";

export function ActivityTable({ entries, showUser }: { entries: ActivityEntry[]; showUser: boolean }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade registrada.</p>;
  }

  return (
    <div className="max-h-[480px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Quando</TableHead>
            {showUser && <TableHead className="w-44">Usuário</TableHead>}
            <TableHead className="w-48">Tipo</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(e.createdAt)}</TableCell>
              {showUser && <TableCell className="text-sm">{e.userName}</TableCell>}
              <TableCell>
                <Badge variant="outline">{ACTIVITY_LABELS[e.kind as keyof typeof ACTIVITY_LABELS] ?? e.kind}</Badge>
              </TableCell>
              <TableCell className="text-sm text-foreground">{e.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
