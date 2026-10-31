// EN/IT: Italian browsers land on the Italian page once; the EN/IT switch
// remembers the choice. Runs in <head>, before the page paints.
// <html data-alt="…"> holds the same page in the other language.
(() => {
  'use strict';

  const KEY = 'eh-lang';
  const html = document.documentElement;

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (error) {
    console.info('[site] language choice is not stored in this browser.', error);
  }

  const preferred = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  if (html.lang === 'en' && saved === null && /^it\b/i.test(preferred) && html.dataset.alt) {
    location.replace(html.dataset.alt + location.hash);
    return;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-lang]');
    if (!link) return;
    try {
      localStorage.setItem(KEY, link.dataset.lang);
    } catch (error) {
      console.info('[site] could not remember the language choice.', error);
    }
  });
})();
