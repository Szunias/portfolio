import { initTranslation } from "./home/translation.js";
import { initVimeoFallback } from "./home/vimeo.js";
import { initTimestamps } from "./home/timestamps.js";
import { initTimelineNav } from "./home/timeline-nav.js";
import { initHeaderScroll } from "./home/header-scroll.js";
import { initScrollReveal } from "./home/scroll-reveal.js";
import { initCounters } from "./home/counter.js";
import { initSmoothScroll } from "./home/smooth-scroll.js";
import { initCursorGlow } from "./home/cursor-glow.js";
import { initProjectCardHover } from "./home/project-hover.js";
import { initLanguagePrompt } from "./home/language-prompt.js";
// Mobile menu is initialized globally by navigation.js - no need to import here
import { initCvDropdown } from "./home/cv-dropdown.js";

const { setLanguage, getCurrentLanguage } = initTranslation();

initVimeoFallback();
initTimestamps();
initTimelineNav();
initHeaderScroll();
initScrollReveal();
initCounters();
initSmoothScroll();
initCursorGlow();
initProjectCardHover();
initLanguagePrompt({ setLanguage, getCurrentLanguage });
// initMobileMenu() - removed, handled by navigation.js
initCvDropdown();
