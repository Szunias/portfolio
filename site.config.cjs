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
 *   schema     – optional JSON-LD string (home page only)
 */

const SITE = 'https://igorszuniewicz.com';

const SCHEMA_HOME = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Igor Szuniewicz",
  "url": "https://igorszuniewicz.com",
  "jobTitle": "Game Audio Designer",
  "sameAs": [
    "https://www.linkedin.com/in/igorszuniewicz",
    "https://github.com/Szunias",
    "https://igorszuniewicz.itch.io",
    "https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6"
  ]
}
</script>`;

module.exports = {
  /** Files to copy as-is to dist/ (external pages, not built with layout system) */
  staticCopy: ['archive/dae-page.html', 'archive/nuonsoft-becpp.html'],

  pages: [
    // ─── HOME ───────────────────────────────────────────────────
    {
      slug: 'index',
      layout: 'home',
      css: 'home',
      js: ['theme-toggle'],
      title: 'IGOR SZUNIEWICZ - Game Audio Designer',
      ogTitle: 'Igor Szuniewicz - Game Audio Designer',
      description: 'Igor Szuniewicz — game audio designer and programmer. Portfolio featuring Wwise, FMOD, Unreal Engine 5, and C++ projects. Sound design, spatial audio, and AI audio research.',
      canonical: `${SITE}/`,
      ogImage: `${SITE}/old/public/assets/images/projects-shadowframes/22_ShadowFrames_03.jpg`,
      schema: SCHEMA_HOME,
    },

    // ─── MUSIC ──────────────────────────────────────────────────
    {
      slug: 'music',
      layout: 'music',
      css: 'music',
      js: ['theme-toggle', 'music'],
      title: 'Music - Igor Szuniewicz',
      description: 'Original music by Igor Szuniewicz — game scores, film compositions, and personal tracks. Listen to the full catalog on Spotify, or stream directly from the portfolio.',
      canonical: `${SITE}/music.html`,
      ogImage: `${SITE}/old/public/assets/audio/covers/Cage.jpg`,
    },

    // ─── PROJECTS (with lightbox) ───────────────────────────────
    {
      slug: 'shadowframes',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Shadow Frames - Igor Szuniewicz',
      description: 'Shadow Frames: a horror game where audio is the only navigation. Solo audio designer on a multi-school UE5 team. Wwise spatial audio, 32 voice limit, 49-page Sound Bible.',
      canonical: `${SITE}/shadowframes.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-shadowframes/22_ShadowFrames_03.jpg`,
      lightbox: true,
    },
    {
      slug: 'nottoday',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Not Today, Darling! - Igor Szuniewicz',
      description: 'Not Today, Darling! — solo audio on a granny go-kart racing game. 70 Wwise events, 32 voice limit, MetaSounds procedural engine in UE5. 11-week project.',
      canonical: `${SITE}/nottoday.html`,
      ogImage: `${SITE}/old/public/assets/images/projects/NotTodayPic1.png`,
      lightbox: true,
    },
    {
      slug: 'ray',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Ray Animation - Igor Szuniewicz',
      description: 'Ray Animation: disco-funk score written from scratch in 8 days after the composer dropped out. Full music composition, sound design, and mix for a 3D animated short.',
      canonical: `${SITE}/ray.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-ray/rayinlight.png`,
      lightbox: true,
    },
    {
      slug: 'akantilado',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'lightbox', 'theme-toggle'],
      title: 'Akantilado - Igor Szuniewicz',
      description: 'Akantilado: 200+ hand-made sounds for a 3D animated jungle short film. Two cats, one cliff, and a soundscape that never goes quiet. Full sound design and mix.',
      canonical: `${SITE}/akantilado.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-akantilado/jungleviewfromtopshot.webp`,
      lightbox: true,
    },

    // ─── PROJECTS (no lightbox) ─────────────────────────────────
    {
      slug: 'transientica',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Transientica - Igor Szuniewicz',
      description: 'Transientica: a beatbox rhythm game built in Unity. KNN classifier recognizes kick, snare, and hi-hat from your mic in real time. Pure C#, zero-allocation audio pipeline, no external ML frameworks.',
      canonical: `${SITE}/transientica.html`,
      ogImage: `${SITE}/transienticascreenshot.png`,
    },
    {
      slug: 'ai-audio-research',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'AI Audio Research - Igor Szuniewicz',
      description: 'Can AI generate game sounds in real time? Research testing three AI models for on-the-fly audio generation. Latency benchmarks, caching strategies, and practical results.',
      canonical: `${SITE}/ai-audio-research.html`,
      ogImage: `${SITE}/aithesiscover.png`,
    },
    {
      slug: 'audioq',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'AudioQ - Igor Szuniewicz',
      description: 'AudioQ: a VST3 sampler plugin built in C++ with JUCE 8. Granular synthesis, filters, bitcrushing, stutter, and reverse — all in one window. Drag in any audio file.',
      canonical: `${SITE}/audioq.html`,
      ogImage: `${SITE}/audioqscreenshot.png`,
    },
    {
      slug: 'amorak',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Amorak - Igor Szuniewicz',
      description: 'Amorak: binaural horror game teaser. Sound design and spatial audio built in Wwise with HRTF — the creature sounds like it\'s right behind you. Headphones required.',
      canonical: `${SITE}/amorak.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-amorak/basement.png`,
    },
    {
      slug: 'pausedeserve',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Pause & Deserve - Igor Szuniewicz',
      description: 'Pause and Deserve: a solo-built UE5 horror game where pausing freezes the enemy but makes it 20% faster each time. Code, audio, and level design all done in 8 weeks.',
      canonical: `${SITE}/pausedeserve.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-pausedeserve/redcorridor.png`,
    },
    {
      slug: 'richter',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Richter - Igor Szuniewicz',
      description: 'Richter: sound design for a student earthquake short film. No sample libraries allowed — every sound was field-recorded or synthesized from scratch with free plugins.',
      canonical: `${SITE}/richter.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-daw2/vlcsnap-2025-09-28-00h05m42s119.png`,
    },
    {
      slug: 'wwisefixer',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Wwise Unreal Engine Fixer - Igor Szuniewicz',
      description: 'Wwise UE Fixer: a tool that automates Wwise-Unreal reconnection after Perforce syncs. Fixes broken paths, mute actors, and plugin settings in one click instead of 20 minutes.',
      canonical: `${SITE}/wwisefixer.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-wwisefixer/wwisefixerlogo.jpeg`,
    },
    {
      slug: 'unrealrebuilder',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Unreal Engine Rebuilder - Igor Szuniewicz',
      description: 'UE Rebuilder: one-click tool that fixes Unreal Engine build failures by clearing stale caches, intermediate files, and linker errors. Saves 15+ minutes per broken build.',
      canonical: `${SITE}/unrealrebuilder.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-unrealrebuilder/appscreenshot.png`,
    },
    {
      slug: 'sounddesign',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Sound Design Reel - Igor Szuniewicz',
      description: 'Sound design reel by Igor Szuniewicz. Original audio stripped, everything rebuilt from scratch — no sound libraries. Redesigns of God of War, Baldur\'s Gate 3, and more.',
      canonical: `${SITE}/sounddesign.html`,
      ogImage: `${SITE}/old/public/assets/images/projects-sounddesign/sounddesignprojectcover.png`,
    },
    {
      slug: 'wwiseprojects',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Wwise Projects Portfolio - Igor Szuniewicz',
      description: 'Three Wwise school projects where things kept breaking. Middleware implementation, event systems, and real problems solved while learning Audiokinetic Wwise from scratch.',
      canonical: `${SITE}/wwiseprojects.html`,
      ogImage: `${SITE}/old/public/wwiseprojectsinfo/images/StomachAches.png`,
    },
    {
      slug: 'gradwork',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'Graduation Work - Igor Szuniewicz',
      description: 'AI audio generation graduation research at Howest DAE. Tested real-time sound synthesis models, measured latency, and built a caching system for game audio pipelines.',
      canonical: `${SITE}/gradwork.html`,
      ogImage: `${SITE}/aithesiscover.png`,
    },
    {
      slug: 'xrlabs',
      layout: 'project',
      css: 'project',
      js: ['scroll-progress', 'scroll-reveal', 'theme-toggle'],
      title: 'XR Labs - Igor Szuniewicz',
      description: 'XR Labs Belgium: technical sound design for VR/AR training simulations used by defence, police, and customs services.',
      canonical: `${SITE}/xrlabs.html`,
      ogImage: `${SITE}/old/public/assets/images/about-grid/xrlabssoldiers.png`,
    },
  ],
};
