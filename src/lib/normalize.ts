/**
 * Normaliza códigos hierárquicos como [1] -> [01], [01.1] -> [01.01], [5.3.2] -> [05.03.02]
 * e remove caracteres especiais como _x0085_, quebras de linha duplicadas e espaços em excesso.
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/_x0085_/g, "") // remove caracteres de controle do Excel
    .replace(/[\r\n\t]+/g, " ") // substitui quebras de linha por espaço
    .replace(/\s+/g, " ") // colapsa múltiplos espaços
    .trim();
}

export function normalizeCodeHierarchy(str: string | null | undefined): string {
  if (!str) return "";
  // Procura padrão [1.2.3...] e formata cada segmento com 2 dígitos
  return str.replace(/\[([\d.]+)\]/g, (_match, numbers: string) => {
    const parts = numbers.split(".").map((part) => {
      const num = parseInt(part, 10);
      return isNaN(num) ? part : num < 10 && part.length === 1 ? `0${num}` : part;
    });
    return `[${parts.join(".")}]`;
  });
}

export function canonicalKey(str: string | null | undefined): string {
  const clean = normalizeString(str);
  const normalizedCode = normalizeCodeHierarchy(clean);
  // remove pontuação externa e transforma em lowercase para matching
  return normalizedCode
    .toLowerCase()
    .replace(/[/\-_]/g, " ")
    .replace(/\s+/g, " ");
}
