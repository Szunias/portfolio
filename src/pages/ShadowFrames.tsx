import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import CodeViewer from '../components/features/CodeViewer';
import ImageLightbox from '../components/features/ImageLightbox';
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
    { src: 'assets/images/projects-shadowframes/MasterMixerHierarchy.png', caption: 'gallery.caption_mixer' },
    { src: 'assets/images/projects-shadowframes/DataAssetConfigsList.png', caption: 'gallery.caption_data' },
    { src: 'assets/images/projects-shadowframes/rtpcandstates.png', caption: 'gallery.caption_rtpc' },
    { src: 'assets/images/projects-shadowframes/Eventlist2.png', caption: 'gallery.caption_events' },
] as const;

const TECH_PILLS = ['Wwise', 'Unreal Engine 5', 'C++', 'Reaper'] as const;

const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const gridItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] },
    },
};

const noMotionContainerVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0 } },
};

const noMotionItemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-6 font-pixel text-[10px] uppercase tracking-[0.16em] text-[#8d8882]">
        {children}
    </h2>
);

/** Shadow Frames custom project page: audio-driven psychological horror game. */
const ShadowFrames = () => {
    const { t } = useTranslation('shadowFrames');
    const prefersReducedMotion = useReducedMotion();

    const containerVars = prefersReducedMotion ? noMotionContainerVariants : gridContainerVariants;
    const itemVars = prefersReducedMotion ? noMotionItemVariants : gridItemVariants;

    return (
        <div className="relative min-h-screen bg-surface">
            <SEO title={t('seo_title')} description={t('seo_description')} />

            <div className="relative z-10 mx-auto max-w-content-wide px-6 pb-16 pt-24 sm:pb-24 sm:pt-28 md:px-12 md:pb-32 md:pt-32 lg:px-16">
                <motion.div
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
                    variants={containerVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* ── Row 1: Header ── */}
                    <motion.section className="pb-2 md:col-span-3" variants={itemVars}>
                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-sm mb-6"
                        >
                            <ArrowLeft size={14} />
                            {t('nav.back')}
                        </Link>
                        <h1 className="font-display text-h2 sm:text-h1 leading-tight text-text-primary md:text-hero">
                            {t('hero.title')}
                        </h1>
                        <p className="mt-3 font-mono text-body-sm tracking-wide text-text-tertiary">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {TECH_PILLS.map((pill) => (
                                <span key={pill} className="px-3 py-1.5 border border-border rounded-md text-xs text-text-secondary font-mono">
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Row 2: Trailer + Concept ── */}
                    <motion.div
                        className="overflow-hidden rounded-xl border border-border bg-surface-raised md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/878QcFfuhZY"
                                title={t('concept.video_label')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.concept')}</SectionLabel>
                        <p className="text-accent font-display text-lg mb-4">
                            {t('concept.hook')}
                        </p>
                        <div className="max-w-[72ch] space-y-4">
                            <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3]">
                                {t('concept.p1')}
                            </p>
                            <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3]">
                                {t('concept.p2')}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-6 border-t border-border">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882]">{t('meta.role')}</p>
                                <p className="text-sm text-text-primary font-display font-medium">{t('meta.role_value')}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882]">{t('meta.team')}</p>
                                <p className="text-sm text-text-primary font-display font-medium">{t('meta.team_value')}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882]">{t('meta.year')}</p>
                                <p className="text-sm text-text-primary font-display font-medium">{t('meta.year_value')}</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Row 3: Audio Systems + Wwise Gallery ── */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.systems')}</SectionLabel>
                        <ul className="space-y-5">
                            {(['footstep', 'proximity', 'anomaly'] as const).map((key) => (
                                <li key={key} className="border-l-2 border-accent/40 pl-4">
                                    <p className="font-display text-sm font-medium text-text-primary">
                                        {t(`systems.${key}.title`)}
                                    </p>
                                    <p className="mt-1 text-body-sm leading-relaxed text-text-secondary">
                                        {t(`systems.${key}.desc`)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.section>

                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-1 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.wwise')}</SectionLabel>
                        <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black mb-4">
                            <iframe
                                src="https://www.youtube.com/embed/zTvxEx0Aoxc"
                                title={t('gallery.video_label')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                        <ImageLightbox images={GALLERY_IMAGES} />
                    </motion.section>

                    {/* ── Row 4: Code Viewer ── */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.code')}</SectionLabel>
                        <p className="text-text-secondary text-sm mb-6">
                            {t('code.hint')}
                        </p>
                        <CodeViewer snippets={CODE_SNIPPETS} />
                    </motion.section>

                    {/* ── Row 5: Challenges & Solutions ── */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.challenges')}</SectionLabel>
                        <div className="grid md:grid-cols-2 gap-5">
                            {([1, 2] as const).map((n) => (
                                <div key={n} className="border-l-2 border-accent/40 pl-5 space-y-3">
                                    <p className="font-display text-sm font-medium text-text-primary">
                                        {t(`challenge${n}.title`)}
                                    </p>
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882] mb-1">
                                            {t('challenge_label.hard')}
                                        </p>
                                        <p className="text-body-sm leading-relaxed text-text-secondary">
                                            {t(`challenge${n}.hard`)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8882] mb-1">
                                            {t('challenge_label.did')}
                                        </p>
                                        <p className="text-body-sm leading-relaxed text-text-secondary">
                                            {t(`challenge${n}.did`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Row 6: Collab image + Links & CTA ── */}
                    <motion.div
                        className="group overflow-hidden rounded-xl border border-border bg-surface-raised md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative h-full min-h-[240px] w-full">
                            <img
                                src="/assets/images/projects-shadowframes/nicedae.jpg"
                                alt="DAE + RITCS + KASK collaboration"
                                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                                loading="lazy"
                            />
                        </div>
                    </motion.div>

                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.links')}</SectionLabel>
                        <div className="space-y-3 mb-8">
                            <a
                                href="https://www.youtube.com/watch?v=878QcFfuhZY"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <ExternalLink size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors text-sm">
                                    {t('links.trailer')}
                                </span>
                            </a>
                            <a
                                href="/assets/docs/Sound_Grp22_ShadowFrames.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-accent/40 transition-colors group"
                            >
                                <FileText size={18} className="text-accent" />
                                <span className="text-text-primary group-hover:text-accent transition-colors text-sm">
                                    {t('links.docs')}
                                </span>
                            </a>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                to="/projects/not_today_darling"
                                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-surface transition-all hover:bg-accent-hover active:scale-[0.98]"
                            >
                                {t('nav.next_project')}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};

export default ShadowFrames;
