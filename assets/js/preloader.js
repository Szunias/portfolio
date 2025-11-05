/**
 * Professional Preloader
 * Wyświetla animację ładowania z nazwiskiem tylko przy pierwszym wejściu
 */

(function() {
  'use strict';
  
  // Sprawdź czy użytkownik już odwiedził stronę w ostatnich 30 minutach
  const visitData = localStorage.getItem('preloaderVisit');
  const now = Date.now();
  const VISIT_DURATION = 30 * 60 * 1000; // 30 minut
  
  let hasVisited = false;
  if (visitData) {
    const visitTime = parseInt(visitData, 10);
    if (now - visitTime < VISIT_DURATION) {
      hasVisited = true;
    }
  }
  
  // Jeśli już odwiedził niedawno, nie pokazuj loadera
  if (hasVisited) {
    return;
  }
  
  // Oznacz że użytkownik odwiedził stronę (natychmiast)
  localStorage.setItem('preloaderVisit', now.toString());
  
  // Blokuj przewijanie od razu
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  // Tworzenie preloadera
  const preloader = document.createElement('div');
  preloader.id = 'preloader';
  preloader.innerHTML = `
    <div class="preloader-content">
      <div class="preloader-logo">
        <span class="name-part">Igor</span>
        <span class="name-part">Szuniewicz</span>
      </div>
      <div class="preloader-line"></div>
    </div>
  `;
  
  // Style dla preloadera
  const style = document.createElement('style');
  style.textContent = `
    #preloader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #000000 0%, #0f172a 50%, #1e293b 100%);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: preloaderFadeOut 0.4s ease-out 1.1s forwards;
    }
    
    .preloader-content {
      text-align: center;
    }
    
    .preloader-logo {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .name-part {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2rem, 8vw, 4rem);
      font-weight: 900;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      opacity: 0;
      transform: translateY(30px);
    }
    
    .name-part:nth-child(1) {
      animation: nameSlideIn 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) 0.1s forwards;
    }
    
    .name-part:nth-child(2) {
      animation: nameSlideIn 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) 0.3s forwards;
    }
    
    .preloader-line {
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
      margin: 0 auto;
      border-radius: 2px;
      animation: lineExpand 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) 0.7s forwards;
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
    }
    
    @keyframes nameSlideIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes lineExpand {
      to {
        width: 300px;
      }
    }
    
    @keyframes preloaderFadeOut {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }
    
    /* Zapobiega przewijaniu podczas ładowania */
    body.preloader-active {
      overflow: hidden;
    }
  `;
  
  // Dodaj style i preloader do DOM natychmiast
  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(style);
    });
  }
  
  // Wstaw preloader natychmiast
  if (document.body) {
    document.body.insertBefore(preloader, document.body.firstChild);
    document.body.classList.add('preloader-active');
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.insertBefore(preloader, document.body.firstChild);
      document.body.classList.add('preloader-active');
    });
  }
  
  // Funkcja czyszcząca - zawsze odblokuj scrollowanie
  function cleanupPreloader() {
    if (preloader && preloader.parentNode) {
      preloader.remove();
    }
    document.body.classList.remove('preloader-active');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  
  // Usuń preloader po animacji (zoptymalizowany czas)
  setTimeout(cleanupPreloader, 1500);
  
  // Failsafe - zawsze odblokuj scrollowanie po 2 sekundach
  setTimeout(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.classList.remove('preloader-active');
  }, 2000);
  
  // Dodatkowy failsafe gdy okno się załaduje
  window.addEventListener('load', () => {
    setTimeout(cleanupPreloader, 100);
  });
  
  // Jeszcze jeden failsafe - odblokuj na interakcję użytkownika
  const unlockOnInteraction = () => {
    cleanupPreloader();
    document.removeEventListener('click', unlockOnInteraction);
    document.removeEventListener('scroll', unlockOnInteraction);
    document.removeEventListener('wheel', unlockOnInteraction);
    document.removeEventListener('touchstart', unlockOnInteraction);
  };
  
  setTimeout(() => {
    document.addEventListener('click', unlockOnInteraction);
    document.addEventListener('scroll', unlockOnInteraction);
    document.addEventListener('wheel', unlockOnInteraction);
    document.addEventListener('touchstart', unlockOnInteraction);
  }, 1600); // Dodaj listenery dopiero po animacji
})();
