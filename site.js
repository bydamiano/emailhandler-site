// EmailHandler site: platform picker, poke-for-XP, download toast.
// Scroll animations are pure CSS (style.css), so nothing here runs on scroll.
(() => {
  'use strict';

  const RELEASES = 'https://github.com/bydamiano/emailhandler-site/releases/latest/download/';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Which computer is this? ----------

  async function detectOs() {
    const ua = navigator.userAgent;
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (/Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && coarse)) return 'mobile';
    if (/Windows/i.test(ua)) return 'windows';
    if (/Linux|X11|CrOS/i.test(ua)) return 'linux';
    if (/Mac/i.test(ua)) {
      try {
        const data = await navigator.userAgentData?.getHighEntropyValues(['architecture']);
        if (data?.architecture === 'x86') return 'mac-intel';
      } catch (error) {
        console.info('[site] CPU type unavailable; assuming an Apple chip.', error);
      }
      return 'mac-arm';
    }
    return null;
  }

  // ---------- Platform picker ("choose your character") ----------

  const platforms = [...document.querySelectorAll('.pf')];
  const startName = document.getElementById('start-name');
  const startLink = document.getElementById('start-link');
  const startFile = document.getElementById('start-file');
  const heroDownload = document.getElementById('hero-download');
  const heroText = document.getElementById('hero-download-text');

  function pick(card) {
    for (const p of platforms) {
      const on = p === card;
      p.setAttribute('aria-pressed', String(on));
      document.getElementById(p.dataset.steps).hidden = true;
    }
    document.getElementById(card.dataset.steps).hidden = false;
    const { label, file } = card.dataset;
    startName.textContent = label;
    startFile.textContent = file;
    startLink.href = RELEASES + file;
    startLink.dataset.label = label;
  }

  for (const card of platforms) card.addEventListener('click', () => pick(card));

  async function preselect() {
    const os = await detectOs();
    if (os === 'mobile') {
      document.getElementById('phone-note').hidden = false;
      heroText.textContent = 'Get it for your computer';
      return;
    }
    const card = platforms.find((p) => p.dataset.os === os);
    if (!card) return;
    card.classList.add('is-mine');
    pick(card);
    heroDownload.href = RELEASES + card.dataset.file;
    heroDownload.dataset.download = '';
    heroDownload.dataset.label = card.dataset.label;
    heroText.textContent = `Download for ${card.dataset.label}`;
  }

  // ---------- Poke the envelope for XP ----------

  const XP_PER_POKE = 10;
  const XP_PER_LEVEL = 50;
  const LEVEL_NAMES = ['Inbox Rookie', 'Tag Apprentice', 'Unsubscribe Ninja', 'Trash Wizard', 'Inbox Legend'];
  const hud = {
    level: document.getElementById('hud-level'),
    name: document.getElementById('hud-name'),
    fill: document.getElementById('hud-fill'),
    xp: document.getElementById('hud-xp'),
  };
  const pop = document.getElementById('xp-pop');
  const levelUp = document.getElementById('lvup');
  let xp = 20;

  /** Restart a CSS animation that is driven by the `go` class. */
  function replay(el) {
    el.classList.remove('go');
    void el.offsetWidth;
    el.classList.add('go');
  }

  function renderXp() {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
    hud.level.textContent = `LV ${level}`;
    hud.name.textContent = name;
    hud.xp.textContent = `${xp} XP`;
    hud.fill.style.width = `${Math.max(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100, 4)}%`;
    return name;
  }

  document.getElementById('poke').addEventListener('click', () => {
    xp += XP_PER_POKE;
    const name = renderXp();
    if (!reduceMotion.matches) replay(pop);
    if (xp % XP_PER_LEVEL === 0) {
      levelUp.textContent = `Level up! ${name}`;
      replay(levelUp);
    }
  });
  renderXp();

  // ---------- "Download started" toast ----------

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer;

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-download]');
    if (!link || !link.href.includes('/releases/')) return;
    const where = /Mac/i.test(navigator.userAgent) ? 'your Downloads folder' : 'your downloads';
    toastText.textContent = `Downloading EmailHandler for ${link.dataset.label}. Check ${where}, then follow the quest log.`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
  });

  preselect().catch((error) => console.error('[site] could not pick a download', error));
})();
