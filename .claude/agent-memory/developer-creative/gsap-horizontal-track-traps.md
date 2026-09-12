---
name: gsap-horizontal-track-traps
description: Non-obvious GSAP/scroll traps hit while building the traveling cup in the coffee portfolio's sideways (containerAnimation) track
metadata:
  type: feedback
---

Three traps that cost real debugging time on the sideways-story portfolio (Vite + GSAP + Lenis, one horizontal tween on #track):

1. `gsap.quickSetter(el, 'scale')` silently does nothing. Use separate `scaleX` and `scaleY` setters.
   **Why:** the traveling cup rendered at its 440px base size everywhere, which another agent reported as the cup "covering their sections".
   **How to apply:** any quickSetter on scale; confirm by reading `el.style.transform` in a probe.

2. Focus (Tab, or a click on a partly hidden element) scrolls `overflow:hidden` ancestors such as #story and the .panel elements. The panels then slide out of sync with the track's x.
   **Why:** after tabbing to a card, the big cup sat over the Tally section while the track still said "brew".
   **How to apply:** in a transformed-track layout, listen for `scroll` on the story and panels and reset `scrollLeft` to 0. This belongs in main.js, so flag it to its owner.

3. The main.js `?x=` / `?go=` params call `lenis.scrollTo(..., {immediate:true})` right after fonts are ready, before Lenis has measured its limit, so they don't scroll. Screenshot harnesses should call `window.__ctx.goTo(...)` about 1s after load instead. Puppeteer `clip` and `fullPage` screenshots resize the viewport and reflow pinned `vh` layouts: expect blank or repeated sections. Use plain viewport shots.

Related: [[scrolltrigger-pin-offsettop]]. Several agents share the scratchpad, so keep harness files in your own subfolder, because another agent overwrote a shared shoot.mjs mid-run.
