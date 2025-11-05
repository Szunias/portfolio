import { I18N } from './dictionary.js';

export function translatePage(lang){
  // Nav links by href
  document.querySelectorAll('#nav a[href="/"], #nav a[href$="index.html"], #nav a[href$="../index.html"]').forEach(a=> a.textContent = I18N.nav_home[lang]);
  document.querySelectorAll('#nav a[href$="about.html"]').forEach(a=> a.textContent = I18N.nav_about[lang]);
  document.querySelectorAll('#nav a[href="/projects/"], #nav a[href*="projects/index.html"]').forEach((a) => {
    const text = a.textContent.trim().toLowerCase();
    const isAll = /all|wszystkie|alle|projecten/.test(text) || a.closest('.links')?.children?.length<=2;
    a.textContent = isAll ? I18N.nav_all[lang] : I18N.nav_projects[lang];
  });
  document.querySelectorAll('#nav a[href$="scholarly.html"]').forEach(a=> a.textContent = I18N.nav_scholarly[lang]);
  document.querySelectorAll('#nav a[href$="extras.html"]').forEach(a=> a.textContent = I18N.nav_extra[lang]);
  document.querySelectorAll('#nav a[href$="contact.html"]').forEach(a=> a.textContent = I18N.nav_contact[lang]);
  document.querySelectorAll('#nav a[href$="music.html"]').forEach(a=> a.textContent = (I18N.nav_music && I18N.nav_music[lang]) ? I18N.nav_music[lang] : 'Music');

  // Music page
  if (location.pathname.endsWith('/music.html') || location.pathname.endsWith('music.html')){
    const h = document.querySelector('[data-i18n="music.title"], .music-page header.major h2');
    const p = document.querySelector('[data-i18n="music.lead"], .music-page header.major p');
    const sort = document.querySelector('#music-sort')?.previousElementSibling?.querySelector('span');
    if (h) h.textContent = I18N.music_title[lang];
    if (p) p.textContent = I18N.music_lead[lang];
    const qualityInfo = document.querySelector('.music-quality-info');
    if (qualityInfo) qualityInfo.innerHTML = I18N.music_quality_info[lang];
    if (sort) sort.textContent = I18N.music_sort[lang];
    const mf = document.querySelector('.music-finder .mf-label'); if (mf) mf.textContent = I18N.music_finder[lang];
    const tg = document.querySelector('.music-finder .gw-toggle'); if (tg) tg.textContent = I18N.music_gw_toggle[lang];
    document.querySelectorAll('#music-list .music-item .mi-hint').forEach(el=>{ el.textContent = I18N.music_hint_click ? I18N.music_hint_click[lang] : ''; });
    document.querySelectorAll('#music-list .music-item.playing').forEach(el=>{ el.setAttribute('data-nowplaying', I18N.music_now_playing[lang]); });
    const vr = document.querySelector('#player-bar .pb-vol-label'); if (vr) vr.textContent = I18N.music_vol_label[lang];
    const se = document.getElementById('music-search'); if (se) se.setAttribute('placeholder', I18N.music_search[lang]);
    const sel = document.getElementById('music-sort');
    if (sel && sel.options){
      if (sel.options[0]) sel.options[0].textContent = I18N.music_sort_new[lang];
      if (sel.options[1]) sel.options[1].textContent = I18N.music_sort_az[lang];
      if (sel.options[2]) sel.options[2].textContent = I18N.music_sort_len[lang];
    }
    const LABELS = {
      all: I18N.tag_all[lang], electronic: I18N.tag_electronic[lang], film: I18N.tag_film[lang], metal: I18N.tag_metal[lang],
      playful: I18N.tag_playful[lang], score: I18N.tag_score[lang], single: I18N.tag_single[lang]
    };
    document.querySelectorAll('#music-tags .chip').forEach(ch=>{ const t=ch.getAttribute('data-tag'); if (t && LABELS[t]) ch.textContent = LABELS[t]; });
  }

  // Homepage specific
  if (document.getElementById('projects-showcase')){
    const introH2 = document.querySelector('#main > section.post header.major h2'); if (introH2) introH2.textContent = I18N.intro_title[lang];
    const introLead = document.querySelector('#main > section.post header.major p'); if (introLead) introLead.textContent = I18N.intro_lead[lang];
  }

  // Capabilities (homepage)
  (function translateCapabilities(){
    const capSection = document.getElementById('capabilities') || Array.from(document.querySelectorAll('section.post'))
      .find(s => /capabilities|kompetencje|competenties/i.test((s.querySelector('header.major h2')?.textContent||'')));
    if (!capSection) return;
    const h2 = capSection.querySelector('header.major h2'); if (h2) h2.textContent = I18N.cap_title[lang];
    const lead = capSection.querySelector('header.major p'); if (lead) lead.textContent = I18N.cap_lead[lang];
    const cards = capSection.querySelectorAll('.project-card');
    if (cards[0]) { const h=cards[0].querySelector('h3'); const p=cards[0].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-gamepad" aria-hidden="true"></span> '+I18N.cap_game_h[lang]; if (p) p.textContent = I18N.cap_game_p[lang]; }
    if (cards[1]) { const h=cards[1].querySelector('h3'); const p=cards[1].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-music" aria-hidden="true"></span> '+I18N.cap_music_h[lang]; if (p) p.textContent = I18N.cap_music_p[lang]; }
    if (cards[2]) { const h=cards[2].querySelector('h3'); const p=cards[2].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-tools" aria-hidden="true"></span> '+I18N.cap_tools_h[lang]; if (p) p.textContent = I18N.cap_tools_p[lang]; }
    if (cards[3]) { const h=cards[3].querySelector('h3'); const p=cards[3].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-users" aria-hidden="true"></span> '+I18N.cap_collab_h[lang]; if (p) p.textContent = I18N.cap_collab_p[lang]; }
  })();

  // 3D Environments project page
  if (location.pathname.endsWith('/environments.html') || location.pathname.endsWith('environments.html')){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[key] && I18N[key][lang]) {
        el.textContent = I18N[key][lang];
      }
    });
  }

  // Projects index page
  const projectsIndexPaths = ['/projects/', '/projects/index.html'];
  if (projectsIndexPaths.some(path => location.pathname.endsWith(path) || location.pathname === path)){
    const filter3DBtn = document.querySelector('[data-filter="3d-design"]');
    if (filter3DBtn && I18N.filter_3d_design) {
      filter3DBtn.textContent = I18N.filter_3d_design[lang];
    }
  }

  // General data-i18n translation for all pages (fallback)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[key] && I18N[key][lang]) {
      // Check if element has data-i18n-placeholder attribute
      if (el.hasAttribute('data-i18n-placeholder')) {
        el.setAttribute('placeholder', I18N[key][lang]);
      } else if (el.innerHTML.includes('<')) {
        // If element contains HTML tags, preserve them
        el.innerHTML = I18N[key][lang];
      } else {
        el.textContent = I18N[key][lang];
      }
    }
  });
  
  // Handle placeholder translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (I18N[key] && I18N[key][lang]) {
      el.setAttribute('placeholder', I18N[key][lang]);
    }
  });
}

// Expose for non-module pages if needed
try { window.translatePage = translatePage; } catch(_){ }


