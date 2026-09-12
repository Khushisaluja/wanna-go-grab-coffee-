/* ------------------------------------------------------------------
   COX & KINGS chapter.
   title → 3 problem scenes (photo + doodle) → before/after wipe (held)
   → 3 fixes (screens + hand-lettered pointers) → result + ask.

   geometry rules, so doodles never drift off their photo:
   - every scene photo sits in a ".cox-world" box with the photo's own
     aspect (2400×1340). the doodle svg shares that box and is authored in
     the photo's pixel space (2000×1117 display units). crop changes, the
     doodle stays glued to the laptop / phone / trunk.
   - fix panels are "stages" with a fixed aspect and container-query type,
     so screens, arrows and notes are authored in one coordinate space and
     can't miss their targets at any viewport.
   final state is the markup. motion() only adds entrances when the
   sideways track exists; static / reduced motion renders as built.
   ------------------------------------------------------------------ */
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import './cox.css';
import { $, $$, esc, em } from '../lib.js';
import { COX, CARDS, walkthrough } from '../data.js';

/* ================================================================ pen
   a tiny deterministic "hand": catmull-rom through jittered points, loops
   that overshoot their own start, rounded rects with uneven corners. */
let SEED = 11;
const rng = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const r1 = (n) => Math.round(n * 10) / 10;

function spline(p, closed = false) {
  const n = p.length;
  const P = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), q1 = P(i), q2 = P(i + 1), p3 = P(i + 2);
    d += `C${r1(q1[0] + (q2[0] - p0[0]) / 6)} ${r1(q1[1] + (q2[1] - p0[1]) / 6)} ${r1(q2[0] - (p3[0] - q1[0]) / 6)} ${r1(q2[1] - (p3[1] - q1[1]) / 6)} ${r1(q2[0])} ${r1(q2[1])}`;
  }
  return closed ? d + 'Z' : d;
}
const jit = (pts, a) => { const r = rng((SEED += 13)); return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * a, y + (r() - 0.5) * 2 * a]); };

