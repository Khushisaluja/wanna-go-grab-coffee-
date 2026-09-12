/* ------------------------------------------------------------------
   TALLY. a sideways chapter in five beats:
   1. title card (paper)            60vw (100vw on phones)
   2. three problem scenes (photo)  3 × 100vw   #tally-problem
   3. the turn: a doodle marker scribbles the paper world into obsidian
      while the panel is held still  140vw (40vw of it is the hold)
   4. four fix panels (obsidian)    4 × 100vw   #tally-solution
   5. end card                      54vw (100vw on phones)
   total 954vw on desktop. every width is explicit so the track measures
   before images load.
   ------------------------------------------------------------------ */
import './tally.css';
import { $, $$, em, esc } from '../lib.js';
import { TALLY, CARDS, walkthrough } from '../data.js';

const W = { title: 60, scene: 100, turn: 140, sol: 100, end: 54 };
const TOTAL = W.title + W.scene * TALLY.problems.length + W.turn + W.sol * TALLY.solutions.length + W.end;

/* local copy that data.js doesn't have (listed in the report) */
const LOCAL = {
  marker: 'the problem',
  turnBefore: 'okay. that’s the mess.',
  turnAfter: 'so i built *one* app for all of it.',
  endTitle: 'that’s the glimpse. want the *long* version?',
  next: 'next: cox & kings',
};

/* ------------------------------------------------------------------ doodles
   parts: [kind, d] or ['g', transform, parts]
   kinds: f cream fill · r tomato fill · k ink fill · c crema fill (coin)
          l line only · m dotted motion line (fades, not drawn)
   every filled shape gets a white halo path behind the whole figure,
   so the sticker outline is plain svg strokes, no filter per frame. */
function doodle(parts, viewBox, cls = '') {
  let halo = '';
  const walk = (ps) => ps.map((p) => {
    if (p[0] === 'g') {
      halo += `<g transform="${p[1]}">`;
      const inner = walk(p[2]);
      halo += '</g>';
      return `<g transform="${p[1]}">${inner}</g>`;
    }
    const [k, d] = p;
    if (k === 'l') return `<path class="dd-draw" d="${d}"/>`;
    if (k === 'm') return `<path class="tally-motion" d="${d}"/>`;
    halo += `<path class="dd-halo" d="${d}"/>`;
    const fill = { f: 'dd-fill', r: 'dd-red', k: 'dd-ink', c: 'tally-coinfill' }[k];
    return `<path class="${fill} tally-fillp" d="${d}"/><path class="dd-draw" d="${d}"/>`;
  }).join('');
  const body = walk(parts);
  return `<svg class="dd dd--sticker tally-dd ${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false"><g class="tally-halo">${halo}</g>${body}</svg>`;
}

const PHONE = 'M 0 7 C 0 2, 3 0, 8 0 L 58 1 C 63 1, 66 4, 66 9 L 65 104 C 65 109, 62 112, 57 112 L 7 111 C 2 111, 0 108, 0 103 Z';

/* 1. frazzled, juggling three phones: pay / budget / split */
const JUGGLER = [
  ['m', 'M 124 128 C 96 70, 104 20, 70 -6'],
  ['m', 'M 150 -40 C 190 -76, 236 -80, 262 -62'],
  ['m', 'M 312 -52 C 370 -66, 420 -46, 446 -12'],
  ['m', 'M 492 104 C 470 130, 452 140, 440 146'],
  ['f', 'M 236 300 L 238 318 C 200 322, 170 336, 158 372 C 146 420, 150 520, 156 610 L 372 610 C 378 520, 380 420, 366 372 C 354 336, 322 322, 284 318 L 284 300 Z'],
  ['r', 'M 153 452 C 230 462, 300 462, 377 450 L 378 482 C 300 494, 230 494, 152 484 Z'],
  ['r', 'M 154 514 C 230 524, 300 524, 377 512 L 377 542 C 300 554, 230 554, 154 544 Z'],
  ['l', 'M 186 588 L 188 606'], ['l', 'M 226 590 L 227 608'], ['l', 'M 302 590 L 301 608'], ['l', 'M 342 588 L 340 606'],
  ['l', 'M 238 318 C 250 334, 272 334, 284 318'],
  ['f', 'M 184 352 C 150 300, 124 244, 108 186 L 140 174 C 158 230, 186 282, 222 330 Z'],
  ['f', 'M 336 330 C 368 280, 394 226, 406 170 L 440 180 C 428 240, 402 300, 358 358 Z'],
  ['l', 'M 150 262 C 158 257, 166 255, 174 258'], ['l', 'M 378 262 C 388 262, 396 266, 402 273'],
  ['f', 'M 98 176 C 90 158, 102 140, 120 140 C 138 140, 148 156, 142 172 C 136 188, 106 192, 98 176 Z'],
  ['l', 'M 106 146 L 96 126'], ['l', 'M 120 140 L 118 118'], ['l', 'M 134 144 L 144 124'],
  ['f', 'M 404 172 C 400 154, 414 140, 432 142 C 450 144, 456 160, 448 176 C 440 190, 410 190, 404 172 Z'],
  ['l', 'M 412 148 L 404 128'], ['l', 'M 428 142 L 430 120'], ['l', 'M 444 148 L 456 130'],
  ['f', 'M 214 238 C 212 196, 250 176, 272 180 C 306 186, 322 214, 318 248 C 314 286, 286 304, 258 302 C 226 300, 216 272, 214 238 Z'],
  ['f', 'M 248 150 C 244 130, 262 118, 278 124 C 294 130, 294 152, 280 162 C 264 170, 250 164, 248 150 Z'],
  ['f', 'M 206 238 C 194 200, 214 164, 254 158 C 296 152, 332 178, 326 230 C 318 212, 302 202, 290 214 C 276 198, 252 196, 238 212 C 226 206, 214 216, 206 238 Z'],
  ['l', 'M 240 176 C 246 186, 250 196, 252 202'], ['l', 'M 278 170 C 282 182, 286 196, 290 210'],
  ['l', 'M 304 164 C 318 146, 330 152, 342 136'], ['l', 'M 224 172 C 208 154, 198 160, 186 146'],
  ['l', 'M 242 244 C 242 238, 252 238, 252 244 C 252 252, 238 252, 236 244 C 236 234, 256 232, 258 244'],
  ['l', 'M 288 242 C 288 236, 298 236, 298 242 C 298 250, 284 250, 282 242 C 282 232, 302 230, 304 242'],
  ['k', 'M 256 276 C 264 268, 280 270, 284 278 C 280 290, 262 292, 256 276 Z'],
  ['f', 'M 332 226 C 340 238, 346 248, 340 256 C 334 262, 324 256, 328 246 C 330 240, 332 232, 332 226 Z'],
  ['f', 'M 196 254 C 190 264, 186 274, 192 278 C 198 282, 204 276, 202 268 C 201 264, 199 258, 196 254 Z'],
  ['l', 'M 196 196 L 180 184'], ['l', 'M 344 200 L 360 190'], ['l', 'M 342 216 L 362 214'],
  ['g', 'translate(40 6) rotate(-18)', [
    ['f', PHONE], ['l', 'M 9 16 L 57 17'], ['l', 'M 9 94 L 57 95'],
    ['l', 'M 21 38 L 45 38'], ['l', 'M 21 48 L 45 48'], ['l', 'M 26 38 C 46 38, 46 60, 26 60 L 44 82'],
  ]],
  ['g', 'translate(228 -62) rotate(7)', [
    ['f', PHONE], ['l', 'M 9 16 L 57 17'], ['l', 'M 9 94 L 57 95'],
    ['f', 'M 13 56 C 13 42, 23 34, 34 34 C 46 34, 54 44, 54 56 C 54 68, 45 78, 33 78 C 21 78, 13 68, 13 56 Z'],
    ['r', 'M 34 56 L 34 34 C 46 34, 54 44, 54 56 C 54 59, 53.6 60.5, 53 62 Z'],
  ]],
  ['g', 'translate(424 -14) rotate(20)', [
    ['f', PHONE], ['l', 'M 9 16 L 57 17'], ['l', 'M 9 94 L 57 95'],
    ['l', 'M 33 84 L 33 60'], ['l', 'M 33 60 C 33 50, 22 46, 18 34'], ['l', 'M 33 60 C 33 50, 44 46, 48 34'],
    ['l', 'M 12 40 L 17 31 L 26 34'], ['l', 'M 40 34 L 49 31 L 54 40'],
  ]],
];

