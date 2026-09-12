---
name: gsap-autoalpha-tab-order
description: GSAP autoAlpha on links/buttons removes them from keyboard tab order until the entrance plays; use opacity for interactive elements
metadata:
  type: feedback
---

Never entrance-animate a link or button with `autoAlpha` in this site. `autoAlpha: 0` sets `visibility: hidden`, which removes the element from the tab order, so a keyboard user tabbing through the sideways track skips the CTA entirely (main.js's focusin-scrolls-into-view handler never fires because focus never lands).

**Why:** found on the Cox chapter's "ask for a walkthrough" button; a programmatic `.focus()` left `document.activeElement` on BODY.
**How to apply:** use `opacity` for interactive elements, and on the section add `focusin` → `timeline.progress(1)`. autoAlpha is fine for decorative doodles and images.

Related: [[cox-chapter]]
