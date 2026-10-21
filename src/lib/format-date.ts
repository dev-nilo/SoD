const FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

/** "21/10/2026, 14:32" in Brasília time, whatever timezone the server runs in. */
export function formatDateTime(iso: string | null | undefined): string {
  return iso ? FORMATTER.format(new Date(iso)) : "—";
}
