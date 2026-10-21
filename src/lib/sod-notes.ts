import type { TriggeredRisk } from "@/types";

/** Whether the ticket maintains an existing profile or creates a new one. */
export type SodScenario = "manutencao" | "criacao";

export const SCENARIO_LABEL: Record<SodScenario, string> = {
  manutencao: "Manutenção",
  criacao: "Criação",
};

export interface FunctionalityRisks {
  functionality: string;
  riskIds: string[];
}

/** Each functionality involved in a triggered risk, once, with the distinct risk ids it takes part in. */
export function groupRisksByFunctionality(triggered: TriggeredRisk[]): FunctionalityRisks[] {
  const byFunctionality = new Map<string, Set<string>>();
  for (const t of triggered) {
    for (const m of t.matches) {
      const ids = byFunctionality.get(m.functionality.name) ?? new Set<string>();
      ids.add(t.risk.id);
      byFunctionality.set(m.functionality.name, ids);
    }
  }
  return [...byFunctionality].map(([functionality, ids]) => ({ functionality, riskIds: [...ids] }));
}

export interface SodNoteInput {
  /** Already formatted, e.g. "21/10/2026". */
  date: string;
  perfil: string;
  modulo: string;
  cenario: SodScenario;
  ticket: string;
  triggeredRisks: TriggeredRisk[];
}

// The note texts below are the original Barril Dobrado's, word for word —
// analysts paste them into tickets and approval e-mails.

export function buildChamadoNote({ date, perfil, modulo, cenario, triggeredRisks }: SodNoteInput): string {
  const grouped = groupRisksByFunctionality(triggeredRisks);
  const lines = grouped.map((g) => `  • ${g.functionality} (${g.riskIds.join(", ")})`).join("\n");

  return `Análise SoD concluída — ${date}
Perfil: ${perfil} | Módulo: ${modulo || "________"} | Cenário: ${SCENARIO_LABEL[cenario]}

Foram identificados riscos de Segregação de Funções (SoD). O chamado não pode ser aprovado enquanto os conflitos abaixo não forem tratados.

Funcionalidades com risco (${grouped.length}):
${lines}

Pendência: revisar as permissões do perfil ou encaminhar para aprovação formal de risco residual.`;
}

export function buildEmailNote({ perfil, modulo, cenario, ticket, triggeredRisks }: SodNoteInput): string {
  const lines = groupRisksByFunctionality(triggeredRisks)
    .map((g) => `  • ${g.functionality}`)
    .join("\n");
  const ticketLabel = ticket.trim() ? `#${ticket.trim()}` : "#______";

  return `Assunto: Análise e Aprovação: Análise SOD em ANEXO

Olá, como vai?

Peço a gentileza de analisar e aprovar a análise SOD em anexo.
Sua aprovação nesta solicitação é importante, pois faz parte do nosso processo de Gestão de Acesso.

Para facilitar o processo da aprovação basta somente responder este e-mail com "De Acordo".

Para a liberação das funcionalidades do perfil ${perfil} no Módulo ${modulo || "________"}, será necessário verificar os riscos apresentados na análise SOD para os quais não foram encontrados controles compensatórios.

Funcionalidades com risco identificado:
${lines}

O Excel em anexo contém a análise SOD com os riscos encontrados.
A ${SCENARIO_LABEL[cenario]} do Perfil foi solicitada a partir do ticket ${ticketLabel}.

Att.`;
}

export const NO_CONFLICT_NOTE = "Nenhum conflito de SoD foi identificado para as funcionalidades analisadas.";