/* 2a. the customer, squinting at a phone held too close */
const CUSTOMER = [
  ['f', 'M 132 180 L 130 200 C 90 206, 56 230, 44 280 C 34 340, 36 420, 40 480 L 262 480 C 266 420, 266 340, 256 280 C 246 232, 214 206, 172 200 L 170 180 Z'],
  ['l', 'M 108 204 C 120 232, 180 234, 194 204'],
  ['l', 'M 136 228 L 132 264'], ['l', 'M 166 228 L 170 264'],
  ['l', 'M 88 392 C 128 384, 176 384, 216 392'],
  ['f', 'M 96 122 C 94 80, 124 60, 152 62 C 186 64, 208 90, 206 124 C 204 160, 180 182, 150 182 C 118 182, 98 158, 96 122 Z'],
  ['k', 'M 92 118 C 86 74, 116 46, 156 48 C 196 50, 216 80, 210 112 C 196 96, 176 88, 160 94 C 142 82, 116 92, 92 118 Z'],
  ['l', 'M 122 122 L 138 128 L 122 134'], ['l', 'M 180 122 L 164 128 L 180 134'],
  ['l', 'M 118 108 L 140 115'], ['l', 'M 184 108 L 162 115'],
  ['l', 'M 136 158 C 142 152, 148 160, 154 155 C 159 151, 163 158, 170 154'],
  ['f', 'M 232 276 C 262 262, 280 230, 272 196 L 240 196 C 244 222, 232 240, 206 256 Z'],
  ['g', 'translate(236 92) rotate(-8)', [
    ['k', 'M 0 5 C 0 2, 2 0, 6 0 L 44 0 C 48 0, 50 2, 50 6 L 50 86 C 50 90, 48 92, 44 92 L 6 92 C 2 92, 0 90, 0 86 Z'],
  ]],
  ['f', 'M 234 196 C 226 178, 238 162, 256 164 C 274 166, 280 184, 272 198 C 264 210, 240 210, 234 196 Z'],
  ['l', 'M 226 96 L 212 90'], ['l', 'M 222 116 L 208 118'], ['l', 'M 228 136 L 214 144'],
  ['l', 'M 30 40 C 30 24, 56 20, 58 36 C 60 50, 42 52, 42 66'], ['l', 'M 42 78 L 42 80'],
  ['l', 'M 250 20 C 250 8, 270 5, 272 18 C 273 28, 260 30, 260 40'], ['l', 'M 260 50 L 260 52'],
];

/* 2b. bhaiya: a doodle head + thumbs-up over the real shopkeeper, whose
   face is hidden behind the packets in the photo */
