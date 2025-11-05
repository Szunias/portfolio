// Debug-only floating language badge. Visible only with ?debug=1 or localhost.
(function(){
  'use strict';
  const DEBUG_MODE = /[?&]debug=1(?:&|$)/.test(location.search) || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!DEBUG_MODE) return;
  if (document.getElementById('lang-fixed')) return;

  function flagSvg(lang){
    if (lang==='pl') return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 3 2"><rect width="3" height="1" fill="#fff"/><rect y="1" width="3" height="1" fill="#dc143c"/></svg>';
    if (lang==='nl') return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 3 2"><rect width="3" height="2" fill="#21468B"/><rect width="3" height="1.333" fill="#fff"/><rect width="3" height="0.666" fill="#AE1C28"/></svg>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 12">\
      <rect width="18" height="12" fill="#012169"/>\
      <path d="M0,0 L18,12 M18,0 L0,12" stroke="#fff" stroke-width="3"/>\
      <path d="M0,0 L18,12 M18,0 L0,12" stroke="#C8102E" stroke-width="1.2"/>\
      <rect x="0" y="5" width="18" height="2" fill="#fff"/>\
      <rect x="8" y="0" width="2" height="12" fill="#fff"/>\
      <rect x="0" y="5.5" width="18" height="1" fill="#C8102E"/>\
      <rect x="8.5" y="0" width="1" height="12" fill="#C8102E"/>\
    </svg>';
  }

  function setLang(lang){
    try { localStorage.setItem('language', lang); } catch(_){ }
    // If translatePage() is present, translate in-place; else reload
    if (typeof window.translatePage === 'function') {
      window.translatePage(lang);
    } else {
      location.reload();
    }
  }

  const box = document.createElement('div');
  box.id = 'lang-fixed';
  box.style.cssText = 'position:fixed;top:14px;right:14px;z-index:2147483647;display:flex;gap:8px;background:rgba(10,16,22,.92);border:1px solid rgba(255,255,255,.14);padding:6px;border-radius:999px;backdrop-filter:saturate(1.2) blur(4px)';
  ['en','pl','nl'].forEach(l=>{
    const btn = document.createElement('button');
    btn.type='button'; btn.setAttribute('data-lang', l);
    const flagWrap = document.createElement('span');
    flagWrap.style.cssText='width:24px;height:16px;display:inline-flex;align-items:center;justify-content:center;';
    flagWrap.innerHTML = flagSvg(l);
    const label = document.createElement('span');
    label.textContent = l.toUpperCase();
    label.style.cssText='margin-left:6px;font-weight:800;letter-spacing:.2px;line-height:1;color:#e9f7ff;display:inline-block;';
    btn.appendChild(flagWrap);
    btn.appendChild(label);
    btn.style.cssText='display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:transparent;border:0;border-radius:999px;cursor:pointer;line-height:1;';
    btn.addEventListener('click', ()=> setLang(l));
    box.appendChild(btn);
  });
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(box));
})();


