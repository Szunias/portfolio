import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ExternalLink, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import CodeViewer from '../components/features/CodeViewer';
import { fadeUpVariants, viewportOnce, noMotion } from '../constants/motion';
import type { CodeSnippet } from '../types';

const CODE_SNIPPETS: readonly CodeSnippet[] = [
    {
        title: 'FootstepComponent.cpp',
        language: 'cpp',
        description: 'Physics-based surface detection with smart timer management for footstep audio.',
        code: `void UFootstepComponent::TickComponent(float DeltaTime, ...)
{
    const float Speed = Owner->GetVelocity().Size();
    const bool bIsMoving = Speed >= m_MinSpeedThreshold;

    if (bIsMoving && !m_bIsTimerActive)
    {
        GetWorld()->GetTimerManager().SetTimer(
            m_FootstepTimerHandle, this,
            &UFootstepComponent::PlayFootstep,
            m_FootstepInterval, true);
        m_bIsTimerActive = true;
    }
    else if (!bIsMoving && m_bIsTimerActive)
    {
        GetWorld()->GetTimerManager().ClearTimer(m_FootstepTimerHandle);
        m_bIsTimerActive = false;
    }
}

FName UFootstepComponent::DetectSurface() const
{
    FHitResult Hit;
    FCollisionQueryParams Params;
    Params.bReturnPhysicalMaterial = true;

    const FVector Start = Owner->GetActorLocation();
    const FVector End = Start - FVector(0, 0, m_TraceDistance);

    if (GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params))
    {
        if (auto* PhysMat = Hit.PhysMaterial.Get())
            return GetSurfaceName(PhysMat->SurfaceType);
    }
    return NAME_None;
}`,
        annotations: [
            { line: 6, label: 'Smart Timer Management', explanation: 'Timer starts only when player begins moving, preventing redundant footstep scheduling while stationary.' },
            { line: 14, label: 'Cleanup on Stop', explanation: 'Timer is cleared immediately when player stops, avoiding ghost footstep sounds after movement ends.' },
            { line: 25, label: 'Physical Material Query', explanation: 'bReturnPhysicalMaterial tells Unreal to include surface data in the hit result, needed for Wwise Switch selection.' },
            { line: 29, label: 'Line Trace Downward', explanation: 'Casts a ray straight down to detect the floor material. Maps the physics surface type to a Wwise Switch name (Tiles, Wood, Concrete).' },
        ],
    },
    {
        title: 'EnemyPresenceAudioManager.cpp',
        language: 'cpp',
        description: 'State machine with hysteresis thresholds preventing audio flickering near boundaries.',
        code: `void UEnemyPresenceAudioManager::OnProximityChanged(float ProximityValue)
{
    const float StartThreshold = m_Config->m_StartThreshold;
    const float StopThreshold = m_Config->m_StopThreshold;

    // Hysteresis: different thresholds for start/stop
    if (ProximityValue >= StartThreshold)
    {
        if (!m_bDreadPlaying)
        {
            UAkGameplayStatics::PostEvent(m_Config->m_DreadStartEvent, Owner);
            m_bDreadPlaying = true;
        }
        if (!m_bBreathingPlaying)
            StartStressBreathing();
    }
    else if (ProximityValue <= StopThreshold)
    {
        if (m_bDreadPlaying)
        {
            UAkGameplayStatics::PostEvent(m_Config->m_DreadStopEvent, Owner);
            m_bDreadPlaying = false;
        }
        if (m_bBreathingPlaying)
            StopStressBreathing();
    }

    // Continuous RTPC update for smooth audio modulation
    if (m_bDreadPlaying)
    {
        UAkGameplayStatics::SetRTPCValue(
            m_Config->m_ProximityRTPC, ProximityValue, 0, Owner);
    }
}`,
        annotations: [
            { line: 7, label: 'Hysteresis Gap', explanation: 'Start threshold is higher than stop threshold (e.g. 70% vs 60%). This gap prevents rapid on/off switching when the enemy hovers near the boundary.' },
            { line: 11, label: 'Wwise PostEvent', explanation: 'Fires a Wwise event to start the dread ambient layer. The event name comes from a DataAsset, so designers can change it without touching code.' },
            { line: 17, label: 'Lower Stop Threshold', explanation: 'Audio only stops when proximity drops well below the start point. Without this gap, audio would flicker on/off at the boundary.' },
            { line: 31, label: 'Continuous RTPC', explanation: 'Smoothly modulates the dread intensity in real-time. Wwise handles the crossfade curves between calm and stressed ambient layers.' },
        ],
    },
    {
        title: 'EnemyPresenceComponent.cpp',
        language: 'cpp',
        description: 'Smart enemy caching with threshold-based event broadcasting to prevent audio spam.',
        code: `void UEnemyPresenceComponent::TickComponent(float DeltaTime, ...)
{
    // Refresh enemy cache periodically, not every frame
    m_CacheTimer += DeltaTime;
    if (m_CacheTimer >= m_CacheInterval)
    {
        RefreshEnemyCache();
        m_CacheTimer = 0.f;
    }

    UpdateClosestEnemy();
    BroadcastIfChanged(CalculateProximity());
}

float UEnemyPresenceComponent::CalculateProximity() const
{
    if (!m_ClosestEnemy) return 0.f;

    const float Distance = FVector::Dist(
        Owner->GetActorLocation(),
        m_ClosestEnemy->GetActorLocation());

    // Normalize to 0-100 range, invert (closer = higher)
    const float Normalized = (Distance - m_MinDist) / (m_MaxDist - m_MinDist);
    return FMath::Clamp((1.f - Normalized) * 100.f, 0.f, 100.f);
}

void UEnemyPresenceComponent::BroadcastIfChanged(float NewValue)
{
    if (FMath::Abs(NewValue - m_CurrentProximity) >= m_ChangeThreshold)
    {
        m_CurrentProximity = NewValue;
        OnProximityChanged.Broadcast(NewValue);
    }
}`,
        annotations: [
            { line: 5, label: 'Cache Interval', explanation: 'Enemy references are refreshed on a timer (e.g. every 0.5s) instead of every frame. Saves CPU by avoiding per-frame actor lookups.' },
            { line: 24, label: 'Distance Normalization', explanation: 'Converts raw distance into a 0-100 percentage. Closer enemy = higher value. Min/max distances are configurable via DataAsset.' },
            { line: 30, label: 'Change Threshold', explanation: 'Only broadcasts when the value changes by more than the threshold. Prevents audio spam from tiny floating-point fluctuations.' },
            { line: 33, label: 'Delegate Broadcast', explanation: 'Fires a multicast delegate that the Audio Manager listens to. Gameplay code and audio code stay completely decoupled.' },
        ],
    },
] as const;

