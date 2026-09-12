/* ------------------------------------------------------------------
   BREW · "work born out of intense CAFFEINATION"
   250vw wide. the stage is held still with ctx.hold while the section
   scrolls past; over that hold the three projects rise out of the
   coffee and fan into an arc. cards are real buttons in the track, under
   the fixed cup layer: while a card is inside the cup's silhouette it's
   hidden by the cup, which reads as "below the coffee surface".
   ------------------------------------------------------------------ */
import './brew.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BREW, CARDS } from '../data.js';
import { $, $$, em, esc } from '../lib.js';
import { POP, MOUTH, cupSVG, setLevel } from './cup.js';

const isStatic = () => document.documentElement.classList.contains('is-static');
const ROT = [-7, 2.5, 6.5];
const IMG_POS = ['50% 0%', '50% 30%', '50% 22%'];

export function build(el) {
  const st = isStatic();
  el.style.width = st ? '' : '250vw';
  el.innerHTML = `
  <div class="brew-stage">
    <div class="brew-glow" aria-hidden="true"></div>
    <svg class="dd brew-rings" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
      <path d="M60 160 C 58 104, 120 70, 176 78 C 236 86, 262 140, 240 188 C 220 232, 140 246, 96 220 C 72 206, 62 186, 64 170"/>
      <path d="M250 70 C 262 40, 318 34, 340 62 C 360 90, 336 124, 300 122 C 276 120, 258 104, 256 90"/>
    </svg>

    <h2 class="brew-head">
      <span class="brew-kicker">${esc(BREW.kicker)}</span>
      <span class="brew-title">${em(BREW.title)}</span>
    </h2>
    <svg class="dd brew-scribble" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path class="dd-draw" d="M6 26 C 90 14, 200 30, 300 18 C 400 8, 500 26, 594 12 M40 34 C 160 26, 300 36, 440 26"/>
    </svg>

    <div class="brew-cupspot" aria-hidden="true">${st ? cupSVG('cupB') : ''}</div>
    <p class="brew-label" aria-hidden="true"><span class="brew-label-in">
      <span>${esc(BREW.steamLabel)}</span>
      <svg class="dd" viewBox="0 0 90 50"><path class="dd-draw" d="M4 8 C 30 4, 62 14, 80 40 M80 40 L 66 36 M80 40 L 82 25"/></svg>
    </span></p>

    <ul class="brew-cards">
      ${CARDS.map((c, i) => `
      <li class="brew-slot brew-slot--${i}">
        <button class="brew-card" type="button" data-go="${esc(c.go)}">
          <span class="brew-card-in">
            <span class="brew-card-media"><img src="${esc(c.img)}" alt="" loading="lazy" decoding="async" style="object-position:${IMG_POS[i]}" /></span>
            <span class="brew-card-body">
              <span class="brew-card-tag">${esc(c.tag)}</span>
              <span class="brew-card-name">${esc(c.name)}</span>
              <span class="brew-card-hook">${em(c.hook)}</span>
              <span class="brew-card-go" aria-hidden="true">open it <span>→</span></span>
            </span>
          </span>
        </button>
      </li>`).join('')}
    </ul>

    <p class="brew-sub">
      <svg class="dd brew-sub-arrow" viewBox="0 0 70 60" aria-hidden="true" focusable="false"><path class="dd-draw" d="M8 54 C 10 30, 30 12, 60 10 M60 10 L 46 4 M60 10 L 50 22"/></svg>
      ${esc(BREW.sub)}
    </p>
  </div>`;
  if (st) setLevel($('.brew-cupspot svg', el), 0.85);
}

