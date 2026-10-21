import type { VarCatalogItem } from "@/types";

const HEADERS = {
  id: "id funcionalidade",
  name: "funcionalidade",
  moduleId: "id modulo",
  moduleName: "modulo",
} as const;

function headerKey(cell: unknown): string {
  return String(cell ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** The catalog's code is the first bracketed segment of the name, e.g. "[01.02]". */
export function codeFromName(name: string): string {
  return name.match(/\[(.*?)\]/)?.[0] ?? "";
}

function toId(cell: unknown): number | null {
  const n = Number(String(cell ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

export interface ParsedCatalogSheet {
  items: VarCatalogItem[];
  /** One pt-BR message per rejected row, by 1-based sheet line. */
  errors: string[];
}

/**
 * Reads a "Base VAR" spreadsheet (columns ID Funcionalidade | Funcionalidade
 * | ID Módulo | Módulo, header row anywhere, any column order) into catalog
 * items. Bad rows are reported rather than failing the whole upload.
 */
export function parseCatalogSheet(rows: unknown[][]): ParsedCatalogSheet {
  const headerIndex = rows.findIndex((row) => {
    const keys = row.map(headerKey);
    return Object.values(HEADERS).every((h) => keys.includes(h));
  });
  if (headerIndex === -1) {
    throw new Error(
      "Não foi possível encontrar o cabeçalho (ID Funcionalidade / Funcionalidade / ID Módulo / Módulo) na planilha."
    );
  }

  const keys = rows[headerIndex].map(headerKey);
  const col = {
    id: keys.indexOf(HEADERS.id),
    name: keys.indexOf(HEADERS.name),
    moduleId: keys.indexOf(HEADERS.moduleId),
    moduleName: keys.indexOf(HEADERS.moduleName),
  };

  const items: VarCatalogItem[] = [];
  const errors: string[] = [];
  const seen = new Set<number>();

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 1;
    if (row.every((cell) => String(cell ?? "").trim() === "")) continue;

    const id = toId(row[col.id]);
    const name = String(row[col.name] ?? "").trim();
    const moduleId = toId(row[col.moduleId]);
    const moduleName = String(row[col.moduleName] ?? "").trim();

    if (id === null) {
      errors.push(`Linha ${line}: ID da funcionalidade inválido.`);
      continue;
    }
    if (!name) {
      errors.push(`Linha ${line}: nome da funcionalidade vazio.`);
      continue;
    }
    if (moduleId === null || !moduleName) {
      errors.push(`Linha ${line}: módulo inválido.`);
      continue;
    }
    if (seen.has(id)) {
      errors.push(`Linha ${line}: ID ${id} repetido — mantida a primeira ocorrência.`);
      continue;
    }
    seen.add(id);
    items.push({ id, code: codeFromName(name), name, moduleId, moduleName });
  }

  return { items, errors };
}

export interface CatalogDiff {
  added: VarCatalogItem[];
  updated: VarCatalogItem[];
  unchanged: number;
  /** In the catalog but not in the upload — reported, never deleted (SoD curation may reference them). */
  missing: VarCatalogItem[];
}

export function diffCatalog(existing: VarCatalogItem[], incoming: VarCatalogItem[]): CatalogDiff {
  const byId = new Map(existing.map((i) => [i.id, i]));
  const incomingIds = new Set(incoming.map((i) => i.id));
  const added: VarCatalogItem[] = [];
  const updated: VarCatalogItem[] = [];
  let unchanged = 0;

  for (const item of incoming) {
    const current = byId.get(item.id);
    if (!current) added.push(item);
    else if (current.name !== item.name || current.code !== item.code || current.moduleId !== item.moduleId) {
      updated.push(item);
    } else unchanged++;
  }

  return { added, updated, unchanged, missing: existing.filter((i) => !incomingIds.has(i.id)) };
}
