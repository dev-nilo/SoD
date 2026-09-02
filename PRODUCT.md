# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal team members (consultants/analysts) at the company who perform TOTVS RM ↔ VAR reconciliation during ERP data migration/implementation projects. More than one person operates the tool — not a single-user script.

## Product Purpose

Automates the "De-Para" (field/functionality mapping) and reconciliation of permission profiles between TOTVS RM and the VAR catalog, replacing manual spreadsheet cross-referencing during ERP migrations. Success is a comparison run with zero divergent and zero not-found rows, followed by a correct "Importa VAR" CSV export.

## Positioning

An automatic matching engine (exact match, code-normalized match, fuzzy/Levenshtein match) combined with manual override for the remaining edge cases — purpose-built for TOTVS RM/VAR reconciliation, not a generic diff or spreadsheet tool.

## Operating Context

Workflow follows a fixed sequence (see `flow-stepper.tsx`): Entrada (paste or upload RM export text) → Configuração (profile ID/code, TOTVS module) → Comparação (review automatic matches, resolve divergent/not-found rows manually via a catalog picker) → Exportar (download CSV for import into VAR). A separate "Dicionário do VAR" catalog (persisted to Postgres/Neon) is maintained as the reference dataset that matching runs against.

## Capabilities and Constraints

- UI language and domain terminology are Portuguese (pt-BR) and must be preserved as-is: "De-Para", "Importa VAR", "TOTVS RM", "VAR", "Perfil", "Módulo", "Divergência", "Não encontrado".
- The CSV export format is a downstream integration point (feeds VAR's own import) and must remain functionally unchanged by any visual redesign.
- Matching engine (exact / normalized / fuzzy-Levenshtein) and the manual-override flow are core mechanisms to preserve, not just visuals.

## Brand Commitments

No company logo, name, or external brand identity needs to appear in the interface. Standing visual preference (confirmed 2026-09-02, redesign request): plain neutral shadcn/ui aesthetic — zinc/slate base color, no strong accent/brand color, comfortable "Notion-like internal tool" density (not compact admin-dashboard density), light/dark theme following OS preference (`prefers-color-scheme`) with a manual toggle override.

## Evidence on Hand

None beyond the running application itself (no testimonials, case studies, or external proof content — this is an internal operational tool, not a marketing surface).

## Product Principles

1. Operate, not persuade — this is a task-completion tool for several internal users; scanability and correctness of the reconciliation data outrank visual expression.
2. Terminology fidelity — Portuguese domain terms are load-bearing product vocabulary, not copy to be polished or translated.
3. Zero-divergence is the success signal — the interface must make a "clean" comparison run (no divergent/not-found rows) unmistakable before export is allowed to feel complete.
4. Precision over throughput — output feeds a downstream import, so reviewability of individual matches matters more than raw speed.
5. Multi-user internal tool — several colleagues operate this, so the design shouldn't assume a lone power-user's tacit knowledge.
