/**
 * Site configuration — page definitions for the build script.
 *
 * Each entry specifies:
 *   slug       – output filename (without .html)
 *   layout     – which layout template to use (home | project | music)
 *   css        – CSS file to inline (one per layout type)
 *   js         – JS files to concatenate and inline
 *   title      – <title> tag content
 *   description– meta description
 *   canonical  – canonical URL
 *   ogTitle    – override OG/Twitter title (defaults to title)
 *   ogImage    – og:image URL (optional)
 *   lightbox   – true to inject lightbox partial (project pages with galleries)
 *   ogImageAlt – accessible text for social preview images (optional)
 */

const SITE = 'https://igorszuniewicz.com';

module.exports = {
  /** External archive pages copied to dist/. Keep noindex pages out of sitemap. */
  staticCopy: [
    {
      file: 'archive/dae-page.html',
      sitemap: false,
      noindex: true,
      rewriteRootRelativeTo: 'https://www.howest.be',
      ensureIds: ['main-content'],
    },
    { file: 'archive/nuonsoft-becpp.html', sitemap: false, noindex: true },
  ],

  pages: [
    // ─── HOME ───────────────────────────────────────────────────
    {
      slug: 'index',
      layout: 'home',
      css: 'home',
      js: ['theme-toggle'],
      title: 'Igor Szuniewicz | Game Audio & Technical Sound Designer',
      ogTitle: 'Igor Szuniewicz | Game Audio & Technical Sound Designer',
      description: 'Game audio portfolio by Igor Szuniewicz: technical sound design, Wwise, Unreal/Unity, spatial audio, C++ tools, and a sound design reel.',
      canonical: `${SITE}/`,
      ogImage: `${SITE}/old/public/assets/images/projects-shadowframes/22_ShadowFrames_03.jpg`,
      ogImageAlt: 'Shadow Frames horror game screenshot from Igor Szuniewicz game audio portfolio',
    },

    // ─── MUSIC ──────────────────────────────────────────────────
    {
      slug: 'music',
      layout: 'music',
      css: 'music',
      js: ['theme-toggle', 'music'],
      title: 'Game & Film Music - Igor Szuniewicz',
      description: 'Original game, film, electronic, metal, jazz, and cinematic music by Igor Szuniewicz for scoring, trailers, and standalone releases.',
      canonical: `${SITE}/music.html`,
      ogImage: `${SITE}/old/public/assets/audio/covers/Cage.png`,
      ogImageAlt: 'Album cover artwork for music by Igor Szuniewicz',
    },

    // ─── PROJECTS (with lightbox) ───────────────────────────────
    {
      slug: 'shadowframes',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Shadow Frames Game Audio | Wwise UE5 Horror Sound Design',
      description: 'Horror game audio case study: Wwise spatial audio, UE5 implementation, 32-source spatial mix budget, and a 49-page Sound Bible for Shadow Frames.',
      canonical: `${SITE}/shadowframes.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-shadowframes/22_ShadowFrames_03.jpg`,
      ogImageAlt: 'Shadow Frames UE5 horror game scene with spatial audio implementation',
      lightbox: true,
    },
    {
      slug: 'nottoday',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Not Today, Darling! | MetaSounds UE5 Game Audio',
      description: 'Solo game audio for an 11-week UE5 4-player go-kart racer: ~70 audio events, 32-source mix limit, MetaSounds engine audio, and team-recorded character voices.',
      canonical: `${SITE}/nottoday.html`,
      ogImage: `${SITE}/old/public/assets/images/projects/NotTodayPic1.png`,
      ogImageAlt: 'Not Today, Darling! go-kart racing game screenshot',
      lightbox: true,
    },
    {
      slug: 'ray',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Ray Animation - Igor Szuniewicz',
      description: 'Ray Animation: disco-funk score written in 8 days after the composer dropped out, with full music, sound design, and mix.',
      canonical: `${SITE}/ray.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-ray/rayinlight.png`,
      ogImageAlt: 'Ray animation still showing the character discovering light in a cave',
      lightbox: true,
    },
    {
      slug: 'akantilado',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Akantilado - Igor Szuniewicz',
      description: 'Akantilado: 200+ hand-made sounds for a 3D jungle short film, with full sound design, foley, ambience, and final mix.',
      canonical: `${SITE}/akantilado.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-akantilado/jungleviewfromtopshot.webp`,
      ogImageAlt: 'Akantilado jungle animation screenshot from sound design project',
      lightbox: true,
    },

    // ─── PROJECTS (no lightbox) ─────────────────────────────────
    {
      slug: 'transientica',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Transientica | Unity Beatbox Rhythm Game & Audio ML',
      description: 'Unity rhythm game audio ML case study: 45ms Python/SVM prototype, 92% accuracy, C# KNN rebuild, and zero-allocation audio pipeline.',
      canonical: `${SITE}/transientica.html`,
      ogImage: `${SITE}/transienticascreenshot.png`,
      ogImageAlt: 'Transientica Unity beatbox rhythm game interface screenshot',
    },
    {
      slug: 'ai-audio-research',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle', 'ai-audio-demo'],
      title: 'AI Audio Research | Real-Time Game Sound Generation',
      description: 'Research on real-time AI game sound generation: procedural DSP, generative models, 600 generations, latency benchmarks, and caching.',
      canonical: `${SITE}/ai-audio-research.html`,
      ogImage: `${SITE}/aithesiscover.png`,
      ogImageAlt: 'AI audio research thesis cover about real-time game sound generation',
    },
    {
      slug: 'audioq',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'AudioQ VST3 Sampler Plugin | C++ JUCE',
      description: 'AudioQ VST3 sampler plugin built in C++ and JUCE 8 with granular synthesis, filters, bitcrushing, stutter, reverse, and drag-drop audio.',
      canonical: `${SITE}/audioq.html`,
      ogImage: `${SITE}/audioqscreenshot.png`,
      ogImageAlt: 'AudioQ VST3 sampler plugin interface with waveform and effects controls',
    },
    {
      slug: 'amorak',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Amorak - Igor Szuniewicz',
      description: 'Amorak: binaural horror animation sound design in Reaper, Dear VR Pro, and IEM, with creature vocals and 3D basement ambience.',
      canonical: `${SITE}/amorak.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-amorak/basement.png`,
      ogImageAlt: 'Amorak horror animation basement scene used for binaural sound design',
    },
    {
      slug: 'pausedeserve',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Pause & Deserve - Igor Szuniewicz',
      description: 'Pause and Deserve: solo-built UE5 horror game with code, audio, and level design, where pausing freezes the enemy but makes it faster.',
      canonical: `${SITE}/pausedeserve.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-pausedeserve/redcorridor.png`,
      ogImageAlt: 'Pause and Deserve UE5 horror game red corridor screenshot',
    },
    {
      slug: 'richter',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Richter - Igor Szuniewicz',
      description: 'Richter: earthquake short film sound design with no commercial sample libraries; every sound was field-recorded or synthesized with free plugins.',
      canonical: `${SITE}/richter.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-daw2/vlcsnap-2025-09-28-00h05m42s119.png`,
      ogImageAlt: 'Richter earthquake short film frame from field-recorded sound design project',
    },
    {
      slug: 'sounddesign',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Game Audio Sound Design Reel - Igor Szuniewicz',
      description: 'Game audio sound design reel with combat, weapons, creatures, foley, synthesis, Reaper editing, field recordings, and redesigns.',
      canonical: `${SITE}/sounddesign.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-sounddesign/sounddesignprojectcover.png`,
      ogImageAlt: 'Sound design reel cover for game audio redesigns by Igor Szuniewicz',
    },
    {
      slug: 'wwiseprojects',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Wwise Audio Implementation Projects | Unity Optimization',
      description: 'Three Wwise implementation projects: 256-voice prioritization, zone-based spatial mixing, and Android memory optimization.',
      canonical: `${SITE}/wwiseprojects.html`,
      ogImage: `${SITE}/old/public/wwiseprojectsinfo/images/StomachAches.png`,
      ogImageAlt: 'Wwise implementation project screenshot showing game audio optimization work',
    },
    {
      slug: 'wwisefixer',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Wwise UE Fixer | Unreal Audio Repair Tool',
      description: 'Dev tool for repairing broken Wwise and Unreal Engine audio references after Perforce syncs: backup-first workflow, config checks, and repair time reduced from about 20 minutes to 10 seconds.',
      canonical: `${SITE}/wwisefixer.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-wwisefixer/wwisefixerlogo.jpeg`,
      ogImageAlt: 'Wwise UE Fixer tool logo for Unreal Engine audio repair workflow',
    },
    {
      slug: 'unrealrebuilder',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'UE Rebuilder | Unreal Engine Cleanup Tool',
      description: 'Unreal Engine cleanup and rebuild tool that archives project folders, clears stale generated data, regenerates solution files, and exposes disk-heavy cache folders.',
      canonical: `${SITE}/unrealrebuilder.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-unrealrebuilder/UnrealRebuilderlogo.jpeg`,
      ogImageAlt: 'UE Rebuilder logo for Unreal Engine cleanup and rebuild tooling',
    },
    {
      slug: 'xrlabs',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'XR Labs Technical Sound Design | VR Spatial Audio',
      description: 'XR Labs Belgium: technical sound design for VR/AR training simulations using Unity, Steam Audio, spatial audio, occlusion, and Perforce.',
      canonical: `${SITE}/xrlabs.html`,
      ogImage: `${SITE}/old/public/assets/images/about-grid/xrlabssoldiers.png`,
      ogImageAlt: 'XR Labs VR training simulation scene with soldiers',
    },
  ],
};
