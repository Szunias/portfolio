import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Cpu, Layers, Zap, Shield, Sliders, Music, AlertTriangle, ChevronDown, Github, Download, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import CodeViewer from '../components/features/CodeViewer';
import { fadeUpVariants, viewportOnce, noMotion } from '../constants/motion';
import type { CodeSnippet } from '../types/project';

const TECH_PILLS = ['C++', 'JUCE', 'VST3/AU', 'DSP'] as const;

const CODE_SNIPPETS: readonly CodeSnippet[] = [
    {
        title: 'Tremolo DSP (C++)',
        language: 'cpp',
        description: 'Per-sample amplitude modulation using sine wave LFO with phase wrapping.',
        code: `if (tremoloOn && tremDepth > 0.0f)
{
    float phaseInc = (float)(2.0 * juce::MathConstants<double>::pi * tremRate / currentSR);

    for (int sample = 0; sample < numSamples; ++sample)
    {
        float lfoVal = 0.5f + 0.5f * std::sin(tremoloPhase);
        float amplitude = (1.0f - tremDepth) + (tremDepth * lfoVal);

        for (int ch = 0; ch < numChannels; ++ch)
        {
            float* writePtr = buffer.getWritePointer(ch);
            writePtr[sample] *= amplitude;
        }

        tremoloPhase += phaseInc;
        if (tremoloPhase > juce::MathConstants<float>::twoPi)
            tremoloPhase -= juce::MathConstants<float>::twoPi;
    }
}`,
        annotations: [
            { line: 3, label: 'Phase increment', explanation: 'Converts Hz to radians per sample for sine generation.' },
            { line: 7, label: 'LFO generation', explanation: 'Sine wave in 0-1 range. Formula ensures depth=0 produces no modulation.' },
            { line: 17, label: 'Phase wrapping', explanation: 'Wraps phase to prevent overflow, keeping it in 0-2\u03C0 range.' },
        ],
    },
    {
        title: 'Parameter Layout (JUCE)',
        language: 'cpp',
        description: 'APVTS setup for DAW automation support.',
        code: `juce::AudioProcessorValueTreeState::ParameterLayout createParameters()
{
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "GAIN", "Gain", 0.0f, 3.1623f, 1.0f
    ));

    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "TEMPO", "Tempo (BPM)", 20.0f, 300.0f, 120.0f
    ));

    return { params.begin(), params.end() };
}`,
        annotations: [
            { line: 5, label: 'Gain parameter', explanation: 'Controls output volume. Range 0.0-3.1623 (~+10dB) allows attenuation and boost.' },
            { line: 9, label: 'Tempo parameter', explanation: 'Controls playback speed via resampling. Range 20-300 BPM enables extreme time-stretch effects.' },
        ],
    },
    {
        title: 'Process Block (Real-time)',
        language: 'cpp',
        description: 'Main audio callback handling safe parameter reading and DSP chain.',
        code: `void processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    if (dangerousVolumeDetected) {
        buffer.clear();
        return;
    }

    float gainValue = *apvts.getRawParameterValue("GAIN");
    float tempoValue = *apvts.getRawParameterValue("TEMPO");

    // Resampling based on tempo
    double ratio = (double)tempoValue / 120.0;
    audioFilePlayer.setResamplingRatio(ratio);

    // Fill buffer from file
    juce::AudioSourceChannelInfo info(buffer);
    audioFilePlayer.getNextAudioBlock(info);

    // Apply DSP chain
    juce::dsp::AudioBlock<float> dspBlock(buffer);
    juce::dsp::ProcessContextReplacing<float> ctx(dspBlock);
    compressor.process(ctx);

    buffer.applyGain(gainValue);
}`,
        annotations: [
            { line: 3, label: 'Volume safety', explanation: 'Automatically stops playback when dangerous levels are detected.' },
            { line: 8, label: 'Parameter reading', explanation: 'APVTS provides thread-safe access via atomic pointers. Lock-free for the audio thread.' },
            { line: 12, label: 'Tempo control', explanation: 'Calculates resampling ratio from BPM. AudioFilePlayer uses ResamplingAudioSource for speed changes.' },
            { line: 20, label: 'DSP processing', explanation: 'AudioBlock and ProcessContext enable SIMD optimization. In-place processing maximizes performance.' },
        ],
    },
    {
        title: 'DSP Setup (prepareToPlay)',
        language: 'cpp',
        description: 'Initializes DSP modules with correct sample rate and block size.',
        code: `void prepareToPlay(double sampleRate, int samplesPerBlock)
{
    juce::dsp::ProcessSpec spec;
    spec.sampleRate = sampleRate;
    spec.maximumBlockSize = (juce::uint32)samplesPerBlock;
    spec.numChannels = 2;

    lpf.setType(juce::dsp::StateVariableTPTFilterType::lowpass);
    hpf.setType(juce::dsp::StateVariableTPTFilterType::highpass);
    lpf.prepare(spec);
    hpf.prepare(spec);

    compressor.prepare(spec);
    compressor.reset();
}`,
        annotations: [
            { line: 3, label: 'ProcessSpec config', explanation: 'Defines the audio processing environment. All JUCE DSP modules require this spec.' },
            { line: 8, label: 'Filter initialization', explanation: 'StateVariableTPTFilter provides zero-delay filtering via TPT design.' },
            { line: 13, label: 'Compressor init', explanation: 'JUCE Compressor handles dynamic range control. Prepared with the same spec.' },
        ],
    },
    {
        title: 'Audio Playback System',
        language: 'cpp',
        description: 'Handles file loading and resampling for tempo control.',
        code: `void loadFile(juce::File file)
{
    auto* reader = formatManager.createReaderFor(file);
    if (reader != nullptr) {
        auto* source = new juce::AudioFormatReaderSource(reader, true);
        resamplingSource.setSource(source, 0, nullptr, reader->sampleRate);
        resamplingSource.setResamplingRatio(1.0);
        transportSource.setSource(&resamplingSource, 0, nullptr, reader->sampleRate);
    }
}

void setResamplingRatio(double ratio) {
    resamplingSource.setResamplingRatio(ratio);
}`,
        annotations: [
            { line: 3, label: 'File reading', explanation: 'AudioFormatManager detects format and creates the right reader. Supports WAV, AIFF, MP3.' },
            { line: 6, label: 'Resampling setup', explanation: 'ResamplingAudioSource enables tempo control. Ratio 1.0 = normal speed, 2.0 = double.' },
            { line: 8, label: 'Transport setup', explanation: 'AudioTransportSource provides play/stop/loop controls and manages playback position.' },
        ],
    },
] as const;

