/**
 * Site configuration - page definitions for the build script.
 *
 * Each entry specifies:
 *   slug       - output filename (without .html)
 *   layout     - which layout template to use (home | project | music)
 *   css        - CSS file to inline (one per layout type)
 *   js         - JS files to concatenate and inline
 *   title      - <title> tag content
 *   description- meta description
 *   canonical  - canonical URL
 *   ogTitle    - override OG/Twitter title (defaults to title)
 *   ogImage    - og:image URL (optional)
 *   lightbox   - true to inject lightbox partial (project pages with galleries)
 *   ogImageAlt - accessible text for social preview images (optional)
 */

const SITE = 'https://igorszuniewicz.com';

module.exports = {
  /** External archive pages copied to dist/. Keep noindex pages out of sitemap. */
  staticCopy: [
    {
      file: 'archive/dae-page.html',
      sitemap: false,
      noindex: true,
      sanitize: true,
      rewriteRootRelativeTo: 'https://www.howest.be',
      ensureIds: ['main-content'],
    },
    { file: 'archive/nuonsoft-becpp.html', sitemap: false, noindex: true, sanitize: true },
  ],

  pages: [
    // Home
    {
      slug: 'index',
      layout: 'home',
      css: 'home',
      js: [],
      assets: [
        'vendor/three.module.min.js',
        'vendor/RoomEnvironment.js',
      ],
      title: 'Igor Szuniewicz | Game Audio & Technical Sound Designer',
      ogTitle: 'Igor Szuniewicz | Game Audio & Technical Sound Designer',
      description: 'Game audio portfolio by Igor Szuniewicz: readable gameplay mixes, Wwise/Unreal/Unity implementation, spatial audio, C++ tools, and sound design case studies.',
      canonical: `${SITE}/`,
      ogImage: `${SITE}/old/public/assets/images/projects-shadowframes/22_ShadowFrames_03.jpg`,
      ogImageAlt: 'Shadow Frames horror game screenshot from Igor Szuniewicz game audio portfolio',
    },

    // Music
    {
      slug: 'music',
      layout: 'music',
      css: 'music',
      js: ['theme-toggle', 'music'],
      title: 'Game & Film Music | Igor Szuniewicz',
      description: 'Original game, film, electronic, metal, jazz, and cinematic tracks by Igor Szuniewicz, written for scoring, trailers, remixes, and releases.',
      canonical: `${SITE}/music.html`,
      ogImage: `${SITE}/old/public/assets/audio/covers/Cage.png`,
      ogImageAlt: 'Album cover artwork for music by Igor Szuniewicz',
    },

    // Projects with lightbox
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
      title: 'Akantilado Sound Design | 5.1 Jungle Foley',
      description: 'Akantilado: 200+ hand-made sounds for a 3D jungle short film, with full sound design, foley, ambience, and final mix.',
      canonical: `${SITE}/akantilado.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-akantilado/jungleviewfromtopshot.webp`,
      ogImageAlt: 'Akantilado jungle animation screenshot from sound design project',
      lightbox: true,
    },

    // Projects without lightbox
    {
      slug: 'transientica',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Transientica | Unity Beatbox Rhythm Game & Audio ML',
      description: 'Unity rhythm game audio ML case study: 45ms Python/SVM prototype, 92% accuracy, C# KNN rebuild, and a pre-allocated audio path.',
      canonical: `${SITE}/transientica.html`,
      ogImage: `${SITE}/transienticascreenshot.png`,
      ogImageAlt: 'Transientica Unity beatbox rhythm game interface screenshot',
    },
    {
      slug: 'ai-audio-research',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle', 'ai-audio-demo'],
      title: 'AI Audio Research | Game Sound Generation Latency',
      description: 'Research on generated game sound latency: procedural DSP, generative models, 600 generations, latency benchmarks, and caching.',
      canonical: `${SITE}/ai-audio-research.html`,
      ogImage: `${SITE}/aithesiscover.png`,
      ogImageAlt: 'AI audio research thesis cover about real-time game sound generation',
      assets: [
        'old/public/assets/images/projects-ai-audio-research/presentation/images/procedural-dsp.png',
        'old/public/assets/images/projects-ai-audio-research/presentation/images/audiogen.png',
        'old/public/assets/images/projects-ai-audio-research/presentation/images/mmaudio.png',
        'old/public/assets/images/projects-ai-audio-research/presentation/images/elevenlabs.png',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/dsp-footstep.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/audiogen-footstep.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/mmaudio-footstep.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/elevenlabs-footstep.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/dsp-machine-gun.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/audiogen-machine-gun.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/mmaudio-machine-gun.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/elevenlabs-machine-gun.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/dsp-cat.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/audiogen-cat.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/mmaudio-cat.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/elevenlabs-cat.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/dsp-door.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/audiogen-door.wav',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/mmaudio-door.mp3',
        'old/public/assets/images/projects-ai-audio-research/presentation/audio/elevenlabs-door.wav',
      ],
    },
    {
      slug: 'audioq',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'AudioQ VST3 Sampler Plugin | C++ JUCE',
      description: 'AudioQ VST3 sampler built in C++ and JUCE 8: granular playback, filters, glitch effects, DAW automation, drag-drop audio, and peak safety in one plugin.',
      canonical: `${SITE}/audioq.html`,
      ogImage: `${SITE}/audioqscreenshot.png`,
      ogImageAlt: 'AudioQ VST3 sampler plugin interface with waveform and effects controls',
    },
    {
      slug: 'amorak',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Amorak Binaural Horror Sound Design | Reaper',
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
      title: 'Richter Field Recording Sound Design | Earthquake Film',
      description: 'Richter earthquake short-film sound design with no commercial libraries: Zoom H6 field recordings, free synth rumble, foley texture, and dialogue-safe mixing.',
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
      description: 'Game audio sound design reel: combat, spells, weapons, creatures, and sci-fi spaces rebuilt from field recordings, synthesis, foley, and Reaper edits.',
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
      description: 'Dev tool for repairing broken Wwise and Unreal audio references after Perforce syncs: backup-first workflow and repair time cut from ~20 minutes to 10 seconds.',
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
      description: 'Unreal Engine cleanup tool that turns ~15 minutes of cache deletion, solution regeneration, backups, and disk cleanup into one guided rebuild flow.',
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
      description: 'XR Labs Belgium technical sound design for Unity VR/AR training simulations: spatial audio, occlusion, implementation, and Perforce workflows.',
      canonical: `${SITE}/xrlabs.html`,
      ogImage: `${SITE}/old/public/assets/images/about-grid/xrlabssoldiers.png`,
      ogImageAlt: 'XR Labs VR training simulation scene with soldiers',
    },
  ],
};
