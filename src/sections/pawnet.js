/* ------------------------------------------------------------------
   PAWNET — chapter 03.
   story: title → two problem scenes (real photos + doodles acting it out)
   → pivot (40 chat reactions collapse into ONE claimed case)
   → three solution panels (real screens + hand-lettered pointers)
   → end card (walkthrough).

   layout rule: every part is an explicit vw width inside #pawnet, which is
   a flex row. two parts are wider than the viewport and use ctx.hold() so
   their stage stays still while scroll "plays" them.

   photo rule: a .pawnet-photo box keeps the photo's aspect and covers its
   stage (container units). doodles that belong to something IN the photo
   are anchored in image percentages, so they stay on the dog at any
   viewport. landscape uses the outpainted 16:9 file (coords from
   public/img/scenes/MANIFEST.md); portrait screens and a failed load use
   the raw 3:4 photo, which has its own coordinates.
   ------------------------------------------------------------------ */
import './pawnet.css';
import { PAWNET, walkthrough } from '../data.js';
import { em, esc } from '../lib.js';

/* ------------------------------------------------------------ sketch kit
   doodles are generated from points with seeded jitter + a catmull-rom
   smooth, so every outline is slightly uneven and overshoots where the pen
   would have started and stopped. same seed → same drawing every load. */
const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const f = (n) => Math.round(n * 10) / 10;

function smooth(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
const jitter = (pts, amt, seed) => { const r = rand(seed); return pts.map(([x, y]) => [x + (r() - .5) * amt, y + (r() - .5) * amt]); };

/* closed-ish loop: overshoots its own start a little, like a pen */
function loop(pts, amt, seed) {
  const j = jitter(pts, amt, seed);
  return smooth([...j, [j[0][0] + amt * .4, j[0][1] - amt * .3], j[1]]);
}
function rrect(x, y, w, h, r, { step = 16, amt = 1.6, seed = 7 } = {}) {
  const pts = [];
  const seg = (x1, y1, x2, y2) => { const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step)); for (let i = 0; i < n; i++) pts.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); };
  const arc = (cx, cy, a0) => { for (let i = 0; i < 3; i++) { const a = a0 + i * Math.PI / 6; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  seg(x + r, y, x + w - r, y); arc(x + w - r, y + r, -Math.PI / 2);
  seg(x + w, y + r, x + w, y + h - r); arc(x + w - r, y + h - r, 0);
  seg(x + w - r, y + h, x + r, y + h); arc(x + r, y + h - r, Math.PI / 2);
  seg(x, y + h - r, x, y + r); arc(x + r, y + r, Math.PI);
  return loop(pts, amt, seed);
}
function ring(cx, cy, rx, ry = rx, { n = 14, amt = 1.4, seed = 3, bumps = 0, bump = 0 } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const k = bumps ? 1 + bump * Math.abs(Math.sin(a * bumps / 2)) : 1;
    pts.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
  }
  return loop(pts, amt, seed);
}
/* a hand arrow: a bent shaft + two uneven head strokes */
function arrow(x1, y1, x2, y2, bend = .25, seed = 11) {
  const r = rand(seed);
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const shaft = smooth(jitter([[x1, y1], [(x1 + mx) / 2, (y1 + my) / 2], [mx, my], [(mx + x2) / 2, (my + y2) / 2], [x2, y2]], 1.2, seed));
  const a = Math.atan2(y2 - (my + y2) / 2, x2 - (mx + x2) / 2), L = 11;
  const h1 = a + Math.PI * .82 + (r() - .5) * .2, h2 = a - Math.PI * .8 + (r() - .5) * .2;
  return [shaft, `M${f(x2 + Math.cos(h1) * L)} ${f(y2 + Math.sin(h1) * L)} L${f(x2)} ${f(y2)} L${f(x2 + Math.cos(h2) * (L - 2))} ${f(y2 + Math.sin(h2) * (L - 2))}`];
}
const P = (d, cls = 'dd-draw') => `<path class="${cls}" d="${d}"/>`;

/* ------------------------------------------------------------ doodles */
const svg = (vb, inner, cls = '') => `<svg class="dd dd--sticker ${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">${inner}</svg>`;

/* shape drawn twice: fat white halo underneath, ink line on top */
const halo = (d) => `<path class="dd-halo" d="${d}"/>`;

function streetDog(seed = 5) {
  const body = smooth(jitter([[34, 44], [48, 37], [70, 36], [90, 39], [101, 49], [98, 60], [84, 63], [60, 63], [42, 62], [33, 55], [34, 44]], 1.5, seed));
  const head = smooth(jitter([[40, 42], [36, 30], [26, 22], [14, 23], [5, 28], [7, 34], [18, 38], [28, 44], [36, 50]], 1.2, seed + 1));
  const ear = smooth(jitter([[24, 23], [28, 12], [36, 15], [35, 27]], 1, seed + 2));
  const legs = ['M44 61 C43 70 41 78 40 86', 'M54 63 C54 72 53 80 53 86', 'M84 62 C85 71 86 79 87 86', 'M95 57 C97 68 99 78 100 86'];
  const tail = smooth(jitter([[100, 47], [110, 42], [115, 32], [110, 23]], 1, seed + 3));
  return svg('0 0 122 92',
    halo(body) + halo(head) + halo(ear) + legs.map(halo).join('') + halo(tail) +
    P(body, 'dd-draw dd-fill') + P(head, 'dd-draw dd-fill') + P(ear, 'dd-draw dd-fill') + legs.map((l) => P(l)).join('') + P(tail) +
    '<circle class="dd-ink" cx="19" cy="28" r="1.8"/><circle class="dd-ink" cx="5.5" cy="30" r="2.4"/>', 'pawnet-dd-dog');
}

