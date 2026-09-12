/* ------------------------------------------------------------------
   THE TRAVELING CUP
   one doodle cup, fixed above the sideways track. it has no timeline of
   its own: a ticker reads the track's live x and derives everything
   (where, how big, tilt, coffee level, steam) from anchors the sections
   expose. that keeps it frame-exact with the track, deterministic under
   scrub, and glued to the photo on resize.

   anchors (a box whose width = cup width, top = cup top):
     #intro .intro-cupspot   on the table beside her
     #brew  .brew-cupspot    centre stage
     #outro .outro-cupspot   the empty cup
   park: bottom-left, inside tokens.css --cup-zone-w/h.
   ------------------------------------------------------------------ */
import './cup.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const VB = { w: 220, h: 240 };
/* where the coffee surface sits, as fractions of the rendered WIDTH */
export const MOUTH = { x: 100 / 220, y: 100 / 220 };
/* the pivot: the cup's foot. fractions of width / height */
const ORIGIN = { x: 100 / 220, y: 226 / 240 };
/* brew hold timeline beats (0..1 of the hold). brew.js launches cards on the
   same numbers so the cup jiggles exactly when each card leaves it. */
export const POP = { first: 0.08, gap: 0.15, rise: 0.05, fly: 0.13 };
/* seconds into the intro load sequence when the cup appears */
export const INTRO_CUP_AT = 1.0;

const BASE_W = 440;
const BASE_H = BASE_W * (VB.h / VB.w);

const BODY = 'M32 101 C 29 141, 36 186, 60 211 C 74 227, 127 228, 141 212 C 163 188, 171 143, 168 100 A 68 15 0 0 1 32 101 Z';
const HANDLE = 'M163 122 C 213 106, 218 190, 145 197 L 147 178 C 191 172, 193 134, 162 143 Z';
const STEAM = [
  'M80 84 C 68 68, 92 58, 80 42 C 70 30, 90 20, 82 6',
  'M104 80 C 92 60, 118 50, 104 32 C 94 18, 114 8, 106 -8',
  'M127 85 C 117 70, 140 62, 128 46 C 120 36, 134 28, 130 18',
];
const FULL = { cy: 101, rx: 64 };
const EMPTY = { cy: 138, rx: 56 };

/* markup for one cup. `p` prefixes the clipPath ids so static clones don't collide. */
export function cupSVG(p = 'cup') {
  return `
<svg class="cup-svg" viewBox="0 0 ${VB.w} ${VB.h}" aria-hidden="true" focusable="false">
  <defs>
    <clipPath id="${p}-mouth"><ellipse cx="100" cy="100" rx="66.5" ry="13.8"/></clipPath>
    <clipPath id="${p}-body"><path d="${BODY}"/></clipPath>
  </defs>
  <ellipse class="cup-shadow" cx="104" cy="226" rx="72" ry="7"/>
  <g class="cup-pot">
    <path class="cup-stream-o" d="M140 -22 C 128 12, 110 56, 104 104"/>
    <path class="cup-stream" d="M140 -22 C 128 12, 110 56, 104 104"/>
    <g transform="translate(168 -62) rotate(-38)">
      <path class="cup-halo-s" d="M-26 -30 L 30 -30 C 36 0, 38 30, 28 52 L -24 52 C -34 30, -32 0, -26 -30 Z"/>
      <path class="cup-fill cup-line" d="M-26 -30 L 30 -30 C 36 0, 38 30, 28 52 L -24 52 C -34 30, -32 0, -26 -30 Z"/>
      <path class="cup-line" d="M-28 -14 L -52 -26 L -46 -12 L -30 0"/>
      <path class="cup-line" d="M31 -16 C 54 -16, 56 24, 33 26"/>
      <path class="cup-line" d="M-30 -32 L 34 -32 M-2 -32 C -2 -40, 6 -40, 6 -32"/>
      <path class="cup-line" d="M-22 14 C -8 18, 12 18, 30 12"/>
    </g>
  </g>
  <g class="cup-halo"><path d="${HANDLE}"/><path d="${BODY}"/></g>
  <path class="cup-fill cup-line" d="${HANDLE}"/>
  <path class="cup-fill" d="${BODY}"/>
  <g clip-path="url(#${p}-body)">
    <path class="cup-stripe" d="M10 150 C 62 161, 140 161, 192 148 L 192 168 C 140 181, 62 181, 10 170 Z"/>
    <path class="cup-stripe" d="M10 186 C 62 196, 140 195, 192 183 L 192 190 C 140 202, 62 203, 10 193 Z"/>
    <path class="cup-line cup-thin" d="M40 118 C 44 132, 46 140, 50 146"/>
  </g>
  <path class="cup-line" d="${BODY}" fill="none"/>
  <path class="cup-line cup-heart" d="M101 141 C 90 133, 85 125, 90 120 C 95 116, 99 120, 101 124 C 103 120, 108 116, 112 120 C 117 125, 112 133, 101 141 Z"/>
  <ellipse class="cup-wall" cx="100" cy="100" rx="68" ry="15"/>
  <g clip-path="url(#${p}-mouth)">
    <ellipse class="cup-coffee" cx="100" cy="${FULL.cy}" rx="${FULL.rx}" ry="13"/>
    <ellipse class="cup-crema" cx="96" cy="${FULL.cy}" rx="44" ry="7"/>
  </g>
  <ellipse class="cup-line" cx="100" cy="100" rx="68" ry="15" fill="none"/>
  <g class="cup-splash">
    <path class="cup-line" d="M62 86 C 56 76, 58 66, 64 60"/>
    <path class="cup-line" d="M138 86 C 146 78, 146 68, 140 60"/>
    <circle class="cup-drop" cx="52" cy="58" r="4"/>
    <circle class="cup-drop" cx="150" cy="52" r="3.4"/>
    <circle class="cup-drop" cx="98" cy="46" r="3"/>
  </g>
  <g class="cup-steam">
    ${STEAM.map((d) => `<path class="cup-steam-o" d="${d}"/>`).join('')}
    ${STEAM.map((d) => `<path class="cup-steam-p" d="${d}"/>`).join('')}
  </g>
</svg>`;
}

