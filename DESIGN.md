---
name: Validador de Perfil & Gerador de Importa VAR
description: Neutral shadcn/ui interface for TOTVS RM ↔ VAR profile reconciliation
colors:
  primary: "#18181b"
  primary-foreground: "#fafafa"
  neutral-bg: "#ffffff"
  neutral-fg: "#09090b"
  neutral-card: "#ffffff"
  neutral-secondary: "#f4f4f5"
  neutral-muted-fg: "#71717a"
  neutral-border: "#e4e4e7"
  status-success: "#218355"
  status-warning: "#ce8509"
  status-destructive: "#dc2828"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "0.4375rem"
  md: "0.5rem"
  lg: "0.625rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.875rem"
  button-secondary:
    backgroundColor: "{colors.neutral-secondary}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.875rem"
  badge-status:
    rounded: "9999px"
    padding: "0.125rem 0.5rem"
---

# Design System: Validador de Perfil & Gerador de Importa VAR

## Overview

**Creative North Star: "The Quiet Workbench"**

This is an internal reconciliation tool, not a product with a brand to project. The redesign (2026-09-02) deliberately walked away from the app's previous identity — a saturated green accent (`152 76% 40%`) carried on every button, icon, and focus ring, permanently locked to dark mode — in favor of shadcn/ui's own neutral zinc system, rendered plainly and left to do its job. The visual language is intentionally unremarkable: several colleagues open this to reconcile TOTVS RM profiles against the VAR catalog, and the interface should recede behind that task.

Comfortable, not compact. The brief explicitly rejected dense admin-dashboard chrome (Linear/Vercel-style) in favor of a roomier, "Notion-like internal tool" feel: generous card padding, readable type sizes for chrome and labels, and only the data tables themselves staying compact where density earns its keep (scanning many reconciliation rows).

Color is spent almost nowhere except to report status. There is no brand accent: `primary` is just the neutral foreground (near-black on light, near-white on dark) used for the default button and the active flow-step indicator. The only saturated color left in the system is semantic — success/warning/destructive — and it is reserved strictly for reporting match state (exact / divergent / not-found), never for decoration or emphasis.

**Key Characteristics:**
- Zinc-neutral palette, no brand accent color
- Semantic color (green/amber/red) reserved exclusively for match-status reporting
- Light/dark follows OS preference (`prefers-color-scheme`) via `next-themes`, with a manual toggle in the header
- Comfortable chrome density; compact only inside data tables
- Flat surfaces — solid `bg-card`/`bg-muted`, no glassmorphism or gradient wash

## Colors

Restrained strategy: neutrals carry the entire interface; color exists only as a status signal, never as identity.

### Primary
- **Ink** (`#18181b` light / `#fafafa` dark): the only "accent" in the system, and it isn't one — it's the neutral foreground promoted to a filled surface. Used for the default button and the active step in the flow stepper. Never used decoratively.

### Neutral
- **Paper** (`#ffffff` light / `#09090b` dark): page background.
- **Card** (`#ffffff` light / `#18181b` dark): card and popover surfaces. In dark mode this sits one step lighter than the page background for elevation; in light mode elevation comes from the border + shadow instead.
- **Panel** (`#f4f4f5` light / `#27272a` dark): secondary buttons, toolbar strips (`bg-muted/40`), badges, chip backgrounds.
- **Ink Muted** (`#71717a` light / `#a1a1aa` dark): secondary text, placeholders, helper copy.
- **Hairline** (`#e4e4e7` light / `#27272a` dark): all borders, dividers, input outlines.

### Status (semantic only — never decorative)
- **Match Success** (`#218355` light / `#34b277` dark): exact matches, confirmed exports, accepted rows.
- **Match Pending** (`#ce8509` light / `#f59f0a` dark): fuzzy/divergent matches awaiting review.
- **Match Missing** (`#dc2828` light / `#811d1d` dark): not-found rows, destructive actions.

### Named Rules
**The Status-Only Rule.** Success/warning/destructive hues report reconciliation state (matched / divergent / not-found) or a destructive action. They never label a plain data value (an ID, a module name) purely for visual interest — if a color doesn't mean something, it's neutral.

## Typography

**Body/UI Font:** system-ui stack (no custom web font — an internal tool has no typographic identity to assert)
**Data/Mono Font:** ui-monospace stack, for VAR/RM identifiers, codes, and raw pasted rows

**Character:** Plain and functional. Type carries almost no personality; hierarchy comes from weight and size steps, not from a display face.

### Hierarchy
- **Title** (semibold, `text-sm`/14px): page title, dialog/sheet titles, card titles.
- **Body** (regular, `text-sm`/14px): form labels, buttons, primary UI copy.
- **Label** (semibold, `text-xs`/12px, uppercase for table headers only): filters, stat captions, table headers.
- **Data** (mono, `text-[12px]`–`text-xs`): table cell content that is an identifier, code, or raw input line — never prose.

## Layout

