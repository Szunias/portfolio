import { useMemo, useState } from 'react';

const projects = [
  {
    title: 'Shadow Frames',
    category: 'Game audio',
    year: '2025',
    image: '/media/shadow-frames.jpg',
    alt: 'Abandoned pub environment in Shadow Frames',
    role: 'Sole audio designer',
    contribution: 'Built the Wwise and Unreal systems for ten audio-led anomalies, edited the assets and mixed the final game.',
    evidence: 'Players locate every anomaly by listening; there are no HUD markers or minimap cues.',
    tools: 'Wwise · Unreal Engine 5 · C++ · Reaper',
    href: 'https://igorszuniewicz.com/shadowframes.html',
  },
  {
    title: 'XR Labs',
    category: 'VR',
    year: 'Current',
    image: '/media/xr-labs.png',
    alt: 'XR Labs VR training simulation',
    role: 'Technical sound designer',
    contribution: 'Design and implementation for Unity VR and AR training, including direction, obstruction, distance and weapon audio.',
    evidence: 'The public case study uses recreated diagrams and public footage; client assets and internal settings are not shown.',
    tools: 'Unity · Steam Audio · Perforce',
    href: 'https://igorszuniewicz.com/xrlabs.html',
  },
  {
    title: 'Transientica',
    category: 'Game audio',
    year: 'In development',
    image: '/media/transientica.png',
    alt: 'Transientica beatbox rhythm game interface',
    role: 'Solo developer',
    contribution: 'Rebuilt beatbox classification inside Unity: onset detection, a 512-sample FFT, seven features and KNN in C#.',
    evidence: 'The current build trains on the player’s own kick, snare and hi-hat and uses Unity’s audio clock for timing judgements.',
    tools: 'Unity 6 · C# · DSP · KNN',
    href: 'https://igorszuniewicz.com/transientica.html',
  },
  {
    title: 'Not Today, Darling!',
    category: 'Game audio',
    year: '2025',
    image: '/media/not-today.png',
    alt: 'Four-player racing in Not Today, Darling!',
    role: 'Sole audio designer',
    contribution: 'Edited roughly 450 source files, built procedural MetaSounds engines and handled implementation, VO and the final mix.',
    evidence: 'A priority hierarchy keeps the local kart audible while four players share a 32-source limit.',
    tools: 'Unreal Engine 5 · MetaSounds · Blueprints · Reaper',
    href: 'https://igorszuniewicz.com/nottoday.html',
  },
  {
    title: 'AI Audio Research',
    category: 'Research',
    year: 'Published 2026',
    image: '/media/ai-audio-research.png',
    alt: 'AI audio latency research thesis cover',
    role: 'Solo research and prototype',
    contribution: 'Measured event-to-first-sample latency across 600 generations in a UE5 and Python prototype.',
    evidence: 'The fastest tested generator reached 1.9 seconds at p95 against the prototype’s 150 ms interaction target.',
    tools: 'Unreal Engine 5 · C++ · Python · Generative audio',
    href: 'https://igorszuniewicz.com/ai-audio-research.html',
  },
  {
    title: 'AudioQ',
    category: 'Tools',
    year: '2024–2025',
    image: '/media/audioq.png',
    alt: 'AudioQ sampler plugin interface',
    role: 'Solo developer',
    contribution: 'Built a VST3 and standalone sampler with granular playback, filters, dynamics and glitch processing.',
    evidence: 'Sixteen APVTS parameters provide host automation and saved plugin state.',
    tools: 'C++17 · JUCE 8 · VST3',
    href: 'https://igorszuniewicz.com/audioq.html',
  },
  {
    title: 'SIDAR:NULL — Prototyping week 1',
    category: 'In development',
    year: 'Current',
    image: '/media/sidar.jpg',
    alt: 'SIDAR NULL signal emerging from darkness',
    role: 'Concept, direction and prototype development',
    contribution: 'First prototype recording for an original psychological horror project.',
    evidence: 'Week-one footage is available as a full video on the project page.',
    tools: 'Unreal Engine · Game audio · Prototyping',
    href: 'https://igorszuniewicz.com/sidar.html',
  },
];

const filters = ['All', 'Game audio', 'VR', 'Tools', 'Research', 'In development'];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#top">Igor Szuniewicz</a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav className={open ? 'site-nav site-nav--open' : 'site-nav'} id="site-nav" aria-label="Main navigation" onClick={() => setOpen(false)}>
        <a href="#work">Work</a>
        <a href="#skills">Skills</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="/Igor_Szuniewicz_CV.pdf">CV</a>
      </nav>
    </header>
  );
}