const SHOPKEEPER = [
  ['f', 'M 146 222 L 144 262 C 160 274, 188 274, 204 262 L 202 222 Z'],
  ['l', 'M 152 226 L 174 252 L 196 226'],
  ['g', 'translate(14 30)', [
    ['f', 'M 104 128 C 90 122, 88 146, 104 150'], ['f', 'M 218 128 C 232 122, 234 146, 218 150'],
    ['f', 'M 104 132 C 102 88, 130 66, 162 66 C 196 66, 220 92, 218 132 C 216 170, 192 194, 160 194 C 128 194, 106 172, 104 132 Z'],
    ['k', 'M 102 122 C 100 80, 130 56, 164 58 C 200 60, 222 86, 220 120 C 206 100, 180 92, 162 96 C 140 90, 118 100, 102 122 Z'],
    ['l', 'M 132 134 C 136 125, 147 125, 151 134'], ['l', 'M 171 134 C 175 125, 186 125, 190 134'],
    ['k', 'M 130 162 C 140 150, 156 152, 161 158 C 166 152, 182 150, 192 162 C 182 160, 172 168, 161 166 C 150 168, 140 160, 130 162 Z'],
    ['l', 'M 146 176 C 154 184, 168 184, 176 176'],
  ]],
  ['f', 'M 30 300 C 26 250, 34 200, 46 168 L 82 172 C 72 206, 70 250, 76 300 Z'],
  ['l', 'M 38 236 L 74 238'], ['l', 'M 34 268 L 74 270'], ['l', 'M 58 184 L 56 300'],
  ['f', 'M 48 140 C 44 120, 46 98, 58 94 C 70 92, 72 110, 68 138 Z'],
  ['f', 'M 30 170 C 24 152, 36 134, 58 134 C 80 134, 90 150, 86 168 C 82 184, 38 188, 30 170 Z'],
  ['l', 'M 40 152 L 80 150'], ['l', 'M 38 164 L 80 164'],
  ['l', 'M 22 102 L 10 90'], ['l', 'M 40 84 L 38 68'], ['l', 'M 82 88 L 94 74'],
];

/* 3a. facepalm at the counter, wrong card in hand */
const FACEPALM = [
  ['k', 'M 114 168 C 104 110, 140 80, 186 84 C 234 88, 258 124, 252 176 C 256 230, 262 280, 270 320 L 96 322 C 108 280, 112 230, 114 168 Z'],
  ['f', 'M 160 234 L 158 250 C 118 256, 84 280, 74 330 C 66 380, 66 460, 70 560 L 300 560 C 304 460, 302 380, 294 330 C 284 280, 250 256, 206 250 L 204 234 Z'],
  ['r', 'M 69 400 C 150 410, 230 410, 302 398 L 303 426 C 230 438, 150 438, 68 428 Z'],
  ['f', 'M 280 318 C 320 328, 356 348, 378 370 L 360 398 C 340 380, 310 364, 282 360 Z'],
  ['g', 'translate(382 322) rotate(-20)', [
    ['f', 'M 0 4 C 0 1, 2 0, 5 0 L 58 0 C 61 0, 63 2, 63 5 L 63 36 C 63 39, 61 40, 58 40 L 5 40 C 2 40, 0 38, 0 35 Z'],
    ['r', 'M 8 10 L 20 10 L 20 20 L 8 20 Z'], ['l', 'M 8 30 L 40 30'],
  ]],
  ['f', 'M 364 366 C 376 354, 396 358, 402 372 C 406 386, 392 398, 378 396 C 364 394, 356 380, 364 366 Z'],
  ['f', 'M 120 172 C 118 124, 150 100, 184 102 C 222 104, 246 134, 242 174 C 238 214, 212 236, 180 236 C 146 236, 122 212, 120 172 Z'],
  ['k', 'M 122 160 C 138 120, 190 104, 240 148 C 210 130, 168 126, 122 160 Z'],
  ['l', 'M 166 218 C 176 211, 190 211, 198 220'],
  ['f', 'M 140 196 C 124 230, 112 270, 108 306 L 140 312 C 144 276, 156 240, 172 204 Z'],
  ['f', 'M 176 158 C 184 138, 196 124, 206 128 C 214 132, 208 148, 196 162 Z'],
  ['f', 'M 192 158 C 204 142, 218 134, 226 140 C 232 146, 222 160, 208 168 Z'],
  ['f', 'M 204 170 C 218 162, 234 160, 238 168 C 240 176, 226 182, 214 184 Z'],
  ['f', 'M 136 186 C 140 164, 170 150, 200 152 C 216 153, 226 162, 222 176 C 216 192, 180 202, 152 202 C 138 202, 132 196, 136 186 Z'],
  ['f', 'M 146 192 C 132 200, 124 214, 132 220 C 140 224, 150 210, 158 202 Z'],
  ['l', 'M 96 140 L 80 130'], ['l', 'M 92 164 L 74 164'], ['l', 'M 266 138 L 282 126'],
];

/* 3b. the cashback, growing wings and leaving */
const COIN = [
  ['m', 'M 596 250 C 566 226, 546 206, 524 186'],
  ['m', 'M 566 262 C 540 240, 516 222, 498 196'],
  ['f', 'M 412 124 C 390 100, 372 104, 370 118 C 380 116, 384 124, 376 130 C 388 132, 396 136, 410 136 Z'],
  ['f', 'M 484 120 C 504 90, 526 92, 528 108 C 516 108, 516 116, 522 122 C 510 126, 500 132, 486 134 Z'],
  ['c', 'M 410 130 C 410 106, 428 92, 448 92 C 470 92, 486 108, 486 130 C 486 152, 470 168, 448 168 C 426 168, 410 152, 410 130 Z'],
  ['l', 'M 422 130 C 422 114, 434 104, 448 104 C 464 104, 474 116, 474 130 C 474 146, 462 156, 448 156 C 432 156, 422 144, 422 130 Z'],
  ['l', 'M 436 116 L 460 116'], ['l', 'M 436 126 L 460 126'], ['l', 'M 440 116 C 456 116, 456 136, 440 136 L 457 150'],
];

