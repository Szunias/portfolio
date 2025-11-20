/**
 * Komponent Nawigacji (navigation.js)
 * Odpowiada za wyświetlanie menu i obsługę wersji mobilnej.
 */

export class NavigationComponent {
  constructor() {
    this.header = null;
    this.mobileMenu = null;
    this.toggleBtn = null;
    this.overlay = null;
    this.scrollTicking = false;
    
    // Wiązanie metod (żeby 'this' zawsze wskazywało na ten obiekt)
    this.handleScroll = this.handleScroll.bind(this);
    this.handleMobileMenuClick = this.handleMobileMenuClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }

  // Główna funkcja startowa
  init() {
    // 1. Jeśli nie ma nagłówka w HTML, stwórz go
    if (!document.getElementById('header')) {
      this.render();
    }

    // 2. Znajdź elementy w DOM
    this.header = document.getElementById('header');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.toggleBtn = document.querySelector('.mobile-menu-toggle');
    this.overlay = document.querySelector('.mobile-menu-overlay');

    // 3. Uruchom logikę
    this.setupSkipLink();
    this.setActiveLink();
    this.setActiveLanguageButton();
    this.setupEventListeners();
    this.handleScroll(); // Sprawdź scroll na starcie

    // 4. Naprawa migania tłumaczeń
    if (window.__I18N__ && !document.documentElement.classList.contains('translations-ready')) {
      document.documentElement.classList.add('translations-ready');
    }
    
    console.log('[Navigation] Menu załadowane pomyślnie');
  }

  // Szablon HTML menu
  getTemplate() {
    return `
      <header class="header" id="header">
        <div class="container">
          <nav class="nav">
            <a href="/" class="logo">Igor Szuniewicz</a>
            <div class="nav-menu">
              <ul class="nav-links">
                <li><a href="/" data-i18n="nav_home">Home</a></li>
                <li><a href="/about.html" data-i18n="nav_about">About</a></li>
                <li><a href="/projects/" data-i18n="nav_projects">Projects</a></li>
                <li><a href="/music.html" data-i18n="nav_music">Music</a></li>
                <li><a href="/contact.html" data-i18n="nav_contact">Contact</a></li>
              </ul>
              <div class="lang-switcher">
                <button class="lang-btn" data-lang="en">EN</button>
                <button class="lang-btn" data-lang="pl">PL</button>
                <button class="lang-btn" data-lang="nl">NL</button>
              </div>
            </div>
            <button class="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </nav>
        </div>
      </header>
      <div class="mobile-menu-overlay"></div>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        <ul class="mobile-nav-links">
          <li><a href="/" data-i18n="nav_home">Home</a></li>
          <li><a href="/about.html" data-i18n="nav_about">About</a></li>
          <li><a href="/projects/" data-i18n="nav_projects">Projects</a></li>
          <li><a href="/music.html" data-i18n="nav_music">Music</a></li>
          <li><a href="/contact.html" data-i18n="nav_contact">Contact</a></li>
        </ul>
        <div class="mobile-lang-switcher">
          <button class="lang-btn" data-lang="en">EN</button>
          <button class="lang-btn" data-lang="pl">PL</button>
          <button class="lang-btn" data-lang="nl">NL</button>
        </div>
      </div>
    `;
  }

  render() {
    if (!document.body) return;
    document.body.insertAdjacentHTML('afterbegin', this.getTemplate());
  }

  setupEventListeners() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    document.addEventListener('click', this.handleMobileMenuClick);
    document.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('languageChanged', this.handleLanguageChange);
  }

  handleScroll() {
    if (!this.scrollTicking) {
      window.requestAnimationFrame(() => {
        if (this.header) {
          this.header.classList.toggle('scrolled', window.scrollY > 50);
        }
        this.scrollTicking = false;
      });
      this.scrollTicking = true;
    }
  }

  handleMobileMenuClick(event) {
    const target = event.target;
    // Kliknięcie w burger menu
    if (this.toggleBtn && (this.toggleBtn === target || this.toggleBtn.contains(target))) {
      this.toggleMenu();
      return;
    }
    // Kliknięcie w tło lub link zamyka menu
    if (target === this.overlay || target.closest('.mobile-menu a') || target.closest('.mobile-lang-switcher .lang-btn')) {
      if (this.mobileMenu?.classList.contains('active')) this.closeMenu();
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.mobileMenu?.classList.contains('active')) this.closeMenu();
  }

  toggleMenu() {
    const isActive = this.mobileMenu.classList.contains('active');
    isActive ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.toggleBtn?.classList.add('active');
    this.mobileMenu?.classList.add('active');
    this.overlay?.classList.add('active');
  }

  closeMenu() {
    this.toggleBtn?.classList.remove('active');
    this.mobileMenu?.classList.remove('active');
    this.overlay?.classList.remove('active');
  }

  handleLanguageChange(event) {
    this.setActiveLanguageButton(event.detail?.language);
  }

  setActiveLanguageButton(langOverride = null) {
    const currentLang = langOverride || localStorage.getItem('language') || 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  setActiveLink() {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
        const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
        if (path.includes('projects') && linkPath.includes('projects')) {
            link.classList.add('active');
        } else {
            link.classList.toggle('active', linkPath === path);
        }
    });
  }

  setupSkipLink() {
    if (document.querySelector('.skip-nav')) return;
    const main = document.querySelector('main') || document.querySelector('section');
    if (main) {
        if (!main.id) main.id = 'main-content';
        const skipLink = document.createElement('a');
        skipLink.href = `#${main.id}`;
        skipLink.className = 'skip-link visually-hidden';
        skipLink.textContent = 'Skip to main content';
        document.body.prepend(skipLink);
    }
  }
}