/** AudioQ project page: VST sampler plugin built in C++/JUCE. */
const AudioQ = () => {
    const { t } = useTranslation('audioq');
    const [codeOpen, setCodeOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const mv = prefersReducedMotion
        ? { initial: noMotion.initial, whileInView: noMotion.animate, transition: noMotion.transition }
        : { initial: fadeUpVariants.hidden, whileInView: fadeUpVariants.visible, viewport: viewportOnce };

    return (
        <div className="min-h-screen bg-surface text-text-primary font-sans selection:bg-accent/30">
            <SEO title={t('seo_title')} description={t('seo_description')} />

            {/* ── 1. HERO ── */}
            <section className="relative pt-32 pb-20 md:pb-28 text-center px-6 md:px-12 lg:px-16 max-w-content-wide mx-auto">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm mb-16"
                >
                    <ArrowLeft size={14} />
                    {t('nav.back')}
                </Link>

                <div className="inline-block px-4 py-1.5 rounded-md bg-surface-raised border border-border text-accent text-sm font-mono uppercase tracking-widest mb-8">
                    {t('hero.badge')}
                </div>

                <div className="flex justify-center mb-8">
                    <img
                        src="/assets/images/projects-audioq/AudioQLogo.jpeg"
                        alt="AudioQ"
                        className="w-24 h-24 rounded-2xl border border-border shadow-lg"
                    />
                </div>

                <h1 className="text-h1 md:text-hero font-display font-bold text-text-primary mb-6 leading-tight">
                    {t('hero.title')}<span className="text-accent">{t('hero.subtitle')}</span>
                </h1>

                <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-7">
                    {t('hero.desc')}
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {TECH_PILLS.map((pill) => (
                        <span key={pill} className="px-4 py-2 bg-surface-raised border border-border rounded-md text-sm text-text-primary font-mono">
                            {pill}
                        </span>
                    ))}
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="https://github.com/Szunias/AudioQ/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-surface rounded-lg font-mono text-sm hover:bg-accent-hover transition-colors"
                    >
                        <Download size={16} />
                        {t('hero.download')}
                    </a>
                    <a
                        href="https://github.com/Szunias/AudioQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-surface-raised border border-border rounded-lg font-mono text-sm text-text-primary hover:border-accent/40 transition-colors"
                    >
                        <Github size={16} />
                        {t('hero.github')}
                    </a>
                </div>
            </section>

            <main className="relative z-10 max-w-content-wide mx-auto px-6 md:px-12 lg:px-16 pb-32">

                {/* ── 2. VIDEO DEMO ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black">
                        <video
                            autoPlay loop muted playsInline
                            poster="/assets/images/projects-audioq/AudioQPicture.png"
                            className="w-full h-full object-cover"
                        >
                            <source src="/assets/images/projects-audioq/AudioQ-Showcase.mp4" type="video/mp4" />
                        </video>
                    </div>
                </motion.section>

                {/* ── 3. FEATURES ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary text-center mb-4">
                        {t('features.title')}
                    </h2>
                    <p className="text-text-secondary text-center max-w-2xl mx-auto mb-16">
                        {t('features.subtitle')}
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Music size={28} />, title: t('features.granular.title'), desc: t('features.granular.desc') },
                            { icon: <Zap size={28} />, title: t('features.tremolo.title'), desc: t('features.tremolo.desc') },
                            { icon: <Sliders size={28} />, title: t('features.filters.title'), desc: t('features.filters.desc') },
                            { icon: <Play size={28} />, title: t('features.tempo.title'), desc: t('features.tempo.desc') },
                            { icon: <Shield size={28} />, title: t('features.safety.title'), desc: t('features.safety.desc') },
                            { icon: <Cpu size={28} />, title: t('features.automation.title'), desc: t('features.automation.desc') },
                        ].map((f) => (
                            <div key={f.title} className="p-8 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors duration-300 group">
                                <div className="w-12 h-12 bg-surface-overlay rounded-lg flex items-center justify-center text-text-primary mb-6 group-hover:text-accent transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="text-h4 font-display text-text-primary mb-3">{f.title}</h3>
                                <p className="text-text-secondary leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 4. ARCHITECTURE ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary text-center mb-16">
                        {t('architecture.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Layers size={28} />, title: t('architecture.apvts.title'), desc: t('architecture.apvts.desc') },
                            { icon: <Cpu size={28} />, title: t('architecture.process.title'), desc: t('architecture.process.desc') },
                            { icon: <Play size={28} />, title: t('architecture.player.title'), desc: t('architecture.player.desc') },
                        ].map((a) => (
                            <div key={a.title} className="p-8 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors duration-300 group">
                                <div className="w-12 h-12 bg-surface-overlay rounded-lg flex items-center justify-center text-text-primary mb-6 group-hover:text-accent transition-colors">
                                    {a.icon}
                                </div>
                                <h3 className="text-h4 font-display text-text-primary mb-3">{a.title}</h3>
                                <p className="text-text-secondary leading-relaxed text-sm">{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 5. CHALLENGES ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <h2 className="text-h2 font-display text-text-primary mb-8">
                        {t('challenges.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: t('challenges.c1_title'),
                                problem: t('challenges.c1_problem'),
                                solution: t('challenges.c1_solution'),
                            },
                            {
                                title: t('challenges.c2_title'),
                                problem: t('challenges.c2_problem'),
                                solution: t('challenges.c2_solution'),
                            },
                            {
                                title: t('challenges.c3_title'),
                                problem: t('challenges.c3_problem'),
                                solution: t('challenges.c3_solution'),
                            },
                        ].map((c) => (
                            <div key={c.title} className="p-6 bg-surface-raised border border-border rounded-xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle size={16} className="text-accent" />
                                    <h4 className="font-display font-bold text-text-primary text-sm">{c.title}</h4>
                                </div>
                                <p className="text-text-secondary text-sm mb-3">
                                    <span className="text-text-primary font-mono text-xs">PROBLEM </span>
                                    {c.problem}
                                </p>
                                <p className="text-text-secondary text-sm">
                                    <span className="text-accent font-mono text-xs">SOLUTION </span>
                                    {c.solution}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── 6. CODE DEEP DIVE ── */}
                <motion.section {...mv} className="mb-20 md:mb-28">
                    <button
                        onClick={() => setCodeOpen(!codeOpen)}
                        className="w-full flex items-center justify-between p-6 bg-surface-raised border border-border rounded-xl hover:bg-surface-overlay transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Cpu size={20} className="text-accent" />
                            <h2 className="text-h3 font-display text-text-primary">{t('code.title')}</h2>
                        </div>
                        <ChevronDown
                            size={20}
                            className={`text-text-secondary transition-transform duration-300 ${codeOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {codeOpen && (
                        <div className="mt-4">
                            <CodeViewer snippets={CODE_SNIPPETS} />
                        </div>
                    )}
                </motion.section>

                {/* ── 7. FOOTER ── */}
                <motion.section {...mv} className="border-t border-border pt-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                        <div>
                            <h3 className="text-h3 font-display text-text-primary mb-2">{t('cta.title')}</h3>
                            <p className="text-text-secondary text-sm">{t('cta.subtitle')}</p>
                        </div>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/Szunias/AudioQ/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-surface rounded-lg font-mono text-sm hover:bg-accent-hover transition-colors"
                            >
                                <Download size={16} />
                                {t('cta.download')}
                            </a>
                            <a
                                href="https://github.com/Szunias/AudioQ"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-raised border border-border rounded-lg font-mono text-sm text-text-primary hover:border-accent/40 transition-colors"
                            >
                                <Github size={16} />
                                {t('cta.source')}
                            </a>
                        </div>
                    </div>

                    <div className="mt-0 text-center">
                        <Link
                            to="/projects/amorak"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-surface-raised border border-border rounded-xl hover:border-accent/40 hover:bg-surface-overlay transition-colors group"
                        >
                            <span className="text-text-secondary text-sm">{t('nav.next_project')}</span>
                            <span className="text-text-primary font-display font-bold group-hover:text-accent transition-colors">Amorak</span>
                            <ArrowRight size={18} className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </motion.section>
            </main>
        </div>
    );
};

export default AudioQ;