/* 0 = empty, 1 = brim */
export function setLevel(svg, level) {
  const l = Math.max(0, Math.min(1, level));
  const cy = EMPTY.cy + (FULL.cy - EMPTY.cy) * l;
  const rx = EMPTY.rx + (FULL.rx - EMPTY.rx) * l;
  const c = svg.querySelector('.cup-coffee');
  const k = svg.querySelector('.cup-crema');
  c.setAttribute('cy', cy.toFixed(2)); c.setAttribute('rx', rx.toFixed(2));
  k.setAttribute('cy', cy.toFixed(2)); k.setAttribute('rx', (rx * 0.68).toFixed(2));
}

/* ---------- refill (called by outro on say-hi hover/focus) ---------- */
const R = { v: 0 };
let staticRefillSvg = null;
export function refill(on) {
  if (staticRefillSvg) { setLevel(staticRefillSvg, on ? 0.9 : 0); staticRefillSvg.classList.toggle('is-refill', on); return; }
  gsap.to(R, { v: on ? 1 : 0, duration: on ? 1.3 : 0.7, ease: on ? 'power2.inOut' : 'power2.in', overwrite: true });
}
export function useStaticRefill(svg) { staticRefillSvg = svg; }

/* ------------------------------------------------------------------ build */
const isStatic = () => document.documentElement.classList.contains('is-static');

export function build(stage) {
  if (isStatic()) {
    /* no fixed cup: it sits on the table in the intro, as part of the photo */
    const spot = document.querySelector('#intro .intro-cupspot');
    if (spot) { spot.innerHTML = cupSVG('cupI'); setLevel(spot.querySelector('svg'), 0.95); }
    return;
  }
  /* the stage holds a real button (the mini cup), so it can't stay aria-hidden */
  stage.removeAttribute('aria-hidden');
  stage.innerHTML = `
    <div class="cup">${cupSVG('cup')}</div>
    <button class="cup-btn" type="button" aria-label="back to the cup" tabindex="-1">
      <span class="cup-tip" aria-hidden="true">back to the cup</span>
    </button>`;
}

/* ----------------------------------------------------------------- motion */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const E = {
  inOut: gsap.parseEase('power2.inOut'),
  out2: gsap.parseEase('power2.out'),
  in: gsap.parseEase('power1.in'),
  out: gsap.parseEase('power3.out'),
  soft: gsap.parseEase('sine.inOut'),
};