const TALLY_MARKS = [
  ['l', 'M 20 14 C 22 50, 18 80, 22 108'], ['l', 'M 50 10 C 52 46, 48 80, 51 106'],
  ['l', 'M 80 14 C 78 50, 82 82, 79 108'], ['l', 'M 110 10 C 112 50, 108 80, 111 106'],
  ['l', 'M 4 88 C 50 62, 100 42, 152 20'],
];

const PEN = [
  ['f', 'M 64 8 C 70 4, 78 6, 104 20 C 110 24, 110 30, 108 34 L 46 150 L 6 128 Z'],
  ['r', 'M 64 8 C 70 4, 78 6, 104 20 C 110 24, 110 30, 108 34 L 96 56 L 50 32 Z'],
  ['k', 'M 6 128 L 46 150 L 12 186 C 6 190, 0 186, 2 180 Z'],
  ['l', 'M 30 100 L 60 116'],
];

/* ------------------------------------------------------------------ layout data
   x/y/w are % of the photo frame (the frame has the photo's aspect, so
   these match MANIFEST.md). m* are the phone-portrait overrides. */
const SCENES = {
  apps: {
    fx: 0.5, mfx: 0.3, card: 'right',
    figs: [{ art: () => doodle(JUGGLER, '-10 -80 540 700'), x: 12, y: 27, w: 27, ratio: 700 / 540, mx: 11, my: 27, mw: 30 }],
    bubbles: [{ key: 'bubble', x: 36, y: 21, tail: '18%', mx: 27, my: 16 }],
  },
  counter: {
    fx: 0.45, mfx: 0.6, card: 'left',
    figs: [
      { art: () => doodle(CUSTOMER, '0 0 300 480'), x: 31, y: 44, w: 19, ratio: 480 / 300, mx: 37, my: 46, mw: 17 },
      { art: () => doodle(SHOPKEEPER, '0 0 260 300'), x: 66, y: 22, w: 17, ratio: 300 / 260, mx: 67, my: 29, mw: 15 },
    ],
    bubbles: [
      { key: 'bubble', x: 34, y: 20, tail: '34%', mx: 39.5, my: 17 },
      { key: 'reply', x: 51, y: 7, tail: '82%', mx: 60, my: 16, wide: true },
    ],
  },
  rewards: {
    fx: 0.5, mfx: 0.34, card: 'right',
    figs: [
      { art: () => doodle(FACEPALM, '0 0 460 560'), x: 19, y: 38, w: 27, ratio: 560 / 460, mx: 13, my: 38, mw: 30 },
      { art: () => doodle(COIN, '360 80 260 190', 'tally-coin'), x: 37, y: 15, w: 13, ratio: 190 / 260, mx: 40, my: 19, mw: 13, cls: 'tally-fig--coin' },
    ],
    bubbles: [{ key: 'bubble', x: 12, y: 13, tail: '66%', mx: 14.5, my: 17 }],
  },
};
const SCENE_BY_BG = { apps: 'apps', name: 'counter', rewards: 'rewards' };

/* solutions: which screens, and where each pointer's arrow lands.
   ax/ay are % of the screen image. p = index into the pointers array. */
const SOLS = {
  names: {
    screens: ['/img/tally/cs-amt.png', '/img/tally/cs-collect.png'],
    alts: [
      'tally pay screen for sharma tea stall. under the shop name, the bank’s legal name, rajesh sharma, has a green verified shield. a banner says this is the first payment to this shop and the qr name and bank name agree. below, a ₹300 keypad.',
      'a ₹5,000 payment request. a red banner asks “is someone on a call with you right now? end the call.” it shows the name at the requester’s bank and says a refund never needs your pin.',
    ],
    rot: [-3, 3.5], lift: [0, 34],
    notes: [
      { s: 0, p: 0, side: 'left', ax: 24, ay: 14.7, shift: -54 },
      { s: 0, p: 1, side: 'left', ax: 8, ay: 28.5, shift: 44 },
      { s: 1, p: 2, side: 'right', ax: 95, ay: 23.5, shift: -30 },
    ],
  },
  smartpay: {
    screens: ['/img/tally/cs-pay300.png', '/img/tally/cs-pay12k.png', '/img/tally/cs-pay25k.png'],
    alts: [
      'a ₹300 payment sheet with a pay button that uses face id, and the line “face id up to ₹5,000”.',
      'a ₹12,000 payment sheet. a smart pay card suggests switching from hdfc savings to an icici rupay credit card: get ₹160 back.',
      'a ₹25,000 payment sheet titled “check and pay”, with the same smart pay suggestion and the bank name verified.',
    ],
    rot: [-3, 0, 3], lift: [44, 8, -28],
    notes: [
      { s: 0, p: 0, side: 'bottom', ax: 44, ay: 94, shift: -6 },
      { s: 2, p: 1, side: 'top', ax: 72, ay: 25.5, shift: 8 },
      { s: 1, p: 2, side: 'bottom', ax: 7, ay: 70, shift: 40 },
    ],
  },
  money: {
    screens: ['/img/tally/cs-insights.png', '/img/tally/cs-goalmoney.png', '/img/tally/cs-levels.png'],
    alts: [
      'insights: ₹38,420 spent of a ₹45,000 monthly budget, “12 days left, ₹6,580 left, on pace”, with daily spend bars and a budget per category.',
      'a savings goal called kerala, december: ₹18,000 saved, ₹22,000 to go, 45% and on track. it says the money stays in hdfc ending 4821 and nothing moves. an add-to-goal sheet is open.',
      'levels: five tiers from “where everyone starts” to “annual fee waived”, then a list of what points buy, stating they are not money.',
    ],
    rot: [-3, 2, -2], lift: [10, -20, 26],
    notes: [
      { s: 0, p: 0, side: 'top', ax: 22, ay: 36.4, shift: -10 },
      { s: 1, p: 1, side: 'top', ax: 40, ay: 37.8, shift: 16 },
      { s: 2, p: 2, side: 'bottom', ax: 40, ay: 65.9, shift: 0 },
    ],
  },
  yours: {
    screens: ['/img/tally/cs-home.png', '/img/tally/cs-arrange.png'],
    alts: [
      'tally home as a stack of widgets: bank account, recents, pay, goals. a hint at the top says “hold a card to move or hide it”.',
      'arrange mode on home. every widget has up and down arrows and a hide button, and a bar says “drag to move, hide what you don’t use”.',
    ],
    rot: [-3, 3], lift: [0, 30],
    notes: [
      { s: 0, p: 0, side: 'top', ax: 12, ay: 15.6, shift: -30 },
      { s: 1, p: 1, side: 'right', ax: 88, ay: 16.8, shift: 40 },
    ],
    aside: 2, // pointer with nothing to point at: a free hand note
  },
};

