# Translation System Documentation

This document explains how the multi-language translation system works in Igor Szuniewicz's portfolio website.

## Overview

The translation system supports three languages:
- **English (en)** - Default language
- **Polish (pl)** - Native language
- **Dutch (nl)** - Secondary language

The system is entirely JavaScript-based with no external JSON files. All translations are embedded in `assets/js/components/enhancements.js`.

## System Architecture

The translation system uses a multi-layered approach with different strategies for different page types:

### 1. Global I18N Object
Located in `enhancements.js` starting around line 673:
```javascript
const I18N = {
  nav_home: { pl: 'Główna', nl: 'Home', en: 'Home' },
  nav_about: { pl: 'O mnie', nl: 'Over mij', en: 'About' },
  // ... hundreds of translation keys
}
```

**Key format**: Underscore notation (e.g., `ray_title`, `amorak_overview_desc`)
**Usage**: For `data-i18n` attributes and general page elements

### 2. Project-Specific Object (P)
Located in `translatePage()` function around line 1188:
```javascript
const P = {
  amorak: {
    title: { en:'Amorak — Sound Design', pl:'Amorak — Sound design', nl:'Amorak — Sounddesign' },
    lead: { en:'Complete sound design...', pl:'Kompletny sound design...', nl:'Volledig sounddesign...' },
    overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
    // ...
  },
  'ray-animation': {
    title: { en:'Ray Animation — Music Composition', pl:'Animacja Ray — Kompozycja muzyki', nl:'Ray Animation — Muziekcompositie' },
    // ...
  }
}
```

**Key format**: Page filename without `.html` (e.g., `ray-animation`, `akantilado`)
**Usage**: For basic project page elements (title, lead, h3 headers)

### 3. Page-Specific Handlers
Different pages have custom translation logic:

#### Individual Project Pages
```javascript
// Ray Animation page translations
if (location.pathname.endsWith('/ray-animation.html')){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[key]) {
      el.textContent = I18N[key][lang];
    }
  });
}
```

#### Special Pages
- **Not Today Darling**: Custom prefix (`ntd_`) added to keys
- **AudioLab**: Direct I18N lookup
- **MusicForGames**: Direct I18N lookup
- **Environments**: Custom ENV object with local translations
- **About/Index**: Custom objects (A, P) with specific translations

## Translation Flow

### 1. Language Detection
```javascript
const LANG_KEY = 'site-lang';
let currentLang = localStorage.getItem(LANG_KEY) || detectLanguage() || 'en';
```
- Checks localStorage first
- Falls back to browser/geo detection
- Defaults to English

### 2. Page Translation Process
When `translatePage(lang)` is called:

1. **Navigation**: Updates all nav links with I18N object
2. **Page-specific logic**: Checks URL and applies appropriate translation strategy
3. **Generic data-i18n**: Processes any remaining `[data-i18n]` elements

### 3. Language Switching
```javascript
function setLang(l, opts) {
  localStorage.setItem(LANG_KEY, l);
  translatePage(l);
  // Update UI elements
}
```

## Adding New Translations

### For Existing Projects
1. **Basic elements** (title, lead, headers): Add to object P in `translatePage()`
2. **Content elements**: Add to I18N object with underscore notation
3. **Ensure data-i18n attributes** use underscore format: `data-i18n="project_key"`

### For New Projects
1. **Add to object P**:
   ```javascript
   'new-project': {
     title: { en:'Title', pl:'Tytuł', nl:'Titel' },
     lead: { en:'Lead text', pl:'Tekst wprowadzający', nl:'Leidende tekst' },
     overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
     gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
     showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
   }
   ```

2. **Add content translations to I18N**:
   ```javascript
   newproject_overview_desc: {
     en: 'English description',
     pl: 'Polski opis',
     nl: 'Nederlandse beschrijving'
   }
   ```

3. **Add page-specific handler** (if needed):
   ```javascript
   if (location.pathname.endsWith('/new-project.html')){
     document.querySelectorAll('[data-i18n]').forEach(el => {
       const key = el.getAttribute('data-i18n');
       if (I18N[key]) {
         el.textContent = I18N[key][lang];
       }
     });
   }
   ```

### For New Pages
1. Create custom translation object in `translatePage()`
2. Add page detection logic
3. Process `[data-i18n]` elements with custom logic if needed

## HTML Integration

### Standard Usage
```html
<h2 data-i18n="project_title">Default English Text</h2>
<p data-i18n="project_description">Default description</p>
```

### Key Naming Conventions
- **Global elements**: `nav_`, `music_`, `contact_` prefixes
- **Project content**: `projectname_key` format (e.g., `ray_overview_desc`)
- **Special pages**: Custom prefixes (`ntd_`, `env_`, etc.)

## File Locations

- **Main translation logic**: `assets/js/components/enhancements.js`
- **Translation objects**: Lines 673+ (I18N), 1188+ (P), various page-specific sections
- **Language switching UI**: Built into the language badge system
- **Storage**: Browser localStorage with key `site-lang`

## Current Translation Keys

The system contains 900+ translation keys covering:
- Navigation elements
- Homepage content
- Project descriptions
- About/CV page
- Music player interface
- Contact forms
- Scholarly page
- All project pages (Ray Animation, Akantilado, Amorak, Not Today Darling, etc.)

## Debugging

To debug translations:
1. Check browser console for errors
2. Verify `localStorage.getItem('site-lang')`
3. Test `translatePage('pl')` in console
4. Ensure `data-i18n` attributes match I18N object keys exactly
5. Check page-specific handlers are triggered correctly

## Future Improvements

Potential system enhancements:
- Extract translations to separate JSON files
- Add translation loading indicators
- Implement fallback chains (pl → en for missing keys)
- Add translation validation tools
- Consider using established i18n libraries for complex features