export function motion(ctx, stage) {
  if (!ctx.hTween) return;
  const cup = stage.querySelector('.cup');
  const svg = cup.querySelector('svg');
  const btn = stage.querySelector('.cup-btn');
  const track = document.getElementById('track');
  const $id = (id) => document.getElementById(id);
  const P = { intro: $id('intro'), brew: $id('brew'), tally: $id('tally'), outro: $id('outro') };
  const spot = {
    intro: P.intro.querySelector('.intro-cupspot'),
    brew: P.brew.querySelector('.brew-cupspot'),
    outro: P.outro.querySelector('.outro-cupspot'),
  };
  const brewStage = P.brew.querySelector('.brew-stage');
  const steamG = svg.querySelector('.cup-steam');
  const splash = svg.querySelector('.cup-splash');
  const pot = svg.querySelector('.cup-pot');
  const stream = svg.querySelectorAll('.cup-stream, .cup-stream-o');

  gsap.set(cup, { transformOrigin: `${ORIGIN.x * 100}% ${ORIGIN.y * 100}%`, force3D: true });
  const setX = gsap.quickSetter(cup, 'x', 'px');
  const setY = gsap.quickSetter(cup, 'y', 'px');
  /* quickSetter ignores the 'scale' alias, so set both axes */
  const setSX = gsap.quickSetter(cup, 'scaleX');
  const setSY = gsap.quickSetter(cup, 'scaleY');
  const setS = (v) => { setSX(v); setSY(v); };
  const setR = gsap.quickSetter(cup, 'rotation', 'deg');

  /* ---- measure anchors ---- */
  let L = null;
  const rel = (el, box) => {
    const a = el.getBoundingClientRect(), b = box.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width };
  };
  const anchor = (r) => ({ ox: r.x + r.w * ORIGIN.x, oy: r.y + r.w * (VB.h / VB.w) * ORIGIN.y, w: r.w });
  const park = (vw, vh) => {
    const narrow = vw < 860;
    const cs = getComputedStyle(document.documentElement);
    const zw = parseFloat(cs.getPropertyValue('--cup-zone-w')) || 150;
    const w = narrow ? 62 : 92;
    const gutter = clamp(vw * 0.03, 16, 48);
    return { ox: gutter + Math.min(zw * 0.4, w * 0.62), oy: vh - (narrow ? 84 : 28), w };
  };
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    L = {
      vw, vh,
      brewL: P.brew.offsetLeft,
      holdLen: Math.max(1, P.brew.offsetWidth - vw),
      tallyL: P.tally.offsetLeft,
      outroL: P.outro.offsetLeft,
      A: anchor(rel(spot.intro, P.intro)),
      B: anchor(rel(spot.brew, brewStage)),
      O: anchor(rel(spot.outro, P.outro)),
      K: park(vw, vh),
    };
    last.t = NaN; // force a render
  }

  /* ---- intro entrance + hover, both plain tweened numbers the frame reads ---- */
  const IN = { v: 0 };
  gsap.to(IN, { v: 1, duration: 0.9, delay: INTRO_CUP_AT, ease: 'back.out(1.8)', onUpdate: () => { last.t = NaN; } });
  const HOV = { v: 0 };
  const hover = (on) => gsap.to(HOV, { v: on ? 1 : 0, duration: on ? 0.45 : 0.3, ease: on ? 'back.out(3)' : 'power2.out', onUpdate: () => { last.t = NaN; } });
  btn.addEventListener('mouseenter', () => hover(true));
  btn.addEventListener('mouseleave', () => hover(false));
  btn.addEventListener('focus', () => hover(true));
  btn.addEventListener('blur', () => hover(false));
  btn.addEventListener('click', () => ctx.goTo('brew', { offset: L.holdLen * 0.78 }));

  /* ---- steam loop: dashes that travel up each curl ---- */
  const steamPaths = [...svg.querySelectorAll('.cup-steam path')];
  const n = STEAM.length;
  steamPaths.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len * 0.55} ${len}`;
    p.style.strokeDashoffset = `${len * 0.55}`;
    p.dataset.len = len;
  });
  for (let i = 0; i < n; i++) {
    const pair = [steamPaths[i], steamPaths[i + n]];
    const len = +pair[0].dataset.len;
    gsap.fromTo(pair, { strokeDashoffset: len * 0.55, opacity: 0 }, {
      keyframes: [{ opacity: 1, duration: 0.25 }, { opacity: 1, duration: 1.2 }, { opacity: 0, duration: 0.55 }],
      strokeDashoffset: -len, duration: 2, ease: 'none', repeat: -1, delay: i * 0.62,
    });
  }
  /* the pour stream draws when refilling */
  stream.forEach((p) => { const len = p.getTotalLength(); p.style.strokeDasharray = `${len}`; p.dataset.len = len; });

  /* ---- the frame ---- */
  const last = { t: NaN, x: 0, y: 0, s: 0, r: 0, sw: 0, lvl: -1, steam: -1, splash: -1, pot: -1, on: null, op: -1 };

  function frame() {
    if (!L) return;
    const t = -gsap.getProperty(track, 'x');
    if (t === last.t && R.v === last.rv) return;
    last.t = t; last.rv = R.v;
    const { vw, vh, brewL, holdLen, tallyL, outroL, A, B, O, K } = L;
    const holdEnd = brewL + holdLen;
    const parkEnd = outroL - vw;

    let ox, oy, w, r = 0, level = 0.95, steam = 1, steamFade = 1, splashA = 0, on = false;

    if (t <= brewL) {
      /* intro → brew: the cup leaves the table and comes TOWARD you */
      const p = clamp(t / brewL);
      const pe = E.inOut(p);
      /* x lets go of the scrolling photo early (out-ease), so the cup reads
         as carried by the camera rather than dragged along with the table */
      ox = mix(A.ox - t, B.ox, E.out2(p));
      oy = mix(A.oy, B.oy, pe) - Math.sin(Math.PI * p) * vh * 0.07;
      w = mix(A.w, B.w, E.in(p));
      r = mix(-3, 0, p) + Math.sin(Math.PI * p) * 8;
      steam = mix(1, 1.05, p);
    } else if (t <= holdEnd) {
      /* brew hold: centre stage, jiggles as each card leaves */
      const hp = (t - brewL) / holdLen;
      ({ ox, oy, w } = B);
      let out = 0, busy = 0;
      for (let i = 0; i < 3; i++) {
        /* steam clears out of the way while a card flies up through it */
        const u = (hp - (POP.first + i * POP.gap)) / (POP.rise + POP.fly);
        if (u > 0 && u < 1) busy = Math.max(busy, Math.sin(u * Math.PI));
        const at = POP.first + i * POP.gap + POP.rise * 0.6;
        const d = (hp - at) / 0.1;
        out += clamp((hp - at) / POP.fly);
        if (d > 0 && d < 1) {
          const damp = 1 - d;
          r += Math.sin(d * Math.PI * 4) * 6 * damp * (i % 2 ? -1 : 1);
          oy += -Math.abs(Math.sin(d * Math.PI * 2)) * 10 * damp;
        }
        const s = (hp - (POP.first + i * POP.gap)) / (POP.rise + 0.05);
        if (s > 0 && s < 1) splashA = Math.max(splashA, Math.sin(s * Math.PI));
      }
      level = 0.95 - out * 0.035;
      steam = 1.05;
      steamFade = 1 - busy;
    } else if (t <= tallyL) {
      /* brew → park: the cup steps back and sits down in the corner */
      const p = clamp((t - holdEnd) / ((tallyL - holdEnd) * 0.82));
      const pe = E.inOut(p);
      ox = mix(B.ox - (t - holdEnd) * 0.35, K.ox, pe);
      oy = mix(B.oy, K.oy, pe) - Math.sin(Math.PI * p) * vh * 0.05;
      w = mix(B.w, K.w, E.out(p));
      r = Math.sin(Math.PI * p) * -10;
      level = 0.845;
      steam = mix(1.05, 0.9, p);
      on = p > 0.9;
    } else if (t <= parkEnd) {
      /* parked through the case studies: coffee drains with story progress */
      ({ ox, oy, w } = K);
      const p = clamp((t - tallyL) / Math.max(1, parkEnd - tallyL));
      level = mix(0.845, 0.14, p);
      steam = mix(0.9, 0.55, p);
      on = true;
    } else {
      /* → outro: back up, EMPTY, tipped */
      const p = clamp((t - parkEnd) / vw);
      const pe = E.inOut(p);
      ox = mix(K.ox, O.ox + (outroL - t), pe);
      oy = mix(K.oy, O.oy, pe) - Math.sin(Math.PI * p) * vh * 0.06;
      w = mix(K.w, O.w, pe);
      r = mix(0, -12, E.out(p));
      level = mix(0.14, 0, p);
      steam = mix(0.55, 0, p);
      on = p < 0.35;
      /* refill: straightens up, fills, steams again */
      const f = R.v * pe;
      level = mix(level, 0.9, f);
      steam = Math.max(steam, 1.1 * f);
      r = mix(r, -2, f);
      last.potV = f;
    }
    if (t <= parkEnd) last.potV = 0;

    /* hover on the parked mini cup: a little hop */
    if (on) { r += -9 * HOV.v; oy -= 6 * HOV.v; }

    /* intro entrance */
    const inV = IN.v;
    const scale = (w / BASE_W) * (0.5 + 0.5 * inV);
    setX(ox - BASE_W * ORIGIN.x); setY(oy - BASE_H * ORIGIN.y); setS(scale); setR(r);
    const op = clamp(inV * 1.4);
    if (Math.abs(op - last.op) > 0.005) { cup.style.opacity = op; last.op = op; }

    /* keep the doodle line a hand-drawn weight at every size */
    const rendered = w;
    const px = clamp(1.3 + rendered * 0.0095, 2.1, 4.6);
    const sw = (px * VB.w) / rendered;
    if (Math.abs(sw - last.sw) / sw > 0.02) { svg.style.setProperty('--cup-sw', sw.toFixed(3)); last.sw = sw; }

    if (Math.abs(level - last.lvl) > 0.002) { setLevel(svg, level); last.lvl = level; }

    const steamOp = clamp(level * 6) * clamp(steam) * steamFade;
    const sk = Math.max(0.4, steam);
    if (Math.abs(sk - last.steam) > 0.005 || Math.abs(steamOp - last.steamOp) > 0.01) {
      steamG.setAttribute('transform', `translate(104 84) scale(${sk.toFixed(3)}) translate(-104 -84)`);
      steamG.style.opacity = steamOp.toFixed(3);
      last.steam = sk; last.steamOp = steamOp;
    }
    if (Math.abs(splashA - last.splash) > 0.01) {
      splash.style.opacity = splashA.toFixed(3);
      splash.setAttribute('transform', `translate(100 90) scale(${(0.7 + splashA * 0.45).toFixed(3)}) translate(-100 -90)`);
      last.splash = splashA;
    }
    const pv = last.potV || 0;
    if (Math.abs(pv - last.pot) > 0.004) {
      pot.style.opacity = clamp(pv * 3).toFixed(3);
      pot.style.transform = `translateY(${((1 - clamp(pv * 2)) * -18).toFixed(2)}px)`;
      stream.forEach((p) => { p.style.strokeDashoffset = `${(+p.dataset.len) * (1 - clamp((pv - 0.2) / 0.5))}`; });
      last.pot = pv;
    }

    if (on !== last.on) {
      btn.classList.toggle('is-on', on);
      btn.tabIndex = on ? 0 : -1;
      if (!on && document.activeElement === btn) btn.blur();
      last.on = on;
    }
    if (on) {
      /* hit box = the cup's own footprint, so it stays inside --cup-zone-w/h */
      const bw = Math.max(48, K.w), bh = Math.max(48, K.w * 1.15);
      btn.style.transform = `translate(${(K.ox - bw * 0.5).toFixed(1)}px, ${(K.oy - bh).toFixed(1)}px)`;
      btn.style.width = `${bw}px`; btn.style.height = `${bh}px`;
    }
  }

  /* focus (Tab, or a click on a partly hidden button) makes the browser scroll
     overflow:hidden ancestors to reveal the element. #story and the panels
     then slide sideways on their own, out of sync with the one horizontal
     tween everything (this cup included) reads. keep them pinned at 0. */
  const unscroll = (e) => { const n = e.currentTarget; if (n.scrollLeft || n.scrollTop) { n.scrollLeft = 0; n.scrollTop = 0; } };
  [document.getElementById('story'), ...document.querySelectorAll('#track > .panel')].forEach((n) => n && n.addEventListener('scroll', unscroll));

  layout();
  frame();
  gsap.ticker.add(frame);
  ScrollTrigger.addEventListener('refresh', layout);
  window.addEventListener('intro:plate', layout);
  let rz = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(layout); });
}