Single centered container, `max-w-7xl`, `p-6`, comfortable `space-y-6` between major regions (header → stats → stepper → tab content). A four-step flow stepper (Entrada → Configuração → Comparação → Exportar) replaces conventional tabs as the primary navigation, with a hairline connecting the step dots.

Chrome density is comfortable: cards pad at `p-4`, toolbar strips at `p-3.5`, grid gaps at `gap-4`. Data tables are the deliberate exception — rows stay compact (`text-xs`, mono for data columns) because the task is scanning dozens of reconciliation rows, not reading prose; density there earns its keep. Responsive behavior collapses toolbars and the settings grid to a single column below `sm`/`md`.

## Elevation & Depth

Flat by default. Surfaces are told apart by `bg-card` vs `bg-muted/40` vs `bg-background`, plus a single hairline border — not by shadow stacking. The one shadow in the system is `shadow-sm` on cards and buttons, a near-invisible lift, not a design statement. The sticky header and table header use `backdrop-blur-sm`/`backdrop-blur` functionally, to signal that content is scrolling beneath them — never as decorative glass elsewhere.

### Named Rules
**The Flat-By-Default Rule.** No card sits inside another card, and no surface gets more than one shadow step (`shadow-sm`). Depth communicates scroll (sticky blur) or nothing at all.

## Shapes

`--radius: 0.625rem` (10px) as the base; buttons and inputs derive `calc(var(--radius) - 2px)` / `- 4px` from it. Corners are soft but not pill-shaped except for true pills: status badges and the flow-stepper's step dots, which are fully rounded (`rounded-full`) to read as discrete tokens against the otherwise rectangular UI.

## Components

### Buttons
- **Shape:** `rounded-lg` (10px)
- **Primary (`default`):** `bg-primary` (Ink) / `text-primary-foreground`, `shadow-sm`, semibold label — the only filled, high-contrast button in the system, reserved for the single main action in a given toolbar (export, process & analyze).
- **Secondary:** `bg-secondary` (Panel) with a hairline border — the default for every non-primary action (load sample, open catalog, re-run).
- **Status buttons (`success`/`warning`/`destructive`):** tinted 10% fill of the status color with a matching border — used only for actions that accept/reject a match or clear data, never as a styling choice.
- **Ghost:** transparent, used for icon-only chrome like the theme toggle.

### Badges
- **Style:** `rounded-full`, 11px text, 10% tint fill with matching border for status variants; solid Panel fill for the plain `default` variant (counts like "N funcionalidades mapeadas").
- **State:** status badges (success/warning/destructive) always pair with a matching lucide icon (CheckCircle2 / AlertTriangle / XCircle) — the icon carries meaning for colorblind users, the color reinforces it.

### Cards / Containers
- **Corner Style:** `rounded-xl` (12px)
- **Background:** solid `bg-card` (Card token) — never translucent.
- **Shadow Strategy:** `shadow-sm` only.
- **Border:** 1px Hairline border always present.
- **Internal Padding:** `p-4` for header/content blocks.
- **Toolbar strip variant:** the same shape language but `bg-muted/40` instead of `bg-card`, used for filter bars and settings groupings that sit above a table/card rather than being one — distinguishes "chrome" from "content."

### Inputs / Fields
- **Style:** 1px Hairline border, `bg-background`, `rounded-lg`, `h-9` default.
- **Focus:** single-pixel `ring-ring` plus border color shift to `ring` — no glow, no scale change.
- **Disabled:** 50% opacity, pointer-events removed.

### Tables
- **Header:** uppercase, semibold, muted-foreground text on `bg-secondary/60`, sticky with `backdrop-blur` while scrolling.
- **Rows:** divided by hairline (`divide-y`), hover state tints `bg-accent/40`.
- **Data cells:** mono font for identifiers/codes; sans for names/prose within the same table.

### Theme Toggle
Icon-only ghost button in the header (Sun/Moon from lucide), switching `next-themes` between `light`/`dark`/`system`. Defaults to `system` — the app reads OS preference on first load, then remembers an explicit override per browser.

## Do's and Don'ts

### Do:
- **Do** use the Ink primary color for exactly one filled button per toolbar — the single most important action.
- **Do** keep success/warning/destructive strictly tied to reconciliation status or a destructive action.
- **Do** default new surfaces to `bg-card` (solid) for content and `bg-muted/40` for chrome/toolbar strips.
- **Do** default to `system` theme and respect the OS preference before any manual override.

### Don't:
- **Don't** introduce a saturated brand/accent color. The system was deliberately de-branded from a green identity; reintroducing an accent for "visual interest" reverses that decision.
- **Don't** use translucent card backgrounds (`bg-card/40`, `bg-card/20`) — cards are solid; only toolbar strips use `bg-muted/40`.
- **Don't** color a plain data value (an ID, a module name, a count) with success/warning/destructive just to make it stand out — that's what bold/mono weight is for.
- **Don't** nest a `Card` inside another `Card`.
