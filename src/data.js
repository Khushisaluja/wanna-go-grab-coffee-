/* ------------------------------------------------------------------
   all copy lives here. voice: simple, gen-z, lowercase. *word* renders
   as ALL CAPS emphasis via em() in lib.js. keep it short: say the one
   thing, then stop. every fact below is sourced (résumé, framer site,
   case studies). do not invent numbers.
   ------------------------------------------------------------------ */

export const ME = {
  name: 'khushi saluja',
  email: 'khushisaluj.work@gmail.com',
  linkedin: 'https://www.linkedin.com/in/khushi-saluja-sophomoretiet/',
  resume: 'https://drive.google.com/file/d/1Hff_dHhM8z_VjiagBHClrEOKoBPB78eH/view',
};

/* web3forms public access key (same one the case-file site uses). public by design:
   web3forms keys only allow sending to the inbox they were created for. */
export const WEB3FORMS_KEY = 'f78be691-1af0-4001-a155-7607706816bf';

export const HELLO = {
  title: 'say hello 👋',
  sub: 'drop me a short note, i read everything 💌',
  name: 'your name',
  email: 'your email (so i can reply back)',
  message: 'write a tiny message ✨',
  hint: 'say anything: ideas, feedback, a role, or just hi',
  max: 240,
  send: 'send',
  sending: 'sending…',
  close: 'close',
  sentTitle: 'sent! ☕',
  sentBody: 'it’s in my inbox. i’ll reply from khushisaluj.work@gmail.com, peek in spam if it’s quiet for a day.',
  error: 'that didn’t send. try again, or email me at khushisaluj.work@gmail.com',
};

export const walkthrough = (project) =>
  `mailto:${ME.email}?subject=${encodeURIComponent(`walkthrough: ${project}`)}&body=${encodeURIComponent(`hi khushi, i'd love a walkthrough of ${project}.`)}`;

export const INTRO = {
  hello: 'hi, i’m khushi.',
  line: 'i design apps and sites that feel *obvious* to use. mostly over coffee.',
  facts: [
    'ui/ux + product designer',
    '3 internships, 3 hackathon wins',
    'looking for opportunities', // 3rd tag = the dark one (intro.css nth-child(3))
    'engineering student @ thapar',
  ],
  bubble: 'shh, reading the news. (because ignorance is apparently not bliss)',
  tableDoodles: ['sticky note: “scroll →”', 'pen', 'tiny sketchbook'],
  side: 'when i’m not designing: stargazing, doodling over coffee, or losing to my dog nawab.',
};

export const BREW = {
  kicker: 'work born out of',
  title: 'intense *caffeination*',
  sub: 'three projects, one cup. tap one, or keep scrolling.',
  steamLabel: 'freshly brewed',
};

/* the three cards that pop out of the cup. `go` = panel id to jump to. */
export const CARDS = [
  { go: 'tally', name: 'tally', tag: 'fintech app · 2026', hook: 'pay, split, budget. *one* app.', img: '/img/tally/cs-home.png', tone: 'ink' },
  { go: 'cox', name: 'cox & kings', tag: 'travel website · internship · 2026', hook: 'a 260-year-old brand, *findable* again.', img: '/img/cox/hero.jpg', tone: 'blue' },
  { go: 'pawnet', name: 'pawnet', tag: 'rescue app · 2025', hook: 'every hurt stray gets *one* rescuer.', img: '/img/pawnet/pawnet-2x.jpg', tone: 'brown' },
];

/* ------------------------------------------------------------------
   TALLY. problems are scenes (photo + doodle), solutions are screens.
   ------------------------------------------------------------------ */
