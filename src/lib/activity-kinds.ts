/**
 * Every kind of entry the activity log records, with the label the history
 * screens show. Client-reported kinds are the analyses that run entirely in
 * the browser; the rest are logged server-side by the route that does the work.
 */
export const ACTIVITY_LABELS = {
  login: "Login",
  "comparacao-validador": "Comparação (Validador)",
  "exportacao-importa-var": "Exportação Importa VAR",
  "analise-sod": "Análise SoD",
  "exportacao-sod": "Exportação da análise SoD",
  "comparacao-perfis": "Comparação de perfis",
  "upload-base-var": "Upload da base VAR",
  "edicao-catalogo": "Edição do catálogo VAR",
  "curadoria-sod": "Curadoria SoD",
  "gestao-usuarios": "Gestão de usuários",
  "troca-senha": "Troca de senha",
} as const;

export type ActivityKind = keyof typeof ACTIVITY_LABELS;

export const CLIENT_ACTIVITY_KINDS: ActivityKind[] = [
  "comparacao-validador",
  "exportacao-importa-var",
  "analise-sod",
  "exportacao-sod",
  "comparacao-perfis",
];

export function isClientActivityKind(value: unknown): value is ActivityKind {
  return CLIENT_ACTIVITY_KINDS.includes(value as ActivityKind);
}

export interface ActivityEntry {
  id: number;
  userId: number;
  userName: string;
  kind: string;
  description: string;
  createdAt: string;
}