/* ------------------------------------------------------------------ build */
export function build(el) {
  el.classList.add('tally');
  /* title + end card are 70/60vw on desktop and a full screen on phones,
     so the chapter width is CSS-driven (vars live in tally.css) */
  el.style.width = `calc(var(--tally-title-w) + var(--tally-end-w) + ${TOTAL - W.title - W.end}vw)`;
  const card = CARDS.find((c) => c.go === 'tally');
  const n = TALLY.problems.length;

  el.innerHTML = `
  <div class="tally-row">
    ${titleCard(card)}
    <div class="tally-group" id="tally-problem" style="width:${W.scene * n}vw">
      ${TALLY.problems.map((p, i) => scene(p, i, n)).join('')}
    </div>
    ${turn()}
    <div class="tally-group tally-group--dark" id="tally-solution" style="width:${W.sol * TALLY.solutions.length}vw">
      ${TALLY.solutions.map((s, i) => solution(s, i, TALLY.solutions.length)).join('')}
    </div>
    ${endCard()}
  </div>`;

  /* a photo that fails to load leaves the paper ground, never a broken icon */
  $$('.tally-photo img', el).forEach((img) => img.addEventListener('error', () => img.remove(), { once: true }));

  layoutNotes(el);
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => layoutNotes(el), 120); });
}

function titleCard(card) {
  return `
  <section class="tally-sub tally-title" style="width:var(--tally-title-w)" aria-labelledby="tally-h">
    <svg class="tally-ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <path d="M 170 100 C 170 60, 140 28, 100 28 C 58 28, 28 60, 30 104 C 32 146, 64 172, 104 172 C 134 172, 158 154, 166 128"/>
      <path d="M 158 96 C 156 64, 132 42, 100 44" class="tally-ring-thin"/>
      <path d="M 176 138 C 180 146, 178 152, 172 150" class="tally-ring-thin"/>
    </svg>
    <div class="tally-title-in">
      <p class="mono tally-kicker">chapter 01 · ${esc(card?.tag || 'fintech app')}</p>
      <h2 id="tally-h" class="tally-name"><span class="tally-name-word">${esc(TALLY.name)}</span>${doodle(TALLY_MARKS, '0 0 160 120', 'tally-marks')}</h2>
      <p class="tally-what">${em(TALLY.what)}</p>
      <p class="tally-role"><span class="mono">role</span> ${esc(TALLY.role)}</p>
    </div>
    <p class="tally-marker hand" aria-hidden="true">${esc(LOCAL.marker)}
      <svg viewBox="0 0 190 56" focusable="false"><path class="dd-draw" d="M 8 34 C 56 12, 118 54, 176 28"/><path class="dd-draw" d="M 158 14 L 180 28 L 158 42"/></svg>
    </p>
  </section>`;
}

function scene(p, i, n) {
  const key = SCENE_BY_BG[p.id] || 'apps';
  const S = SCENES[key];
  const figs = S.figs.map((f) => `
    <div class="tally-fig ${f.cls || ''}" style="--x:${f.x}%;--y:${f.y}%;--w:${f.w}%;--r:${f.ratio};--mx:${f.mx}%;--my:${f.my}%;--mw:${f.mw}%">${f.art()}</div>`).join('');
  const bubbles = S.bubbles.map((b, j) => `
    <p class="bubble tally-bubble tally-bubble--${j}${b.wide ? ' tally-bubble--wide' : ''}" style="--x:${b.x}%;--y:${b.y}%;--mx:${b.mx}%;--my:${b.my}%;--tail-x:${b.tail}">${esc(p[b.key])}</p>`).join('');
  return `
  <section class="tally-sub tally-scene tally-scene--${key}" style="width:${W.scene}vw" aria-labelledby="tally-p-${p.id}">
    <div class="tally-photo" style="--fx:${S.fx};--mfx:${S.mfx}">
      <div class="tally-frame">
        <img src="${p.bg}" alt="" width="2400" height="1340" loading="lazy" decoding="async" />
        ${figs}
        ${bubbles}
      </div>
    </div>
    <div class="tally-card tally-card--${S.card}">
      <div class="tally-card-in">
        <span class="tally-tape" aria-hidden="true"></span>
        <p class="mono tally-kicker">the problem · 0${i + 1} / 0${n}</p>
        <h3 id="tally-p-${p.id}" class="tally-card-title">${em(p.title)}</h3>
        <p class="tally-card-body">${em(p.body)}</p>
      </div>
    </div>
  </section>`;
}