const GALLERY_IMAGES = [
    { src: '/assets/images/projects-shadowframes/MasterMixerHierarchy.png', captionKey: 'gallery.caption_mixer' },
    { src: '/assets/images/projects-shadowframes/DataAssetConfigsList.png', captionKey: 'gallery.caption_data' },
    { src: '/assets/images/projects-shadowframes/rtpcandstates.png', captionKey: 'gallery.caption_rtpc' },
    { src: '/assets/images/projects-shadowframes/Eventlist2.png', captionKey: 'gallery.caption_events' },
] as const;

const TECH_PILLS = ['Wwise', 'Unreal Engine 5', 'C++', 'Reaper'] as const;

/** Shadow Frames custom project page: audio-driven psychological horror game. */
const ShadowFrames = () => {
    const { t } = useTranslation('shadowFrames');
    const [codeOpen, setCodeOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const prefersReducedMotion = useReducedMotion();

    const mv = prefersReducedMotion
        ? { initial: noMotion.initial, whileInView: noMotion.animate, transition: noMotion.transition }
        : { initial: fadeUpVariants.hidden, whileInView: fadeUpVariants.visible, viewport: viewportOnce };

    return (
        <div className="min-h-screen bg-surface text-text-primary font-sans selection:bg-accent/30">
            <SEO title={t('seo_title')} description={t('seo_description')} />

            {/* ── 1. HERO ── */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
                {/* Video background */}
                <div className="absolute inset-0 z-0">
                    <video
                        src="/assets/images/projects-shadowframes/Menugif.mp4"
                        className="w-full h-full object-cover"
                        autoPlay loop muted playsInline
                        onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-3xl">
                    <div className="inline-block px-4 py-1.5 rounded-md bg-surface-raised/80 border border-border text-accent text-sm font-mono uppercase tracking-widest mb-6">
                        {t('hero.badge', 'Audio-Driven Horror')}
                    </div>

                    <h1 className="text-h1 md:text-hero font-display font-bold text-text-primary mb-4 leading-tight">
                        {t('hero.title', 'Shadow Frames')}
                    </h1>

                    <p className="text-lg md:text-h3 text-accent font-display mb-6">
                        {t('hero.subtitle', 'Audio-Driven Horror')}
                    </p>

                    <p className="text-text-secondary text-lg md:text-xl mb-10 leading-relaxed">
                        {t('hero.hook', 'A horror game where sound is the only weapon.')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {TECH_PILLS.map((pill) => (
                            <span key={pill} className="px-4 py-2 bg-surface-raised/80 border border-border rounded-md text-sm text-text-primary font-mono">
                                {pill}
                            </span>
                        ))}
                    </div>

                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                    >
                        <ArrowLeft size={14} />
                        {t('nav.back', 'Back to Projects')}
                    </Link>
                </div>
            </section>

            <main className="relative z-10 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pb-32">

                {/* ── 2. CONCEPT ── */}
                <motion.section {...mv} className="py-20 md:py-28">
                    <h2 className="text-h2 font-display text-text-primary mb-12 border-l-4 border-accent pl-6">
                        {t('concept.title', 'The Concept')}
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <p className="text-text-secondary leading-relaxed">
                                {t('concept.p1', 'Shadow Frames is a psychological horror game set in a 1960s Irish pub rendered entirely in black and white. Anomalies appear every 30 to 50 seconds. Glasses levitate, shadows move on their own, chairs spin. Audio is how you find them.')}
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                {t('concept.p2', 'Sound is not atmosphere, it is the gameplay mechanic. Mute the game and you are blind. Every creak, whisper, and rattle is directional information that guides you to the next anomaly. Photograph it, pin it to the board, piece together the story.')}
                            </p>
                        </div>

                        <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                            <iframe
                                src="https://www.youtube.com/embed/878QcFfuhZY"
                                title={t('concept.video_label', 'Shadow Frames Trailer')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Info bar */}
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: t('info.role', 'Role'), value: 'Audio Designer' },
                            { label: t('info.team', 'Team'), value: 'DAE + RITCS + KASK' },
                            { label: t('info.engine', 'Engine'), value: 'UE5 + Wwise' },
                            { label: t('info.status', 'Status'), value: 'Released' },
                            { label: t('info.year_label', 'Year'), value: t('info.year', '2025') },
                        ].map((item) => (
                            <div key={item.label} className="p-4 bg-surface-raised border border-border rounded-lg text-center">
                                <p className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">{item.label}</p>
                                <p className="text-text-primary font-display font-bold text-sm">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 3. AUDIO SYSTEMS ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary text-center mb-16">
                        {t('systems.title', 'Audio Systems')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <SystemCard
                            title={t('systems.footstep.title', 'Footstep Detection')}
                            desc={t('systems.footstep.desc', 'Physics line-trace fires downward from the player\'s feet each step. The hit result\'s Physical Material maps to a Wwise Switch: wood, tiles, concrete, creaky wood. New surfaces are added in the editor without touching code.')}
                        />
                        <SystemCard
                            title={t('systems.proximity.title', 'Enemy Proximity')}
                            desc={t('systems.proximity.desc', 'A hysteresis state machine with dual thresholds (start at 70%, stop at 60%) prevents audio flickering when the enemy hovers near a boundary. RTPC smoothly scales dread ambience and stress breathing with distance.')}
                        />
                        <SystemCard
                            title={t('systems.anomaly.title', 'Anomaly System')}
                            desc={t('systems.anomaly.desc', 'Three-stage detection: alert burst on spawn, directional hint for location, sustained presence loop until captured. RTPC tension scaling drives intensity. Spatial audio cues are the only way to find anomalies. No UI markers.')}
                        />
                    </div>
                </motion.section>

                {/* ── 4. WWISE GALLERY ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-4">
                        {t('gallery.title', 'Wwise Architecture')}
                    </h2>
                    <p className="text-text-secondary mb-8 max-w-2xl">
                        {t('gallery.desc', 'Screenshots from the Wwise project showing the mixer hierarchy, DataAsset configurations, RTPC curves, and event structure.')}
                    </p>

                    {/* Sound Design Showcase Video */}
                    <div className="mb-8">
                        <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                            <iframe
                                src="https://www.youtube.com/embed/zTvxEx0Aoxc"
                                title={t('gallery.video_label', 'Sound Design Showcase')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                        <p className="text-text-secondary text-sm mt-3 text-center">
                            {t('gallery.video_label', 'Sound Design Showcase')}
                        </p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {GALLERY_IMAGES.map((img) => (
                            <button
                                key={img.captionKey}
                                onClick={() => setLightboxSrc(img.src)}
                                className="flex-shrink-0 w-72 md:w-80 snap-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
                            >
                                <div className="rounded-xl overflow-hidden border border-border bg-surface-raised hover:border-accent/40 transition-colors">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={img.src}
                                            alt={t(img.captionKey)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <p className="px-4 py-3 text-text-secondary text-sm">
                                        {t(img.captionKey)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* ── 5. CODE DEEP DIVE ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <button
                        onClick={() => setCodeOpen(!codeOpen)}
                        className="w-full flex items-center justify-between p-6 bg-surface-raised border border-border rounded-xl hover:border-accent/40 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                        <div className="text-left">
                            <h2 className="text-h3 font-display text-text-primary group-hover:text-accent transition-colors">
                                {t('code.title', 'Technical Deep Dive')}
                            </h2>
                            <p className="text-text-secondary text-sm mt-1">
                                {t('code.hint', '3 annotated C++ snippets. Click lines with dots for explanations')}
                            </p>
                        </div>
                        <ChevronDown
                            size={24}
                            className={`text-text-secondary transition-transform duration-300 ${codeOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <AnimatePresence>
                        {codeOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6">
                                    <CodeViewer snippets={CODE_SNIPPETS} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* ── 6. FOOTER ── */}
                <motion.section {...mv} className="border-t border-border pt-16">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-h3 font-display text-text-primary mb-4">
                                {t('credits.title', 'Collaboration')}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                {t('credits.collab', 'Cross-institutional project between Howest DAE (game development & audio implementation), RITCS (narrative design & story), and KASK Conservatory (music composition).')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <a
                                href="https://www.youtube.com/watch?v=878QcFfuhZY"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-surface-raised border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <ExternalLink size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors">
                                    {t('links.trailer', 'Watch Trailer on YouTube')}
                                </span>
                            </a>

                            <a
                                href="/assets/docs/Sound_Grp22_ShadowFrames.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-surface-raised border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <FileText size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors">
                                    {t('links.docs', 'Sound Documentation PDF')}
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Next Project CTA */}
                    <div className="mt-16 text-center">
                        <Link
                            to="/projects/not_today_darling"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-surface-raised border border-border rounded-xl hover:border-accent/40 hover:bg-surface-overlay transition-colors group"
                        >
                            <span className="text-text-secondary text-sm">{t('nav.next_project', 'Next Project')}</span>
                            <span className="text-text-primary font-display font-bold group-hover:text-accent transition-colors">Not Today, Darling!</span>
                            <ArrowRight size={18} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </motion.section>
            </main>

            {/* Lightbox overlay */}
            <AnimatePresence>
                {lightboxSrc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-pointer"
                        onClick={() => setLightboxSrc(null)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setLightboxSrc(null); }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image preview"
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={lightboxSrc}
                            alt=""
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SystemCard = ({ title, desc }: { title: string; desc: string }) => (
    <div className="p-8 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors duration-300">
        <h3 className="text-h4 font-display text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed text-sm">{desc}</p>
    </div>
);

export default ShadowFrames;
