import type { VarCatalogItem } from "@/types";

/**
 * Base de conhecimento padrão do VAR, extraída e estruturada a partir da planilha.
 */
export const INITIAL_VAR_CATALOG: VarCatalogItem[] = [
  { id: 7532, code: "[01]", name: "[01] Cadastros", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9021, code: "[01.01]", name: "[01.01] Específicos", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 7534, code: "[01.01.01]", name: "[01.01.01] Clientes \n Fornecedores", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9310, code: "[01.01.01.03]", name: "[01.01.01.03] Editar Cliente/Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9313, code: "[01.01.01.06]", name: "[01.01.01.06] Acessar Cliente", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9314, code: "[01.01.01.07]", name: "[01.01.01.07] Acessar Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9316, code: "[01.01.01.09]", name: "[01.01.01.09] Incluir Filtro de Cliente/Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9317, code: "[01.01.01.10]", name: "[01.01.01.10] Editar Filtro de Cliente/Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9318, code: "[01.01.01.11]", name: "[01.01.01.11] Excluir Filtro de Cliente/Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9320, code: "[01.01.01.13]", name: "[01.01.01.13] Gerar Cli/For a partir de Pessoa", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9321, code: "[01.01.01.14]", name: "[01.01.01.14] Vínculo entre Cli/For e Pessoa", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9322, code: "[01.01.01.15]", name: "[01.01.01.15] Importação de Cliente/Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9323, code: "[01.01.01.16]", name: "[01.01.01.16] Movimento", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9025, code: "[01.01.05]", name: "[01.01.05] Tipos Documento", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9026, code: "[01.01.06]", name: "[01.01.06] Tipos Cliente/Fornecedor", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9027, code: "[01.01.07]", name: "[01.01.07] Tabelas Opcionais", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9325, code: "[01.01.07.01]", name: "[01.01.07.01] Classificação Financeira", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9328, code: "[01.01.07.01.04]", name: "[01.01.07.01.04] Defaults Contábeis", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9327, code: "[01.01.07.03]", name: "[01.01.07.03] Considerar NFE", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9033, code: "[01.01.13]", name: "[01.01.13] Campos Complementares", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 7688, code: "[02]", name: "[02] Contas a Pagar / Receber", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 7859, code: "[03]", name: "[03] Movimentações Bancárias", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 8026, code: "[04]", name: "[04] Caixa", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 8042, code: "[05]", name: "[05] Gestão Financeira", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9194, code: "[05.03.02]", name: "[05.03.02] Mais", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 8063, code: "[06]", name: "[06] Controle Gerencial", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 8104, code: "[07]", name: "[07] Utilitários", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9750, code: "[07.04.04.04.03]", name: "[07.04.04.04.03] Visualizar Boleto", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 8140, code: "[09]", name: "[09] Customização", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9240, code: "[09.01]", name: "[09.01] Customização", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9245, code: "[09.02]", name: "[09.02] Pagamento web", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9246, code: "[09.02.02]", name: "[09.02.02] Gerar Link de Pagamento", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9815, code: "[10]", name: "[10] Gestão", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9816, code: "[10.01]", name: "[10.01] Utilitários", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9817, code: "[10.01.01]", name: "[10.01.01] Calculadora", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9818, code: "[10.01.02]", name: "[10.01.02] Agenda", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9819, code: "[10.02.01.04]", name: "[10.02.01.04] Visualizar Cubo", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9820, code: "[10.02.01.05]", name: "[10.02.01.05] Atualizar Cubo", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9821, code: "[10.02.01.06]", name: "[10.02.01.06] Exportar Cubo para visualizador de Cubos (CUBX)", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9822, code: "[10.02.01.07]", name: "[10.02.01.07] Exportar Cubo para documento (XLS, PDF, RTF, etc)", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9823, code: "[10.02.01.08]", name: "[10.02.01.08] Imprimir Cubo", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9824, code: "[10.02.01.09]", name: "[10.02.01.09] Salvar Gráfico", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9270, code: "[10.02.03]", name: "[10.02.03] Planilha Net", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9832, code: "[10.02.03.05]", name: "[10.02.03.05] Habilitar botão Salvar", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9833, code: "[10.02.03.06]", name: "[10.02.03.06] Habilitar botão Salvar como Excel na Planilha RM", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },
  { id: 9834, code: "[10.02.03.07]", name: "[10.02.03.07] Converter planilha Excel para planilha RM", moduleId: 2, moduleName: "TOTVS Gestão Financeira" },

  // Módulo Educacional (ID 7)
  { id: 1, code: "[01]", name: "[01] Currículo e Oferta", moduleId: 7, moduleName: "TOTVS Educacional" },
  { id: 2, code: "[01.01]", name: "[01.01] Aluno e Professor", moduleId: 7, moduleName: "TOTVS Educacional" },
  { id: 3, code: "[01.01.01]", name: "[01.01.01] Alunos", moduleId: 7, moduleName: "TOTVS Educacional" },
  { id: 4, code: "[01.01.01.01]", name: "[01.01.01.01] Painel de responsáveis", moduleId: 7, moduleName: "TOTVS Educacional" },
  { id: 9, code: "[01.01.01.06]", name: "[01.01.01.06] Incluir Aluno", moduleId: 7, moduleName: "TOTVS Educacional" },
  { id: 10, code: "[01.01.01.07]", name: "[01.01.07.02] Excluir Aluno", moduleId: 7, moduleName: "TOTVS Educacional" },
  { id: 11, code: "[01.01.01.08]", name: "[01.01.01.08] Editar Aluno", moduleId: 7, moduleName: "TOTVS Educacional" },

  // Módulo Fiscal (ID 4)
  { id: 11263, code: "[02.03.01.04.01]", name: "[02.03.01.04.01] Incluir", moduleId: 4, moduleName: "TOTVS Gestão Fiscal" },
  { id: 11264, code: "[02.03.01.04]", name: "[02.03.01.04] Destinatários das Deduções ECF", moduleId: 4, moduleName: "TOTVS Gestão Fiscal" },
  { id: 11265, code: "[02.03.01.04.03]", name: "[02.03.01.04.03] Excluir", moduleId: 4, moduleName: "TOTVS Gestão Fiscal" },
  { id: 11266, code: "[02.03.01.04.02]", name: "[02.03.01.04.02] Editar", moduleId: 4, moduleName: "TOTVS Gestão Fiscal" },

  // Módulo Estoque / Compras (ID 6)
  { id: 11267, code: "[10.01.17.04]", name: "[10.01.17.04] Definir Leiaute", moduleId: 6, moduleName: "TOTVS Gestão de Estoque, Compras e Faturamento" },
  { id: 11268, code: "[10.01.17.07]", name: "[10.01.17.07] Editar Controle Due Diligence", moduleId: 6, moduleName: "TOTVS Gestão de Estoque, Compras e Faturamento" },
  { id: 11269, code: "[10.01.17.01]", name: "[10.01.17.01] Incluir Rastreabilidade SN", moduleId: 6, moduleName: "TOTVS Gestão de Estoque, Compras e Faturamento" },
];

export const AVAILABLE_MODULES = [
  { id: "2", name: "TOTVS Gestão Financeira" },
  { id: "7", name: "TOTVS Educacional" },
  { id: "4", name: "TOTVS Gestão Fiscal" },
  { id: "6", name: "TOTVS Gestão de Estoque, Compras e Faturamento" },
  { id: "0", name: "Todos os Módulos (Sem Filtro)" },
];
