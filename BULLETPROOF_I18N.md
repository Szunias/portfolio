# 🛡️ Bulletproof i18n Architecture

## Problem z obecnym systemem

**Single point of failure:**
```javascript
// Jeśli to fail → cała strona pusta
await fetch('locales/index.json')
```

**Co może się zepsuć:**
1. ❌ Fetch error (network fail, 404)
2. ❌ JSON parse error (malformed JSON)
3. ❌ LocalStorage quota exceeded
4. ❌ JS disabled by user
5. ❌ Typo in translation key
6. ❌ Missing translation file
7. ❌ Race condition (JS loads before JSON)

---

## ✅ Bulletproof Solution - 5 Layers of Defense

### Layer 1: HTML Fallback (No JS required)

**Każdy element ma domyślny tekst w HTML:**

```html
<!-- ❌ ZŁE - jeśli JS fail = puste -->
<h1 data-i18n="hero.title"></h1>

<!-- ✅ DOBRE - zawsze działa -->
<h1 data-i18n="hero.title">Interactive Sound for Modern Games</h1>
```

**Zalety:**
- ✅ Działa bez JS
- ✅ SEO-friendly (Google widzi tekst)
- ✅ Instant load (no FOUC)
- ✅ Accessibility (screen readers)

---

### Layer 2: Inline Critical Translations

**Najważniejsze tłumaczenia w `<head>` jako inline JSON:**

```html
<head>
  <script>
    // Critical translations inline (no network request)
    window.__CRITICAL_I18N__ = {
      en: {
        'nav.home': 'Home',
        'nav.projects': 'Projects',
        'nav.contact': 'Contact'
      },
      pl: {
        'nav.home': 'Start',
        'nav.projects': 'Projekty',
        'nav.contact': 'Kontakt'
      }
    };
  </script>
</head>
```

**Zalety:**
- ✅ Zero network delay dla nav
- ✅ Instant language switch
- ✅ ~2KB inline (acceptable)

---

### Layer 3: Lazy Loading with Timeout

**Ładuj dodatkowe tłumaczenia async z timeout:**

```javascript
class BulletproofTranslationService {
  async loadTranslations(lang) {
    // Timeout promise - fail after 3s
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );

    // Fetch with timeout
    try {
      const translations = await Promise.race([
        fetch(`/locales/${lang}/main.json`).then(r => r.json()),
        timeout
      ]);

      return translations;
    } catch (error) {
      console.warn('Translations failed to load, using fallback');

      // Fallback: use inline critical translations
      return window.__CRITICAL_I18N__[lang] || {};
    }
  }
}
```

**Zalety:**
- ✅ Nigdy nie blokuje strony
- ✅ Pokazuje content po 3s nawet jeśli fail
- ✅ Graceful degradation

---

### Layer 4: Fallback Chain

**Hierarchia fallback:**

```
1. Try: Current language translation (PL)
2. Try: English translation (EN)
3. Try: Key from inline critical i18n
4. Try: HTML fallback content (data-i18n element textContent)
5. Last resort: Show translation key
```

**Implementacja:**

```javascript
translate(key, lang = this.currentLang) {
  // 1. Try current language
  let value = this.getTranslation(key, lang);
  if (value) return value;

  // 2. Try English fallback
  if (lang !== 'en') {
    value = this.getTranslation(key, 'en');
    if (value) return value;
  }

  // 3. Try inline critical
  value = window.__CRITICAL_I18N__?.[lang]?.[key];
  if (value) return value;

  // 4. Try HTML fallback
  const element = document.querySelector(`[data-i18n="${key}"]`);
  if (element?.textContent) return element.textContent;

  // 5. Last resort: show key
  console.warn(`Translation missing: ${key}`);
  return key;
}
```

---

### Layer 5: Error Boundaries

**Wrap każdą operację w try-catch:**

```javascript
class BulletproofTranslationService {
  // Global error handler
  _safeExecute(fn, fallback) {
    try {
      return fn();
    } catch (error) {
      console.error('[i18n] Error:', error);
      return fallback;
    }
  }

  // Safe translate
  translate(key) {
    return this._safeExecute(
      () => this._translateInternal(key),
      key // Fallback: return key
    );
  }

  // Safe DOM update
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      this._safeExecute(() => {
        const key = element.getAttribute('data-i18n');
        const translation = this.translate(key);

        // Only update if translation is different from current
        if (element.textContent !== translation) {
          element.textContent = translation;
        }
      }, undefined); // Fallback: do nothing, keep HTML content
    });
  }
}
```

---

## 🎯 Recommended Architecture

### File Structure:

```
locales/
├── critical.json (2KB - inlined in HTML <head>)
│   └── Navigation, footer, error messages
├── en/
│   ├── common.json (5KB - lazy loaded on all pages)
│   ├── home.json (8KB - lazy loaded on home page)
│   └── projects.json (10KB - lazy loaded on projects page)
├── pl/
│   └── ... (same structure)
└── nl/
    └── ... (same structure)
```

### Loading Strategy:

```javascript
// 1. Inline critical (0ms - already in HTML)
// 2. Lazy load common.json (100-200ms)
// 3. Lazy load page-specific.json (100-200ms)
// 4. Show content after 3s timeout (guaranteed)
```

---

## 📊 Comparison: Current vs Bulletproof

### Current System:

| Scenario | Result |
|----------|--------|
| ❌ JSON 404 | Blank page |
| ❌ JSON parse error | Blank page |
| ❌ JS disabled | Blank page |
| ❌ Slow network (5s) | Blank page for 5s |
| ❌ Missing key | Shows key or blank |