export function motion(ctx, el) {
  const chrome = document.getElementById('chrome');
  const stage = $('.brew-stage', el);
  const cards = $$('.brew-card', el);
  const slots = $$('.brew-slot', el);
  const spot = $('.brew-cupspot', el);
  const darkChrome = (s) => chrome?.classList.toggle('is-dark', s.isActive);

  if (!ctx.hTween) {
    ScrollTrigger.create({ trigger: el, start: 'top 40px', end: 'bottom 40px', onToggle: darkChrome });
    return;
  }

  ctx.st({ trigger: el, start: 'left 50%', end: 'right 50%', onToggle: darkChrome });
  ctx.hold(el, stage);

  /* ---- entering: the headline pours in while the cup travels ---- */
  const words = ctx.splitWords($('.brew-title', el));
  const kick = ctx.splitWords($('.brew-kicker', el));
  const scribble = $('.brew-scribble', el);
  ctx.draw(scribble);
  const label = $('.brew-label', el);
  ctx.draw(label);

  const tIn = ctx.tl(el, { start: 'left 80%', end: 'left 2%', scrub: true });
  tIn.fromTo(kick, { yPercent: 110 }, { yPercent: 0, stagger: 0.05, duration: 0.3, ease: 'power3.out' }, 0)
    .fromTo(words, { yPercent: 118, rotation: 5 }, { yPercent: 0, rotation: 0, stagger: 0.14, duration: 0.5, ease: 'power3.out' }, 0.15)
    .to($$('path', scribble), { strokeDashoffset: 0, duration: 0.35, ease: 'power1.inOut' }, 0.6)
    .fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.75)
    .to($$('path', label), { strokeDashoffset: 0, duration: 0.25 }, 0.78);

  /* ---- the hold: three cards come out of the cup ---- */
  const geo = () => {
    const s = stage.getBoundingClientRect();
    const r = spot.getBoundingClientRect();
    const mouth = { x: r.left - s.left + r.width * MOUTH.x, y: r.top - s.top + r.width * MOUTH.y };
    return slots.map((sl) => {
      const b = sl.getBoundingClientRect();
      return { dx: mouth.x - (b.left - s.left + b.width / 2), dy: mouth.y - (b.top - s.top + b.height / 2), h: b.height };
    });
  };
  let G = geo();
  ScrollTrigger.addEventListener('refreshInit', () => { G = null; });
  const g = (i) => { if (!G) G = geo(); return G[i]; };

  const tl = ctx.tl(el, { start: 'left left', end: 'right right', scrub: true, invalidateOnRefresh: true }, { defaults: { ease: 'none' } });
  cards.forEach((card, i) => {
    const at = POP.first + i * POP.gap;
    /* below the surface → breaking through → arcing out to its place */
    tl.fromTo(card,
      { x: () => g(i).dx, y: () => g(i).dy + g(i).h * 0.2 + 40, scale: 0.18, rotation: 0, opacity: 0 },
      { x: () => g(i).dx * 0.96, y: () => g(i).dy - g(i).h * 0.2, scale: 0.3, rotation: -ROT[i] * 0.6, opacity: 1, duration: POP.rise, ease: 'power2.out' }, at)
      .to(card, { x: 0, y: 0, scale: 1, rotation: ROT[i], duration: POP.fly, ease: 'back.out(1.35)' }, at + POP.rise);
  });
  /* the hint lands the moment the LAST card breaks out of the coffee, not before */
  const lastOut = POP.first + (cards.length - 1) * POP.gap + POP.rise;
  tl.fromTo($('.brew-sub', el), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, lastOut)
    /* the entry timeline fades the outer label in; this one fades the inner out.
       two elements, so the two scrubbed timelines never fight over one opacity */
    .fromTo($('.brew-label-in', el), { y: 0, opacity: 1 }, { y: -10, opacity: 0, duration: 0.06 }, 0.1)
    .set({}, {}, 1);
  ctx.draw($('.brew-sub', el));
  tl.to($$('.brew-sub path', el), { strokeDashoffset: 0, duration: 0.08 }, lastOut + 0.03);

  /* keyboard: focusing a card that hasn't come out yet brings the story to it */
  cards.forEach((card) => card.addEventListener('focusin', () => {
    requestAnimationFrame(() => {
      const st = ctx.hTween.scrollTrigger;
      const want = st.start + el.offsetLeft + (el.offsetWidth - window.innerWidth) * 0.8;
      if (Math.abs(window.scrollY - want) > window.innerWidth * 0.2) ctx.goTo('brew', { offset: (el.offsetWidth - window.innerWidth) * 0.8 });
    });
  }));
}
