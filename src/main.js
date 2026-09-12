import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/shantell-sans/500.css';
import '@fontsource/shantell-sans/600.css';
import '@fontsource/shantell-sans/700.css';
import '@fontsource/martian-mono/400.css';
import './styles/tokens.css';
import './styles/base.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $, $$, makeCtx } from './lib.js';
import { ME } from './data.js';

import * as intro from './sections/intro.js';
import * as brew from './sections/brew.js';
import * as tally from './sections/tally.js';
import * as cox from './sections/cox.js';
import * as pawnet from './sections/pawnet.js';
import * as outro from './sections/outro.js';
import * as cup from './sections/cup.js';

gsap.registerPlugin(ScrollTrigger);

/* ?static forces the stacked layout for testing; ?noanim is an alias */
const q = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || q.has('static') || q.has('noanim');
if (reduced) document.documentElement.classList.add('is-static');

const SECTIONS = [
  ['intro', intro], ['brew', brew], ['tally', tally], ['cox', cox], ['pawnet', pawnet], ['outro', outro],
];

/* 1. build markup */
SECTIONS.forEach(([id, mod]) => mod.build?.($('#' + id)));
cup.build?.($('#cupstage'));
chrome();

/* 2. smooth scroll */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* 3. the one horizontal tween */
const track = $('#track');
const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
let hTween = null;
if (!reduced) {
  hTween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#story', pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      end: () => '+=' + distance(),
    },
  });
}

const ctx = makeCtx({ hTween, reduced, lenis });

/* jump to a panel (or any element inside the track) */
ctx.goTo = (target, { offset = 0, immediate = false } = {}) => {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  if (!hTween) { el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' }); return; }
  let left = 0, n = el;
  while (n && n !== track) { left += n.offsetLeft; n = n.offsetParent; }
  const st = hTween.scrollTrigger;
  const y = Math.min(st.end, Math.max(st.start, st.start + left + offset));
  lenis ? lenis.scrollTo(y, { immediate, duration: 1.6 }) : window.scrollTo(0, y);
};
window.__ctx = ctx; // handy for screenshot harnesses

/* 4. motion, after fonts so text measures right */
document.fonts.ready.then(() => {
  SECTIONS.forEach(([id, mod]) => mod.motion?.(ctx, $('#' + id)));
  cup.motion?.(ctx, $('#cupstage'));
  chromeMotion(ctx);
  ScrollTrigger.refresh();
  /* deep links wait a frame so the pin-spacer exists and Lenis has re-measured the page limit;
     otherwise lenis.scrollTo clamps to the pre-pin height and nothing moves. */
  requestAnimationFrame(() => {
    lenis?.resize();
    if (q.has('x')) ctx.goTo('track', { offset: +q.get('x'), immediate: true }); // ?x=<px of horizontal travel>
    if (q.has('go')) ctx.goTo(q.get('go'), { immediate: true });
  });
});
window.addEventListener('load', () => ScrollTrigger.refresh());

/* keyboard: left/right arrows move a screen sideways */
window.addEventListener('keydown', (e) => {
  if (!hTween || e.target.closest('input, textarea')) return;
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  const y = window.scrollY + (e.key === 'ArrowRight' ? 1 : -1) * window.innerWidth * 0.8;
  lenis.scrollTo(y, { duration: 0.9 });
});

/* focus that lands off-screen inside the track scrolls into view */
track.addEventListener('focusin', (e) => {
  if (!hTween) return;
  const r = e.target.getBoundingClientRect();
  if (r.left >= 0 && r.right <= window.innerWidth) return;
  /* immediate: a smooth scroll per focus change stacks up when tabbing fast and lands elsewhere */
  ctx.goTo(e.target, { offset: -window.innerWidth * 0.3, immediate: true });
});

/* ------------------------------------------------------------------ chrome */
function chrome() {
  $('#chapters').innerHTML = $$('.panel').map((p) =>
    `<li><button type="button" data-go="${p.id}">${p.dataset.chapter}</button></li>`).join('');
  $('#resumeLink').href = ME.resume;
  $('#helloLink').href = `mailto:${ME.email}`;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    e.preventDefault();
    ctx.goTo(b.dataset.go);
  });
}

function chromeMotion(ctx) {
  const btns = $$('#chapters button');
  const set = (id) => btns.forEach((b) => (b.dataset.go === id ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
  $$('.panel').forEach((p) => {
    const vars = { trigger: p, start: 'left 50%', end: 'right 50%', onToggle: (s) => s.isActive && set(p.id) };
    ctx.hTween ? ctx.st(vars) : ScrollTrigger.create({ ...vars, start: 'top 50%', end: 'bottom 50%' });
  });
  set('intro');
  const hint = $('#scrollhint');
  if (ctx.hTween) ScrollTrigger.create({ start: 80, onEnter: () => gsap.to(hint, { autoAlpha: 0, duration: .3 }), onLeaveBack: () => gsap.to(hint, { autoAlpha: 1, duration: .3 }) });
}
