// Skill Modal System - Click to view details
// Data based on ACTUAL project tech tags

const SKILL_DATA = {
  // Middleware
  wwise: {
    name: 'Wwise',
    category: 'middleware',
    icon: 'honeyicons/wwiselogo.png',
    connections: ['cpp', 'blueprints'],
    projects: [
      {
        name: 'Shadow Frames',
        descKey: 'modal_shadow_frames',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Pause & Deserve',
        descKey: 'modal_pause_deserve',
        url: 'projects/pause-and-deserve.html'
      },
      {
        name: 'Music for Games',
        descKey: 'modal_music_games',
        url: 'projects/musicforgames.html'
      },
      {
        name: 'Middleware Optimization',
        descKey: 'modal_middleware_opt',
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
        descKey: 'modal_fmod_exp',
        url: null
      }
    ]
  },
  unreal: {
    name: 'Unreal Engine',
    category: 'middleware',
    icon: 'honeyicons/Unreal_Engine-Logo.wine.png',
    connections: ['cpp', 'blueprints'],
    projects: [
      {
        name: 'Shadow Frames',
        descKey: 'modal_shadow_frames',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Not Today Darling',
        descKey: 'modal_not_today',
        url: 'projects/not-today-darling.html'
      },
      {
        name: 'Pause & Deserve',
        descKey: 'modal_pause_deserve',
        url: 'projects/pause-and-deserve.html'
      }
    ]
  },
  unity: {
    name: 'Unity',
    category: 'middleware',
    icon: 'honeyicons/Unitylogo.png',
    connections: ['csharp'],
    projects: [
      {
        name: 'AudioLab',
        descKey: 'modal_unity_audiolab',
        url: 'projects/audiolab.html'
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
        descKey: 'modal_reaper_ntd',
        url: 'projects/not-today-darling.html'
      },
      {
        name: 'Ray Animation',
        descKey: 'modal_reaper_ray',
        url: 'projects/ray-animation.html'
      },
      { name: 'All Projects', descKey: 'modal_reaper_all', url: null }
    ]
  },
  ableton: {
    name: 'Ableton Live',
    category: 'daw',
    icon: 'honeyicons/abletonlogo.png',
    connections: ['dsp'],
    projects: [
      {
        name: 'Music for Games',
        descKey: 'modal_ableton_music',
        url: 'projects/musicforgames.html'
      },
      { name: 'Sound Design', descKey: 'modal_ableton_sound', url: null }
    ]
  },
  flstudio: {
    name: 'FL Studio',
    category: 'daw',
    icon: 'honeyicons/flstudiologo.png',
    connections: ['dsp'],
    projects: [{ name: 'Music Composition', descKey: 'modal_fl_music', url: null }]
  },
  logicpro: {
    name: 'Logic Pro',
    category: 'daw',
    icon: 'honeyicons/logicproicon.png',
    connections: ['dsp'],
    projects: [
      {
        name: 'Amorak',
        descKey: 'modal_logic_amorak',
        url: 'projects/amorak.html'
      }
    ]
  },
  studioone: {
    name: 'Studio One',
    category: 'daw',
    icon: 'honeyicons/studiooneicon.png',
    connections: ['dsp'],
    projects: [
      {
        name: 'Ray Animation',
        descKey: 'modal_studio_ray',
        url: 'projects/ray-animation.html'
      },
      {
        name: 'Amorak',
        descKey: 'modal_studio_amorak',
        url: 'projects/amorak.html'
      },
      {
        name: 'Akantilado',
        descKey: 'modal_studio_akantilado',
        url: 'projects/akantilado.html'
      }
    ]
  },
  cubase: {
    name: 'Cubase',
    category: 'daw',
    icon: 'honeyicons/Cubaselogo.png',
    connections: ['dsp'],
    projects: [{ name: 'Music Composition', descKey: 'modal_cubase_music', url: null }]
  },

  // Programming
  cpp: {
    name: 'C++',
    category: 'programming',
    icon: 'honeyicons/cpplogo.png',
    connections: ['wwise', 'fmod', 'unreal', 'juce', 'dsp'],
    projects: [
      {
        name: 'Shadow Frames',
        descKey: 'modal_cpp_shadow',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Not Today Darling',
        descKey: 'modal_cpp_ntd',
        url: 'projects/not-today-darling.html'
      },
      { name: 'Custom Audio Plugins', descKey: 'modal_cpp_plugins', url: null }
    ]
  },
  csharp: {
    name: 'C#',
    category: 'programming',
    icon: 'honeyicons/csharplogo.png',
    connections: ['fmod', 'unity'],
    projects: [
      {
        name: 'AudioLab',
        descKey: 'modal_csharp_audiolab',
        url: 'projects/audiolab.html'
      },
      { name: 'Unity Tools', descKey: 'modal_csharp_tools', url: null }
    ]
  },
  python: {
    name: 'Python',
    category: 'programming',
    icon: 'honeyicons/pythonlogo.png',
    connections: ['tensorflow'],
    projects: [
      {
        name: 'AudioLab',
        descKey: 'modal_python_audiolab',
        url: 'projects/audiolab.html'
      },
      { name: 'AudioQ', descKey: 'modal_python_audioq', url: 'projects/audioq.html' },
      {
        name: 'Wwise Unreal Fixer',
        descKey: 'modal_wwise_fixer',
        url: 'projects/wwise-unreal-fixer.html'
      },
      {
        name: 'Unreal Engine Rebuilder',
        descKey: 'modal_ue_rebuilder',
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
        descKey: 'modal_blueprints_shadow',
        url: 'projects/shadow-frames.html'
      },
      {
        name: 'Pause & Deserve',
        descKey: 'modal_blueprints_pause',
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
        descKey: 'modal_git_all',
        url: 'https://github.com/Szunias'
      }
    ]
  },
  perforce: {
    name: 'Perforce',
    category: 'programming',
    icon: 'honeyicons/Perforcelogo.png',
    connections: [],
    projects: [
      {
        name: 'Large-Scale Projects',
        descKey: 'modal_perforce_projects',
        url: null
      }
    ]
  },

  // Specialized
  juce: {
    name: 'JUCE',
    category: 'specialized',
    icon: 'honeyicons/JUCE_Logo.png',
    connections: ['cpp'],
    projects: [{ name: 'Audio Plugin Development', descKey: 'modal_juce_plugins', url: null }]
  },
  dsp: {
    name: 'DSP',
    category: 'specialized',
    icon: 'honeyicons/dsplogo.png',
    connections: ['cpp', 'reaper', 'ableton', 'flstudio', 'logicpro', 'studioone', 'cubase', 'puredata'],
    projects: [{ name: 'Real-time Processing', descKey: 'modal_dsp_processing', url: null }]
  },
  tensorflow: {
    name: 'TensorFlow',
    category: 'specialized',
    icon: 'honeyicons/tensorflowlogo.png',
    connections: ['python'],
    projects: [
      {
        name: 'Beatbox Classification Experiments',
        descKey: 'modal_tensorflow_beatbox',
        url: null
      },
      {
        name: 'AudioLab (uses scikit-learn)',
        descKey: 'modal_tensorflow_note',
        url: 'projects/audiolab.html'
      }
    ]
  },
  spatial: {
    name: '3D Spatial Audio',
    category: 'specialized',
    icon: 'honeyicons/3DAudio.png',
    connections: ['blueprints', 'reaper'],
    projects: [
      {
        name: 'Shadow Frames',
        descKey: 'modal_spatial_shadow',
        url: 'projects/shadow-frames.html'
      }
    ]
  },
  puredata: {
    name: 'Pure Data',
    category: 'specialized',
    icon: 'honeyicons/puredatalogo.png',
    connections: ['dsp'],
    projects: [
      {
        name: 'Audio Synthesis',
        descKey: 'modal_puredata_synthesis',
        url: null
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

// Get translation helper - checks both inline and loaded translations
function getTranslation(key) {
  const lang = localStorage.getItem('language') || 'en';

  // Try loaded translations first (from BulletproofI18n)
  if (window.i18n && window.i18n.translations && window.i18n.translations[lang]) {
    const keys = key.split('.');
    let value = window.i18n.translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value && value !== key) return value;
  }

  // Fallback to inline critical translations
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

      // Store current skill ID for language change updates
      overlay.dataset.currentSkill = skillId;

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

      // Projects - use translation keys for descriptions
      projectsEl.innerHTML = skill.projects
        .map((p) => {
          const desc = p.descKey ? getTranslation(p.descKey) : (p.desc || '');
          if (p.url) {
            return `<li><a href="${p.url}"><span class="project-name">${p.name}</span><span class="project-desc">${desc}</span></a></li>`;
          } else {
            return `<li><span class="project-name">${p.name}</span><span class="project-desc">${desc}</span></li>`;
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
      overlay.dataset.currentSkill = ''; // Clear current skill
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

      // If modal is open, refresh all translatable content
      if (overlay.classList.contains('active')) {
        // Update "no connections" message if visible
        const noConnectionsP = connectionsEl.querySelector('p');
        if (noConnectionsP) {
          noConnectionsP.textContent = getTranslation('skillModal.noConnections');
        }

        // Re-render project descriptions with new language
        const currentSkillId = overlay.dataset.currentSkill;
        if (currentSkillId) {
          const skill = SKILL_DATA[currentSkillId];
          if (skill) {
            projectsEl.innerHTML = skill.projects
              .map((p) => {
                const desc = p.descKey ? getTranslation(p.descKey) : (p.desc || '');
                if (p.url) {
                  return `<li><a href="${p.url}"><span class="project-name">${p.name}</span><span class="project-desc">${desc}</span></a></li>`;
                } else {
                  return `<li><span class="project-name">${p.name}</span><span class="project-desc">${desc}</span></li>`;
                }
              })
              .join('');
          }
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
