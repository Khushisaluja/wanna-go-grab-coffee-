/* ------------------------------------------------------------------
   INTRO · her photo, a torn-paper note, doodles on the table.
   the photo sits on a "plate": a box sized to exactly the rendered image,
   so anything positioned in % inside it is glued to a spot in the photo
   (the table, her head) at every viewport size. coordinates are CSS vars
   in intro.css.
   ------------------------------------------------------------------ */
import './intro.css';
import gsap from 'gsap';
import { INTRO } from '../data.js';
import { $, $$, em, esc } from '../lib.js';
import { INTRO_CUP_AT } from './cup.js';

const WIDE = '/img/scenes/hero-wide.jpg';
const RAW = '/img/raw/hero-newspaper.jpg';

const SPARK = 'M20 3 C 21 13, 26 18, 37 20 C 26 22, 22 27, 20 37 C 18 27, 13 22, 3 20 C 14 18, 19 13, 20 3 Z';

const NAWAB = `
<svg class="dd dd--sticker intro-nawab-svg" viewBox="0 0 120 92" aria-hidden="true" focusable="false">
  <path class="dd-halo" d="M24 88 C 6 80, 4 52, 22 40 C 28 18, 48 10, 60 13 C 76 10, 94 18, 98 40 C 116 52, 114 80, 96 88"/>
  <path class="dd-fill dd-draw" d="M26 88 C 12 72, 14 48, 28 38 C 32 20, 48 12, 60 15 C 74 12, 90 20, 94 38 C 108 48, 110 72, 96 88"/>
  <path class="dd-draw intro-ear" d="M30 40 C 14 42, 6 64, 12 82 C 18 90, 30 84, 32 72"/>
  <path class="dd-draw intro-ear" d="M91 40 C 107 42, 115 64, 109 82 C 103 90, 91 84, 89 72"/>
  <path class="dd-draw" d="M53 17 C 48 7, 56 1, 61 5 C 66 0, 74 7, 67 17"/>
  <path class="dd-draw" d="M40 30 C 46 26, 52 28, 56 24 M66 24 C 70 28, 78 26, 82 30"/>
  <circle class="dd-ink" cx="47" cy="51" r="3.4"/>
  <circle class="dd-ink" cx="74" cy="51" r="3.4"/>
  <ellipse class="dd-ink" cx="60.5" cy="62" rx="5.2" ry="3.8"/>
  <path class="dd-draw" d="M53 69 C 56 72, 60 71, 60.5 67 C 61 71, 65 72, 68 69"/>
  <path class="dd-fill dd-draw" d="M57 71 C 56 80, 65 80, 64 71"/>
  <path class="dd-draw" d="M36 62 C 33 66, 34 70, 37 72 M85 62 C 88 66, 87 70, 84 72"/>
  <path class="dd-fill dd-draw" d="M28 92 C 27 80, 45 79, 45 92"/>
  <path class="dd-fill dd-draw" d="M76 92 C 76 79, 94 80, 93 92"/>
  <path class="dd-draw" d="M34 86 V 91 M39 86 V 91 M82 86 V 91 M87 86 V 91"/>
</svg>`;

const SKETCHBOOK = `
<svg class="dd dd--sticker" viewBox="0 0 90 60" aria-hidden="true" focusable="false">
  <path class="dd-halo" d="M6 32 L 52 18 L 84 34 L 36 52 Z"/>
  <path class="dd-fill dd-draw" d="M6 33 L 6 38 L 36 57 L 84 39 L 84 34"/>
  <path class="dd-fill dd-draw" d="M6 32 L 51 18 L 84 34 L 37 51 Z"/>
  <path class="dd-draw" d="M13 31 l 2 -3 M20 29 l 2 -3 M27 27 l 2 -3 M34 25 l 2 -3 M41 23 l 2 -3"/>
  <path class="dd-draw" d="M36 38 C 44 34, 50 38, 58 33 C 62 31, 64 34, 68 32"/>
  <path class="dd-draw" d="M40 44 C 46 42, 52 43, 56 40"/>
</svg>`;