/* open hand line. two-point lines get a slight random bow. */
function ln(pts, a = 2.2) {
  if (pts.length === 2) {
    const [[x1, y1], [x2, y2]] = pts; const b = (rng((SEED += 7))() - 0.5) * 0.08;
    const nx = -(y2 - y1) * b, ny = (x2 - x1) * b;
    pts = [[x1, y1], [(2 * x1 + x2) / 3 + nx, (2 * y1 + y2) / 3 + ny], [(x1 + 2 * x2) / 3 + nx, (y1 + 2 * y2) / 3 + ny], [x2, y2]];
  }
  return spline(jit(pts, a));
}
/* closed organic shape through points */
const blob = (pts, a = 2) => spline(jit(pts, a), true);
/* rounded quad from 4 corners; k = how far the rounding eats into each edge */
function quad(c, k = 0.07, a = 1.6) {
  const pts = [];
  c.forEach((p, i) => {
    const q = c[(i + 1) % 4];
    [k, 0.5, 1 - k].forEach((t) => pts.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]));
  });
  return blob(pts, a);
}
/* a pen loop around an ellipse that overshoots where it started */
function loop(cx, cy, rx, ry, { over = 0.16, n = 10, wob = 0.05, a0 } = {}) {
  const r = rng((SEED += 29)); const start = a0 ?? r() * Math.PI * 2; const pts = [];
  const steps = Math.round(n * (1 + over));
  for (let i = 0; i <= steps; i++) {
    const ang = start + (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * wob + (i / steps) * over * 0.4;
    pts.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]);
  }
  return spline(pts);
}
const oval = (cx, cy, rx, ry, n = 10, wob = 0.035) => {
  const r = rng((SEED += 31)); const pts = [];
  for (let i = 0; i < n; i++) { const ang = (i / n) * Math.PI * 2; const k = 1 + (r() - 0.5) * 2 * wob; pts.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]); }
  return spline(pts, true);
};
/* curved arrow; returns [shaft, head] */
function arrow([x1, y1], [x2, y2], { bend = 0.18, via, head = 24 } = {}) {
  const mx = via ? via[0] : (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = via ? via[1] : (y1 + y2) / 2 + (x2 - x1) * bend;
  const shaft = ln([[x1, y1], [mx, my], [x2, y2]], 1.5);
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h = (s) => [x2 - head * Math.cos(ang + s), y2 - head * Math.sin(ang + s)];
  return [shaft, ln([h(0.55), [x2, y2], h(-0.5)], 0.8)];
}
/* where an arrow from `from` should stop on an ellipse around `to` */
function edge(from, to, rx, ry, pad = 1.18) {
  const ang = Math.atan2((from[1] - to[1]) / ry, (from[0] - to[0]) / rx);
  return [to[0] + Math.cos(ang) * rx * pad, to[1] + Math.sin(ang) * ry * pad];
}

/* sticker assembler: white halo under cream fills under ink lines under text */
function doodle() {
  const halo = [], fill = [], ink = [], top = [];
  const api = {
    shape(d, { f = 'dd-fill', h = true, line = true } = {}) {
      if (h) halo.push(`<path d="${d}"/>`);
      if (f) fill.push(`<path class="${f}" d="${d}"/>`);
      if (line) ink.push(`<path class="dd-draw" d="${d}"/>`);
      return api;
    },
    line(d, cls = '') { ink.push(`<path class="dd-draw ${cls}" d="${d}"/>`); return api; },
    haloLine(d) { halo.push(`<path class="dd-draw cox-halo-line" d="${d}"/>`); ink.push(`<path class="dd-draw" d="${d}"/>`); return api; },
    dot(x, y, r = 5) { top.push(`<circle class="dd-ink" cx="${x}" cy="${y}" r="${r}"/>`); return api; },
    text(s, x, y, { size = 30, cls = '', t = '' } = {}) {
      top.push(`<text class="cox-t ${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="middle"${t ? ` transform="${t}"` : ''}>${esc(s)}</text>`);
      return api;
    },
    raw(s) { top.push(s); return api; },
    out(cls = '', attr = '') {
      return `<g class="${cls}" ${attr}><g class="cox-halo">${halo.join('')}</g><g class="cox-fillg">${fill.join('')}</g><g class="cox-ink">${ink.join('')}</g><g class="cox-top">${top.join('')}</g></g>`;
    },
  };
  return api;
}

/* ================================================================ scenes */
const W = '0 0 2000 1117';

/* 01 · explore now → no journeys found. a paper note stuck over the real
   laptop's screen, a tumbleweed rolling across the duvet, a girl from behind. */
function artDeadEnd() {
  const note = doodle()
    .shape(quad([[1166, 300], [1588, 320], [1578, 558], [1154, 546]], 0.05))
    .shape(quad([[1330, 286], [1420, 290], [1418, 318], [1328, 314]], 0.1), { f: 'cox-f-tape', line: false, h: false })
    .line(loop(1192, 332, 6, 6, { over: 0.05 })).line(loop(1212, 333, 6, 6, { over: 0.05 })).line(loop(1232, 334, 6, 6, { over: 0.05 }))
    .shape(quad([[1196, 352], [1400, 360], [1398, 404], [1194, 396]], 0.26), { f: 'cox-f-sienna' });
  const [s, h] = arrow([1410, 388], [1352, 450], { via: [1470, 420], head: 18 });
  note.line(s).line(h)
    .text('explore now →', 1297, 388, { size: 25, cls: 'cox-t--milk', t: 'rotate(2.6 1297 388)' })
    .text('no journeys found', 1368, 498, { size: 38, t: 'rotate(2.6 1368 498)' })
    .text('(0 results)', 1368, 534, { size: 20, cls: 'cox-t--soft', t: 'rotate(2.6 1368 534)' });

  /* seated, seen from behind: sloped shoulders, one arm down, one reaching the keyboard */
  const g = doodle()
    .shape(blob([[742, 1420], [744, 790], [760, 718], [812, 684], [860, 664], [900, 664], [948, 684], [1000, 718], [1016, 790], [1018, 1420]], 1.2))
    .shape(quad([[746, 846], [1014, 842], [1016, 880], [746, 884]], 0.02, 1), { f: 'cox-f-red', h: false, line: false })
    .line(ln([[748, 846], [880, 840], [1014, 844]])).line(ln([[746, 884], [880, 878], [1016, 882]]))
    .line(ln([[756, 770], [880, 760], [1006, 770]])).line(ln([[744, 950], [880, 944], [1018, 952]])).line(ln([[744, 1024], [880, 1018], [1018, 1026]]))
    .shape(blob([[756, 724], [724, 820], [712, 960], [744, 972], [758, 830], [782, 752]], 1))
    .shape(blob([[984, 712], [1036, 668], [1100, 638], [1118, 670], [1062, 712], [1012, 770]], 1))
    .shape(oval(1122, 656, 24, 17, 8))
    .shape(oval(880, 540, 82, 88, 12))
    .shape(oval(878, 446, 36, 30))
    .line(ln([[846, 474], [878, 466], [910, 474]]))
    .line(ln([[834, 480], [810, 536], [818, 604]])).line(ln([[868, 470], [852, 540], [862, 620]]))
    .line(ln([[906, 472], [918, 544], [906, 616]])).line(ln([[942, 496], [956, 552], [946, 600]]))
    .line(ln([[800, 540], [790, 560], [804, 580]], 1)).line(ln([[958, 538], [970, 558], [958, 578]], 1));

  const tumble = doodle().shape(oval(0, 0, 66, 62, 11), { line: false });
  [[0, 0, 60, 56], [8, -6, 42, 48], [-10, 8, 36, 30], [6, 4, 22, 26]].forEach(([x, y, rx, ry]) => tumble.line(loop(x, y, rx, ry, { over: 0.5, wob: 0.14 })));
  tumble.line(ln([[-40, -30], [10, 20], [44, -18]], 3)).line(ln([[-30, 30], [20, -20]], 3));
  const dust = doodle().line(ln([[500, 1030], [560, 1026]])).line(ln([[468, 1002], [520, 1000]])).line(ln([[520, 1058], [570, 1056]]));

  return `
    ${note.out('cox-a cox-a--note')}
    <g transform="translate(250 110) scale(.82)">${g.out('cox-a cox-a--girl')}</g>
    ${dust.out('cox-a cox-a--dust')}
    <g transform="translate(640 980)">${tumble.out('cox-a cox-tumble')}</g>`;
}

/* 02 · nobody to talk to. a tin-can phone with a snipped string, the real
   phone showing a number you can't tap, a "reach us via" note all struck out. */
function artNoHuman() {
  const c = doodle()
    .shape(blob([[735, 700], [865, 700], [860, 884], [814, 884], [800, 770], [786, 884], [740, 884]], 1.2))
    .shape(blob([[744, 552], [856, 552], [874, 708], [726, 708]], 1.2))
    .shape(quad([[738, 604], [862, 604], [866, 624], [734, 624]], 0.02, 0.8), { f: 'cox-f-red', h: false, line: false })
    .line(ln([[738, 604], [862, 604]], 1)).line(ln([[734, 626], [866, 624]], 1)).line(ln([[741, 578], [859, 577]], 1))
    .shape(oval(766, 898, 34, 15)).shape(oval(836, 898, 34, 15))
    .shape(blob([[746, 560], [700, 616], [722, 682], [744, 672], [728, 618], [756, 590]], 1))
    .shape(blob([[852, 562], [902, 520], [888, 466], [866, 470], [878, 516], [846, 542]], 1))
    .shape(oval(800, 478, 60, 64, 11))
    .line(ln([[738, 488], [736, 436], [764, 404], [804, 394], [846, 406], [866, 440], [864, 494]], 1.5))
    .line(ln([[748, 446], [800, 430], [856, 444]], 1.5))
    .line(ln([[770, 462], [792, 468]], 1)).line(ln([[810, 468], [832, 461]], 1))
    .dot(784, 484, 5).dot(818, 482, 5)
    .line(ln([[786, 516], [800, 508], [816, 515]], 1))
    .line(ln([[834, 380], [846, 356], [858, 380], [872, 354], [884, 378]], 1.5))
    .line(ln([[900, 350], [918, 334]], 1)).line(ln([[904, 374], [928, 370]], 1))
    .shape(quad([[862, 432], [900, 418], [916, 466], [878, 480]], 0.12))
    .line(ln([[868, 448], [906, 434]], 1))
    .haloLine(ln([[912, 440], [980, 384], [1044, 452], [1052, 560], [1000, 634]], 2.5))
    .line(ln([[976, 606], [1012, 640]], 1)).line(ln([[978, 642], [1010, 604]], 1))
    .text('snip.', 1060, 616, { size: 26, cls: 'cox-t--halo' });

  const phone = doodle()
    .text('+91 85560 01700', 0, 0, { size: 27, cls: 'cox-t--milk' })
    .text('(just text)', 0, 34, { size: 19, cls: 'cox-t--latte' });
  const taps = doodle()
    .haloLine(ln([[1196, 530], [1188, 506]], 1)).haloLine(ln([[1222, 522], [1226, 496]], 1)).haloLine(ln([[1172, 548], [1150, 536]], 1));

  const n = doodle()
    .shape(quad([[1600, 700], [1896, 684], [1908, 912], [1612, 926]], 0.04))
    .shape(quad([[1710, 676], [1800, 672], [1802, 702], [1712, 706]], 0.1), { f: 'cox-f-tape', line: false, h: false })
    .text('reach a person via:', 1752, 740, { size: 22, cls: 'cox-t--soft', t: 'rotate(-3 1752 740)' })
    .text('whatsapp', 1740, 796, { size: 36, t: 'rotate(-3 1740 796)' })
    .text('callback', 1744, 848, { size: 36, t: 'rotate(-3 1744 848)' })
    .text('chat', 1746, 900, { size: 36, t: 'rotate(-3 1746 900)' });
  const strikes = doodle()
    .line(ln([[1654, 794], [1700, 780], [1760, 790], [1830, 772]], 2), 'cox-red-ink')
    .line(ln([[1664, 846], [1730, 834], [1826, 830]], 2), 'cox-red-ink')
    .line(ln([[1700, 898], [1750, 880], [1796, 884]], 2), 'cox-red-ink');

  return `
    <g transform="translate(90 0)">${c.out('cox-a cox-a--char')}</g>
    <g transform="translate(1300 672) rotate(8.5) skewX(-16)">${phone.out('cox-a cox-a--phone')}</g>
    ${taps.out('cox-a cox-a--taps')}
    <g transform="translate(-130 6)">${n.out('cox-a cox-a--note')}${strikes.out('cox-strikes')}</g>`;
}

/* 03 · 260 years in the footer. an explorer peeks over the real trunk, an
   est. 1758 stamp, and the three blank luggage tags get the three ages. */
function artBuried() {
  const e = doodle()
    .shape(oval(1180, 244, 60, 60, 11))
    .shape(blob([[1100, 200], [1110, 146], [1150, 112], [1202, 108], [1246, 130], [1266, 184], [1270, 200]], 1.2))
    .shape(blob([[1066, 204], [1180, 186], [1294, 206], [1180, 226]], 1.2))
    .line(ln([[1110, 176], [1180, 164], [1262, 174]], 1))
    .line(loop(1204, 250, 19, 19, { over: 0.1, wob: 0.03 }))
    .line(ln([[1220, 266], [1238, 300], [1228, 336]], 1.2))
    .dot(1160, 250, 5).dot(1204, 250, 3)
    .line(ln([[1142, 228], [1158, 218], [1174, 226]], 1)).line(ln([[1188, 222], [1206, 210], [1224, 220]], 1))
    .line(ln([[1156, 278], [1180, 270], [1206, 278]], 1))
    .line(loop(1181, 290, 8, 9, { over: 0.1, wob: 0.02 }))
    .shape(blob([[1036, 290], [1040, 256], [1056, 250], [1066, 262], [1078, 252], [1094, 258], [1102, 292]], 1))
    .line(ln([[1056, 254], [1058, 280]], 0.6)).line(ln([[1078, 256], [1080, 282]], 0.6))
    .shape(blob([[1262, 306], [1266, 274], [1282, 268], [1292, 280], [1304, 272], [1320, 280], [1326, 312]], 1))
    .line(ln([[1282, 272], [1284, 300]], 0.6)).line(ln([[1304, 276], [1306, 304]], 0.6));

  const stamp = doodle()
    .shape(oval(0, 0, 128, 72, 12))
    .line(loop(0, 0, 106, 55, { over: 0.06, wob: 0.02 }), 'cox-sienna-ink')
    .raw('<text class="cox-serif" x="0" y="-14" font-size="30" text-anchor="middle">est.</text>')
    .raw('<text class="cox-serif cox-serif--big" x="0" y="34" font-size="62" text-anchor="middle">1758</text>');
  /* "found it" glints: short uneven rays, not plus signs */
  const sparks = doodle();
  [[1150, 430, 0], [1178, 560, 0.6]].forEach(([x, y, k]) => [0, 1.2, 2.3, 3.6, 4.8].forEach((a, i) => {
    const r0 = 10, r = 24 + ((i * 7 + k * 10) % 3) * 6;
    sparks.haloLine(ln([[x + Math.cos(a + k) * r0, y + Math.sin(a + k) * r0], [x + Math.cos(a + k) * r, y + Math.sin(a + k) * r]], 0.6));
  }));

  const tags = doodle()
    .text('260+ years', 1068, 838, { size: 27, t: 'rotate(2 1068 838)' })
    .text('265 years', 1092, 912, { size: 27, t: 'rotate(-6 1092 912)' })
    .text('25 yrs of exp.', 1150, 986, { size: 22, t: 'rotate(-17 1150 986)' });
  const said = doodle()
    .text('the old site said:', 800, 880, { size: 30, cls: 'cox-t--halo' });
  const [sa, sh] = arrow([900, 896], [950, 860], { bend: -0.3, head: 16 });
  said.haloLine(sa).haloLine(sh).text('??', 1330, 930, { size: 56, cls: 'cox-t--halo cox-t--sienna' });

  return `
    ${e.out('cox-a cox-a--explorer')}
    <g transform="translate(990 520) rotate(-9)">${stamp.out('cox-stamp')}</g>
    ${sparks.out('cox-a cox-a--sparks')}
    ${tags.out('cox-tags')}
    ${said.out('cox-a cox-a--said')}`;
}

/* layout per scene: fx = horizontal focus of the photo on narrow screens (0–1);
   bubble position in % of the photo, desktop and mobile. */
const SCENES = {
  'dead-end': { art: artDeadEnd, fx: 0.5, fxm: 0.62, b: [44, 20, 30], bm: [44.5, 13, 40] },
  'no-human': { art: artNoHuman, fx: 0.5, fxm: 0.59, b: [46, 11, 22], bm: [42, 13, 30] },
  buried: { art: artBuried, fx: 0.5, fxm: 0.579, b: [66, 9, 12], bm: [61, 29, 20] },
};

function scene(p, i) {
  const L = SCENES[p.id];
  return `
  <article class="cox-scene" id="cox-p-${p.id}" aria-labelledby="cox-p-${p.id}-t"
    style="--fx:${L.fx};--fxm:${L.fxm}">
    <div class="cox-world" aria-hidden="true">
      <img class="cox-world__photo" src="${p.bg}" alt="" width="2400" height="1340" loading="lazy" decoding="async"
        onerror="this.remove()" />
      <svg class="dd dd--sticker cox-world__art" viewBox="${W}" preserveAspectRatio="none" focusable="false">${L.art()}</svg>
      <p class="bubble cox-bubble" style="--bx:${L.b[0]}%;--by:${L.b[1]}%;--tail-x:${L.b[2]}%;--bxm:${L.bm[0]}%;--bym:${L.bm[1]}%;--tail-xm:${L.bm[2]}%">${esc(p.bubble)}</p>
    </div>
    <div class="cox-card">
      <p class="mono cox-card__no">problem 0${i + 1} <span aria-hidden="true">/</span> 03</p>
      <h3 class="cox-card__title" id="cox-p-${p.id}-t">${em(p.title)}</h3>
      <p class="cox-card__body">${em(p.body)}</p>
    </div>
  </article>`;
}

/* ================================================================ before / after */
const OLD = {
  src: '/img/cox/old-hero.jpg',
  alt: 'the homepage khushi inherited: a centred headline, two competing calls to action, a plain-text phone number and a 4.8 rating badge with no source',
  marks: [
    { c: [1012, 38, 94, 24], note: 'a phone number you can’t tap (plain text, not clickable)', at: [60.5, 11.5, 24], from: [930, 100], to: [990, 66] },
    { c: [866, 652, 106, 32], note: 'explore now → no journeys found (limited filter options)', at: [58, 60.5, 29], from: [860, 540], to: [868, 614] },
    { c: [620, 756, 76, 22], note: '4.8… says who? (not clickable)', at: [27, 85.5, 17], from: [520, 700], to: [556, 742] },
  ],
};
const NEW = {
  src: '/img/cox/hero.jpg',
  alt: 'the redesigned homepage: one search bar asking where, who and when, the 4.9 rating from 2,400+ verified reviews right under it, and a talk to an expert button in the header',
  marks: [
    { c: [1128, 38, 90, 26], note: 'a human, one click away', at: [66, 11.5, 22], from: [1010, 100], to: [1080, 64] },
    { c: [355, 585, 330, 36], note: 'where, who, when. one button. quick, easy, not overwhelming.', at: [58, 63, 25], from: [720, 520], to: [660, 566] },
    { c: [180, 663, 150, 20], note: '4.9, and where it came from (click to view reviews)', at: [31, 82.6, 29], from: [384, 668], to: [344, 666] },
  ],
};
const OLD_M = {
  src: '/img/cox/old-mobile.jpg',
  alt: 'the inherited homepage on a phone: a grey hero where the image failed to load, one grey search button and no way to reach a person',
  vb: '0 0 460 995',
  marks: [
    { c: [230, 48, 200, 34], note: 'no one to call up here', at: [20, 12, 64], from: [200, 128], to: [210, 88] },
    { c: [230, 970, 88, 22], note: '4.8, says who? (not clickable)', at: [22, 84, 56], from: [230, 880], to: [230, 944] },
  ],
};
const NEW_M = {
  src: '/img/cox/m-hero.jpg',
  alt: 'the redesigned homepage on a phone: where, who and when stacked above one blue search button, with the 4.9 rating and review count under it',
  vb: '0 0 520 1125',
  marks: [
    { c: [260, 518, 236, 118], note: 'three fields, one button. quick + easy', at: [14, 29.5, 72], from: [300, 360], to: [300, 394] },
    { c: [230, 718, 212, 30], note: '4.9 + its source (click to view reviews)', at: [30, 69, 56], from: [300, 806], to: [290, 752] },
  ],
};

function marks(set, vb) {
  const d = doodle();
  const [, , w] = vb.split(' ').map(Number);
  const k = w / 1240; // stroke geometry scales with the capture
  set.marks.forEach((m) => {
    d.haloLine(loop(m.c[0], m.c[1], m.c[2], m.c[3], { over: 0.2, wob: 0.04 }));
    const [s, h] = arrow(m.from, m.to, { bend: 0.2, head: 16 * Math.max(k, 0.6) });
    d.haloLine(s).haloLine(h);
  });
  return `<svg class="dd cox-marks" viewBox="${vb}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${d.out('cox-marks__g')}</svg>
    ${set.marks.map((m, j) => `<span class="cox-tag" aria-hidden="true" style="left:${m.at[0]}%;top:${m.at[1]}%;width:${m.at[2]}%;--r:${j % 2 ? 2 : -2}deg">${esc(m.note)}</span>`).join('')}`;
}

function wipe({ old, neu, kind }) {
  const isPhone = kind === 'phone';
  const vbO = old.vb || '0 0 1240 775', vbN = neu.vb || '0 0 1240 775';
  const [, , ow, oh] = vbO.split(' ').map(Number);
  const [, , nw, nh] = vbN.split(' ').map(Number);
  const shell = (inner) => isPhone
    ? `<div class="cox-phone cox-phone--swap">${inner}</div>`
    : `<div class="cox-browser cox-browser--swap"><div class="cox-browser__bar" aria-hidden="true"><i></i><i></i><i></i><span>cox &amp; kings · home</span></div>${inner}</div>`;
  return shell(`
    <div class="cox-wipe">
      <figure class="cox-wipe__before">
        <img src="${old.src}" alt="before: ${esc(old.alt)}" width="${ow}" height="${oh}" loading="lazy" decoding="async" />
        ${marks(old, vbO)}
        <figcaption class="cox-wipe__label">before</figcaption>
      </figure>
      <figure class="cox-wipe__after">
        <div class="cox-wipe__afterin">
          <img src="${neu.src}" alt="after: ${esc(neu.alt)}" width="${nw}" height="${nh}" loading="lazy" decoding="async" />
          ${marks(neu, vbN)}
          <figcaption class="cox-wipe__label cox-wipe__label--after">after</figcaption>
        </div>
      </figure>
      <div class="cox-wipe__line" aria-hidden="true"><span class="cox-wipe__knob">‹ ›</span></div>
    </div>`);
}

/* ================================================================ fixes
   stage units: desktop 1800×1100, mobile 1000×1500. screen origins:
   browser image (20,90) at 1:1 · desktop phone screen (1163,343) at
   274/520 · mobile phone screen (258,398) at 484/520. */
const B = (x, y) => [20 + x, 90 + y];
const Pd = (x, y) => [1163 + x * (274 / 520), 343 + y * (274 / 520)];
const Pm = (x, y) => [258 + x * (484 / 520), 398 + y * (484 / 520)];

const FIX = {
  search: {
    mob: '/img/cox/m-hero.jpg',
    alt: ['the redesigned homepage hero: where, who and when in one search bar with a blue search button, the 4.9 star rating and review count right under it', 'the same hero on a phone, three stacked fields and one full-width search button'],
    desk: [
      { box: [590, 250, 470], from: [700, 372], to: B(355, 585), rx: 345, ry: 40, bend: -0.25 },
      { box: [1490, 600, 300], from: [1500, 700], to: Pd(240, 718), rx: 128, ry: 20, bend: 0.25 },
    ],
    mobile: [
      { box: [20, 20, 470], from: [240, 250], to: Pm(260, 520), rx: 250, ry: 125, bend: 0.1 },
      { box: [500, 1150, 480], from: [560, 1156], to: Pm(240, 718), rx: 232, ry: 30, bend: 0.2 },
    ],
  },
  doors: {
    mob: '/img/cox/m-fork.jpg',
    alt: ['three doors one scroll below the hero: escorted small groups, tailor-made and private, and just talk to someone, each with one blue button', 'the doors on a phone, with a chat with an expert bar fixed where the thumb rests'],
    desk: [
      { box: [500, 640, 540], from: [760, 646], to: B(620, 262), rx: 480, ry: 186, bend: 0.2 },
      { box: [1490, 740, 300], from: [1510, 850], to: Pd(260, 1060), rx: 142, ry: 26, bend: -0.3 },
    ],
    mobile: [
      { box: [20, 20, 470], from: [240, 250], to: Pm(208, 290), rx: 205, ry: 190, bend: 0.1 },
      { box: [470, 990, 510], from: [700, 1180], to: Pm(260, 1060), rx: 245, ry: 44, bend: -0.2 },
    ],
  },
  prices: {
    mob: '/img/cox/m-journeys.jpg',
    alt: ['journey cards with group size, pace, a from-price per person and a total for two travellers, each with a blue enquire button', 'a journey shelf on a phone showing the trip style chip, nights and season on each card'],
    desk: [
      { box: [40, 900, 560], from: [300, 906], to: B(465, 508), rx: 140, ry: 58, bend: 0.12 },
      { box: [640, 950, 480], from: [900, 956], to: B(1057, 572), rx: 84, ry: 24, bend: -0.12 },
    ],
    mobile: [
      { box: [20, 20, 470], from: [240, 250], to: Pm(200, 900), rx: 215, ry: 104, bend: 0.12 },
      { box: [520, 20, 460], from: null },
    ],
  },
};

function stage(s, mode) {
  const L = FIX[s.id];
  const pts = mode === 'desk' ? L.desk : L.mobile;
  const d = doodle();
  pts.forEach((p) => {
    if (!p.from) return;
    d.haloLine(loop(p.to[0], p.to[1], p.rx, p.ry, { over: 0.22, wob: 0.04 }));
    const end = edge(p.from, p.to, p.rx, p.ry);
    const [sh, hd] = arrow(p.from, end, { bend: p.bend ?? 0.2, via: p.via, head: mode === 'desk' ? 26 : 30 });
    d.haloLine(sh).haloLine(hd);
  });
  const [VW, VH] = mode === 'desk' ? [1800, 1100] : [1000, 1500];
  const pct = (v, of) => `${r1((v / of) * 100)}%`;
  const screens = mode === 'desk'
    ? `<div class="cox-browser cox-browser--fix"><div class="cox-browser__bar" aria-hidden="true"><i></i><i></i><i></i><span>cox &amp; kings</span></div>
         <img src="${s.screens[0]}" alt="${esc(L.alt[0])}" width="1240" height="775" loading="lazy" decoding="async" /></div>
       <div class="cox-phone cox-phone--fix"><img src="${L.mob}" alt="${esc(L.alt[1])}" width="520" height="1125" loading="lazy" decoding="async" /></div>`
    : `<div class="cox-phone cox-phone--fixm"><img src="${L.mob}" alt="${esc(L.alt[1])}" width="520" height="1125" loading="lazy" decoding="async" /></div>`;
  return `
    <div class="cox-stage cox-stage--${mode}">
      <div class="cox-stage__in">
        ${screens}
        <svg class="dd cox-stage__ink" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${d.out('cox-pointers')}</svg>
        ${s.pointers.map((t, j) => {
          const p = pts[j]; const [l, tp, w] = p.box;
          return `<p class="cox-note" style="left:${pct(l, VW)};top:${pct(tp, VH)};width:${pct(w, VW)};--r:${j % 2 ? 1.6 : -1.8}deg">${em(t)}</p>`;
        }).join('')}
      </div>
    </div>`;
}

function fix(s, i) {
  return `
  <article class="cox-fix" id="cox-f-${s.id}" aria-labelledby="cox-f-${s.id}-t">
    <div class="cox-fix__text">
      <p class="mono cox-fix__no">fix 0${i + 1} <span aria-hidden="true">/</span> 03</p>
      <h3 class="cox-fix__title" id="cox-f-${s.id}-t">${em(s.title)}</h3>
      <p class="cox-fix__body">${em(s.body)}</p>
      <ul class="sr">${s.pointers.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>
    ${stage(s, 'desk')}
    ${stage(s, 'mob')}
  </article>`;
}

/* ================================================================ build */
export function build(el) {
  el.classList.add('cox');
  SEED = 11;
  const tag = CARDS.find((c) => c.go === 'cox')?.tag || '';

  const ring = doodle()
    .line(loop(200, 200, 150, 142, { over: 0.08, wob: 0.03 }), 'cox-ring')
    .line(loop(204, 196, 132, 126, { over: -0.35, wob: 0.05, a0: 2 }), 'cox-ring cox-ring--thin');
  const [ma, mh] = arrow([10, 40], [196, 30], { bend: -0.22, head: 20 });
  const mark = doodle().line(ma).line(mh);
  const [rsA, rsH] = arrow([10, 50], [190, 50], { bend: -0.3, head: 22 });

  el.innerHTML = `
  <div class="cox-title" id="cox-intro">
    <svg class="dd cox-title__ring" viewBox="0 0 400 400" aria-hidden="true" focusable="false">${ring.out()}</svg>
    <div class="cox-title__in">
      <img class="cox-title__crest" src="/img/cox/cox-crest.svg" alt="cox &amp; kings crest" width="200" height="126" decoding="async" />
      <p class="mono cox-title__tag">${esc(tag)}</p>
      <h2 class="cox-title__name">${esc(COX.name)}<span class="cox-title__est" aria-hidden="true">est. 1758</span></h2>
      <p class="cox-title__what">${em(COX.what)}</p>
      <p class="mono cox-title__role">${esc(COX.role)}</p>
    </div>
    <p class="cox-marker cox-marker--problem" aria-hidden="true">
      <span>the problem</span>
      <svg class="dd" viewBox="0 0 210 70" focusable="false">${mark.out()}</svg>
    </p>
  </div>

  <div class="cox-group" id="cox-problem">
    ${COX.problems.map(scene).join('')}
  </div>

  <div class="cox-group" id="cox-solution">
    <section class="cox-swap" aria-labelledby="cox-swap-t">
      <div class="cox-swap__in">
        <div class="cox-swap__text">
          <p class="cox-marker cox-marker--fix"><span>the fix</span></p>
          <h3 class="cox-swap__title" id="cox-swap-t">same homepage, <b class="caps">rebuilt</b>.</h3>
          <p class="cox-swap__sub">keep scrolling to wipe from the site i inherited to the one i shipped.</p>
        </div>
        <div class="cox-swap__frame cox-swap__frame--desk">${wipe({ old: OLD, neu: NEW, kind: 'browser' })}</div>
        <div class="cox-swap__frame cox-swap__frame--mob">${wipe({ old: OLD_M, neu: NEW_M, kind: 'phone' })}</div>
      </div>
    </section>

    ${COX.solutions.map(fix).join('')}

    <section class="cox-end" aria-labelledby="cox-end-t">
      <div class="cox-result">
        <p class="mono cox-result__label">${esc(COX.result.label)}</p>
        <p class="cox-result__nums">
          <span class="cox-result__before"><span class="sr">before: </span>${esc(COX.result.before)}
            <svg class="dd cox-result__strike" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${doodle().line(ln([[8, 70], [60, 40], [110, 62], [190, 26]], 3), 'cox-red-ink').line(ln([[20, 34], [100, 56], [184, 60]], 3), 'cox-red-ink').out()}</svg>
          </span>
          <svg class="dd cox-result__arrow" viewBox="0 0 210 100" aria-hidden="true" focusable="false">${doodle().line(rsA).line(rsH).out()}</svg>
          <span class="cox-result__after"><span class="sr">after: </span>${esc(COX.result.after)}
            <svg class="dd cox-result__circle" viewBox="0 0 200 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">${doodle().line(loop(100, 80, 92, 70, { over: 0.25, wob: 0.05 }), 'cox-blue-ink').out()}</svg>
          </span>
        </p>
      </div>
      <div class="cox-ask">
        <h3 class="cox-ask__title" id="cox-end-t">that’s the <b class="caps">glimpse</b>.</h3>
        <p class="cox-ask__body">the research, the 98 use cases and the versions that failed are better told live.</p>
        <div class="cox-ask__row">
          <a class="btn cox-ask__btn" href="${walkthrough('cox & kings')}">${esc(COX.cta)} <span aria-hidden="true">→</span></a>
          <button type="button" class="btn btn--light" data-go="pawnet">next: pawnet <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </section>
  </div>`;
}

/* ================================================================ motion
   each move answers one question:
   - title words rise + crest stamps: "a heritage brand, opening a chapter".
   - photo drifts slower than the track: depth, you're walking past a room.
   - doodle draws itself, then speaks: the problem is noticed, then voiced.
   - tumbleweed rolls with scroll: emptiness, literally.
   - strike-throughs draw on the "reach us" note: options being taken away.
   - the wipe is scrubbed and held: before/after is the whole argument.
   - screens slide in, then pointers draw to them: look here, because.
   - 5.9 gets struck, 8+ gets circled: the outcome, said once. */
export function motion(ctx, el) {
  if (!ctx.hTween) return; // static + reduced motion: markup is already the final state
  const { gsap } = ctx;
  const once = { toggleActions: 'play none none none' };
  const settle = (tl, root) => tl.eventCallback('onComplete', () => $$('.dd-draw', root).forEach((p) => { p.style.strokeDasharray = 'none'; }));

  /* title */
  const title = $('.cox-title', el);
  const words = ctx.splitWords($('.cox-title__name', title));
  const tt = ctx.tl(title, { start: 'left 70%', ...once });
  tt.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.07, ease: 'power4.out' })
    .fromTo('.cox-title__crest', { scale: 0.5, rotation: -26, autoAlpha: 0 }, { scale: 1, rotation: -7, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.4)' }, 0.1)
    .fromTo('.cox-title__est', { autoAlpha: 0, rotation: 8 }, { autoAlpha: 1, rotation: -4, duration: 0.6, ease: 'back.out(2)' }, 0.55)
    .fromTo(['.cox-title__tag', '.cox-title__what', '.cox-title__role'].map((s) => $(s, title)), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.3)
    .add(ctx.draw($('.cox-title__ring', title), { duration: 1.6, stagger: 0.3 }), 0.2)
    .fromTo('.cox-marker--problem span', { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.9)
    .add(ctx.draw($('.cox-marker--problem svg', title), { duration: 0.6, stagger: 0.2 }), 1);
  settle(tt, title);

  /* problem scenes */
  $$('.cox-scene', el).forEach((sc) => {
    const world = $('.cox-world', sc);
    ctx.tl(sc, { start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true })
      .fromTo(world, { x: () => innerWidth * 0.07 }, { x: () => -innerWidth * 0.07, ease: 'none' });

    const art = $$('.cox-a', sc);
    const tl = ctx.tl(sc, { start: 'left 55%', ...once });
    tl.fromTo($('.cox-card', sc), { y: 46, autoAlpha: 0, rotation: 2.5 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 0.8, ease: 'power3.out' })
      .fromTo(art.map((a) => [$('.cox-halo', a), $('.cox-fillg', a), $('.cox-top', a)]).flat(), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.03 }, 0.15)
      .fromTo($('.cox-bubble', sc), { scale: 0.3, autoAlpha: 0, rotation: -8 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.2)' }, 0.75);

    art.forEach((a, k) => tl.add(ctx.draw(a, { duration: 0.9, stagger: 0.02 }), 0.2 + k * 0.12));
    const strikes = $('.cox-strikes', sc);
    if (strikes) tl.add(ctx.draw(strikes, { duration: 0.35, stagger: 0.28, ease: 'power1.in' }), 1.5);
    const stamp = $('.cox-stamp', sc);
    if (stamp) {
      tl.fromTo(stamp, { scale: 1.9, autoAlpha: 0, transformOrigin: '50% 50%' }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'power4.in' }, 0.9)
        .fromTo($$('.cox-tags text', sc), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.22 }, 1.4);
      tl.fromTo($('.cox-a--explorer', sc), { y: 70 }, { y: 0, duration: 0.8, ease: 'back.out(1.6)' }, 0.2);
    }
    settle(tl, sc);

    const tumble = $('.cox-tumble', sc);
    if (tumble) {
      ctx.tl(sc, { start: 'left 80%', end: 'right 20%', scrub: 0.6 })
        .fromTo(tumble, { x: -260, rotation: -200, svgOrigin: '0 0' }, { x: 260, rotation: 260, ease: 'none' });
    }
  });

  /* before / after, held on screen while the wipe runs */
  const swap = $('.cox-swap', el);
  ctx.hold(swap, $('.cox-swap__in', swap));
  const st = ctx.tl(swap, { start: 'left 40%', ...once });
  st.fromTo($$('.cox-swap__text > *', swap), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
    .fromTo($$('.cox-swap__frame', swap), { y: 50, autoAlpha: 0, rotation: 1.5 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 0.9, ease: 'power3.out' }, 0.1);
  $$('.cox-wipe__before', swap).forEach((b) => st.add(ctx.draw(b, { duration: 0.7, stagger: 0.1 }), 0.7)
    .fromTo($$('.cox-tag', b), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(2)' }, 0.9));
  settle(st, swap);

  const wt = ctx.tl(swap, { start: 'left left', end: 'right right', scrub: true });
  $$('.cox-wipe', swap).forEach((w) => {
    wt.fromTo($('.cox-wipe__after', w), { xPercent: 100 }, { xPercent: 0, ease: 'none', duration: 0.8 }, 0.1)
      .fromTo($('.cox-wipe__afterin', w), { xPercent: -100 }, { xPercent: 0, ease: 'none', duration: 0.8 }, 0.1)
      .fromTo($('.cox-wipe__line', w), { xPercent: 100 }, { xPercent: 0, ease: 'none', duration: 0.8 }, 0.1)
      .to($('.cox-wipe__line', w), { autoAlpha: 0, duration: 0.06 }, 0.9);
  });
  wt.set({}, {}, 1);

  /* fixes */
  $$('.cox-fix', el).forEach((f) => {
    const tl = ctx.tl(f, { start: 'left 55%', ...once });
    const h = ctx.splitWords($('.cox-fix__title', f));
    tl.fromTo($('.cox-fix__no', f), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
      .fromTo(h, { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: 0.035, ease: 'power4.out' }, 0)
      .fromTo($('.cox-fix__body', f), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.35)
      .fromTo($$('.cox-browser', f), { x: 120, autoAlpha: 0, rotation: 2 }, { x: 0, autoAlpha: 1, rotation: 0, duration: 1, ease: 'power3.out' }, 0.1)
      .fromTo($$('.cox-phone', f), { y: 120, autoAlpha: 0, rotation: 8 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 1, ease: 'back.out(1.3)' }, 0.3);
    $$('.cox-stage', f).forEach((s) => tl.add(ctx.draw($('.cox-stage__ink', s), { duration: 0.6, stagger: 0.08 }), 0.95)
      .fromTo($$('.cox-note', s), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.35, ease: 'back.out(2)' }, 0.85));
    settle(tl, f);
  });

  /* result + ask */
  const end = $('.cox-end', el);
  const et = ctx.tl(end, { start: 'left 55%', ...once });
  et.fromTo($('.cox-result__label', end), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 })
    .fromTo($('.cox-result__before', end), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1)
    .add(ctx.draw($('.cox-result__strike', end), { duration: 0.35, stagger: 0.2 }), 0.6)
    .add(ctx.draw($('.cox-result__arrow', end), { duration: 0.4, stagger: 0.1 }), 0.9)
    .fromTo($('.cox-result__after', end), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(2.4)' }, 1.15)
    .add(ctx.draw($('.cox-result__circle', end), { duration: 0.7 }), 1.45)
    /* opacity, never autoAlpha: visibility:hidden would pull the two buttons out of the tab order */
    .fromTo($$('.cox-ask > *', end), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 0.5);
  settle(et, end);
  end.addEventListener('focusin', () => et.progress(1), { once: true });
}
