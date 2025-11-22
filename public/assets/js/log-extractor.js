/**
 * Automatic Log Extractor - PERSISTENT VERSION
 * Automatically captures all console logs, warnings, and errors
 * Saves to localStorage - works across ALL pages and sessions!
 *
 * HOW TO DISABLE:
 * In browser console, run: localStorage.setItem('log_extractor_disabled', 'true')
 * To enable again: localStorage.removeItem('log_extractor_disabled')
 */

(function () {
  "use strict";

  // CHECK IF DISABLED - Exit early if user disabled it
  if (localStorage.getItem('log_extractor_disabled') === 'true') {
    console.log('%c📊 Log Extractor DISABLED (enable: localStorage.removeItem("log_extractor_disabled"))',
      'color: #999; font-style: italic;');
    return; // Don't initialize anything
  }

  const STORAGE_KEY = "log_extractor_session_logs";
  const SESSION_KEY = "log_extractor_session_id";

  // Get or create session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  const currentSession = getSessionId();

  // Load existing logs from localStorage
  function loadLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's from current session
        if (parsed.sessionId === currentSession) {
          return parsed.logs;
        }
      }
    } catch (e) {
      console.warn("Failed to load saved logs:", e);
    }
    return {
      errors: [],
      warnings: [],
      info: [],
      navigation: [], // Track page navigation history
      interactions: [], // Track user interactions (clicks, etc.)
      performance: [] // Track performance metrics
    };
  }

  // Save logs to localStorage
  function saveLogs() {
    try {
      const data = {
        sessionId: currentSession,
        logs: logStore,
        lastUpdate: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save logs:", e);
    }
  }

  // Storage for captured logs - loaded from localStorage
  const logStore = loadLogs();

  // CRITICAL: Ensure new tracking arrays exist (for backward compatibility with old sessions)
  if (!logStore.navigation) logStore.navigation = [];
  if (!logStore.interactions) logStore.interactions = [];
  if (!logStore.performance) logStore.performance = [];

  // Backup original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  function formatArgs(args) {
    return Array.from(args)
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");
  }

  function createLogEntry(message, type) {
    return {
      message: message,
      type: type,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleString("pl-PL"),
      page: window.location.pathname,
      url: window.location.href,
    };
  }

  // ============================================================================
  // NAVIGATION & INTERACTION TRACKING
  // ============================================================================

  let currentPageStartTime = Date.now();
  let previousPage = null;

  function trackNavigation(fromPage, toPage, method) {
    const now = Date.now();
    const timeOnPreviousPage = previousPage ? now - currentPageStartTime : 0;

    const navEntry = {
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleString("pl-PL"),
      from: fromPage || '(initial)',
      to: toPage,
      method: method, // 'ajax', 'reload', 'initial', 'popstate'
      timeOnPreviousPage: timeOnPreviousPage,
      timeOnPreviousPageFormatted: formatDuration(timeOnPreviousPage)
    };

    logStore.navigation.push(navEntry);
    currentPageStartTime = now;
    previousPage = toPage;
    saveLogs();

    originalConsole.log(
      `%c🧭 Navigation: ${fromPage || '(initial)'} → ${toPage} [${method}] (${formatDuration(timeOnPreviousPage)} on previous)`,
      'color: #3b82f6; font-weight: bold;'
    );
  }

  function trackInteraction(type, target, details) {
    const interactionEntry = {
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleString("pl-PL"),
      page: window.location.pathname,
      type: type, // 'click', 'submit', 'modal_open', etc.
      target: target,
      details: details || {}
    };

    logStore.interactions.push(interactionEntry);
    saveLogs();
  }

  function trackPerformance(metric, value, details) {
    const perfEntry = {
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleString("pl-PL"),
      page: window.location.pathname,
      metric: metric,
      value: value,
      details: details || {}
    };

    logStore.performance.push(perfEntry);
    saveLogs();
  }

  function formatDuration(ms) {
    if (ms < 1000) return ms + 'ms';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + 's';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Track initial page load
  trackNavigation(null, window.location.pathname, 'initial');

  // Track navigation events
  window.addEventListener('popstate', () => {
    trackNavigation(previousPage, window.location.pathname, 'popstate');
  });

  // Track AJAX navigation (SmoothNav)
  window.addEventListener('pageContentLoaded', () => {
    trackNavigation(previousPage, window.location.pathname, 'ajax');
  });

  // Track link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      trackInteraction('link_click', href, {
        text: link.textContent.trim().substring(0, 50),
        className: link.className
      });
    }

    // Track button clicks
    const button = e.target.closest('button');
    if (button) {
      trackInteraction('button_click', button.className, {
        text: button.textContent.trim().substring(0, 50),
        id: button.id
      });
    }

    // Track skill modal clicks
    const skillHex = e.target.closest('.hexagon[data-skill]');
    if (skillHex) {
      trackInteraction('skill_click', skillHex.dataset.skill, {
        category: skillHex.closest('.skill-category')?.querySelector('h3')?.textContent
      });
    }
  }, true); // Use capture phase to catch all clicks

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackInteraction('page_hidden', window.location.pathname, {
        timeOnPage: Date.now() - currentPageStartTime
      });
    } else {
      trackInteraction('page_visible', window.location.pathname);
      currentPageStartTime = Date.now(); // Reset timer when page becomes visible again
    }
  });

  // Track performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;

        trackPerformance('page_load', loadTime, {
          domReady: domReady,
          domReadyFormatted: formatDuration(domReady),
          loadTimeFormatted: formatDuration(loadTime)
        });
      }
    }, 0);
  });

  console.error = function (...args) {
    const message = formatArgs(args);
    logStore.errors.push(createLogEntry(message, "error"));
    saveLogs();
    updateBadge();
    originalConsole.error.apply(console, args);
  };

  console.warn = function (...args) {
    const message = formatArgs(args);
    logStore.warnings.push(createLogEntry(message, "warning"));
    saveLogs();
    updateBadge();
    originalConsole.warn.apply(console, args);
  };

  console.log =
    console.info =
    console.debug =
      function (...args) {
        const message = formatArgs(args);
        logStore.info.push(createLogEntry(message, "info"));
        saveLogs();
        updateBadge();
        originalConsole.log.apply(console, args);
      };

  window.addEventListener("error", function (event) {
    const message =
      event.message +
      " at " +
      event.filename +
      ":" +
      event.lineno +
      ":" +
      event.colno;
    logStore.errors.push(createLogEntry(message, "error"));
    saveLogs();
    updateBadge();
  });

  window.addEventListener("unhandledrejection", function (event) {
    const message = "Unhandled Promise Rejection: " + event.reason;
    logStore.errors.push(createLogEntry(message, "error"));
    saveLogs();
    updateBadge();
  });

  function generateMarkdown() {
    var md = "# 📊 Console Log Report - Full Session\n\n";
    md += "**Generated:** " + new Date().toLocaleString("pl-PL") + "\n";
    md += "**Session ID:** " + currentSession + "\n";
    md += "**Current URL:** " + window.location.href + "\n\n";
    md += "## 📈 Summary\n\n";
    md += "- **Errors:** " + logStore.errors.length + "\n";
    md += "- **Warnings:** " + logStore.warnings.length + "\n";
    md += "- **Info/Logs:** " + logStore.info.length + "\n";
    md += "- **Navigation Events:** " + (logStore.navigation?.length || 0) + "\n";
    md += "- **User Interactions:** " + (logStore.interactions?.length || 0) + "\n";
    md += "- **Performance Metrics:** " + (logStore.performance?.length || 0) + "\n";
    md +=
      "- **Total Logs:** " +
      (logStore.errors.length +
        logStore.warnings.length +
        logStore.info.length) +
      "\n\n";

    // Get unique pages visited
    const allLogs = [
      ...logStore.errors,
      ...logStore.warnings,
      ...logStore.info,
    ];
    const uniquePages = [...new Set(allLogs.map((log) => log.page))];
    md += "**Pages visited:** " + uniquePages.length + "\n";
    uniquePages.forEach(function (page) {
      md += "- " + page + "\n";
    });

    md += "\n---\n\n";

    // Navigation History
    md += "## 🧭 Navigation History (" + (logStore.navigation?.length || 0) + ")\n\n";
    if (!logStore.navigation || logStore.navigation.length === 0) {
      md += "*No navigation tracked*\n\n";
    } else {
      md += "| # | Time | From | To | Method | Time on Previous |\n";
      md += "|---|------|------|----|---------|-----------------|\n";
      logStore.navigation.forEach(function (nav, index) {
        md += `| ${index + 1} | ${nav.timeFormatted} | ${nav.from} | ${nav.to} | ${nav.method} | ${nav.timeOnPreviousPageFormatted} |\n`;
      });
      md += "\n";
    }

    md += "---\n\n";

    // User Interactions
    md += "## 👆 User Interactions (" + (logStore.interactions?.length || 0) + ")\n\n";
    if (!logStore.interactions || logStore.interactions.length === 0) {
      md += "*No interactions tracked*\n\n";
    } else {
      // Group by page for better readability
      const interactionsByPage = {};
      logStore.interactions.forEach(function (interaction) {
        if (!interactionsByPage[interaction.page]) {
          interactionsByPage[interaction.page] = [];
        }
        interactionsByPage[interaction.page].push(interaction);
      });

      Object.keys(interactionsByPage).forEach(function (page) {
        md += `### Page: ${page}\n\n`;
        interactionsByPage[page].forEach(function (interaction, index) {
          md += `**${index + 1}.** [${interaction.timeFormatted}] **${interaction.type}** → ${interaction.target}\n`;
          if (interaction.details && Object.keys(interaction.details).length > 0) {
            md += "```json\n" + JSON.stringify(interaction.details, null, 2) + "\n```\n";
          }
          md += "\n";
        });
      });
    }

    md += "---\n\n";

    // Performance Metrics
    md += "## ⚡ Performance Metrics (" + (logStore.performance?.length || 0) + ")\n\n";
    if (!logStore.performance || logStore.performance.length === 0) {
      md += "*No performance data*\n\n";
    } else {
      logStore.performance.forEach(function (perf, index) {
        md += `### Metric #${index + 1}: ${perf.metric}\n`;
        md += `- **Page:** ${perf.page}\n`;
        md += `- **Time:** ${perf.timeFormatted}\n`;
        md += `- **Value:** ${perf.value}ms\n`;
        if (perf.details && Object.keys(perf.details).length > 0) {
          md += "- **Details:**\n```json\n" + JSON.stringify(perf.details, null, 2) + "\n```\n";
        }
        md += "\n";
      });
    }

    md += "---\n\n";

    md += "## ❌ Errors (" + logStore.errors.length + ")\n\n";
    if (logStore.errors.length === 0) {
      md += "*No errors*\n\n";
    } else {
      logStore.errors.forEach(function (log, index) {
        md += "### Error #" + (index + 1) + "\n";
        md += "- **Time:** " + log.timeFormatted + "\n";
        md += "- **Page:** " + log.page + "\n";
        md += "- **URL:** " + log.url + "\n";
        md += "- **Message:**\n```\n" + log.message + "\n```\n\n";
      });
    }

    md += "## ⚠️ Warnings (" + logStore.warnings.length + ")\n\n";
    if (logStore.warnings.length === 0) {
      md += "*No warnings*\n\n";
    } else {
      logStore.warnings.forEach(function (log, index) {
        md += "### Warning #" + (index + 1) + "\n";
        md += "- **Time:** " + log.timeFormatted + "\n";
        md += "- **Page:** " + log.page + "\n";
        md += "- **URL:** " + log.url + "\n";
        md += "- **Message:**\n```\n" + log.message + "\n```\n\n";
      });
    }

    md += "## ℹ️ Info & Logs (" + logStore.info.length + ")\n\n";
    if (logStore.info.length === 0) {
      md += "*No info logs*\n\n";
    } else {
      logStore.info.forEach(function (log, index) {
        md += "### Log #" + (index + 1) + "\n";
        md += "- **Time:** " + log.timeFormatted + "\n";
        md += "- **Page:** " + log.page + "\n";
        md += "- **URL:** " + log.url + "\n";
        md += "- **Message:**\n```\n" + log.message + "\n```\n\n";
      });
    }

    return md;
  }

  function generateText() {
    var txt = "========================================\n";
    txt += "   CONSOLE LOG REPORT - FULL SESSION\n";
    txt += "========================================\n\n";
    txt += "Generated: " + new Date().toLocaleString("pl-PL") + "\n";
    txt += "Session ID: " + currentSession + "\n";
    txt += "Current URL: " + window.location.href + "\n\n";
    txt += "SUMMARY:\n";
    txt += "- Errors: " + logStore.errors.length + "\n";
    txt += "- Warnings: " + logStore.warnings.length + "\n";
    txt += "- Info/Logs: " + logStore.info.length + "\n";
    txt += "- Navigation Events: " + (logStore.navigation?.length || 0) + "\n";
    txt += "- User Interactions: " + (logStore.interactions?.length || 0) + "\n";
    txt += "- Performance Metrics: " + (logStore.performance?.length || 0) + "\n";
    txt +=
      "- Total Logs: " +
      (logStore.errors.length +
        logStore.warnings.length +
        logStore.info.length) +
      "\n\n";

    const allLogs = [
      ...logStore.errors,
      ...logStore.warnings,
      ...logStore.info,
    ];
    const uniquePages = [...new Set(allLogs.map((log) => log.page))];
    txt += "Pages visited: " + uniquePages.length + "\n";
    uniquePages.forEach(function (page) {
      txt += "  - " + page + "\n";
    });

    txt += "\n========================================\n\n";

    // Navigation History
    txt += "NAVIGATION HISTORY (" + (logStore.navigation?.length || 0) + "):\n";
    txt += "----------------------------------------\n";
    if (!logStore.navigation || logStore.navigation.length === 0) {
      txt += "No navigation tracked\n\n";
    } else {
      logStore.navigation.forEach(function (nav, index) {
        txt += "\n[" + (index + 1) + "] " + nav.timeFormatted + "\n";
        txt += "From: " + nav.from + "\n";
        txt += "To: " + nav.to + "\n";
        txt += "Method: " + nav.method + "\n";
        txt += "Time on previous: " + nav.timeOnPreviousPageFormatted + "\n";
        txt += "----------------------------------------\n";
      });
    }

    txt += "\nUSER INTERACTIONS (" + (logStore.interactions?.length || 0) + "):\n";
    txt += "----------------------------------------\n";
    if (!logStore.interactions || logStore.interactions.length === 0) {
      txt += "No interactions tracked\n\n";
    } else {
      logStore.interactions.forEach(function (interaction, index) {
        txt += "\n[" + (index + 1) + "] " + interaction.timeFormatted + "\n";
        txt += "Page: " + interaction.page + "\n";
        txt += "Type: " + interaction.type + "\n";
        txt += "Target: " + interaction.target + "\n";
        if (interaction.details && Object.keys(interaction.details).length > 0) {
          txt += "Details: " + JSON.stringify(interaction.details, null, 2) + "\n";
        }
        txt += "----------------------------------------\n";
      });
    }

    txt += "\nPERFORMANCE METRICS (" + (logStore.performance?.length || 0) + "):\n";
    txt += "----------------------------------------\n";
    if (!logStore.performance || logStore.performance.length === 0) {
      txt += "No performance data\n\n";
    } else {
      logStore.performance.forEach(function (perf, index) {
        txt += "\n[" + (index + 1) + "] " + perf.timeFormatted + "\n";
        txt += "Page: " + perf.page + "\n";
        txt += "Metric: " + perf.metric + "\n";
        txt += "Value: " + perf.value + "ms\n";
        if (perf.details && Object.keys(perf.details).length > 0) {
          txt += "Details: " + JSON.stringify(perf.details, null, 2) + "\n";
        }
        txt += "----------------------------------------\n";
      });
    }

    txt += "\n========================================\n\n";

    txt += "ERRORS (" + logStore.errors.length + "):\n";
    txt += "----------------------------------------\n";
    if (logStore.errors.length === 0) {
      txt += "No errors\n\n";
    } else {
      logStore.errors.forEach(function (log, index) {
        txt += "\n[" + (index + 1) + "] " + log.timeFormatted + "\n";
        txt += "Page: " + log.page + "\n";
        txt += "URL: " + log.url + "\n";
        txt += log.message + "\n";
        txt += "----------------------------------------\n";
      });
    }

    txt += "\nWARNINGS (" + logStore.warnings.length + "):\n";
    txt += "----------------------------------------\n";
    if (logStore.warnings.length === 0) {
      txt += "No warnings\n\n";
    } else {
      logStore.warnings.forEach(function (log, index) {
        txt += "\n[" + (index + 1) + "] " + log.timeFormatted + "\n";
        txt += "Page: " + log.page + "\n";
        txt += "URL: " + log.url + "\n";
        txt += log.message + "\n";
        txt += "----------------------------------------\n";
      });
    }

    txt += "\nINFO & LOGS (" + logStore.info.length + "):\n";
    txt += "----------------------------------------\n";
    if (logStore.info.length === 0) {
      txt += "No info logs\n\n";
    } else {
      logStore.info.forEach(function (log, index) {
        txt += "\n[" + (index + 1) + "] " + log.timeFormatted + "\n";
        txt += "Page: " + log.page + "\n";
        txt += "URL: " + log.url + "\n";
        txt += log.message + "\n";
        txt += "----------------------------------------\n";
      });
    }

    txt += "\n========================================\n";
    txt += "            END OF REPORT\n";
    txt += "========================================\n";

    return txt;
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function exportLogs(format) {
    format = format || "md";
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = "console-logs-session_" + timestamp + "." + format;

    var content;
    if (format === "md") {
      content = generateMarkdown();
    } else {
      content = generateText();
    }

    downloadFile(filename, content);
    originalConsole.log("✅ Session logs exported to " + filename);
  }

  function clearLogs() {
    logStore.errors = [];
    logStore.warnings = [];
    logStore.info = [];
    saveLogs();
    updateBadge();
    originalConsole.log("🗑️ All session logs cleared");
  }

  function startNewSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function getStats() {
    const allLogs = [
      ...logStore.errors,
      ...logStore.warnings,
      ...logStore.info,
    ];
    const uniquePages = [...new Set(allLogs.map((log) => log.page))];

    // Ensure arrays exist before filtering
    const navArray = logStore.navigation || [];
    const interactionArray = logStore.interactions || [];

    // Calculate navigation stats
    const navStats = {
      totalNavigations: navArray.length,
      ajaxNavigations: navArray.filter(n => n.method === 'ajax').length,
      fullPageLoads: navArray.filter(n => n.method === 'reload' || n.method === 'initial').length,
      backForward: navArray.filter(n => n.method === 'popstate').length
    };

    // Calculate interaction stats
    const interactionStats = {
      totalInteractions: interactionArray.length,
      linkClicks: interactionArray.filter(i => i.type === 'link_click').length,
      buttonClicks: interactionArray.filter(i => i.type === 'button_click').length,
      skillClicks: interactionArray.filter(i => i.type === 'skill_click').length
    };

    return {
      errors: logStore.errors.length,
      warnings: logStore.warnings.length,
      info: logStore.info.length,
      total:
        logStore.errors.length +
        logStore.warnings.length +
        logStore.info.length,
      pagesVisited: uniquePages.length,
      pages: uniquePages,
      sessionId: currentSession,
      navigation: navStats,
      interactions: interactionStats,
      performance: (logStore.performance || []).length
    };
  }

  function updateBadge() {
    const badge = document.getElementById("log-extractor-badge");
    if (badge) {
      const total =
        logStore.errors.length +
        logStore.warnings.length +
        logStore.info.length;
      badge.textContent = total;
      badge.style.display = total > 0 ? "flex" : "none";
    }
  }

  function disableExtractor() {
    localStorage.setItem('log_extractor_disabled', 'true');
    originalConsole.log('%c📊 Log Extractor DISABLED - Reload page to take effect',
      'background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px;');
    location.reload();
  }

  function createFloatingButton() {
    if (document.getElementById("log-extractor-btn")) return;

    const buttonHTML =
      '<div id="log-extractor-btn" style="position: fixed;bottom: 20px;right: 20px;z-index: 999999;font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;"><button id="log-extractor-toggle" style="width: 60px;height: 60px;border-radius: 50%;background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);border: none;color: white;font-size: 24px;cursor: pointer;box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);transition: transform 0.3s, box-shadow 0.3s;position: relative;">📊</button><div id="log-extractor-badge" style="position: absolute;top: -5px;right: -5px;background: #dc3545;color: white;border-radius: 50%;width: 24px;height: 24px;display: none;align-items: center;justify-content: center;font-size: 12px;font-weight: bold;box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);">0</div><div id="log-extractor-menu" style="position: absolute;bottom: 70px;right: 0;background: white;border-radius: 12px;box-shadow: 0 8px 32px rgba(0,0,0,0.2);padding: 12px;min-width: 220px;display: none;flex-direction: column;gap: 8px;"><div style="padding: 8px;background: #f8f9fa;border-radius: 8px;margin-bottom: 8px;"><div style="font-size: 11px; color: #666; margin-bottom: 4px;">Session Logs (All Pages):</div><div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 4px;"><span style="color: #dc3545;">❌ <span id="error-count">0</span></span><span style="color: #ffc107;">⚠️ <span id="warning-count">0</span></span><span style="color: #17a2b8;">ℹ️ <span id="info-count">0</span></span></div><div style="font-size: 10px; color: #999;">Pages: <span id="pages-count">0</span></div></div><button id="export-md" style="padding: 10px;background: #28a745;color: white;border: none;border-radius: 8px;cursor: pointer;font-weight: 600;transition: background 0.2s;font-size: 13px;">💾 Export Session .md</button><button id="export-txt" style="padding: 10px;background: #17a2b8;color: white;border: none;border-radius: 8px;cursor: pointer;font-weight: 600;transition: background 0.2s;font-size: 13px;">💾 Export Session .txt</button><button id="clear-logs" style="padding: 8px;background: #ffc107;color: #333;border: none;border-radius: 8px;cursor: pointer;font-weight: 600;transition: background 0.2s;font-size: 12px;">🗑️ Clear Session</button><button id="new-session" style="padding: 8px;background: #6c757d;color: white;border: none;border-radius: 8px;cursor: pointer;font-weight: 600;transition: background 0.2s;font-size: 12px;">🔄 New Session</button><button id="disable-extractor" style="padding: 8px;background: #dc3545;color: white;border: none;border-radius: 8px;cursor: pointer;font-weight: 600;transition: background 0.2s;font-size: 12px;">🚫 Disable (Reload)</button></div></div>';

    document.body.insertAdjacentHTML("beforeend", buttonHTML);

    const toggle = document.getElementById("log-extractor-toggle");
    const menu = document.getElementById("log-extractor-menu");

    toggle.addEventListener("click", function () {
      const isVisible = menu.style.display === "flex";
      menu.style.display = isVisible ? "none" : "flex";
      updateMenuStats();
    });

    toggle.addEventListener("mouseenter", function () {
      toggle.style.transform = "scale(1.1)";
      toggle.style.boxShadow = "0 6px 28px rgba(102, 126, 234, 0.6)";
    });

    toggle.addEventListener("mouseleave", function () {
      toggle.style.transform = "scale(1)";
      toggle.style.boxShadow = "0 4px 20px rgba(102, 126, 234, 0.4)";
    });

    document.getElementById("export-md").addEventListener("click", function () {
      exportLogs("md");
      menu.style.display = "none";
    });

    document
      .getElementById("export-txt")
      .addEventListener("click", function () {
        exportLogs("txt");
        menu.style.display = "none";
      });

    document
      .getElementById("clear-logs")
      .addEventListener("click", function () {
        if (confirm("Clear all logs from this session?")) {
          clearLogs();
          updateMenuStats();
        }
      });

    document
      .getElementById("new-session")
      .addEventListener("click", function () {
        if (
          confirm(
            "Start a new session? (clears all logs and creates new session ID)",
          )
        ) {
          startNewSession();
        }
      });

    document
      .getElementById("disable-extractor")
      .addEventListener("click", function () {
        if (
          confirm(
            "Disable Log Extractor? (will reload page)\n\nTo enable again, run in console:\nlocalStorage.removeItem('log_extractor_disabled')",
          )
        ) {
          disableExtractor();
        }
      });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#log-extractor-btn")) {
        menu.style.display = "none";
      }
    });

    function updateMenuStats() {
      const stats = getStats();
      document.getElementById("error-count").textContent = stats.errors;
      document.getElementById("warning-count").textContent = stats.warnings;
      document.getElementById("info-count").textContent = stats.info;
      document.getElementById("pages-count").textContent = stats.pagesVisited;
    }

    updateBadge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createFloatingButton);
  } else {
    createFloatingButton();
  }

  window.LogExtractor = {
    export: exportLogs,
    clear: clearLogs,
    stats: getStats,
    getLogs: function () {
      return logStore;
    },
    newSession: startNewSession,
    // New tracking functions exposed for manual use
    trackNavigation: trackNavigation,
    trackInteraction: trackInteraction,
    trackPerformance: trackPerformance
  };

  const stats = getStats();
  originalConsole.log(
    "%c📊 Log Extractor Activated! (Enhanced Session Mode)",
    "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 14px;",
  );
  originalConsole.log("Session ID: " + currentSession);
  originalConsole.log(
    "Loaded " + stats.total + " logs from " + stats.pagesVisited + " pages",
  );
  originalConsole.log(
    "Navigation: " + stats.navigation.totalNavigations + " events (" +
    stats.navigation.ajaxNavigations + " AJAX, " +
    stats.navigation.fullPageLoads + " full loads)"
  );
  originalConsole.log(
    "Interactions: " + stats.interactions.totalInteractions + " total (" +
    stats.interactions.linkClicks + " links, " +
    stats.interactions.buttonClicks + " buttons, " +
    stats.interactions.skillClicks + " skills)"
  );
  originalConsole.log(
    "Performance: " + stats.performance + " metrics tracked"
  );
  originalConsole.log(
    'Commands: LogExtractor.export("md"), LogExtractor.stats(), LogExtractor.newSession()',
  );
  originalConsole.log(
    'Manual tracking: LogExtractor.trackInteraction("type", "target", {details})'
  );
})();
