# Rulebook review — 2026-09-05

Source: `Copy of Worms - Rulebook DIGITAL.pdf`, found in Downloads. 24 PDF pages; printed page numbers match PDF page positions. SHA-256: `8e92b7f42f74d06a97e13e4effe179080b62bd644da3fc8913a6dfdc44b11511`. PDF metadata records creation on 2024-06-17. The PDF itself is not copied into the repository.

Reviewed the complete text and visually checked the symbol tables on pp. 16, 17 and 20, and the team illustrations on pp. 7 and 15. This verifies against this supplied edition, not later errata or other editions.

| Pages | Review and implementation |
| --- | --- |
| 1–5 | Cover, credits and components. No gameplay summary changes needed. |
| 6–7 | Setup, starting hand, decks and first-player selection added. Team illustrations show Blue, Red, Yellow and Green. |
| 8–10 | Turn order, activation, healing, movement and simultaneous effects verified. Jump example explicitly resolves a crate pickup before Scatter. Added that ordering reminder. |
| 11 | Weapon symbols, End turn, Drop resolution and passing the token checked. Sudden Death wording now says to resolve and retain the revealed card, and use its Drop portion subsequently. |
| 12–13 | Example turn and endgame checked. Added the final-round inclusion of the current player and the draw after both tie-break counts match. |
| 14–15 | Introductory setup uses two worms per team, Blue first and Wind 2. Kept distinct from normal setup. |
| 16–17 | Added Accuracy, Blast, Craters, Oil Drums and Wind. Damage summary now includes the instruction to finish Weapon Card text already being resolved, then skip to End turn. Visually verified numerical, Wind and no-move symbols. |
| 18–20 | Water destroys even indestructible Things. Added Fire, Place, Direct targeting and standalone Knockback. Full-hex summary now covers placement as well as movement. |
| 21–22 | Verified crates, mines, Sudden Death and Things; added Air Strike targeting. Direct includes the worm’s own hex. |
| 23 | Added an index of optional rules with an explicit note that the assistant does not automatically apply variants. |
| 24 | Quick-reference cross-check. Used the detailed keyword pages for citations; the quick-reference Blast entry points to p. 20, but the detailed Blast rule is on p. 16. |

## Original 13 summaries

All were compared against their cited sections. Turn sequence, simultaneous effects, card priority, Weapon Action Line, Scatter, Supply Crates and Mines were substantially consistent. Movement, Damage, Water, full hexes, Sudden Death and elimination received the clarifications above.

## Answer reliability

Removed substring-based scenario rulings and the misleading “Explicitly covered / context-dependent” fallback. Only narrowly recognised common questions receive direct answers with specifically selected supporting references. Other questions show related summaries without claiming the full scenario is settled. Retrieval ignores common filler words and prioritises matching titles. Contextual turn help uses explicit rule IDs instead of searching generated prose.

## Team scope

The app defaults to all four illustrated base-game teams and allows two to six named teams in chosen table order. The supplied `additionalplayers.pdf` is a one-page image-only Extra Rules sheet (printed p. 1), read visually in full. SHA-256: `dc9e359d1ad2126d1367300b6c7a90aae7e20374ecb70210ec3d1bd54adbc621`.

It explicitly supports 5–6 players using additional player cards 5 and 6 and matching rings. Normal setup and starting hands remain unchanged. Each additional player supplies four worms, one Oil Drum, one Supply Crate, one Mine and another Map Tile. New Weapon and Superweapon Cards join the existing deck; some weapons have additional Reference Cards and tokens. Added both expansion summaries with **Extra Rules · p. 1** citations so they cannot be mistaken for main-rulebook page 1.

The user confirmed that the additional colours are Purple and Grey; these are the default fifth and sixth team names and have matching display colours. This colour information comes from the user, not the unnamed colours in the Extra Rules sheet. Edition selection exposes 2–4 players for Standard and 2–6 for Collector’s, with the corresponding team defaults and expansion guidance. The saved edition does not alter the common turn sequence: the Extra Rules sheet keeps normal play and setup. No additional weapon effects are inferred from the mention of the Electromagnet.

## Remaining scope

No complete Weapon Card database, full guided interaction resolver, optional-rule automation, worm-count tracking or final-round automation. A damaged-worm shortcut moves to End-turn effects after the player has resolved applicable text. The physical board and cards remain authoritative.
