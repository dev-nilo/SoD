# SoD — Validador de Perfil & Gerador de Importa VAR

> **In English:** A Next.js app that reconciles permission profiles between the TOTVS RM ERP and the VAR catalog. It matches functionalities automatically (exact, code-normalized and fuzzy/Levenshtein), lets analysts fix the remaining links by hand, and exports a CSV for import into VAR. Built with Next.js, TypeScript, shadcn/ui, Drizzle ORM, PostgreSQL (Neon) and Vitest. **Live:** [sod-theta.vercel.app](https://sod-theta.vercel.app)

Aplicação Next.js (App Router) + shadcn/ui para conciliação de funcionalidades entre o TOTVS RM e o catálogo do VAR, com matching automático (exato, normalizado por código e fuzzy/Levenshtein), edição manual de vínculos e exportação para CSV.

## Stack

- [Next.js](https://nextjs.org/) (App Router, React 19)
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
- TypeScript

## Estrutura de pastas

```
src/
  app/                    # rotas do App Router (layout, page, globals.css)
  components/
    ui/                   # primitivos shadcn/ui (button, input, table, dialog, ...)
    validator/             # componentes de domínio (header, tabs, tabelas, modal)
  data/                   # catálogo do VAR e texto de exemplo do RM
  hooks/                  # use-profile-validator: estado e orquestração da tela
  lib/                    # normalização, similaridade, motor de matching, export CSV
  types/                  # tipos compartilhados (VarCatalogItem, ComparisonRow, ...)
```

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