/* the scribble: a zigzag in a 0-100 box stretched to the viewport */
/* seeded wobble so the scribble is uneven but identical on every load */
function scribblePath() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let x = -8, y = -3, down = true;
  let d = `M ${x} ${y}`;
  while (x < 112) {
    const nx = x + 8 + rnd() * 5;
    const ny = down ? 100 + rnd() * 6 : -6 + rnd() * 8;
    const cx = (x + nx) / 2 + (rnd() - 0.5) * 9;
    const cy = (y + ny) / 2 + (rnd() - 0.5) * 16;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx; y = ny; down = !down;
  }
  return d;
}

function turn() {
  return `
  <section class="tally-sub tally-turn" style="width:${W.turn}vw" aria-label="from the problem to the fix">
    <div class="tally-turn-in">
      <p class="tally-turn-before hand">${esc(LOCAL.turnBefore)}</p>
      <svg class="tally-scribble" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${scribblePath()}"/></svg>
      <div class="tally-ink" aria-hidden="true"></div>
      <div class="tally-pen" aria-hidden="true">${doodle(PEN, '0 0 112 192')}</div>
      <p class="tally-turn-after">${em(LOCAL.turnAfter)}</p>
    </div>
  </section>`;
}

function arrowSvg() {
  return `<svg class="tally-arrow" width="1" height="1" aria-hidden="true" focusable="false"><path class="dd-draw tally-arrow-ring" d=""/><path class="dd-draw tally-arrow-line" d=""/><path class="dd-draw tally-arrow-head" d=""/></svg>`;
}

function solution(s, i, n) {
  const cfg = SOLS[s.id] || { screens: s.screens, alts: s.screens.map(() => ''), rot: [], lift: [], notes: [] };
  const trio = cfg.screens.length > 2;
  const shots = cfg.screens.map((src, k) => {
    const notes = cfg.notes.filter((no) => no.s === k).map((no) => `
      <span class="tally-pin" style="left:${no.ax}%;top:${no.ay}%" aria-hidden="true">${no.p + 1}</span>
      <span class="tally-note tally-note--${no.side}" style="left:${no.ax}%;top:${no.ay}%" data-side="${no.side}" data-ax="${no.ax}" data-ay="${no.ay}" data-shift="${no.shift}" aria-hidden="true">
        ${arrowSvg()}<span class="tally-note-text hand">${esc(s.pointers[no.p])}</span>
      </span>`).join('');
    return `
      <div class="tally-shot-p" style="--lift:${cfg.lift[k] || 0}px;--k:${k}">
        <figure class="tally-shot" data-rot="${cfg.rot[k] || 0}">
          <img src="${src}" alt="${esc(cfg.alts[k] || '')}" width="392" height="832" loading="lazy" decoding="async" />
          ${notes}
        </figure>
      </div>`;
  }).join('');
  const aside = cfg.aside != null ? `<p class="tally-aside hand" aria-hidden="true">${esc(s.pointers[cfg.aside])}<svg viewBox="0 0 200 20" preserveAspectRatio="none" focusable="false"><path class="dd-draw" d="M 4 12 C 50 4, 120 18, 196 8"/></svg></p>` : '';
  return `
  <section class="tally-sub tally-sol ${trio ? 'tally-sol--trio' : 'tally-sol--duo'}" style="width:${W.sol}vw" aria-labelledby="tally-s-${s.id}">
    <div class="tally-sol-copy">
      <p class="mono tally-kicker tally-kicker--lime">the fix · 0${i + 1} / 0${n}</p>
      <h3 id="tally-s-${s.id}" class="tally-sol-title">${em(s.title)}</h3>
      <p class="tally-sol-body">${em(s.body)}</p>
      <ol class="tally-pointers">
        ${s.pointers.map((pt, k) => `<li><span class="tally-num" aria-hidden="true">${k + 1}</span><span>${esc(pt)}</span></li>`).join('')}
      </ol>
    </div>
    <div class="tally-stage">${shots}${aside}</div>
  </section>`;
}

function endCard() {
  return `
  <section class="tally-sub tally-end" style="width:var(--tally-end-w)" aria-labelledby="tally-end-h">
    <div class="tally-end-in">
      ${doodle(TALLY_MARKS, '0 0 160 120', 'tally-marks tally-marks--end')}
      <h3 id="tally-end-h" class="tally-end-title">${em(LOCAL.endTitle)}</h3>
      <div class="tally-end-actions">
        <a class="btn btn--light tally-cta" href="${walkthrough('tally')}">${esc(TALLY.cta)} <span aria-hidden="true">↗</span></a>
        <button type="button" class="tally-next hand" data-go="cox">${esc(LOCAL.next)} <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </section>`;
}

/* arrows are measured, not guessed: each one runs from outside the phone
   to its anchor, so it stays right at any screen height */