function question(seed = 21) {
  const q = smooth(jitter([[4, 14], [6, 5], [16, 2], [25, 7], [24, 17], [15, 23], [14, 32]], 1.4, seed));
  return svg('0 0 30 44', halo(q) + P(q) + '<circle class="dd-ink" cx="14.5" cy="40" r="2.6"/>', 'pawnet-dd-q');
}

function scooter(flip = false, seed = 31) {
  const wheelA = ring(36, 112, 16, 16, { seed, amt: 1.2, n: 12 });
  const wheelB = ring(134, 112, 16, 16, { seed: seed + 1, amt: 1.2, n: 12 });
  const rear = smooth(jitter([[14, 110], [12, 92], [28, 80], [52, 79], [72, 82], [82, 94], [84, 104], [118, 104], [120, 110], [14, 110]], 1.4, seed + 2));
  const shield = smooth(jitter([[112, 104], [118, 86], [118, 64], [112, 46]], 1.2, seed + 3));
  const fork = smooth(jitter([[112, 50], [122, 72], [128, 94], [134, 112]], 1, seed + 4));
  const bar = 'M100 42 C108 40 118 38 126 37';
  const torso = smooth(jitter([[54, 80], [58, 62], [66, 50], [74, 44]], 1, seed + 5));
  const head = ring(80, 28, 13, 13, { seed: seed + 6, n: 11, amt: 1 });
  const helmet = smooth(jitter([[66, 30], [67, 16], [80, 12], [93, 18], [94, 30], [66, 30]], 1, seed + 7));
  const arm = smooth(jitter([[70, 50], [86, 55], [100, 48], [110, 42]], 1, seed + 8));
  const leg = smooth(jitter([[56, 80], [72, 84], [86, 90], [96, 102]], 1, seed + 9));
  const lines = [wheelA, wheelB, rear, shield, fork, bar, torso, head, helmet, arm, leg];
  return svg('0 0 170 132',
    lines.map(halo).join('') +
    P(rear, 'dd-draw dd-fill') + P(wheelA, 'dd-draw dd-fill') + P(wheelB, 'dd-draw dd-fill') + P(shield) + P(fork) + P(bar) +
    P(torso) + P(leg) + P(head, 'dd-draw dd-fill') + P(helmet, 'dd-draw pawnet-fill-terra') + P(arm) +
    '<circle class="dd-ink" cx="87" cy="31" r="1.6"/>',
    `pawnet-dd-scooter${flip ? ' is-flip' : ''}`);
}

/* nawab, a shih tzu: a scalloped fluff-ball with his tongue out (as in the photo) */
function nawab(seed = 41) {
  const fluff = ring(60, 60, 44, 38, { n: 26, amt: 2.2, seed, bumps: 13, bump: .07 });
  const earL = smooth(jitter([[22, 44], [10, 58], [12, 80], [24, 88], [32, 76]], 1.6, seed + 1));
  const earR = smooth(jitter([[98, 44], [110, 58], [108, 80], [96, 88], [88, 76]], 1.6, seed + 2));
  const knot = smooth(jitter([[50, 24], [48, 12], [60, 6], [72, 12], [70, 24]], 1.2, seed + 3));
  const bow = 'M52 22 L44 16 L46 28 Z M68 22 L76 16 L74 28 Z';
  const mouth = 'M50 76 C54 81 58 81 60 77 C62 81 66 81 70 76';
  const tongue = smooth(jitter([[55, 79], [55, 90], [60, 94], [65, 90], [65, 79]], .8, seed + 4));
  return svg('0 0 120 110',
    [fluff, earL, earR, knot].map(halo).join('') +
    P(earL, 'dd-draw dd-fill') + P(earR, 'dd-draw dd-fill') + P(fluff, 'dd-draw dd-fill') + P(knot, 'dd-draw dd-fill') +
    P(bow, 'dd-draw pawnet-fill-terra') + P(tongue, 'dd-draw pawnet-fill-pink') + P(mouth) +
    '<circle class="dd-ink" cx="45" cy="56" r="4.2"/><circle class="dd-ink" cx="75" cy="56" r="4.2"/><ellipse class="dd-ink" cx="60" cy="68" rx="6" ry="4.4"/>' +
    '<circle cx="46.5" cy="54.5" r="1.2" style="fill:#fff;stroke:none"/><circle cx="76.5" cy="54.5" r="1.2" style="fill:#fff;stroke:none"/>',
    'pawnet-dd-nawab');
}