export const TALLY = {
  name: 'tally',
  what: 'a upi payments + money app for people in their twenties',
  role: 'research, product design, working prototype',
  problems: [
    {
      id: 'apps',
      bg: '/img/scenes/tally-apps.jpg',
      title: '*three* apps for one chai',
      body: 'pay on one app. track the budget on another. split it on splitwise. then forget which one had the receipt.',
      bubble: 'wait which app did i pay on??',
    },
    {
      id: 'name',
      bg: '/img/scenes/tally-counter.jpg',
      title: '“bhaiya, naam kya hai aapka?”',
      body: 'the only fraud check at a shop is asking the shopkeeper to read his own name back to you. scammers love that.',
      bubble: 'bhaiya… rajesh?',
      reply: 'haan haan, rajesh 👍',
    },
    {
      id: 'rewards',
      bg: '/img/scenes/tally-rewards.jpg',
      title: 'rewards? *missed* again.',
      body: 'you paid ₹12k with the card that earns nothing. the cashback card was saved in the *same* app. nobody told you to pick it.',
      bubble: 'there was cashback?? on THAT card??',
    },
  ],
  solutions: [
    {
      id: 'names',
      title: 'two names. *one* verified.',
      body: 'before you type an amount, you see the shop’s name and the bank’s legal name side by side. no more asking bhaiya.',
      screens: ['/img/tally/cs-amt.png', '/img/tally/cs-fraud.png'],
      pointers: ['bank name gets the verified tick. the shop name doesn’t, bhaiya picks that himself (like “sharma tea stall”)', 'first-time payee? it tells you what matches', 'a scam call in progress gets named on screen'],
    },
    {
      id: 'smartpay',
      title: 'smart pay picks the *right* card',
      body: 'above ₹5,000, tally suggests the card that actually earns you something, and says how much. under that, it stays out of your way.',
      screens: ['/img/tally/cs-pay12k.png', '/img/tally/cs-pay25k.png'],
      pointers: ['face id up to ₹5,000, one tap', 'bigger payment, a little more checking', 'the suggestion shows the saving upfront'],
    },
    {
      id: 'money',
      title: 'budget, goals, rewards. *built in*.',
      body: 'set a ceiling, see your pace. tag money toward a goal. good habits stack up into points and levels that unlock real perks.',
      screens: ['/img/tally/cs-insights.png', '/img/tally/cs-goalmoney.png', '/img/tally/cs-levels.png'],
      pointers: ['“12 days left · on pace”, not a scary total', 'saving for a goa trip next month? goals keep track of it', 'points come from habits, not from spending more'],
    },
    {
      id: 'yours',
      title: 'an app that shapes itself around *you*',
      body: 'one question at setup: what do you use tally for most? your home screen builds itself around the answer. personal, dynamic, still dead simple.',
      screens: ['/img/tally/cs-ob3.png', '/img/tally/cs-home.png'],
      pointers: ['pick what you use tally for, in order', 'your home screen builds itself around those answers', 'setup went from seven screens to four'],
    },
  ],
  cta: 'ask for a walkthrough',
};

/* ------------------------------------------------------------------
   COX & KINGS
   ------------------------------------------------------------------ */
