// Small bootstrap that translates the page and loads page modules conditionally.
import { translatePage } from './i18n/translate.js';

function getLang(){
  const stored = (typeof localStorage!=='undefined' && localStorage.getItem('language')) || '';
  const fromHtml = document.documentElement.getAttribute('lang') || '';
  const cand = (stored || fromHtml || 'en').toLowerCase();
  return /^(en|pl|nl)$/.test(cand) ? cand : 'en';
}

const lang = getLang();
translatePage(lang);

// Conditional page code
const path = location.pathname;
if (/not-today-darling\.html$/.test(path)) {
  import('./pages/not-today-darling.js');
}
if (/environments\.html$/.test(path)) {
  // No specific JS needed for environments page yet
}
if (/\/(index\.html)?$/.test(path)) {
  import('./pages/home.js');
}
// Other pages can be added here as they are modularized