const pawPrint = (rot = 0) =>
  `<svg class="pawnet-print" viewBox="0 0 40 40" aria-hidden="true" style="rotate:${rot}deg"><g fill="currentColor"><ellipse cx="20" cy="27" rx="9" ry="7.5"/><ellipse cx="8.5" cy="16" rx="3.6" ry="4.6" transform="rotate(-24 8.5 16)"/><ellipse cx="16" cy="9" rx="3.6" ry="4.8" transform="rotate(-8 16 9)"/><ellipse cx="24.5" cy="9" rx="3.6" ry="4.8" transform="rotate(8 24.5 9)"/><ellipse cx="31.5" cy="16" rx="3.6" ry="4.6" transform="rotate(24 31.5 16)"/></g></svg>`;

/* a hand-drawn arrow svg sized to its box */
function arrowSvg(w, h, from, to, bend, seed, cls = '') {
  const [s, hd] = arrow(from[0], from[1], to[0], to[1], bend, seed);
  return `<svg class="dd pawnet-arrow ${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${P(s)}${P(hd)}</svg>`;
}

/* ------------------------------------------------------------ content */
const SCREEN_ALT = {
  '/img/pawnet/rescue.png': 'pawnet rescue feed: a report injured animal button, then nearby cases such as “dog, hit by vehicle”, each with a severity tag, a status tag and a claim or details action',
  '/img/pawnet/detail.png': 'case detail for a cow with a minor wound: a five-step progress bar at “on route”, directions, call and message, the reporter, a timeline and the team’s latest update',
  '/img/pawnet/report.png': 'report emergency sheet: pick critical, moderate or stable, phone number verified with an otp, location detected automatically, optional photos and a note',
  '/img/pawnet/lost.png': 'lost pet page for bruno, a golden retriever: ai match leads at 87 and 41 percent, with the owner’s photo and the found dog side by side',
};

/* raw photo: 1800×2400 portrait. outpaint: 2400×1340. anchors are in % of each. */
const SCENES = {
  groups: { raw: '/img/raw/IMG_4115.jpg', alt: 'khushi bends down to pet a black street dog on a cobbled hill path, paper plates of food scattered around' },
  double: { raw: '/img/raw/IMG_7274.jpg', alt: 'two wet street dogs stand close together on a red and yellow tiled path beside a snack kiosk' },
};
const pos = (w, r, extra = '') => `style="--x16:${w[0]};--y16:${w[1]};--xr:${r[0]};--yr:${r[1]};${extra}"`;

const PIPE = [
  ['reported', '#C75B39'], ['assigned', '#D4900A'], ['on route', '#4A6FA5'], ['transport', '#7B5EA7'], ['rescued', '#3D7A5F'],
];

function photo(p, scene, { fy16 = .5, fyr = .5, fxr = .5 } = {}, anchors = '') {
  const s = SCENES[scene];
  return `
    <div class="pawnet-photo" style="--fy16:${fy16};--fyr:${fyr};--fxr:${fxr}" data-raw="${s.raw}">
      <picture>
        <source media="(orientation: portrait)" srcset="${s.raw}" width="1800" height="2400">
        <img class="pawnet-photo__img" src="${p.bg}" width="2400" height="1340" alt="${esc(s.alt)}" loading="lazy" decoding="async">
      </picture>
      ${anchors}
    </div>`;
}

function card(p, i, extra = '') {
  return `
    <div class="pawnet-card ${extra}">
      <p class="pawnet-kicker mono">problem 0${i + 1} / 02</p>
      <h3 class="pawnet-card__title">${em(p.title)}</h3>
      <p class="pawnet-card__body">${em(p.body)}</p>
    </div>`;
}

function sceneGroups(p) {
  const chat = [
    ['in', '<span class="pawnet-chat__pic" aria-hidden="true"></span>hurt dog near the benches, pls help'],
    ['react', '😢 <b class="pawnet-count">40</b>'],
    ['in', 'omg so sad 💔'],
    ['in', 'sharing in the other group'],
    ['in pawnet-chat__last', esc(p.bubble)],
  ];
  const phone = rrect(6, 6, 208, 388, 30, { seed: 13, amt: 2.2 });
  const notch = smooth(jitter([[84, 22], [110, 20], [136, 22]], 1, 9));
  return `
  <article class="pawnet-scene pawnet-scene--groups" aria-labelledby="pawnet-p1">
    <div class="pawnet-stage">
      ${photo(p, 'groups', { fy16: .55, fyr: .62, fxr: .42 }, `
        <div class="pawnet-anchor pawnet-anchor--dogring" ${pos([.635, .79], [.64, .6])}>
          <div class="pawnet-dogring">${svg('0 0 200 140', P(ring(100, 70, 88, 56, { seed: 61, amt: 5, n: 16 })), 'pawnet-dd-ring')}</div>
        </div>
        <div class="pawnet-anchor pawnet-anchor--ask" ${pos([.5, .28], [.62, .45])}>
          <p class="bubble pawnet-bubble pawnet-ask" style="--tail-x:62%">${esc(p.bubble)}</p>
        </div>`)}
      <div class="pawnet-scrim" aria-hidden="true"></div>
      ${card(p, 0).replace('<h3 class="pawnet-card__title">', '<h3 class="pawnet-card__title" id="pawnet-p1">')}
      <div class="pawnet-chatphone" aria-hidden="true">
        <svg class="dd dd--sticker pawnet-chatphone__frame" viewBox="0 0 220 400" preserveAspectRatio="none">${halo(phone)}${P(phone, 'dd-draw dd-fill')}${P(notch)}</svg>
        <div class="pawnet-chat">
          <p class="pawnet-chat__group mono">street dogs · sector 9<br><span>214 members</span></p>
          ${chat.map(([k, t]) => `<p class="pawnet-chat__msg ${k.split(' ').map((c) => c.startsWith('pawnet') ? c : 'is-' + c).join(' ')}">${t}</p>`).join('')}
        </div>
      </div>
    </div>
  </article>`;
}