const PEN = `
<svg class="dd dd--sticker" viewBox="0 0 90 40" aria-hidden="true" focusable="false">
  <path class="dd-halo" d="M8 30 L 70 8 L 80 10 L 76 17 L 14 38 Z"/>
  <path class="dd-fill dd-draw" d="M10 30 L 69 9 L 80 10 L 76 17 L 15 37 C 9 38, 6 33, 10 30 Z"/>
  <path class="dd-draw" d="M58 13 L 62 22 M24 25 L 27 33"/>
  <path class="dd-ink" d="M76 10 L 80 10 L 78 15 Z"/>
</svg>`;

const STICKY = `
<svg class="dd dd--sticker" viewBox="0 0 120 112" aria-hidden="true" focusable="false">
  <path class="dd-halo" d="M8 10 L 108 4 L 112 94 L 30 104 L 12 90 Z"/>
  <path class="dd-fill dd-draw" d="M9 11 L 107 5 L 111 93 L 31 103 L 13 89 Z"/>
  <path class="dd-draw" d="M13 89 L 29 86 L 31 103"/>
  <text class="intro-sticky-t intro-sticky-t--big" x="60" y="46" text-anchor="middle" transform="rotate(-3 60 50)">scroll</text>
  <!-- sideways arrow: the story moves right -->
  <path class="dd-draw" d="M20 70 C 42 64, 66 72, 94 66" transform="rotate(-3 60 50)"/>
  <path class="dd-draw" d="M82 57 L 95 66 L 83 76" transform="rotate(-3 60 50)"/>
</svg>`;

const SPARKS = `
<svg class="dd intro-sparks-svg" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
  <path class="dd-draw intro-spark" d="${SPARK}"/>
  <path class="dd-draw intro-spark" d="${SPARK}" transform="translate(70 30) scale(.62)"/>
  <path class="dd-draw intro-spark" d="${SPARK}" transform="translate(30 58) scale(.42)"/>
  <path class="dd-draw" d="M96 12 C 100 8, 104 8, 108 4"/>
</svg>`;

export function build(el) {
  el.style.width = '100vw';
  el.classList.add('intro--pre');
  el.innerHTML = `
  <div class="intro-scene">
    <article class="intro-card">
      <div class="intro-nawab" aria-hidden="true">${NAWAB}</div>
      <div class="intro-paper">
        <span class="intro-tape" aria-hidden="true"></span>
        <h1 class="intro-hello">${esc(INTRO.hello)}</h1>
        <p class="intro-line">${em(INTRO.line)}</p>
        <ul class="intro-facts">
          ${INTRO.facts.map((f) => `<li class="intro-fact">${esc(f)}</li>`).join('')}
        </ul>
        <p class="intro-side">${esc(INTRO.side)}</p>
      </div>
    </article>

    <div class="intro-photo">
      <div class="intro-plate">
        <img class="intro-img" src="${WIDE}" alt="khushi in a sunlit, glass-walled room, curled up in a chair reading the newspaper" fetchpriority="high" decoding="async" />
        <div class="intro-doodles" aria-hidden="true">
          <div class="intro-dd intro-dd--sticky">${STICKY}</div>
          <div class="intro-dd intro-dd--book">${SKETCHBOOK}</div>
          <div class="intro-dd intro-dd--pen">${PEN}</div>
          <div class="intro-dd intro-dd--sparks">${SPARKS}</div>
        </div>
        <div class="intro-cupspot" aria-hidden="true"></div>
        <p class="bubble intro-bubble">${esc(INTRO.bubble)}</p>
      </div>
      <div class="intro-scrim" aria-hidden="true"></div>
    </div>
  </div>`;

  const img = $('.intro-img', el);
  const fallback = () => {
    if (img.dataset.fell) return;
    img.dataset.fell = '1';
    el.classList.add('intro--fallback');
    img.src = RAW;
    fitPlate(el);
  };
  img.addEventListener('error', fallback);
  img.addEventListener('load', () => fitPlate(el));
  if (img.complete && !img.naturalWidth) fallback();

  fitPlate(el);
  let rz = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => fitPlate(el)); });
  /* never leave the intro hidden if motion doesn't run */
  setTimeout(() => el.classList.remove('intro--pre'), 4000);
}

