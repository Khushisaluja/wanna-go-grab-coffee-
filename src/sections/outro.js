/* ------------------------------------------------------------------
   OUTRO · "cup's EMPTY." the traveling cup lands here, empty and tipped.
   hover or focus "say hi" and a doodle pot pours it full again.
   ------------------------------------------------------------------ */
import './outro.css';
import { ME, OUTRO } from '../data.js';
import { $, $$, em, esc } from '../lib.js';
import { cupSVG, setLevel, refill, useStaticRefill } from './cup.js';

const isStatic = () => document.documentElement.classList.contains('is-static');
const SPARK = 'M20 3 C 21 13, 26 18, 37 20 C 26 22, 22 27, 20 37 C 18 27, 13 22, 3 20 C 14 18, 19 13, 20 3 Z';

export function build(el) {
  const st = isStatic();
  el.style.width = '100vw';
  el.innerHTML = `
  <div class="outro-scene">
    <div class="outro-copy">
      <h2 class="outro-title">${em(OUTRO.title)}</h2>
      <p class="outro-sub">${esc(OUTRO.sub)}</p>
      <div class="outro-actions">
        <a class="btn outro-hi" href="mailto:${esc(ME.email)}" data-hello aria-haspopup="dialog">
          <span class="outro-hi-say">say hi</span>
        </a>
        <button type="button" class="btn btn--light outro-link outro-copybtn" data-copy-email="${esc(ME.email)}" aria-label="copy email address ${esc(ME.email)}">
          <svg class="outro-copy-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8 V 6 a 2 2 0 0 0 -2 -2 H 6 a 2 2 0 0 0 -2 2 v 8 a 2 2 0 0 0 2 2 h 2"/></svg>
          <span class="outro-copy-label" data-copy-label>${esc(ME.email)}</span>
        </button>
        <div class="outro-links">
          <a class="btn btn--light outro-link" href="${esc(ME.linkedin)}" target="_blank" rel="noreferrer">linkedin <span aria-hidden="true">↗</span><span class="sr"> (opens in a new tab)</span></a>
          <a class="btn btn--light outro-link" href="${esc(ME.resume)}" target="_blank" rel="noreferrer">resume <span aria-hidden="true">↗</span><span class="sr"> (google drive, opens in a new tab)</span></a>
        </div>
      </div>
      <p class="outro-also">${esc(OUTRO.also)}</p>
    </div>

    <figure class="outro-polaroid">
      <div class="outro-photo">
        <img src="/img/raw/IMG_7278.jpg" alt="a tall iced coffee on a wooden desk, next to flowers and an open book" loading="lazy" decoding="async" />
        <svg class="dd dd--sticker outro-dd" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <path class="dd-draw" d="${SPARK}" transform="translate(212 34) scale(1.1)"/>
          <path class="dd-draw" d="${SPARK}" transform="translate(250 84) scale(.6)"/>
          <path class="dd-draw" d="M118 46 L 126 22 L 140 38 L 152 16 L 162 40 L 178 24 L 182 50 C 160 56, 138 56, 118 46 Z"/>
          <path class="dd-draw" d="M40 60 C 30 48, 12 58, 22 74 L 40 90 L 58 74 C 68 58, 50 48, 40 60 Z"/>
        </svg>
      </div>
      <figcaption class="outro-cap">the real mvp</figcaption>
    </figure>

    <div class="outro-cupspot" aria-hidden="true">${st ? cupSVG('cupO') : ''}</div>
    <p class="outro-refill" aria-hidden="true">
      <svg class="dd" viewBox="0 0 80 50" focusable="false"><path class="dd-draw" d="M76 34 C 56 44, 26 40, 8 16 M8 16 L 10 31 M8 16 L 22 20"/></svg>
      <span>say hi = refill</span>
    </p>
    <p class="outro-sign">
      ${esc(OUTRO.sign)}
      <svg class="dd outro-heart" viewBox="0 0 40 36" aria-hidden="true" focusable="false"><path class="dd-draw" d="M20 32 C 6 22, 2 12, 8 6 C 13 2, 18 5, 20 10 C 22 5, 27 2, 32 6 C 38 12, 34 22, 20 32 Z"/></svg>
    </p>
  </div>`;

  if (st) {
    const svg = $('.outro-cupspot svg', el);
    setLevel(svg, 0);
    useStaticRefill(svg);
  }

  const hi = $('.outro-hi', el);
  const on = () => refill(true), off = () => refill(false);
  hi.addEventListener('mouseenter', on);
  hi.addEventListener('mouseleave', off);
  hi.addEventListener('focus', on);
  hi.addEventListener('blur', off);

  /* where the empty cup lands depends on how tall the title and how wide the button row render,
     so measure instead of guessing vh. cup.js reads .outro-cupspot's rect every frame, so moving
     the spot is enough. phones and the stacked layout keep their css. */
  const place = () => {
    const spot = $('.outro-cupspot', el), note = $('.outro-refill', el), scene = $('.outro-scene', el);
    const clear = () => { spot.style.left = spot.style.top = ''; note.style.left = note.style.top = ''; note.style.visibility = ''; };
    if (isStatic() || matchMedia('(max-width: 860px) and (orientation: portrait)').matches) { clear(); return; }
    const s = scene.getBoundingClientRect();
    const rel = (e) => { const r = e.getBoundingClientRect(); return { l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top, w: r.width, h: r.height }; };
    /* row 1 = say hi + email, row 2 = linkedin + resume, then the "also made" line */
    const hiB = rel($('.outro-hi', el)), copyB = rel($('.outro-copybtn', el));
    const links = [...el.querySelectorAll('.outro-links > a')].map(rel);
    const row1 = { r: Math.max(hiB.r, copyB.r), t: Math.min(hiB.t, copyB.t), b: Math.max(hiB.b, copyB.b) };
    const row2 = { r: Math.max(...links.map((x) => x.r)), b: Math.max(...links.map((x) => x.b)) };
    const also = rel($('.outro-also', el)), pol = rel($('.outro-polaroid', el));
    const w = spot.offsetWidth, h = w * 240 / 220;
    const vis = 1.25;                 // the drawn cup (halo + steam + tilt) is ~25% bigger than its box
    const pad = (vis - 1) * w * 0.5;  // how far the drawing spills past its box on each side
    const gap = 22;
    let left, top;
    if (row1.r + gap + pad + w * vis <= pol.l - gap) {
      /* A: beside "say hi" + the email, where it can be refilled in plain sight */
      left = row1.r + gap + pad;
      top = row1.t - pad;
    } else {
      /* B: under the email button, right of linkedin/resume and the "also made" line */
      left = Math.max(row2.r, also.r) + gap + pad;
      top = row1.b + gap + pad;
    }
    top = Math.max(0, Math.min(top, s.height - h * vis - 12));   // never off the bottom
    left = Math.min(left, pol.l - w * vis - gap);                 // never into the polaroid
    const moved = spot.style.left !== `${Math.round(left)}px` || spot.style.top !== `${Math.round(top)}px`;
    spot.style.left = `${Math.round(left)}px`;
    spot.style.top = `${Math.round(top)}px`;
    /* cup.js only re-measures its anchors on resize / refresh / this event */
    if (moved) dispatchEvent(new Event('intro:plate'));
    /* the "say hi = refill" note: beside the cup if there's room before the polaroid, else under it, else hidden */
    note.style.visibility = '';
    const nw = note.offsetWidth || 170, nh = note.offsetHeight || 44;
    /* the spot box is the cup's footprint; the drawing only spills sideways and up (steam), so the
       note can tuck right under the box instead of under the padded size */
    const cupR = left + w * vis, cupB = top + h * 0.98;
    if (cupR + 8 + nw < pol.l - 8) { note.style.left = `${Math.round(cupR + 8)}px`; note.style.top = `${Math.round(top + h * 0.55)}px`; }
    else if (cupB + nh < s.height - 8) { note.style.left = `${Math.round(left)}px`; note.style.top = `${Math.round(cupB)}px`; }
    else note.style.visibility = 'hidden';
  };
  el._placeCup = place;
  /* the first measure can happen before the fonts / polaroid photo settle (buttons render shorter,
     so the cup lands on the email button). re-place whenever any of those boxes change size. */
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
  addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(schedule);
    ['.outro-actions', '.outro-copy', '.outro-polaroid', '.outro-scene'].forEach((q) => { const n = $(q, el); if (n) ro.observe(n); });
  }
  $('.outro-polaroid img', el)?.addEventListener('load', schedule);
}

export function motion(ctx, el) {
  const title = $('.outro-title', el);
  const dd = $$('.outro-dd, .outro-heart, .outro-refill svg', el);
  if (ctx.reduced || !ctx.hTween) return;

  const words = ctx.splitWords(title);
  dd.forEach((d) => ctx.draw(d));

  /* scrubbed so that the very end of the scroll is the finished page */
  const tl = ctx.tl(el, { start: 'left 75%', end: 'left left', scrub: true });
  tl.fromTo(words, { yPercent: 120, rotation: 6 }, { yPercent: 0, rotation: 0, stagger: 0.12, duration: 0.45, ease: 'power3.out' }, 0)
    .fromTo($('.outro-polaroid', el), { y: '-30vh', rotation: -16, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }, 0.1)
    .fromTo($$('.outro-sub, .outro-actions > *, .outro-also', el), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, 0.35)
    .to($$('.outro-dd path, .outro-heart path, .outro-refill path', el), { strokeDashoffset: 0, stagger: 0.04, duration: 0.3 }, 0.62)
    .fromTo($$('.outro-sign, .outro-refill span', el), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.75)
    .set({}, {}, 1);
}