function sceneDouble(p) {
  const tick = smooth(jitter([[2, 8], [7, 13], [18, 2]], .6, 4));
  return `
  <article class="pawnet-scene pawnet-scene--double" aria-labelledby="pawnet-p2">
    <div class="pawnet-stage">
      ${photo(p, 'double', { fy16: .6, fyr: .6, fxr: .5 }, `
        <div class="pawnet-anchor pawnet-anchor--scootL" ${pos([.3, .87], [.36, .72])}><div class="pawnet-scoot pawnet-scoot--l">${scooter(false, 31)}</div></div>
        <div class="pawnet-anchor pawnet-anchor--scootR" ${pos([.62, .88], [.7, .78])}><div class="pawnet-scoot pawnet-scoot--r">${scooter(true, 47)}</div></div>
        <div class="pawnet-anchor pawnet-anchor--oops" ${pos([.5, .3], [.52, .36])}>
          <p class="bubble pawnet-bubble pawnet-oops" style="--tail-x:24%">${esc(p.bubble)}</p>
        </div>`)}
      <div class="pawnet-scrim" aria-hidden="true"></div>
      ${card(p, 1, 'pawnet-card--right').replace('<h3 class="pawnet-card__title">', '<h3 class="pawnet-card__title" id="pawnet-p2">')}
      <div class="pawnet-meanwhile" aria-hidden="true">
        <p class="pawnet-meanwhile__label">meanwhile, across town</p>
        <div class="pawnet-meanwhile__row">
          ${[5, 8, 12].map((s, i) => `<div class="pawnet-lonely pawnet-lonely--${i}"><span class="pawnet-lonely__q">${question(20 + s)}</span>${streetDog(s)}</div>`).join('')}
        </div>
      </div>
      <div class="pawnet-reporter" aria-hidden="true">
        <p class="pawnet-reporter__who mono">the reporter, 3 days later</p>
        <p class="pawnet-reporter__msg">any update on the dog? <svg class="pawnet-reporter__tick" viewBox="0 0 20 16">${P(tick, '')}</svg></p>
        <p class="pawnet-reporter__none mono">no replies</p>
      </div>
    </div>
  </article>`;
}

function pivot() {
  const mess = ['😢', 'is anyone going??', 'so sad 💔', 'who’s near?', '😢😢', 'sharing!!', 'someone pls', '🙏'];
  return `
  <article class="pawnet-pivot" aria-labelledby="pawnet-pivot-h">
    <div class="pawnet-stage pawnet-pivot__stage">
      <div class="pawnet-pivot__copy">
        <p class="pawnet-kicker pawnet-kicker--dark mono">the fix</p>
        <h3 class="pawnet-pivot__title" id="pawnet-pivot-h">40 reactions.<br>${em('*one*')} rescuer.</h3>
        <p class="pawnet-pivot__sub">so i built pawnet: every report has an owner, and everyone else can see it’s taken.</p>
      </div>
      <div class="pawnet-pivot__mess" aria-hidden="true">
        ${mess.map((m, i) => `<span class="pawnet-mess pawnet-mess--${i}">${esc(m)}</span>`).join('')}
        <div class="pawnet-case">
          <div class="pawnet-case__main">
            <span class="pawnet-case__pic"></span>
            <div>
              <p class="pawnet-case__name">dog, hit by vehicle</p>
              <p class="pawnet-case__tags"><span class="pawnet-tag pawnet-tag--critical">critical</span><span class="pawnet-tag pawnet-tag--assigned">assigned</span></p>
            </div>
          </div>
          <p class="pawnet-case__owner"><span class="pawnet-case__lock">🔒</span> claimed by <b>you</b></p>
          <span class="pawnet-case__stamp">claimed!</span>
        </div>
        <p class="pawnet-locked pawnet-locked--a">rescuer, 0.6km away · <b>case locked</b></p>
        <p class="pawnet-locked pawnet-locked--b">rescuer, 1.2km away · <b>case locked</b></p>
      </div>
    </div>
  </article>`;
}

function phone(src, i) {
  return `
    <div class="pawnet-phone pawnet-phone--${i}">
      <div class="pawnet-phone__body">
        <div class="pawnet-phone__screen">
          <div class="pawnet-skel" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          <img src="${src}" width="780" height="1688" alt="${esc(SCREEN_ALT[src] || 'pawnet app screen')}" loading="lazy" decoding="async">
        </div>
      </div>
    </div>`;
}

