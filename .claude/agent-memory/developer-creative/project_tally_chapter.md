---
name: tally-chapter
description: Tally chapter of the coffee sideways portfolio (src/sections/tally.js/.css) — structure, local copy/screen overrides not yet in data.js, and parallel-agent quirks
metadata:
  type: project
---

Tally chapter built 2026-09-13 by the creative-dev agent, in parallel with intro/cup, cox, pawnet agents.
Structure: title (70vw, 100vw on phones) → 3 photo problem scenes → "turn" (170vw, ctx.hold, doodle marker scribbles paper to obsidian) → 4 fix panels on obsidian with measured hand-drawn arrows → end card (60vw / 100vw).

**Why it matters:** several decisions live only in tally.js because the agent could not edit data.js:
- LOCAL copy: marker "the problem", turn lines, end title, "next: cox & kings".
- Screen overrides: names fix uses cs-amt + cs-collect (the scam-call screen; data.js lists cs-fraud); smart pay uses cs-pay300/12k/25k (data.js lists only 12k/25k). Needed so each pointer has something real to point at.
- Do NOT toggle `#chrome.is-dark`: the coordinator gave logo/resume their own milk pills in base.css (2026-09-13).
- Coordinator wants chapter widths comparable (Cox 948vw, PawNet 846vw); tally tightened to 954vw. Chapter images are switched to eager ~3.5 screens ahead, because native lazy inside the translated track loads too late.

**How to apply:** if data.js copy/screens change, update SOLS anchors (ax/ay % of the 392x832 PNG) in tally.js. Doodle positions in SCENES are % of the photo frame and match public/img/scenes/MANIFEST.md.
Quirks seen: the cup agent's parked cup was larger than --cup-zone during early builds; cox.js emits "GSAP target not found" from ctx.draw (not tally). Related: [[scrolltrigger-pin-offsettop]].
