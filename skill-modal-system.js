// Skill Modal System - Click to view details
// Data based on ACTUAL project tech tags

const SKILL_DATA = {
  // Middleware
  wwise: {
    name: 'Wwise',
    category: 'middleware',
    icon: 'honeyicons/wwiselogo.png',
    connections: ['cpp', 'blueprints', 'ableton'],
    projects: [
      {
        name: 'Shadow Frames',
        desc: 'RTPC systems, spatial audio, surface detection',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Pause & Deserve',
        desc: 'Real-time audio control and gameplay integration',
        url: 'projects/pause-and-deserve.html'
      },
      {
        name: 'Music for Games',
        desc: 'Adaptive music with vertical layering and RTPC',
        url: 'projects/musicforgames.html'
      },
      {
        name: 'Middleware Optimization',
        desc: 'Three school projects learning Wwise',
        url: 'projects/middleware-optimization.html'
      }
    ]
  },
  fmod: {
    name: 'FMOD',
    category: 'middleware',
    icon: 'honeyicons/fmodlogo.png',
    connections: ['cpp', 'csharp'],
    projects: [
      {
        name: 'Previous Experience',
        desc: 'FMOD integration in past projects (not published)',
        url: null
      }
    ]
  },
  unreal: {
    name: 'Unreal Engine',
    category: 'middleware',
    icon: 'honeyicons/Unreal_Engine-Logo.wine.png',
    connections: ['cpp', 'blueprints', 'wwise'],
    projects: [
      {
        name: 'Shadow Frames',
        desc: 'UE5.5 - Full audio system architecture with Wwise',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Not Today Darling',
        desc: 'UE5 - MetaSounds procedural audio systems',
        url: 'projects/not-today-darling.html'
      },
      {
        name: 'Pause & Deserve',
        desc: 'Wwise integration and gameplay audio',
        url: 'projects/pause-and-deserve.html'
      }
    ]
  },

  // DAW
  reaper: {
    name: 'Reaper',
    category: 'daw',
    icon: 'honeyicons/REAPER_logo.png',
    connections: ['dsp', 'spatial'],
    projects: [
      {
        name: 'Not Today Darling',
        desc: 'Sound processing and mixing',
        url: 'projects/not-today-darling.html'
      },
      {
        name: 'Ray Animation',
        desc: 'Sound design for animation',
        url: 'projects/ray-animation.html'
      },
      { name: 'All Projects', desc: 'Primary DAW for editing and post-production', url: null }
    ]
  },
  ableton: {
    name: 'Ableton Live',
    category: 'daw',
    icon: 'honeyicons/abletonlogo.png',
    connections: ['dsp', 'wwise'],
    projects: [
      {
        name: 'Music for Games',
        desc: 'Music composition and production for Wwise implementation',
        url: 'projects/musicforgames.html'
      },
      { name: 'Sound Design', desc: 'Experimental synthesis and processing', url: null }
    ]
  },
  flstudio: {
    name: 'FL Studio',
    category: 'daw',
    icon: 'honeyicons/flstudiologo.png',
    connections: ['dsp'],
    projects: [{ name: 'Music Composition', desc: 'Beat production and melodic work', url: null }]
  },

  // Programming
  cpp: {
    name: 'C++',
    category: 'programming',
    icon: 'honeyicons/c++logo.png',
    connections: ['wwise', 'unreal', 'juce', 'dsp'],
    projects: [
      {
        name: 'Shadow Frames',
        desc: 'Audio system architecture in UE5.5',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Not Today Darling',
        desc: 'MetaSounds and audio systems in UE5',
        url: 'projects/not-today-darling.html'
      },
      { name: 'Custom Audio Plugins', desc: 'JUCE-based VST/AU development', url: null }
    ]
  },
  csharp: {
    name: 'C#',
    category: 'programming',
    icon: 'honeyicons/c# logo.png',
    connections: ['python'],
    projects: [
      {
        name: 'AudioLab',
        desc: 'Unity beatbox rhythm game with ML integration',
        url: 'projects/audiolab.html'
      },
      { name: 'Unity Tools', desc: 'Custom editor extensions', url: null }
    ]
  },
  python: {
    name: 'Python',
    category: 'programming',
    icon: 'honeyicons/pythonlogo.png',
    connections: ['csharp'],
    projects: [
      {
        name: 'AudioLab',
        desc: 'ML beatbox classification with scikit-learn & LibROSA',
        url: 'projects/audiolab.html'
      },
      { name: 'AudioQ', desc: 'AI-driven audio quality assessment', url: 'projects/audioq.html' },
      {
        name: 'Wwise Unreal Fixer',
        desc: 'Automation tool for fixing Wwise integration',
        url: 'projects/wwise-unreal-fixer.html'
      },
      {
        name: 'Unreal Engine Rebuilder',
        desc: 'Project management automation',
        url: 'projects/unreal-engine-rebuilder.html'
      }
    ]
  },
  blueprints: {
    name: 'Blueprints',
    category: 'programming',
    icon: null, // SVG icon in HTML
    connections: ['wwise', 'unreal', 'spatial'],
    projects: [
      {
        name: 'Shadow Frames',
        desc: 'Audio triggers and gameplay systems',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Pause & Deserve',
        desc: 'Wwise integration and interactive audio',
        url: 'projects/pause-and-deserve.html'
      }
    ]
  },
  git: {
    name: 'Git',
    category: 'programming',
    icon: 'honeyicons/github.png',
    connections: [],
    projects: [
      {
        name: 'All Projects',
        desc: 'Version control and collaboration',
        url: 'https://github.com/Szunias'
      }
    ]
  },

  // Specialized
  juce: {
    name: 'JUCE',
    category: 'specialized',
    icon: 'honeyicons/JUCE_Logo.png',
    connections: ['cpp'],
    projects: [{ name: 'Audio Plugin Development', desc: 'VST/AU/AAX plugins', url: null }]
  },
  dsp: {
    name: 'DSP',
    category: 'specialized',
    icon: 'honeyicons/dsplogo.png',
    connections: ['cpp', 'reaper', 'ableton', 'flstudio'],
    projects: [{ name: 'Real-time Processing', desc: 'Audio effects and algorithms', url: null }]
  },
  tensorflow: {
    name: 'TensorFlow',
    category: 'specialized',
    icon: 'honeyicons/tensorflowlogo.png',
    connections: ['python'],
    projects: [
      {
        name: 'Beatbox Classification',
        desc: 'Bachelor thesis - CNN audio recognition',
        url: null
      },
      {
        name: 'Note: AudioLab uses scikit-learn',
        desc: 'Not TensorFlow',
        url: 'projects/audiolab.html'
      }
    ]
  },
  spatial: {
    name: '3D Spatial Audio',
    category: 'specialized',
    icon: 'honeyicons/3DAudio.png',
    connections: ['blueprints', 'reaper', 'wwise'],
    projects: [
      {
        name: 'Shadow Frames',
        desc: 'Spatial audio systems in Wwise',
        url: 'projects/shadow-frames.html'
      }
    ]
  }
};