/* the extra illustration per fix: each one shows the pointer it explains */
function illo(s) {
  if (s.id === 'claim') {
    return `
      <div class="pawnet-illo pawnet-sev" role="img" aria-label="severity tags: critical in terra, moderate in amber, stable in light brown, resolved in green, each with its word">
        ${[['critical', 'critical'], ['moderate', 'moderate'], ['stable', 'stable'], ['resolved', 'resolved']].map(([k, l]) => `<span class="pawnet-tag pawnet-tag--${k} pawnet-sev__tag" aria-hidden="true">${l}</span>`).join('')}
        <p class="pawnet-sev__note hand" aria-hidden="true">colour-blind? still readable.</p>
      </div>`;
  }
  if (s.id === 'track') {
    const w = 520, y = 34;
    const line = smooth(jitter([[14, y], [120, y - 5], [250, y + 4], [380, y - 4], [506, y + 1]], 2, 71));
    return `
      <div class="pawnet-illo pawnet-pipe" role="img" aria-label="a case moves through five stops: reported, assigned, on route, transport, rescued">
        <svg class="dd pawnet-pipe__line" viewBox="0 0 ${w} 70" preserveAspectRatio="none" aria-hidden="true">${P(line, 'pawnet-pipe__base')}${P(line, 'pawnet-pipe__fill')}</svg>
        <ol class="pawnet-pipe__stops" aria-hidden="true">
          ${PIPE.map(([l, c], i) => `<li class="pawnet-stop is-lit" style="--c:${c}"><span class="pawnet-stop__dot"></span><span class="pawnet-stop__label">${l}</span></li>`).join('')}
        </ol>
      </div>`;
  }
  if (s.id === 'lost') {
    const arcs = [[0, .4, '#C75B39'], [.4, .7, '#D4900A'], [.7, 1, '#3D7A5F']].map(([a, b, c]) => {
      const pt = (t) => [100 - 78 * Math.cos(Math.PI * t), 96 - 78 * Math.sin(Math.PI * t)];
      const [x1, y1] = pt(a + .006), [x2, y2] = pt(b - .006);
      return `<path d="M${f(x1)} ${f(y1)} A78 78 0 0 1 ${f(x2)} ${f(y2)}" style="stroke:${c};stroke-width:14;fill:none;stroke-linecap:butt"/>`;
    }).join('');
    return `
      <div class="pawnet-illo pawnet-meter" role="img" aria-label="match confidence gauge: 70 percent and up is green, 40 percent and up is amber, below 40 is terra">
        <svg viewBox="0 0 200 112" aria-hidden="true">
          ${arcs}
          <path d="M18 96 A82 82 0 0 1 182 96" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:3 5"/>
          <g class="pawnet-meter__needle"><path d="M100 96 L100 30" style="stroke:var(--ink);stroke-width:3.4;stroke-linecap:round"/></g>
          <circle cx="100" cy="96" r="7" style="fill:var(--ink)"/>
        </svg>
        <p class="pawnet-meter__read" aria-hidden="true"><b class="pawnet-meter__val">87%</b> <span class="pawnet-meter__zone">check this one first</span></p>
        <ul class="pawnet-meter__legend mono" aria-hidden="true"><li style="--c:#3D7A5F">≥70%</li><li style="--c:#D4900A">≥40%</li><li style="--c:#C75B39">below</li></ul>
      </div>`;
  }
  return '';
}

function solution(s, i) {
  return `
  <article class="pawnet-sol pawnet-sol--${s.id}" aria-labelledby="pawnet-s-${s.id}">
    <div class="pawnet-sol__copy">
      <p class="pawnet-kicker mono"><span class="pawnet-kicker__num">fix 0${i + 1}</span> / 03</p>
      <h3 class="pawnet-sol__title" id="pawnet-s-${s.id}">${em(s.title)}</h3>
      <p class="pawnet-sol__body">${em(s.body)}</p>
      ${illo(s)}
    </div>
    <div class="pawnet-sol__shots pawnet-sol__shots--${s.screens.length}">
      ${s.screens.map((src, k) => phone(src, k)).join('')}
      <ul class="pawnet-notes">
        ${s.pointers.map((t, k) => `
          <li class="pawnet-note pawnet-note--${k}">
            <span class="pawnet-note__text">${em(t)}</span>
            ${k === 0 ? arrowSvg(120, 80, [8, 14], [108, 66], -.22, 90 + i) : arrowSvg(120, 80, [110, 64], [12, 12], -.2, 95 + i)}
          </li>`).join('')}
      </ul>
    </div>
  </article>`;
}

function endCard() {
  return `
  <article class="pawnet-end" aria-labelledby="pawnet-end-h">
    <div class="pawnet-end__trail" aria-hidden="true">${[-8, 14, -4, 18, 2, 22].map((r, i) => `<span class="pawnet-end__step pawnet-end__step--${i}">${pawPrint(90 + r)}</span>`).join('')}</div>
    <div class="pawnet-end__inner">
      <p class="pawnet-kicker mono">that’s the short version</p>
      <h3 class="pawnet-end__title" id="pawnet-end-h">five roles, every flow, <br>the whole ${em('*why*')}.</h3>
      <p class="pawnet-end__body">happy to walk you through the rest over a call.</p>
      <div class="pawnet-end__actions">
        <a class="btn pawnet-end__cta" href="${walkthrough('pawnet')}">${esc(PAWNET.cta)} <span aria-hidden="true">→</span></a>
        <a class="pawnet-end__link" href="${PAWNET.caseStudy}" target="_blank" rel="noreferrer">peek the case study&nbsp;<span aria-hidden="true">↗</span><span class="sr"> (opens in a new tab)</span></a>
      </div>
      <button type="button" class="pawnet-end__next hand" data-go="outro">last sip <span aria-hidden="true">→</span></button>
    </div>
  </article>`;
}

