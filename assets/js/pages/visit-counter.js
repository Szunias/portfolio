/**
 * Visit Counter with Firebase Realtime Database
 * Tracks and displays page visit count with IP-based rate limiting (24h)
 */

(function() {
  'use strict';

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBA2enzFHX7aljA2RMQ46YZ093z9N4lbGM",
    authDomain: "igorszuniewicz-9ddfc.firebaseapp.com",
    databaseURL: "https://igorszuniewicz-9ddfc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "igorszuniewicz-9ddfc",
    storageBucket: "igorszuniewicz-9ddfc.firebasestorage.app",
    messagingSenderId: "478087683913",
    appId: "1:478087683913:web:737f0cca1837d4acf04498"
  };

  const BASE_COUNT = 2533; // Historical starting count
  const INCREMENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  const STORAGE_LAST_HIT = 'visit_last_hit_at';
  const SESSION_HIT_FLAG = 'visit_hit_session_done';
  const FALLBACK_KEY = 'last_known_count';

  let db = null;
  let firebaseInitialized = false;

  // Initialize Firebase
  async function initFirebase() {
    if (firebaseInitialized) return true;

    try {
      // Load Firebase SDK from CDN
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js');
      }

      if (!window.firebase) {
        throw new Error('Firebase SDK failed to load');
      }

      // Initialize Firebase app
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      db = firebase.database();
      firebaseInitialized = true;
      return true;
    } catch (error) {
      // Firebase initialization failed
      return false;
    }
  }

  // Load external script
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Generate simple hash from browser fingerprint (privacy-friendly)
  async function getVisitorHash() {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return 'visitor_' + Math.abs(hash).toString(36);
  }

  // Check if visitor should increment counter (24h cooldown)
  function shouldIncrementNow() {
    try {
      // Avoid repeated increments within the same browser session
      if (sessionStorage.getItem(SESSION_HIT_FLAG) === '1') return false;

      const lastHit = parseInt(localStorage.getItem(STORAGE_LAST_HIT) || '0', 10);
      const now = Date.now();
      if (!lastHit || (now - lastHit) > INCREMENT_TTL_MS) return true;
      return false;
    } catch (_) {
      return false;
    }
  }

  // Mark increment as done
  function markIncremented() {
    try {
      sessionStorage.setItem(SESSION_HIT_FLAG, '1');
      localStorage.setItem(STORAGE_LAST_HIT, String(Date.now()));
    } catch (_) {}
  }

  // Read current visit count from Firebase
  async function readVisitCount() {
    try {
      const initialized = await initFirebase();
      if (!initialized || !db) throw new Error('Firebase not initialized');

      const snapshot = await db.ref('visit_count').once('value');
      const count = snapshot.val() || 0;
      const total = BASE_COUNT + count;

      localStorage.setItem(FALLBACK_KEY, String(total));
      return total;
    } catch (error) {
      // Failed to read visit count
      const cached = localStorage.getItem(FALLBACK_KEY);
      return cached ? parseInt(cached, 10) : BASE_COUNT;
    }
  }

  // Increment visit count in Firebase
  async function incrementVisitCount() {
    try {
      const initialized = await initFirebase();
      if (!initialized || !db) throw new Error('Firebase not initialized');

      const visitorHash = await getVisitorHash();
      const now = Date.now();

      // Check if this visitor already incremented recently
      const visitorRef = db.ref(`visitors/${visitorHash}`);
      const visitorSnapshot = await visitorRef.once('value');
      const visitorData = visitorSnapshot.val();

      if (visitorData && visitorData.timestamp) {
        const timeSinceLastVisit = now - visitorData.timestamp;
        if (timeSinceLastVisit < INCREMENT_TTL_MS) {
          // Visitor already counted within 24h, just read current count
          return await readVisitCount();
        }
      }

      // Increment the counter
      const countRef = db.ref('visit_count');
      const newCount = await countRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
      });

      // Update visitor timestamp
      await visitorRef.set({ timestamp: now });

      const total = BASE_COUNT + (newCount.snapshot.val() || 0);
      localStorage.setItem(FALLBACK_KEY, String(total));
      return total;

    } catch (error) {
      // Failed to increment visit count
      const cached = localStorage.getItem(FALLBACK_KEY);
      return cached ? parseInt(cached, 10) : BASE_COUNT;
    }
  }

  // Format visit count for display
  function formatCount(count) {
    return count.toLocaleString('en-US');
  }

  // Animate counter number
  function animateCount(element, targetCount) {
    const duration = 1500;
    const startCount = Math.max(0, targetCount - 10);
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOut cubic

      const currentCount = Math.floor(startCount + (targetCount - startCount) * easeProgress);
      element.textContent = formatCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = formatCount(targetCount);
      }
    }

    requestAnimationFrame(update);
  }

  // Show visit counter
  async function showVisitCounter() {
    const counter = document.getElementById('visit-counter');
    const countSpan = document.getElementById('visit-count');

    if (!counter || !countSpan) return;

    try {
      const willIncrement = shouldIncrementNow();
      const currentCount = willIncrement ? await incrementVisitCount() : await readVisitCount();
      if (willIncrement) markIncremented();

      // Start animation after delay
      setTimeout(() => {
        counter.style.display = 'flex';
        counter.style.opacity = '0';
        counter.style.transform = 'translateY(10px)';

        setTimeout(() => {
          counter.style.opacity = '1';
          counter.style.transform = 'translateY(0)';
          animateCount(countSpan, currentCount);
        }, 100);
      }, 2500);

    } catch (error) {
      // Visit counter error occurred
      // Ensure we still show something useful if everything fails
      const cached = localStorage.getItem(FALLBACK_KEY);
      const fallback = cached ? parseInt(cached, 10) : BASE_COUNT;
      countSpan.textContent = formatCount(fallback);
      counter.style.display = 'flex';
    }
  }

  // Initialize when page loads
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showVisitCounter);
    } else {
      showVisitCounter();
    }
  }

  // Don't show for bots
  function shouldShowCounter() {
    const botPattern = /bot|crawler|spider|scraper|headless/i;
    if (botPattern.test(navigator.userAgent)) return false;
    return true;
  }

  if (shouldShowCounter()) {
    init();
  }

})();