function Project({ project }) {
  return (
    <article className="project-row">
      <a className="project-image" href={project.href} aria-label={`View ${project.title}`}>
        <img src={project.image} alt={project.alt} loading="lazy" />
      </a>
      <div className="project-body">
        <div className="project-title">
          <div>
            <p>{project.category}</p>
            <h3><a href={project.href}>{project.title}</a></h3>
          </div>
          <span>{project.year}</span>
        </div>
        <dl className="project-facts">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Work</dt><dd>{project.contribution}</dd></div>
          <div><dt>Proof</dt><dd>{project.evidence}</dd></div>
        </dl>
        <div className="project-footer">
          <p>{project.tools}</p>
          <a href={project.href}>View project <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [filter, setFilter] = useState('All');
  const visibleProjects = useMemo(
    () => filter === 'All' ? projects : projects.filter((project) => project.category === filter),
    [filter],
  );

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero" id="top">
          <div className="hero-title">
            <p className="eyebrow">Game audio · VR · Audio tools</p>
            <h1>Technical sound design for games and VR.</h1>
          </div>
          <div className="hero-intro">
            <p>I design and implement interactive audio in Wwise, Unreal and Unity. My work covers spatial audio, gameplay-driven mixing, procedural sound and audio tools in C++ and C#.</p>
            <div className="hero-actions">
              <a className="primary-link" href="#work">Selected work</a>
              <a href="/Igor_Szuniewicz_CV.pdf">Download CV</a>
            </div>
          </div>
          <figure className="hero-media">
            <img src="/media/shadow-frames.jpg" alt="Shadow Frames abandoned pub environment" />
            <figcaption><strong>Shadow Frames</strong><span>Sole audio designer · Wwise + UE5</span></figcaption>
          </figure>
          <div className="availability">
            <span>Currently</span><strong>XR Labs Belgium</strong>
            <span>Education</span><strong>Howest DAE, 2026</strong>
            <span>Based in</span><strong>Kortrijk, Belgium</strong>
          </div>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-title">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 id="work-title">Projects</h2>
            </div>
            <p>Each entry states my role, the work I completed and the material that supports it.</p>
          </header>
          <div className="filters" aria-label="Filter projects">
            {filters.map((name) => (
              <button key={name} type="button" className={filter === name ? 'filter filter--active' : 'filter'} aria-pressed={filter === name} onClick={() => setFilter(name)}>
                {name} <span>{name === 'All' ? projects.length : projects.filter((project) => project.category === name).length}</span>
              </button>
            ))}
          </div>
          <div className="project-list" aria-live="polite">
            {visibleProjects.map((project) => <Project key={project.title} project={project} />)}
          </div>
        </section>

        <section className="skills-section" id="skills" aria-labelledby="skills-title">
          <header className="section-heading">
            <div><p className="eyebrow">Working range</p><h2 id="skills-title">Skills and tools</h2></div>
            <p>The technical scope behind the projects above.</p>
          </header>
          <dl className="skills-list">
            <div><dt>Implementation</dt><dd>Wwise, FMOD, Unreal Engine 5, Unity, MetaSounds, Steam Audio</dd></div>
            <div><dt>Programming</dt><dd>C++, C#, Python, JUCE, Unreal Blueprints</dd></div>
            <div><dt>Sound production</dt><dd>Reaper, field recording, editing, foley, mixing, voice recording</dd></div>
            <div><dt>Interactive systems</dt><dd>Spatial audio, obstruction, RTPC-driven mixing, procedural sound, DSP, audio ML</dd></div>
            <div><dt>Team workflow</dt><dd>Perforce, Git, technical documentation, DataAssets, designer-facing controls</dd></div>
          </dl>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="about-title"><p className="eyebrow">Profile</p><h2 id="about-title">About</h2></div>
          <div className="about-copy">
            <p>I’m a technical sound designer and audio programmer finishing Game Sound Integration at Howest DAE. At XR Labs, I implement audio for Unity VR and AR training.</p>
            <p>My portfolio focuses on systems that change with gameplay rather than linear audio alone. I also compose music and have twelve years of classical piano training.</p>
          </div>
          <dl className="about-facts">
            <div><dt>Now</dt><dd>XR Labs Belgium</dd></div>
            <div><dt>Education</dt><dd>Howest DAE<br />Game Sound Integration</dd></div>
            <div><dt>Location</dt><dd>Kortrijk, Belgium</dd></div>
            <div><dt>Status</dt><dd>Open to junior technical sound design roles</dd></div>
          </dl>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">igorszuniewiczwork@gmail.com</h2>
          <p>Available for junior technical sound design and audio programming roles.</p>
          <div className="contact-links">
            <a href="mailto:igorszuniewiczwork@gmail.com">Email</a>
            <a href="https://www.linkedin.com/in/igorszuniewicz">LinkedIn</a>
            <a href="https://github.com/Szunias">GitHub</a>
            <a href="https://igorszuniewicz.itch.io">Itch.io</a>
            <a href="https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6">Spotify</a>
          </div>
        </section>
      </main>
      <footer><span>Igor Szuniewicz © 2026</span><a href="#top">Back to top ↑</a></footer>
    </>
  );
}

export default App;
