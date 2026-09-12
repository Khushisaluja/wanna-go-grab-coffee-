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
        <button type="button" class="btn btn--light outro-link outro-copybtn" data-copy-email="${esc(ME.email)}">
          <svg class="outro-copy-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8 V 6 a 2 2 0 0 0 -2 -2 H 6 a 2 2 0 0 0 -2 2 v 8 a 2 2 0 0 0 2 2 h 2"/></svg>
          <span class="outro-copy-label" data-copy-label>copy email</span>
        </button>
        <a class="btn btn--light outro-link" href="${esc(ME.linkedin)}" target="_blank" rel="noreferrer">linkedin <span aria-hidden="true">↗</span><span class="sr"> (opens in a new tab)</span></a>
        <a class="btn btn--light outro-link" href="${esc(ME.resume)}" target="_blank" rel="noreferrer">resume <span aria-hidden="true">↗</span><span class="sr"> (google drive, opens in a new tab)</span></a>
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
