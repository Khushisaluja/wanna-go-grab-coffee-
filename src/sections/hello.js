/* ------------------------------------------------------------------
   SAY HELLO · the contact dialog behind every "say hi" button.
   native <dialog> + showModal(): focus is trapped, Esc closes, the page
   behind is inert. sends through web3forms (same key as the case-file site).
   ------------------------------------------------------------------ */
import './hello.css';
import gsap from 'gsap';
import { HELLO, WEB3FORMS_KEY, ME } from '../data.js';
import { esc } from '../lib.js';

let dlg = null;
let lastTrigger = null;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-static');

function build() {
  dlg = document.createElement('dialog');
  dlg.className = 'hello';
  dlg.setAttribute('aria-labelledby', 'hello-title');
  dlg.setAttribute('aria-describedby', 'hello-sub');
  dlg.innerHTML = `
    <div class="hello-card">
      <button type="button" class="hello-x" data-close aria-label="${esc(HELLO.close)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
      </button>

      <div class="hello-body" data-view="form">
        <h2 class="hello-title" id="hello-title">${esc(HELLO.title)}</h2>
        <p class="hello-sub" id="hello-sub">${esc(HELLO.sub)}</p>

        <form class="hello-form" novalidate>
          <input type="hidden" name="access_key" value="${esc(WEB3FORMS_KEY)}" />
          <input type="hidden" name="subject" value="new note from the coffee portfolio" />
          <input type="hidden" name="from_name" value="coffee portfolio" />
          <input type="checkbox" name="botcheck" class="sr" tabindex="-1" autocomplete="off" aria-hidden="true" />

          <label class="hello-field">
            <span class="sr">${esc(HELLO.name)}</span>
            <input class="hello-input" name="name" type="text" autocomplete="name" required maxlength="80" placeholder="${esc(HELLO.name)}" />
          </label>
          <label class="hello-field">
            <span class="sr">${esc(HELLO.email)}</span>
            <input class="hello-input" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="120" placeholder="${esc(HELLO.email)}" />
          </label>
          <label class="hello-field">
            <span class="sr">${esc(HELLO.message)}</span>
            <textarea class="hello-input hello-textarea" name="message" required maxlength="${HELLO.max}" rows="4" placeholder="${esc(HELLO.message)}" aria-describedby="hello-hint hello-count"></textarea>
          </label>
          <div class="hello-meta">
            <span id="hello-hint">${esc(HELLO.hint)}</span>
            <span id="hello-count" class="hello-count" aria-live="off">0/${HELLO.max}</span>
          </div>

          <p class="hello-error" role="alert" hidden></p>

          <div class="hello-actions">
            <button type="submit" class="hello-send">${esc(HELLO.send)}</button>
            <button type="button" class="hello-close" data-close>${esc(HELLO.close)}</button>
          </div>
        </form>
      </div>

      <div class="hello-body hello-done" data-view="sent" hidden>
        <svg class="dd hello-done-cup" viewBox="0 0 120 110" aria-hidden="true">
          <path class="dd-fill" d="M22 38 L 92 38 L 86 96 C 84 102, 30 102, 28 96 Z"/>
          <path d="M92 50 C 112 48, 112 80, 88 78"/>
          <path d="M44 28 C 40 20, 48 14, 44 6 M60 28 C 56 20, 64 14, 60 6 M76 28 C 72 20, 80 14, 76 6"/>
          <path class="hello-done-tick" d="M42 66 L 54 78 L 76 54"/>
        </svg>
        <h2 class="hello-title" tabindex="-1">${esc(HELLO.sentTitle)}</h2>
        <p class="hello-sub">${esc(HELLO.sentBody)}</p>
        <div class="hello-actions">
          <button type="button" class="hello-send" data-close>${esc(HELLO.close)}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dlg);

  const form = dlg.querySelector('form');
  const msg = form.querySelector('textarea');
  const count = dlg.querySelector('.hello-count');
  const err = dlg.querySelector('.hello-error');
  const send = form.querySelector('.hello-send');

  msg.addEventListener('input', () => {
    count.textContent = `${msg.value.length}/${HELLO.max}`;
    count.classList.toggle('is-near', msg.value.length > HELLO.max - 20);
  });

  /* validate on blur, not while typing; clear the error as soon as it's fixed */
  form.querySelectorAll('.hello-input').forEach((inp) => {
    inp.addEventListener('blur', () => { if (inp.value) inp.toggleAttribute('aria-invalid', !inp.checkValidity()); });
    inp.addEventListener('input', () => {
      if (inp.hasAttribute('aria-invalid') && inp.checkValidity()) inp.removeAttribute('aria-invalid');
      /* the "fill in all three" nudge goes away once there's nothing left to fix */
      if (!err.hidden && !form.querySelector('.hello-input[aria-invalid]')) err.hidden = true;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const bad = [...form.querySelectorAll('.hello-input')].filter((i) => !i.checkValidity() || !i.value.trim());
    bad.forEach((i) => i.setAttribute('aria-invalid', ''));
    if (bad.length) {
      err.textContent = bad[0].name === 'email' && bad[0].value ? 'that email doesn’t look right.' : 'fill in all three, then send.';
      err.hidden = false;
      bad[0].focus();
      return;
    }
    send.disabled = true;
    send.textContent = HELLO.sending;
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'send failed');
      form.reset();
      count.textContent = `0/${HELLO.max}`;
      showView('sent');
    } catch {
      err.textContent = HELLO.error;
      err.hidden = false;
    } finally {
      send.disabled = false;
      send.textContent = HELLO.send;
    }
  });

  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { close(); return; }
    if (e.target === dlg) close(); // click on the backdrop
  });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Esc
}

function showView(v) {
  dlg.querySelectorAll('[data-view]').forEach((el) => { el.hidden = el.dataset.view !== v; });
  if (v === 'sent') {
    dlg.querySelector('[data-view="sent"] .hello-title').focus();
    if (!reduced()) gsap.fromTo(dlg.querySelector('.hello-done-cup'), { scale: 0.6, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' });
  }
}

export function openHello(trigger) {
  if (!dlg) build();
  lastTrigger = trigger || document.activeElement;
  showView('form');
  dlg.querySelector('.hello-error').hidden = true;
  dlg.showModal();
  window.__ctx?.lenis?.stop();
  document.documentElement.classList.add('hello-open');
  if (!reduced()) {
    gsap.fromTo(dlg.querySelector('.hello-card'), { y: 30, scale: 0.94, rotation: -1.5, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.7)' });
  }
  dlg.querySelector('input[name="name"]').focus();
}

function close() {
  if (!dlg?.open) return;
  const done = () => {
    dlg.close();
    window.__ctx?.lenis?.start();
    document.documentElement.classList.remove('hello-open');
    lastTrigger?.focus?.({ preventScroll: true });
  };
  if (reduced()) { done(); return; }
  gsap.to(dlg.querySelector('.hello-card'), { y: 20, scale: 0.96, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: done });
}

/* any element with data-hello opens the dialog (links keep a mailto href as a no-js fallback) */
export function wireHello() {
  /* [data-copy-email]: copy the address, say "copied!" for a moment, announce it to screen readers */
  let live = null;
  document.addEventListener('click', async (e) => {
    const c = e.target.closest('[data-copy-email]');
    if (!c) return;
    const addr = c.dataset.copyEmail;
    const label = c.querySelector('[data-copy-label]') || c;
    let ok = true;
    try { await navigator.clipboard.writeText(addr); } catch {
      /* clipboard api blocked (http, old browsers): fall back to a hidden textarea */
      const ta = Object.assign(document.createElement('textarea'), { value: addr });
      ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    if (!live) { live = Object.assign(document.createElement('p'), { className: 'sr' }); live.setAttribute('aria-live', 'polite'); document.body.appendChild(live); }
    live.textContent = ok ? `copied ${addr}` : `couldn't copy. the email is ${addr}`;
    label.textContent = ok ? 'copied! ✓' : addr;
    c.classList.toggle('is-copied', ok);
    clearTimeout(c._t);
    c._t = setTimeout(() => { label.textContent = 'copy email'; c.classList.remove('is-copied'); }, ok ? 2000 : 6000);
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-hello]');
    if (!t) return;
    e.preventDefault();
    openHello(t);
  });
}

export { ME };