function layoutNotes(root) {
  $$('.tally-note', root).forEach((note) => {
    const shot = note.closest('.tally-shot');
    const w = shot.offsetWidth, h = shot.offsetHeight;
    if (!w || !h) return;
    const side = note.dataset.side, ax = +note.dataset.ax / 100, ay = +note.dataset.ay / 100, sh = +note.dataset.shift;
    const gap = 34;
    const txt = $('.tally-note-text', note);
    let L, tail, c1, c2, head;
    const r = 9; // the little scribbled ring around the anchor
    if (side === 'left' || side === 'right') {
      const dir = side === 'left' ? -1 : 1;
      L = (side === 'left' ? ax * w : (1 - ax) * w) + gap;
      tail = [dir * L, sh];
      c1 = [dir * L * 0.55, sh - 18];
      c2 = [dir * (r + 22), sh * 0.15 + 8];
      const tip = [dir * (r + 3), 1];
      head = `M ${dir * (r + 15)} -8 L ${tip[0]} ${tip[1]} L ${dir * (r + 13)} 11`;
      Object.assign(txt.style, side === 'left'
        ? { right: `${L + 8}px`, left: 'auto', top: `${sh - 12}px`, textAlign: 'right' }
        : { left: `${L + 8}px`, right: 'auto', top: `${sh - 12}px`, textAlign: 'left' });
      $('.tally-arrow-line', note).setAttribute('d', `M ${tail[0]} ${tail[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${tip[0]} ${tip[1]}`);
    } else {
      const dir = side === 'top' ? -1 : 1;
      L = (side === 'top' ? ay * h : (1 - ay) * h) + gap;
      tail = [sh, dir * L];
      c1 = [sh + 20, dir * L * 0.6];
      c2 = [-10, dir * (r + 26)];
      const tip = [1, dir * (r + 3)];
      head = `M -9 ${dir * (r + 15)} L ${tip[0]} ${tip[1]} L 11 ${dir * (r + 13)}`;
      Object.assign(txt.style, side === 'top'
        ? { bottom: `${L + 6}px`, top: 'auto', left: `${sh - 95}px`, textAlign: 'center' }
        : { top: `${L + 6}px`, bottom: 'auto', left: `${sh - 95}px`, textAlign: 'center' });
      $('.tally-arrow-line', note).setAttribute('d', `M ${tail[0]} ${tail[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${tip[0]} ${tip[1]}`);
    }
    $('.tally-arrow-head', note).setAttribute('d', head);
    $('.tally-arrow-ring', note).setAttribute('d', `M ${r} -2 C ${r} -${r + 2}, -${r + 1} -${r}, -${r} 1 C -${r - 1} ${r + 1}, ${r + 2} ${r}, ${r + 1} -${r - 3}`);
  });
}

