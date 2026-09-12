/* ------------------------------------------------------------------
   shared helpers. every section module gets these through `ctx`.

   THE SCROLL MODEL (read before animating anything):
   - #story is pinned; #track (a flex row of .panel sections) is tweened
     on x by ONE tween, ctx.hTween, scrubbed by vertical scroll.
   - vertical scroll distance == horizontal distance, 1:1.
   - anything that reacts to scroll inside the track MUST use
     containerAnimation: ctx.hTween  →  use ctx.st() / ctx.tl(), which add it.
   - start/end use horizontal words: 'left right' = element's left edge
     meets the viewport's right edge (just entering). 'left left' = it has
     reached the left edge. 'center center' etc.
   - you cannot `pin` inside a containerAnimation. To hold something on
     screen while its (wider-than-viewport) section passes, use ctx.hold().
   - when ctx.reduced is true there is no hTween: panels stack vertically,
     ctx.st/ctx.tl return null, and you must render the final state.
   ------------------------------------------------------------------ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* copy helper: *word* → <b class="caps">WORD</b> (the emphasis rule: lowercase
   everywhere, emphasis in ALL CAPS). Escapes everything else. */
export const em = (s) => esc(s).replace(/\*(.+?)\*/g, (_, w) => `<b class="caps">${w.toUpperCase()}</b>`);

export function makeCtx({ hTween, reduced, lenis }) {
  const ca = hTween || null;
  const ctx = {
    gsap, ScrollTrigger, hTween: ca, reduced, lenis,

    /* ScrollTrigger inside the sideways track */
    st(vars) {
      if (!ca) return null;
      return ScrollTrigger.create({ containerAnimation: ca, ...vars });
    },

    /* scrubbed or toggled timeline inside the sideways track.
       ctx.tl(triggerEl, { start:'left 80%', end:'right left', scrub:true }) */
    tl(trigger, stVars = {}, tlVars = {}) {
      if (!ca) return null;
      return gsap.timeline({ ...tlVars, scrollTrigger: { containerAnimation: ca, trigger, ...stVars } });
    },

    /* keep `inner` visually still while `section` scrolls past.
       section must be wider than the viewport. returns the tween. */
    hold(section, inner, { from = 'left left', to = 'right right' } = {}) {
      if (!ca) return null;
      return gsap.fromTo(inner, { x: 0 }, {
        x: () => section.offsetWidth - window.innerWidth,
        ease: 'none',
        scrollTrigger: { containerAnimation: ca, trigger: section, start: from, end: to, scrub: true, invalidateOnRefresh: true },
      });
    },

    /* hand-drawn stroke draw-in. el = svg or any ancestor of paths with class .dd-draw
       (or pass selector). returns a timeline you can nest. */
    draw(el, { duration = 1.1, stagger = 0.12, ease = 'power2.inOut' } = {}) {
      const paths = el.matches?.('.dd-draw') ? [el] : $$('.dd-draw', el);
      paths.forEach((p) => {
        const len = p.getTotalLength ? p.getTotalLength() : 400;
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = reduced ? '0' : `${len}`;
      });
      const tl = gsap.timeline();
      if (!reduced) tl.to(paths, { strokeDashoffset: 0, duration, stagger, ease });
      return tl;
    },

    /* idle wobble for doodles, the "alive sticker" feel. off under reduced motion. */
    wobble(els, { rot = 2.5, y = 3, dur = 2.4 } = {}) {
      if (reduced) return;
      gsap.utils.toArray(els).forEach((el, i) => {
        gsap.to(el, { rotation: `+=${rot * (i % 2 ? -1 : 1)}`, y: `-=${y}`, duration: dur + (i % 3) * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      });
    },

    /* wrap each word in <span class="w"><span>word</span></span> for masked reveals */
    splitWords(el) {
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const w = document.createElement('span'); w.className = 'w';
              const i = document.createElement('span'); i.textContent = part;
              w.appendChild(i); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
        });
      };
      walk(el);
      return $$('.w > span', el);
    },
  };
  return ctx;
}
