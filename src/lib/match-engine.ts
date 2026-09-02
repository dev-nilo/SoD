import { canonicalKey } from "@/lib/normalize";
import { calculateSimilarity } from "@/lib/similarity";
import type { MatchResult, VarCatalogItem } from "@/types";

const FUZZY_MATCH_THRESHOLD = 0.72;

/**
 * Divergências com confiança igual ou acima disso vêm de correspondências
 * estruturais (formatação ou código hierárquico idêntico) — na prática, o
 * mesmo item do catálogo. Abaixo disso, a confiança vem só de similaridade
 * textual e merece revisão manual antes de aprovar.
 */
export const HIGH_CONFIDENCE_THRESHOLD = 90;

/**
 * Motor de comparação principal: tenta casar uma linha de funcionalidade do RM
 * contra o catálogo do VAR, em ordem decrescente de rigor (exata > normalizada
 * > por código isolado > fuzzy) até encontrar uma correspondência aceitável.
 */
export function matchFunctionality(
  inputFunc: string,
  catalogList: VarCatalogItem[],
  targetModuleId: string | number | null
): MatchResult | null {
  const rawClean = inputFunc.trim();
  if (!rawClean) return null;

  // Filtra por módulo se especificado, ou usa o catálogo completo
  const filteredCatalog = targetModuleId
    ? catalogList.filter((item) => item.moduleId === Number(targetModuleId))
    : catalogList;

  // 1. Verificação exata direta
  const exactMatch = filteredCatalog.find((item) => item.name === rawClean);
  if (exactMatch) {
    return {
      status: "Exato",
      rawInput: rawClean,
      matchedItem: exactMatch,
      confidence: 100,
      reason: "Correspondência idêntica sem divergências.",
    };
  }

  // 2. Verificação com normalização estrutural (códigos e espaços)
  const inputKey = canonicalKey(rawClean);
  const normalizedMatch = filteredCatalog.find((item) => canonicalKey(item.name) === inputKey);
  if (normalizedMatch) {
    return {
      status: "Divergente",
      rawInput: rawClean,
      matchedItem: normalizedMatch,
      confidence: 98,
      reason: "Divergência de formatação (código sem zero à esquerda ou quebra de linha corrigida).",
    };
  }

  // 3. Verificação por código isolado (ex: extrai [01.01.01.03])
  const codeMatchRegex = rawClean.match(/\[([\d.]+)\]/);
  if (codeMatchRegex) {
    const rawCodeNum = codeMatchRegex[1];
    const normalizedCodePattern = `[${rawCodeNum
      .split(".")
      .map((p) => (p.length === 1 ? `0${p}` : p))
      .join(".")}]`;
    const codeMatch = filteredCatalog.find(
      (item) => item.name.startsWith(normalizedCodePattern) || item.name.startsWith(`[${rawCodeNum}]`)
    );
    if (codeMatch) {
      return {
        status: "Divergente",
        rawInput: rawClean,
        matchedItem: codeMatch,
        confidence: 90,
        reason: "Código hierárquico idêntico encontrado com ligeira variação no texto da funcionalidade.",
      };
    }
  }

  // 4. Fuzzy matching nos candidatos do módulo
  let bestCandidate: VarCatalogItem | null = null;
  let highestScore = 0;

  for (const item of filteredCatalog) {
    const score = calculateSimilarity(inputKey, canonicalKey(item.name));
    if (score > highestScore) {
      highestScore = score;
      bestCandidate = item;
    }
  }

  if (bestCandidate && highestScore >= FUZZY_MATCH_THRESHOLD) {
    return {
      status: "Divergente",
      rawInput: rawClean,
      matchedItem: bestCandidate,
      confidence: Math.round(highestScore * 100),
      reason: `Similaridade textual alta (${Math.round(highestScore * 100)}%). Sugerido para revisão.`,
    };
  }

  // 5. Não encontrado
  return {
    status: "Não Encontrado",
    rawInput: rawClean,
    matchedItem: null,
    confidence: 0,
    reason: "Nenhuma funcionalidade compatível foi encontrada no módulo selecionado.",
  };
}