/* size the plate like object-fit: cover, using the image's real ratio and
   the object-position from CSS vars */
function fitPlate(el) {
  const box = $('.intro-photo', el);
  const img = $('.intro-img', el);
  const plate = $('.intro-plate', el);
  const cs = getComputedStyle(el);
  const v = (n, d) => { const x = parseFloat(cs.getPropertyValue(n)); return Number.isFinite(x) ? x : d; };
  const fallbackRatio = el.classList.contains('intro--fallback') ? 0.75 : 16 / 9;
  const ratio = img.naturalWidth ? img.naturalWidth / img.naturalHeight : v('--intro-ratio', fallbackRatio);
  const px = v('--intro-pos-x', 0.5), py = v('--intro-pos-y', 0.5);
  const bw = box.clientWidth, bh = box.clientHeight;
  if (!bw || !bh) return;
  let w = bw, h = bw / ratio;
  if (h < bh) { h = bh; w = bh * ratio; }
  plate.style.width = `${w}px`;
  plate.style.height = `${h}px`;
  plate.style.left = `${(bw - w) * px}px`;
  plate.style.top = `${(bh - h) * py}px`;
  plate.style.setProperty('--pw', `${w}px`);
  el.classList.add('intro--fit');
  window.dispatchEvent(new Event('intro:plate'));
}

export function motion(ctx, el) {
  const img = $('.intro-img', el);
  const card = $('.intro-card', el);
  const hello = $('.intro-hello', el);
  const line = $('.intro-line', el);
  const facts = $$('.intro-fact', el);
  const side = $('.intro-side', el);
  const nawab = $('.intro-nawab-svg', el);
  const bubble = $('.intro-bubble', el);
  const doodles = $('.intro-doodles', el);
  const fills = $$('.intro-doodles .dd-fill, .intro-doodles text, .intro-doodles .dd-ink', el);
  const halos = $$('.intro-doodles .dd-halo, .intro-nawab .dd-halo', el);

  if (ctx.reduced) { el.classList.remove('intro--pre'); return; }

  const words = ctx.splitWords(hello);

  /* ---- one orchestrated load sequence ---- */
  const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } });
  gsap.set([fills, halos], { opacity: 0 });
  tl.fromTo(img, { scale: 1.07 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
    .fromTo(card, { y: 70, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: 0, duration: 1, ease: 'expo.out' }, 0.2)
    .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.07, ease: 'power4.out' }, 0.38)
    .fromTo(line, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.7)
    .fromTo(facts, { scale: 0.55, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.55, stagger: 0.07, ease: 'back.out(2.2)' }, 0.86)
    .fromTo(side, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.15)
    .add(ctx.draw(doodles, { duration: 0.8, stagger: 0.05 }), 0.8)
    .to(halos, { opacity: 1, duration: 0.3, stagger: 0.04 }, 1.1)
    .to(fills, { opacity: 1, duration: 0.4, stagger: 0.03 }, 1.15)
    .fromTo(bubble, { scale: 0.3, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.7, ease: 'back.out(2)' }, INTRO_CUP_AT + 0.45)
    .add(ctx.draw($('.intro-nawab', el), { duration: 0.6, stagger: 0.03 }), 1.45)
    .fromTo(nawab, { yPercent: 70 }, { yPercent: 0, duration: 0.8, ease: 'back.out(1.6)' }, 1.45);
  el.classList.remove('intro--pre');
  tl.call(() => {
    ctx.wobble($$('.intro-dd--sticky, .intro-dd--sparks', el), { rot: 2, y: 2.5, dur: 2.6 });
    ctx.wobble(bubble, { rot: 1.2, y: 4, dur: 3 });
  });

  /* ---- leaving: the room dims as the cup comes toward you ---- */
  const out = ctx.tl(el, { start: 'left left', end: 'right left', scrub: true });
  out.fromTo($('.intro-scrim', el), { opacity: 0 }, { opacity: 0.72, ease: 'power1.in' }, 0)
    .fromTo(card, { xPercent: 0 }, { xPercent: -18, ease: 'none' }, 0);
}
