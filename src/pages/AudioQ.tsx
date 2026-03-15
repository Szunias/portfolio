import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, Github, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import SEO from '../components/layout/SEO';
import CodeViewer from '../components/features/CodeViewer';
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

/** AudioQ project page: VST sampler plugin built in C++/JUCE. */
const AudioQ = () => {
    const { t } = useTranslation('audioq');
    const [codeOpen, setCodeOpen] = useState(false);
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
                    {/* Header */}
                    <motion.section className="pb-2 md:col-span-3" variants={itemVars}>
                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-sm mb-6"
                        >
                            <ArrowLeft size={14} />
                            {t('nav.back')}
                        </Link>
                        <h1 className="font-display text-h2 sm:text-h1 leading-tight text-text-primary md:text-hero">
                            {t('hero.title')}<span className="text-accent">{t('hero.subtitle')}</span>
                        </h1>
                        <p className="mt-3 font-mono text-body-sm tracking-wide text-text-tertiary">
                            {t('hero.tagline')}
                        </p>
                    </motion.section>

                    {/* Plugin logo + video */}
                    <motion.div
                        className="group overflow-hidden rounded-xl border border-border bg-black md:col-span-1"
                        variants={itemVars}
                    >
                        <div className="relative h-full min-h-[280px] sm:min-h-[320px] w-full">
                            <video
                                autoPlay loop muted playsInline
                                poster="/assets/images/projects-audioq/AudioQPicture.png"
                                className="h-full w-full object-cover"
                            >
                                <source src="/assets/images/projects-audioq/AudioQ-Showcase.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </motion.div>

                    {/* About the project */}
                    <motion.section
                        className="rounded-xl border border-border bg-surface-raised p-6 md:col-span-2 md:p-8"
                        variants={itemVars}
                    >
                        <SectionLabel>{t('section.about')}</SectionLabel>
                        <p className="text-body leading-7 sm:leading-8 text-[#d1cbc3] max-w-[72ch]">
                            {t('about.text')}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {TECH_PILLS.map((pill) => (
                                <span key={pill} className="px-3 py-1.5 border border-border rounded-md text-xs text-text-secondary font-mono">
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </motion.section>

                    {/* Code deep dive */}
                    <motion.section className="md:col-span-3" variants={itemVars}>
                        <button
                            onClick={() => setCodeOpen((o) => !o)}
                            className="w-full flex items-center justify-between p-6 rounded-xl border border-border bg-surface-raised hover:bg-surface-overlay transition-colors"
                        >
                            <SectionLabel>{t('section.code')}</SectionLabel>
                            <ChevronDown
                                size={18}
                                className={`text-text-tertiary transition-transform duration-300 ${codeOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {codeOpen && (
                            <div className="mt-4">
                                <CodeViewer snippets={CODE_SNIPPETS} />
                            </div>
                        )}
                    </motion.section>

                    {/* Footer */}
                    <motion.section
                        className="rounded-xl border border-accent/20 bg-surface-raised p-6 md:col-span-3 md:p-8"
                        variants={itemVars}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="https://github.com/Szunias/AudioQ/releases"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-surface transition-all hover:bg-accent-hover active:scale-[0.98]"
                                >
                                    <Download size={16} />
                                    {t('download.cta')}
                                </a>
                                <a
                                    href="https://github.com/Szunias/AudioQ"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-semibold text-text-primary transition-all hover:border-accent hover:bg-surface-overlay active:scale-[0.98]"
                                >
                                    <Github size={16} />
                                    {t('download.github')}
                                </a>
                            </div>
                            <Link
                                to="/projects/amorak"
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

export default AudioQ;