/* ------------------------------------------------------------------ motion */
export function motion(ctx, el) {
  const { gsap } = ctx;
  if (!ctx.hTween) return; // static / reduced: build() already renders the final state

  const q = (s, r = el) => $$(s, r);

  /* native lazy-loading only looks ~1 screen ahead, and inside a translated
     track that means the photo decodes after you arrive. start every image
     in the chapter while it is still ~2.5 screens away. */
  ctx.st({
    trigger: el, start: 'left 350%', once: true,
    onEnter: () => q('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }),
  });

  /* ---- title card */
  const title = $('.tally-title', el);
  const nameWord = $('.tally-name-word', title);
  gsap.set($$('.tally-fillp, .tally-halo', title), { autoAlpha: 1 });
  const tTl = ctx.tl(title, { start: 'left 70%', toggleActions: 'play none none none' });
  const markPaths = q('.tally-marks .dd-draw', title);
  prepDraw(markPaths);
  const markerPaths = q('.tally-marker .dd-draw', title);
  prepDraw(markerPaths);
  tTl.fromTo(nameWord, { yPercent: 105 }, { yPercent: 0, duration: 1, ease: 'expo.out' })
    .fromTo(q('.tally-kicker, .tally-what, .tally-role', title), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out' }, .15)
    .to(markPaths, { strokeDashoffset: 0, duration: .32, stagger: .16, ease: 'power2.in' }, .35)
    .fromTo($('.tally-ring', title), { autoAlpha: 0, scale: .85, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: 'power3.out' }, .2)
    .fromTo($('.tally-marker', title), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, .9)
    .to(markerPaths, { strokeDashoffset: 0, duration: .6, stagger: .3, ease: 'power2.inOut' }, .95);

  /* ---- problem scenes */
  q('.tally-scene').forEach((sc) => {
    const frame = $('.tally-frame', sc);
    const figs = q('.tally-fig', sc);
    const svgs = q('.tally-dd', sc);
    const bubbles = q('.tally-bubble', sc);
    const card = $('.tally-card-in', sc);

    /* photo parallax: the frame is 106% wide, so it has room to drift */
    ctx.tl(sc, { start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true })
      .fromTo(frame, { x: () => innerWidth * 0.025 }, { x: () => -innerWidth * 0.025, ease: 'none' });

    gsap.set(q('.tally-fillp, .tally-halo', sc), { autoAlpha: 0 });
    const motionLines = q('.tally-motion', sc);
    if (motionLines.length) gsap.set(motionLines, { autoAlpha: 0 });
    gsap.set(bubbles, { autoAlpha: 0, scale: .3 });
    const tl = ctx.tl(sc, { start: 'left 80%', toggleActions: 'play none none none' });
    tl.fromTo(card, { autoAlpha: 0, y: 60, rotation: 5 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .9, ease: 'back.out(1.4)' }, 0);
    svgs.forEach((svg, k) => {
      const at = .1 + k * .35;
      tl.add(ctx.draw(svg, { duration: .7, stagger: { amount: 1 }, ease: 'power1.inOut' }), at);
      tl.to(q('.tally-halo, .tally-fillp', svg), { autoAlpha: 1, duration: .5, stagger: { amount: .8 } }, at + .25);
      const ml = q('.tally-motion', svg);
      if (ml.length) tl.to(ml, { autoAlpha: 1, duration: .4, stagger: .1 }, at + 1);
    });
    bubbles.forEach((b, k) => {
      tl.to(b, { autoAlpha: 1, scale: 1, duration: .55, ease: 'back.out(2.6)' }, 1.05 + k * .55);
    });

    /* idle life only while the scene is on screen */
    const loops = figs.map((f, k) => gsap.to(f, { rotation: k % 2 ? -1.6 : 1.6, y: -5, duration: 2.2 + k * .4, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true }));
    const coin = $('.tally-fig--coin', sc);
    if (coin) loops.push(gsap.to(coin, { x: 18, y: -26, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true }));
    ctx.st({ trigger: sc, start: 'left right', end: 'right left', onToggle: (s) => loops.forEach((l) => (s.isActive ? l.play() : l.pause())) });
  });

  /* ---- the turn: held still while a doodle marker scribbles it dark */
  const turnEl = $('.tally-turn', el);
  const inner = $('.tally-turn-in', turnEl);
  ctx.hold(turnEl, inner);
  const scrib = $('.tally-scribble path', turnEl);
  const len = scrib.getTotalLength();
  scrib.style.strokeDasharray = `${len}`;
  const pen = $('.tally-pen', turnEl);
  const afterWords = ctx.splitWords($('.tally-turn-after', turnEl));
  const place = (p) => {
    const pt = scrib.getPointAtLength(len * p);
    const r = inner.getBoundingClientRect();
    const cl = gsap.utils.clamp;
    gsap.set(pen, { x: cl(0, r.width, (pt.x / 100) * r.width), y: cl(r.height * 0.22, r.height * 0.97, (pt.y / 100) * r.height), rotation: Math.sin(p * 40) * 7 });
  };
  const state = { p: 0 };
  gsap.set(afterWords, { yPercent: 110 });
  gsap.set($('.tally-ink', turnEl), { autoAlpha: 0 });
  gsap.set(pen, { autoAlpha: 0 });
  /* timeline spans exactly 1.0 of a 40vw hold: scribble 0–.62, line lands
     .64–.88, a short .12 beat to read it. no empty tail. */
  const turnTl = ctx.tl(turnEl, { start: 'left left', end: 'right right', scrub: .6, invalidateOnRefresh: true });
  turnTl
    .fromTo($('.tally-turn-before', turnEl), { autoAlpha: 1, rotation: -3 }, { autoAlpha: 0, rotation: -8, y: -30, duration: .1 }, .02)
    .to(pen, { autoAlpha: 1, duration: .02 }, 0)
    .fromTo(state, { p: 0 }, { p: 1, duration: .62, ease: 'none', onUpdate: () => { scrib.style.strokeDashoffset = `${len * (1 - state.p)}`; place(state.p); } }, 0)
    .to($('.tally-ink', turnEl), { autoAlpha: 1, duration: .05 }, .57)
    .to(pen, { autoAlpha: 0, x: '+=120', y: '-=80', duration: .06 }, .62)
    .to(afterWords, { yPercent: 0, stagger: .014, duration: .16, ease: 'power3.out' }, .64)
    .to({}, { duration: .12 }, .88);
  scrib.style.strokeDashoffset = `${len}`;

  /* ---- solutions */
  q('.tally-sol').forEach((sol) => {
    const words = ctx.splitWords($('.tally-sol-title', sol));
    const shotsP = q('.tally-shot-p', sol);
    const shots = q('.tally-shot', sol);
    const notePaths = q('.tally-note .dd-draw, .tally-aside .dd-draw', sol);
    const noteTexts = q('.tally-note-text, .tally-aside', sol);
    const pins = q('.tally-pin', sol);
    gsap.set(words, { yPercent: 110 });
    gsap.set(shots, { autoAlpha: 0 });
    gsap.set(noteTexts, { autoAlpha: 0 });

    /* depth: each phone drifts at its own speed as the panel passes */
    ctx.tl(sol, { start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true })
      .fromTo(shotsP, { x: (k) => 40 + k * 36 }, { x: (k) => -(40 + k * 36), ease: 'none' });

    /* fires while the panel is still sliding in, and the phones reach full
       opacity in .4s (the move keeps settling after) so a jump never lands
       on half-faded screens */
    const tl = ctx.tl(sol, { start: 'left 78%', toggleActions: 'play none none none' });
    tl.to(words, { yPercent: 0, duration: .9, stagger: .035, ease: 'expo.out' }, 0)
      .fromTo(q('.tally-kicker, .tally-sol-body, .tally-pointers', sol), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .1, ease: 'power3.out' }, .15)
      .to(shots, { autoAlpha: 1, duration: .4, stagger: .1, ease: 'power1.out' }, .05)
      .fromTo(shots, { x: 140, y: 30, rotation: (k) => +shots[k].dataset.rot + 9 },
        { x: 0, y: 0, rotation: (k) => +shots[k].dataset.rot, duration: 1.1, stagger: .13, ease: 'expo.out' }, .05)
      .fromTo(pins, { scale: 0 }, { scale: 1, duration: .4, stagger: .1, ease: 'back.out(3)' }, .8)
      .add(() => prepDraw(notePaths), .0)
      .to(notePaths, { strokeDashoffset: 0, duration: .45, stagger: .08, ease: 'power2.inOut', onComplete: () => gsap.set(notePaths, { clearProps: 'strokeDasharray,strokeDashoffset' }) }, .85)
      .to(noteTexts, { autoAlpha: 1, duration: .5, stagger: .22 }, 1.05);
    prepDraw(notePaths);
  });

  /* ---- end card */
  const end = $('.tally-end', el);
  const endMarks = q('.tally-marks .dd-draw', end);
  prepDraw(endMarks);
  const endWords = ctx.splitWords($('.tally-end-title', end));
  gsap.set(endWords, { yPercent: 110 });
  ctx.tl(end, { start: 'left 60%', toggleActions: 'play none none none' })
    .to(endMarks, { strokeDashoffset: 0, duration: .3, stagger: .14, ease: 'power2.in' }, 0)
    .to(endWords, { yPercent: 0, duration: .8, stagger: .03, ease: 'expo.out' }, .3)
    .fromTo(q('.tally-end-actions > *', end), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .12, ease: 'back.out(1.6)' }, .7);

  /* re-measure arrows when the track refreshes (resize, fonts) */
  ctx.ScrollTrigger.addEventListener('refreshInit', () => layoutNotes(el));

  function prepDraw(paths) {
    paths.forEach((p) => {
      const l = p.getTotalLength ? p.getTotalLength() : 300;
      p.style.strokeDasharray = `${l}`;
      p.style.strokeDashoffset = `${l}`;
    });
  }
}
