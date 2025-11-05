/**
 * Analytics Dashboard
 * Fetches and displays website statistics with charts and visualizations
 */

(function() {
  'use strict';

  let currentData = null;
  let charts = {};

  // Configuration
  const API_ENDPOINT = '/api/analytics.php'; // Backend endpoint for real data
  const DEMO_MODE = true; // Temporary: back to demo mode to debug

  // Initialize dashboard
  function initDashboard() {
    setupAuth();
    setupEventListeners();
  }

  // Setup authentication
  function setupAuth() {
    const authOverlay = document.getElementById('auth-overlay');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const password = 'analytics2025'; // Change this password!

    // Check if already authenticated
    if (sessionStorage.getItem('analytics_auth') === 'true') {
      authOverlay.style.display = 'none';
      loadAnalytics();
      return;
    }

    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputPassword = document.getElementById('auth-password').value;

      if (inputPassword === password) {
        sessionStorage.setItem('analytics_auth', 'true');
        authOverlay.style.display = 'none';
        loadAnalytics();
      } else {
        authError.style.display = 'block';
        document.getElementById('auth-password').value = '';
        setTimeout(() => authError.style.display = 'none', 3000);
      }
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
      timeRange.addEventListener('change', loadAnalytics);
    }
  }

  // Load analytics data
  async function loadAnalytics() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const dashboardEl = document.getElementById('dashboard');

    // Show loading state
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (dashboardEl) dashboardEl.style.display = 'none';

    try {
      let data;
      if (DEMO_MODE) {
        data = await generateDemoData();
      } else {
        const timeRange = document.getElementById('timeRange')?.value || '7d';
        const response = await fetch(`${API_ENDPOINT}?range=${timeRange}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();

        // Validate data structure
        if (!data || !data.summary) {
          throw new Error('Invalid data structure received');
        }
      }

      currentData = data;
      renderDashboard(data);

      // Hide loading, show dashboard
      if (loadingEl) loadingEl.style.display = 'none';
      if (dashboardEl) dashboardEl.style.display = 'block';

    } catch (error) {
      // Analytics loading error occurred

      // Show error state
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = `⚠️ Failed to load analytics: ${error.message}`;
      }
    }
  }

  // Generate demo data for testing
  async function generateDemoData() {
    const timeRange = document.getElementById('timeRange')?.value || '7d';
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const baseVisitors = Math.floor(Math.random() * 1000) + 500;

    return {
      summary: {
        totalVisitors: baseVisitors,
        totalPageViews: Math.floor(baseVisitors * (1.2 + Math.random() * 0.8)),
        avgSessionMinutes: (2 + Math.random() * 8).toFixed(1),
        mobilePercent: Math.floor(45 + Math.random() * 30) + '%'
      },
      visitorsOverTime: generateTimeSeriesData(days),
      topCountries: [
        { name: 'Poland', code: 'PL', visitors: Math.floor(baseVisitors * 0.4), flag: '🇵🇱' },
        { name: 'United States', code: 'US', visitors: Math.floor(baseVisitors * 0.25), flag: '🇺🇸' },
        { name: 'Germany', code: 'DE', visitors: Math.floor(baseVisitors * 0.15), flag: '🇩🇪' },
        { name: 'United Kingdom', code: 'GB', visitors: Math.floor(baseVisitors * 0.08), flag: '🇬🇧' },
        { name: 'Netherlands', code: 'NL', visitors: Math.floor(baseVisitors * 0.07), flag: '🇳🇱' },
        { name: 'France', code: 'FR', visitors: Math.floor(baseVisitors * 0.05), flag: '🇫🇷' }
      ],
      browsers: [
        { name: 'Chrome', percentage: 45 + Math.floor(Math.random() * 20) },
        { name: 'Firefox', percentage: 20 + Math.floor(Math.random() * 15) },
        { name: 'Safari', percentage: 15 + Math.floor(Math.random() * 10) },
        { name: 'Edge', percentage: 10 + Math.floor(Math.random() * 8) },
        { name: 'Other', percentage: 5 + Math.floor(Math.random() * 5) }
      ],
      popularPages: [
        { page: '/music.html', views: Math.floor(baseVisitors * 0.6), avgTime: '4:32', bounceRate: '25%' },
        { page: '/index.html', views: Math.floor(baseVisitors * 0.8), avgTime: '2:15', bounceRate: '45%' },
        { page: '/projects/', views: Math.floor(baseVisitors * 0.4), avgTime: '3:22', bounceRate: '35%' },
        { page: '/about.html', views: Math.floor(baseVisitors * 0.3), avgTime: '2:45', bounceRate: '40%' },
        { page: '/contact.html', views: Math.floor(baseVisitors * 0.2), avgTime: '1:30', bounceRate: '60%' }
      ],
      musicPlays: [
        { track: 'Inflow', plays: Math.floor(Math.random() * 200) + 50, avgListenTime: '3:45' },
        { track: 'Astrophonic Dance', plays: Math.floor(Math.random() * 180) + 40, avgListenTime: '4:12' },
        { track: 'Cathedral Of Time', plays: Math.floor(Math.random() * 160) + 35, avgListenTime: '5:20' },
        { track: 'Obsidian', plays: Math.floor(Math.random() * 140) + 30, avgListenTime: '3:30' },
        { track: 'Run — Main Theme', plays: Math.floor(Math.random() * 120) + 25, avgListenTime: '2:55' }
      ]
    };
  }

  // Generate time series data
  function generateTimeSeriesData(days) {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const baseValue = 50 + Math.random() * 100;
      const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1;

      data.push({
        date: date.toISOString().split('T')[0],
        visitors: Math.floor(baseValue * weekendMultiplier)
      });
    }

    return data;
  }

  // Render complete dashboard
  function renderDashboard(data) {
    renderSummaryStats(data.summary);
    renderVisitorsChart(data.visitorsOverTime);
    renderCountriesChart(data.topCountries);
    renderBrowsersChart(data.browsers);
    renderPopularPages(data.popularPages);
    renderMusicPlays(data.musicPlays);
  }

  // Render summary statistics
  function renderSummaryStats(summary) {
    const elements = {
      totalVisitors: document.getElementById('totalVisitors'),
      totalPageViews: document.getElementById('totalPageViews'),
      avgSession: document.getElementById('avgSession'),
      mobilePercent: document.getElementById('mobilePercent')
    };

    if (elements.totalVisitors) elements.totalVisitors.textContent = summary.totalVisitors.toLocaleString();
    if (elements.totalPageViews) elements.totalPageViews.textContent = summary.totalPageViews.toLocaleString();
    if (elements.avgSession) elements.avgSession.textContent = summary.avgSessionMinutes;
    if (elements.mobilePercent) elements.mobilePercent.textContent = summary.mobilePercent;
  }

  // Render visitors over time chart (Canvas-based simple chart)
  function renderVisitorsChart(data) {
    const canvas = document.getElementById('visitorsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    // Find min/max values
    const maxVisitors = Math.max(...data.map(d => d.visitors));
    const minVisitors = Math.min(...data.map(d => d.visitors));
    const range = maxVisitors - minVisitors || 1;

    // Setup
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = '#18bfef';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((point.visitors - minVisitors) / range) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#18bfef';
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((point.visitors - minVisitors) / range) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minVisitors + (range / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value), padding - 10, y + 4);
    }

    // X-axis labels (show every few days)
    const labelInterval = Math.max(1, Math.floor(data.length / 7));
    data.forEach((point, index) => {
      if (index % labelInterval === 0) {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const date = new Date(point.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;

        ctx.textAlign = 'center';
        ctx.fillText(label, x, height - 10);
      }
    });
  }

  // Render countries chart
  function renderCountriesChart(countries) {
    const container = document.getElementById('countriesChart');
    if (!container) return;

    const total = countries.reduce((sum, country) => sum + country.visitors, 0);

    const html = countries.map(country => {
      const percentage = ((country.visitors / total) * 100).toFixed(1);
      return `
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 20px; margin-right: 8px;">${country.flag}</span>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>${country.name}</span>
              <span>${country.visitors.toLocaleString()} (${percentage}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // Render browsers chart
  function renderBrowsersChart(browsers) {
    const container = document.getElementById('browsersChart');
    if (!container) return;

    const html = browsers.map(browser => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span>${browser.name}</span>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 8px;">${browser.percentage}%</span>
          <div class="progress-bar" style="width: 100px;">
            <div class="progress-fill" style="width: ${browser.percentage}%"></div>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  // Render popular pages table
  function renderPopularPages(pages) {
    const tbody = document.getElementById('popularPages');
    if (!tbody) return;

    const html = pages.map(page => `
      <tr>
        <td>${page.page}</td>
        <td>${page.views.toLocaleString()}</td>
        <td>${page.avgTime}</td>
        <td>${page.bounceRate}</td>
      </tr>
    `).join('');

    tbody.innerHTML = html;
  }

  // Render music plays table
  function renderMusicPlays(tracks) {
    const tbody = document.getElementById('musicPlays');
    if (!tbody) return;

    const html = tracks.map(track => `
      <tr>
        <td>${track.track}</td>
        <td>${track.plays.toLocaleString()}</td>
        <td>${track.avgListenTime}</td>
      </tr>
    `).join('');

    tbody.innerHTML = html;
  }

  // Expose loadAnalytics globally for refresh button
  window.loadAnalytics = loadAnalytics;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }

})();