const CATEGORY_COLORS = {
  middleware: '#3b82f6',
  daw: '#a855f7',
  programming: '#22c55e',
  specialized: '#fb923c'
};

// Get translation helper
function getTranslation(key) {
  const lang = localStorage.getItem('language') || 'en';
  const keys = key.split('.');
  let value = window.__I18N__?.[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

// Initialize skill modal system
function initSkillModal() {
  // Check if overlay already exists
  let overlay = document.querySelector('.skill-detail-overlay');

  if (!overlay) {
    // Create modal overlay only if it doesn't exist
    overlay = document.createElement('div');
    overlay.className = 'skill-detail-overlay';
    overlay.innerHTML = `
      <div class="skill-detail-card">
        <button class="skill-detail-close">×</button>
        <div class="skill-detail-header">
          <img class="skill-detail-icon" src="" alt="">
          <h2 class="skill-detail-title"></h2>
        </div>
        <div class="skill-detail-section">
          <h3 class="modal-section-header" data-section="connectedTech"></h3>
          <div class="skill-detail-connections"></div>
        </div>
        <div class="skill-detail-section">
          <h3 class="modal-section-header" data-section="projectUsage"></h3>
          <ul class="skill-detail-projects"></ul>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Always update section headers with translations (even if overlay exists)
  overlay.querySelectorAll('.modal-section-header').forEach((header) => {
    const section = header.dataset.section;
    header.textContent = getTranslation(`skillModal.${section}`);
  });

  const card = overlay.querySelector('.skill-detail-card');
  const closeBtn = overlay.querySelector('.skill-detail-close');
  const iconEl = overlay.querySelector('.skill-detail-icon');
  const titleEl = overlay.querySelector('.skill-detail-title');
  const connectionsEl = overlay.querySelector('.skill-detail-connections');
  const projectsEl = overlay.querySelector('.skill-detail-projects');

  // Store reference to prevent duplicate event listeners
  if (!overlay.dataset.initialized) {
    overlay.dataset.initialized = 'true';

    // Open modal function (stored globally for reuse)
    window.openSkillModal = function (skillId) {
      const skill = SKILL_DATA[skillId];
      if (!skill) return;

      // Set content
      titleEl.textContent = skill.name;
      if (skill.icon) {
        iconEl.src = skill.icon;
        iconEl.style.display = 'block';
      } else {
        iconEl.style.display = 'none';
      }

      // Connections
      connectionsEl.innerHTML = '';
      skill.connections.forEach((connId) => {
        const connSkill = SKILL_DATA[connId];
        if (connSkill) {
          const tag = document.createElement('div');
          tag.className = `connection-tag category-${connSkill.category}`;
          tag.textContent = connSkill.name;
          tag.onclick = () => {
            overlay.classList.remove('active');
            setTimeout(() => window.openSkillModal(connId), 300);
          };
          connectionsEl.appendChild(tag);
        }
      });

      if (skill.connections.length === 0) {
        const noConnectionsMsg = getTranslation('skillModal.noConnections');
        connectionsEl.innerHTML = `<p style="color: #9ca3af;">${noConnectionsMsg}</p>`;
      }

      // Projects
      projectsEl.innerHTML = skill.projects
        .map((p) => {
          if (p.url) {
            return `<li><a href="${p.url}"><span class="project-name">${p.name}</span><span class="project-desc">${p.desc}</span></a></li>`;
          } else {
            return `<li><span class="project-name">${p.name}</span><span class="project-desc">${p.desc}</span></li>`;
          }
        })
        .join('');

      // Show modal
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    // Close modal function
    window.closeSkillModal = function () {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    // Event listeners (only attach once)
    closeBtn.onclick = window.closeSkillModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) window.closeSkillModal();
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        window.closeSkillModal();
      }
    });

    // Update translations when language changes
    window.addEventListener('languageChanged', () => {
      overlay.querySelectorAll('.modal-section-header').forEach((header) => {
        const section = header.dataset.section;
        header.textContent = getTranslation(`skillModal.${section}`);
      });

      // If modal is open, update the "no connections" message if visible
      if (overlay.classList.contains('active')) {
        const noConnectionsP = connectionsEl.querySelector('p');
        if (noConnectionsP) {
          noConnectionsP.textContent = getTranslation('skillModal.noConnections');
        }
      }
    });
  }

  // Attach/reattach click handlers to hexagons (these need to be refreshed after AJAX load)
  document.querySelectorAll('.hexagon[data-skill]').forEach((hex) => {
    hex.style.cursor = 'pointer';
    // Remove old listener if exists
    hex.replaceWith(hex.cloneNode(true));
  });

  // Re-query after cloning and add fresh listeners
  document.querySelectorAll('.hexagon[data-skill]').forEach((hex) => {
    hex.style.cursor = 'pointer';
    hex.addEventListener('click', () => {
      const skillId = hex.dataset.skill;
      window.openSkillModal(skillId);
    });
  });
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkillModal);
} else {
  initSkillModal();
}

// Re-initialize after AJAX page load (for smooth navigation system)
window.addEventListener('pageContentLoaded', () => {
  // Check if we're on the about page before initializing
  if (window.location.pathname.includes('about') || window.location.pathname === '/') {
    initSkillModal();
  }
});