function title() {
  const arr = arrowSvg(160, 60, [6, 34], [150, 26], .12, 55);
  return `
  <header class="pawnet-title">
    <p class="pawnet-kicker mono">chapter 03 · rescue app · 2025</p>
    <h2 class="pawnet-title__h" aria-label="pawnet">${[...'pawnet'].map((c) => `<span class="pawnet-title__m"><span class="pawnet-title__c">${c}</span></span>`).join('')}</h2>
    <p class="pawnet-title__what">${em(PAWNET.what)}, for indian cities.</p>
    <p class="pawnet-title__role mono">${esc(PAWNET.role)}</p>
    <figure class="pawnet-polaroid">
      <span class="pawnet-polaroid__tape" aria-hidden="true"></span>
      <img src="/img/raw/nawab.jpg" width="1800" height="2400" loading="lazy" decoding="async" alt="khushi hugging nawab, her shih tzu, on a sofa">
      <figcaption class="hand">it started with loving this guy. (nawab, mine)</figcaption>
      <div class="pawnet-polaroid__doodle">${nawab()}</div>
    </figure>
    <p class="pawnet-title__next hand">the problem ${arr}</p>
  </header>`;
}

/* ------------------------------------------------------------ build */
export function build(el) {
  el.classList.add('pawnet');
  el.innerHTML = `
    ${title()}
    <div class="pawnet-part" id="pawnet-problem">
      ${sceneGroups(PAWNET.problems[0])}
      ${sceneDouble(PAWNET.problems[1])}
    </div>
    <div class="pawnet-part" id="pawnet-solution">
      ${pivot()}
      ${PAWNET.solutions.map(solution).join('')}
    </div>
    ${endCard()}`;

  /* landscape photo failed → raw portrait photo + its own anchor coordinates */
  el.querySelectorAll('.pawnet-photo').forEach((box) => {
    const img = box.querySelector('img');
    const fail = () => {
      if (box.classList.contains('is-raw')) return;
      box.classList.add('is-raw');
      box.querySelector('source')?.remove();
      img.width = 1800; img.height = 2400;
      img.src = box.dataset.raw;
    };
    img.addEventListener('error', fail, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  });
  /* screen missing → keep the drawn skeleton visible */
  el.querySelectorAll('.pawnet-phone img').forEach((img) => {
    const miss = () => img.closest('.pawnet-phone').classList.add('is-missing');
    img.addEventListener('error', miss, { once: true });
    img.addEventListener('load', () => img.closest('.pawnet-phone').classList.add('is-loaded'), { once: true });
  });
}

/* ------------------------------------------------------------ motion
   every tween answers: what does it tell you? messages ARRIVING (chaos grows),
   scooters CONVERGING (duplicated effort), bubbles COLLAPSING into one card
   (the idea), stops LIGHTING in order (the pipeline), needle SWEEPING across
   thresholds (the colour rule). decoration-only motion was cut. */
export function motion(ctx, el) {
  const { gsap } = ctx;
  const q = (s, r = el) => r.querySelector(s);
  const qa = (s, r = el) => [...r.querySelectorAll(s)];
  const count = qa('.pawnet-count');

  /* reduced / static: final state, nothing moves */
  if (!ctx.hTween) {
    gsap.set(q('.pawnet-meter__needle'), { rotation: meterAngle(87), svgOrigin: '100 96' });
    return;
  }

  /* chrome goes light over the photos and the brown pivot. one shared set,
     so two neighbouring triggers can't race each other off/on. */
  const chromeEl = document.getElementById('chrome');
  const pivotEl = q('.pawnet-pivot');
  const darkOn = new Set();
  qa('.pawnet-scene, .pawnet-pivot').forEach((part) => ctx.st({
    trigger: part, start: 'left 4%', end: 'right 96%',
    onToggle: (s) => { s.isActive ? darkOn.add(part) : darkOn.delete(part); chromeEl?.classList.toggle('is-dark', darkOn.size > 0); },
  }));

  /* ---------- title */
  const t = ctx.tl(q('.pawnet-title'), { start: 'left 70%', toggleActions: 'play none none reverse' });
  t.fromTo(qa('.pawnet-title__c'), { yPercent: 115, rotation: 8 }, { yPercent: 0, rotation: 0, duration: .8, stagger: .045, ease: 'back.out(1.6)' })
    .fromTo(qa('.pawnet-title__what, .pawnet-title__role'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .08, ease: 'power3.out' }, .3)
    .fromTo(q('.pawnet-polaroid'), { y: -70, rotation: 14, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: .9, ease: 'back.out(1.3)' }, .35)
    .add(ctx.draw(q('.pawnet-polaroid__doodle'), { duration: .9, stagger: .05 }), .9)
    .add(ctx.draw(q('.pawnet-title__next'), { duration: .7 }), 1);

  /* ---------- problem 1: the group chat fills while the scene is held */
  const g = q('.pawnet-scene--groups');
  ctx.hold(g, q('.pawnet-stage', g));
  const gt = ctx.tl(g, { start: 'left 55%', end: 'right right', scrub: .6 });
  const msgs = qa('.pawnet-chat__msg', g);
  const counter = { v: 1 };
  gt.fromTo(q('.pawnet-photo__img', g), { scale: 1.1 }, { scale: 1, duration: 12, ease: 'none' }, 0)
    .fromTo(q('.pawnet-card', g), { y: 50, autoAlpha: 0, rotation: -5 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 1.2, ease: 'power3.out' }, 0)
    .fromTo(q('.pawnet-chatphone', g), { y: 80, rotation: 8, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out' }, .6)
    .add(ctx.draw(q('.pawnet-chatphone__frame', g), { duration: 1.2 }), .8)
    .fromTo(q('.pawnet-chat__group', g), { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 1.6);
  msgs.forEach((m, i) => {
    gt.fromTo(m, { y: 22, scale: .92, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: .7, ease: 'back.out(2)' }, 2.2 + i * 1.5);
  });
  gt.fromTo(counter, { v: 1 }, { v: 40, duration: 4.2, ease: 'power1.in', onUpdate: () => count.forEach((c) => (c.textContent = Math.round(counter.v))) }, 3.7)
    .add(ctx.draw(q('.pawnet-dogring', g), { duration: 1.2 }), 5.6)
    .fromTo(q('.pawnet-ask', g), { scale: .4, rotation: -10, autoAlpha: 0 }, { scale: 1, rotation: -3, autoAlpha: 1, duration: 1, ease: 'back.out(2.2)' }, 9.4);

  /* ---------- problem 2: two scooters converge on the same dog */
  const d = q('.pawnet-scene--double');
  gsap.fromTo(q('.pawnet-photo__img', d), { xPercent: -3, scale: 1.08 }, {
    xPercent: 3, scale: 1.08, ease: 'none',
    scrollTrigger: { containerAnimation: ctx.hTween, trigger: d, start: 'left right', end: 'right left', scrub: true },
  });
  const dt = ctx.tl(d, { start: 'left 80%', end: 'left 5%', scrub: .6 });
  dt.fromTo(q('.pawnet-card', d), { y: 50, autoAlpha: 0, rotation: 4 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 1, ease: 'power3.out' }, 0)
    .fromTo(q('.pawnet-scoot--l', d), { x: () => -window.innerWidth * .45, rotation: -4 }, { x: 0, rotation: 0, duration: 2.4, ease: 'power2.out' }, .2)
    .fromTo(q('.pawnet-scoot--r', d), { x: () => window.innerWidth * .45, rotation: 4 }, { x: 0, rotation: 0, duration: 2.4, ease: 'power2.out' }, .2)
    .add(ctx.draw(q('.pawnet-scoot--l', d), { duration: 1, stagger: .03 }), .2)
    .add(ctx.draw(q('.pawnet-scoot--r', d), { duration: 1, stagger: .03 }), .2)
    .fromTo(q('.pawnet-oops', d), { scale: .4, rotation: 8, autoAlpha: 0 }, { scale: 1, rotation: 2, autoAlpha: 1, duration: .8, ease: 'back.out(2.2)' }, 2.4)
    .fromTo(q('.pawnet-meanwhile__label', d), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .6 }, 2.9)
    .fromTo(qa('.pawnet-lonely', d), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .25 }, 3)
    .add(ctx.draw(q('.pawnet-meanwhile', d), { duration: .6, stagger: .02 }), 3)
    .fromTo(q('.pawnet-reporter', d), { autoAlpha: 0, y: 40, rotation: 3 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .8, ease: 'power3.out' }, 3.8);

  /* ---------- pivot: the mess collapses into one claimed case */
  const pv = pivotEl;
  const messBox = q('.pawnet-pivot__mess', pv);
  const bubbles = qa('.pawnet-mess', pv);
  /* timing: the chaos must be fully on screen when the panel lands
     ('left left' ≈ t 3.9 of 8), and the collapse happens only while held. */
  ctx.hold(pv, q('.pawnet-stage', pv));
  const pt = ctx.tl(pv, { start: 'left 75%', end: 'right right', scrub: .7, invalidateOnRefresh: true });
  pt.fromTo(qa('.pawnet-pivot__copy > *', pv), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: .3, ease: 'power3.out' }, 0)
    .fromTo(bubbles, { scale: .5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .5, stagger: .22, ease: 'back.out(2.4)' }, .6)
    .fromTo(bubbles, { x: 0, y: 0, rotation: 0 }, {
      x: (i, b) => messBox.offsetWidth / 2 - (b.offsetLeft + b.offsetWidth / 2),
      y: (i, b) => messBox.offsetHeight / 2 - (b.offsetTop + b.offsetHeight / 2),
      rotation: (i) => (i % 2 ? 20 : -20), scale: .2, autoAlpha: 0,
      duration: 1.4, stagger: .06, ease: 'power3.in',
    }, 4.3)
    .fromTo(q('.pawnet-case', pv), { scale: .3, autoAlpha: 0, rotation: -8 }, { scale: 1, autoAlpha: 1, rotation: -2, duration: 1, ease: 'back.out(1.8)' }, 5.5)
    .fromTo(q('.pawnet-case__stamp', pv), { scale: 2.6, rotation: -30, autoAlpha: 0 }, { scale: 1, rotation: -12, autoAlpha: 1, duration: .5, ease: 'power4.in' }, 6.5)
    /* one tween per row: a staggered fromTo here left the second row visible before its turn */
    .fromTo(q('.pawnet-locked--a', pv), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .5, immediateRender: true }, 7)
    .fromTo(q('.pawnet-locked--b', pv), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .5, immediateRender: true }, 7.25)
    .to({}, { duration: .6 });

  /* ---------- solutions */
  qa('.pawnet-sol').forEach((s) => {
    /* starts as the panel's edge enters, done (~1.1s) before it lands, so
       arriving by the nav never shows a half-built panel */
    const st = ctx.tl(s, { start: 'left 88%', toggleActions: 'play none none none' });
    st.fromTo(qa('.pawnet-sol__copy > :not(.pawnet-illo)', s), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, stagger: .06, ease: 'power3.out' }, 0)
      .fromTo(qa('.pawnet-phone__body', s), { y: 110, rotation: 6, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: .8, stagger: .1, ease: 'expo.out' }, .1)
      .fromTo(qa('.pawnet-note__text', s), { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .4, stagger: .12, ease: 'back.out(2)' }, .5)
      .add(ctx.draw(q('.pawnet-notes', s), { duration: .45, stagger: .08 }), .55);
    if (s.classList.contains('pawnet-sol--claim')) {
      st.fromTo(qa('.pawnet-sev__tag, .pawnet-sev__note', s), { autoAlpha: 0, y: 16, rotation: (i) => (i % 2 ? 6 : -6) }, { autoAlpha: 1, y: 0, rotation: 0, duration: .5, stagger: .1, ease: 'back.out(2)' }, .5);
    }
  });

  /* pipeline: stops light in order as the panel settles */
  const pipe = q('.pawnet-pipe');
  const stops = qa('.pawnet-stop', pipe);
  const fill = q('.pawnet-pipe__fill', pipe);
  const flen = fill.getTotalLength();
  fill.style.strokeDasharray = flen;
  const light = (p) => {
    fill.style.strokeDashoffset = flen * (1 - p);
    stops.forEach((s, i) => s.classList.toggle('is-lit', p >= i / (stops.length - 1) - .001));
  };
  light(0);
  ctx.st({ trigger: pipe.closest('.pawnet-sol'), start: 'left 60%', end: 'left 12%', scrub: true, onUpdate: (s) => light(s.progress) });

  /* match meter: needle sweeps across the three colour zones */
  const lost = q('.pawnet-sol--lost');
  const val = q('.pawnet-meter__val', lost), zone = q('.pawnet-meter__zone', lost), read = q('.pawnet-meter__read', lost);
  const m = { v: 12 };
  const paint = () => {
    const v = Math.round(m.v);
    val.textContent = v + '%';
    const [z, c] = v >= 70 ? ['check this one first', 'green'] : v >= 40 ? ['maybe, worth a look', 'amber'] : ['unlikely', 'terra'];
    zone.textContent = z; read.dataset.zone = c;
  };
  gsap.set(q('.pawnet-meter__needle', lost), { svgOrigin: '100 96', rotation: meterAngle(12) });
  const mt = ctx.tl(lost, { start: 'left 55%', end: 'left 12%', scrub: .5 });
  mt.fromTo(m, { v: 12 }, { v: 87, ease: 'power1.inOut', duration: 1, onUpdate: paint }, 0)
    .fromTo(q('.pawnet-meter__needle', lost), { rotation: meterAngle(12) }, { rotation: meterAngle(87), svgOrigin: '100 96', ease: 'power1.inOut', duration: 1 }, 0);
  paint();

  /* ---------- end: paw prints walk you to the button */
  const e = q('.pawnet-end');
  /* fires the moment the card's edge enters and is done in ~0.6s, so the
     button is never mid-fade once the card is on screen (even via a nav glide).
     no reverse: scrolling back never greys the cta out again. */
  /* the cta never fades: a nav glide crosses the whole card in under a second,
     so any opacity tween on it reads as a greyed-out button. it only slides. */
  ctx.tl(e, { start: 'left 150%', toggleActions: 'play none none none' })
    .fromTo(qa('.pawnet-end__inner > :not(.pawnet-end__actions, .pawnet-end__next)', e), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .4, stagger: .05, ease: 'power3.out' }, 0)
    .fromTo(qa('.pawnet-end__actions, .pawnet-end__next', e), { y: 18 }, { y: 0, duration: .5, stagger: .05, ease: 'power3.out' }, .05)
    .fromTo(qa('.pawnet-end__step', e), { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: .25, stagger: .07, ease: 'back.out(3)' }, 0);

  ctx.wobble(qa('.pawnet-polaroid__doodle svg'), { rot: 4, y: 3, dur: 2.2 });
}

const meterAngle = (v) => -90 + (v / 100) * 180;