export const COX = {
  name: 'cox & kings',
  what: 'the customer website for one of the world’s oldest travel companies (est. 1758)',
  role: 'product design intern · research, design system, ui, front-end',
  problems: [
    {
      id: 'dead-end',
      bg: '/img/scenes/cox-planning.jpg',
      title: '“explore now” → *no journeys found*',
      body: 'the main button on the homepage led to an empty page. for trips that cost ₹2.5 to ₹15 lakh.',
      bubble: 'explore now… explore WHAT?',
    },
    {
      id: 'no-human',
      bg: '/img/scenes/cox-call.jpg',
      title: 'nobody to *talk* to',
      body: 'trips this big close on a call. the phone number was plain text. no whatsapp, no callback, no chat.',
      bubble: 'can i just talk to a person pls',
    },
    {
      id: 'buried',
      bg: '/img/scenes/cox-heritage.jpg',
      title: '260 years, hidden in the *footer*',
      body: 'the one thing no competitor can copy was at the very bottom. and the old site stated three different company ages.',
      bubble: 'is this company new?? can i trust them? where are the reviews?',
    },
  ],
  solutions: [
    {
      id: 'search',
      title: 'one search. three fields. *one* button.',
      body: 'where, who, when. the rating sits right under it, with its source and review count.',
      screens: ['/img/cox/hero.jpg', '/img/cox/m-hero.jpg'],
      pointers: ['three fields is the most people fill before quitting', 'rating goes where the eye already is'],
    },
    {
      id: 'doors',
      title: 'three doors, not *98* filters',
      body: 'ready to book, still comparing, or just dreaming. each gets its own door, and “just talk to someone” is one of them.',
      screens: ['/img/cox/fork.jpg', '/img/cox/m-fork.jpg'],
      pointers: ['mapped 10 dimensions and 98 use cases, kept the one that predicts intent', 'a human path on every screen, tap to call on mobile'],
    },
    {
      id: 'prices',
      title: 'prices you can *actually* compare',
      body: 'a from-price and a two-traveller total on every card, plus pace and group size. the named hotel, not “premium accommodation”.',
      screens: ['/img/cox/listing-cards.jpg', '/img/cox/journeys.jpg'],
      pointers: ['“max 18 · relaxed pace · veg and jain meals”', 'brand blue owns every action, one colour to remember'],
    },
  ],
  result: { before: '5.9', after: '8+', label: 'buyer panel score out of 10, averaged across first impression, findability, pricing clarity, trust + reviews, calls to action, mobile, visuals and readability. before → after' },
  cta: 'ask for a walkthrough',
};

/* ------------------------------------------------------------------
   PAWNET
   ------------------------------------------------------------------ */
export const PAWNET = {
  name: 'pawnet',
  what: 'a hyperlocal rescue app for injured street animals',
  role: 'self-directed · ux + product design',
  problems: [
    {
      id: 'groups',
      bg: '/img/scenes/pawnet-groups.jpg', // outpainted from /img/raw/IMG_4115.jpg (fallback)
      title: 'rescue runs on *whatsapp groups*',
      body: 'someone posts a photo of a hurt dog. 40 people react with 😢. nobody actually owns it.',
      bubble: 'is anyone going??',
    },
    {
      id: 'double',
      bg: '/img/scenes/pawnet-double.jpg', // outpainted from /img/raw/IMG_7274.jpg (fallback)
      title: 'two volunteers, *same* dog',
      body: 'and three other dogs nobody went to. the person who reported it never finds out what happened.',
      bubble: 'oh… you’re here too?',
    },
  ],
  solutions: [
    {
      id: 'claim',
      title: 'one report, *one* owner',
      body: 'alerts go to rescuers nearby. the first person to claim a case locks it, so nobody doubles up.',
      screens: ['/img/pawnet/rescue.png', '/img/pawnet/detail.png'],
      pointers: ['critical, moderate, stable: colour AND a label', 'claim, update, or release it back'],
    },
    {
      id: 'track',
      title: 'the reporter sees *every* step',
      body: 'reported → assigned → on route → transport → rescued. no more “did anyone go?”',
      screens: ['/img/pawnet/detail.png', '/img/pawnet/report.png'],
      pointers: ['otp-verified reports, fewer fake alerts', 'five roles, each with its own flow', 'reporters: no login, just report. regulars: alerts + a rescue community'],
    },
    {
      id: 'lost',
      title: 'lost pets, *matched*',
      body: 'lost and found posts get matched with a confidence score, side by side, so owners check the likely ones first.',
      screens: ['/img/pawnet/lost.png'],
      pointers: ['≥70% green, ≥40% amber, below that terra', 'built mobile-first, thumb-reachable nav'],
    },
  ],
  caseStudy: 'https://pawnet.figma.site/',
  cta: 'ask for a walkthrough',
};

export const OUTRO = {
  title: 'cup’s *empty*.',
  sub: 'refill? let’s talk about your product over a coffee (or a call).',
  also: 'also made: velo, zynema, bitebook, menuscrript and a very serious coffee recipes site.',
  sign: 'crafted with love and a LOT of caffeine',
};