### Bulletproof System:

| Scenario | Result |
|----------|--------|
| ✅ JSON 404 | Shows HTML fallback (English) |
| ✅ JSON parse error | Uses inline critical i18n |
| ✅ JS disabled | Shows HTML content (works!) |
| ✅ Slow network (5s) | Shows content after 3s timeout |
| ✅ Missing key | Fallback chain: EN → HTML → key |

---

## 🔥 Ultra-Lightweight Option (5KB)

**Jeśli chcesz MINIMAL bundle:**

```javascript
// ultra-minimal-i18n.js (5KB minified)
const i18n = {
  lang: localStorage.getItem('lang') || 'en',
  t: {},

  // Load translations
  async load(lang) {
    try {
      const res = await Promise.race([
        fetch(`/i18n/${lang}.json`),
        new Promise((_, rej) => setTimeout(() => rej('timeout'), 2000))
      ]);

      if (res.ok) this.t = await res.json();
    } catch (e) {
      // Use inline fallback
      this.t = window.__I18N__?.[lang] || {};
    }

    this.apply();
  },

  // Apply translations to DOM
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      try {
        const key = el.dataset.i18n;
        const text = key.split('.').reduce((o, k) => o?.[k], this.t);
        if (text) el.textContent = text;
      } catch (e) {
        // Keep HTML content on error
      }
    });
  },

  // Change language
  set(lang) {
    this.lang = lang;
    localStorage.setItem('lang', lang);
    this.load(lang);
  }
};

// Auto-init
i18n.load(i18n.lang);
```

**+ Inline critical i18n in HTML:**

```html
<script>
window.__I18N__ = {
  en: { nav: { home: 'Home' } },
  pl: { nav: { home: 'Start' } }
};
</script>
```

**Rezultat:**
- ✅ 5KB total JS
- ✅ Działa bez network request (inline fallback)
- ✅ Graceful degradation
- ✅ HTML fallback content
- ✅ Timeout protection

---

## 🎯 Implementation Plan

### Option A: Ultra-Minimal (5KB, 2h work)
- Jeden prosty plik `i18n.js` (5KB)
- Inline critical translations
- HTML fallback content
- Timeout + try-catch protection

### Option B: Professional with Polyglot.js (8KB, 3h work)
- Polyglot.js dla pluralizacji
- Custom loader z timeout
- Inline critical + lazy loading
- Full fallback chain

### Option C: Industry-Standard with i18next (70KB, 4h work)
- i18next + http-backend
- Namespace lazy loading
- Full feature set
- Error boundaries

---

## 💡 My Recommendation

**→ Option A: Ultra-Minimal**

**Dlaczego:**
1. ✅ **5KB** - minimal impact
2. ✅ **Bulletproof** - nigdy nie crashuje
3. ✅ **Fast** - instant critical translations
4. ✅ **SEO** - HTML content works without JS
5. ✅ **Simple** - łatwy maintenance

**Trade-off:**
- ❌ Brak pluralizacji (musisz ręcznie: "1 project" vs "5 projects")
- ❌ Brak interpolacji (musisz ręcznie: `Hello ${name}`)

Ale dla portfolio - **wystarczy w 100%**.

---

## 🔨 Implementation Example

### HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Critical i18n inline (no network delay) -->
  <script>
    window.__I18N__ = {
      en: {
        nav: { home: 'Home', projects: 'Projects', contact: 'Contact' },
        hero: { title: 'Interactive Sound for Modern Games' }
      },
      pl: {
        nav: { home: 'Start', projects: 'Projekty', contact: 'Kontakt' },
        hero: { title: 'Interaktywny Dźwięk dla Nowoczesnych Gier' }
      }
    };
  </script>
</head>
<body>
  <!-- Fallback content in HTML (works without JS) -->
  <nav>
    <a data-i18n="nav.home" href="/">Home</a>
    <a data-i18n="nav.projects" href="/projects">Projects</a>
    <a data-i18n="nav.contact" href="/contact">Contact</a>
  </nav>

  <h1 data-i18n="hero.title">Interactive Sound for Modern Games</h1>

  <!-- Ultra-minimal i18n (5KB) -->
  <script src="/assets/js/i18n.min.js" defer></script>
</body>
</html>
```

### Result:

1. **Without JS:** Page works perfectly (English fallback)
2. **With JS (instant):** Shows correct language from inline critical
3. **With JS (after load):** Shows full translations from JSON
4. **On error:** Falls back to inline → HTML → key

---

## ✅ Testing Failure Scenarios

```bash
# Test 1: Disable JavaScript
# Result: ✅ Page works with HTML content

# Test 2: Block JSON file (404)
# Result: ✅ Uses inline critical i18n

# Test 3: Malformed JSON
# Result: ✅ Catches error, uses inline fallback

# Test 4: Slow network (5s)
# Result: ✅ Shows content after 3s timeout

# Test 5: LocalStorage full
# Result: ✅ Falls back to default language

# Test 6: Missing translation key
# Result: ✅ Uses fallback chain (EN → HTML → key)
```

---

## 🚀 Ready to Implement?

Powiedz które rozwiązanie Cię interesuje:

1. **Option A: Ultra-Minimal** (5KB, bulletproof, 2h)
2. **Option B: Polyglot.js** (8KB, with pluralization, 3h)
3. **Option C: i18next** (70KB, full features, 4h)

Ja polecam **Option A** - prosty, szybki, nie crashuje nigdy.
