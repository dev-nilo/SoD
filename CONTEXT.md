# Barril Valida

Validates a TOTVS RM access profile against the VAR functionality catalog, matching each RM functionality line to a VAR entry and letting the user approve or correct the match before exporting an Importa VAR load sheet.

## Language

**RM Functionality**:
One line of raw text pasted or uploaded from the TOTVS RM system, naming a functionality that belongs to a profile.
_Avoid_: input line, raw input.

**VAR Catalog**:
The reference list of TOTVS functionalities (with id, code, and module) that RM functionalities are matched against.
_Avoid_: dictionary, database.

**Comparison Row**:
One RM Functionality paired with its best match (if any) from the VAR Catalog, plus a Status and an Override.
_Avoid_: result, item, entry.

**Comparison Session**:
The current run's full set of Comparison Rows for one Profile, plus the actions that turn one row's Status into `Exato` (see Override). Built fresh from RM input text and the VAR Catalog; independent of how the VAR Catalog itself is loaded.
_Avoid_: validator state, results.

**Status**:
A Comparison Row's current truth: `Exato` (matched, correct), `Divergente` (matched, but the RM text differs from the catalog entry), or `Não Encontrado` (no acceptable match). Always reflects the row as it stands right now — never shadowed by a separate "what the user did" value.
_Avoid_: state, match status.

**Override**:
Provenance recording how a row reached `Exato` through user action, not a second source of truth to resolve against Status: `aprovado` (the suggested Divergente match was approved as-is) or `manual` (the user searched the VAR Catalog and linked a different entry by hand). A row with no Override reached its Status from matching alone.
_Avoid_: acceptedOverride, approval.

**High-Confidence Divergence**:
A Divergente row whose match confidence clears the threshold for structural certainty (formatting or hierarchical-code differences only, not textual guesswork) — eligible for batch approval in one action rather than row-by-row review.
_Avoid_: auto-accept, high score.

**Profile**:
The RM access profile being validated, identified by a Profile ID and a Profile Code (its RM name), against a single TOTVS Module.
_Avoid_: role, permission set.

**Importa VAR**:
The load-sheet output (id, perfil, funcionalidade id, funcionalidade) built from a profile's matched Comparison Rows, ready to import into VAR.
_Avoid_: export, analysis sheet.
