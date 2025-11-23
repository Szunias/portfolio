import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useInView } from 'framer-motion';
import { ArrowLeft, Database, Server, Cpu, Zap, Clock, Brain, Layers } from 'lucide-react';
import SEO from '../components/layout/SEO';

const Gradwork = () => {
    const containerRef = useRef(null);
    useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-emerald-500/30">
            <SEO title="AI Audio Research | Igor Szuniewicz" description="Graduate Research: Real-time AI Audio in Games" />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0a0a0a] to-[#0a0a0a] z-0"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-5xl w-full text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold uppercase tracking-wider mb-8 border border-emerald-500/20">
                        <Brain size={16} />
                        Graduate Research
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-8 leading-tight">
                        Is AI Audio in <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Real-Time</span> Possible?
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
                        A deep dive into the latency, architecture, and "cheats" required to bring Generative AI audio into game engines.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce"
                >
                    <ArrowLeft className="-rotate-90" size={24} />
                </motion.div>
            </section>

            {/* Main Content */}
            <main className="relative z-20 max-w-4xl mx-auto px-6 pb-32 space-y-32">
                
                {/* Section 1: The Question */}
                <Section number="01" title="The Premise">
                    <p className="text-lg leading-relaxed text-slate-300 mb-6">
                        You might be wondering why anyone would even try to generate sounds with AI in games. 
                        Imagine a world where instead of storing thousands of pre-recorded WAV files, the game creates them on the fly. 
                        Infinite variations. Zero storage cost.
                    </p>
                    <div className="bg-white/5 border-l-4 border-emerald-500 p-6 rounded-r-lg my-8">
                        <p className="text-xl font-semibold text-white italic">
                            "Is AI fast enough that players wouldn't even notice the delay between an action and its sound?"
                        </p>
                    </div>
                    <p className="text-lg leading-relaxed text-slate-300">
                        <strong className="text-emerald-400">Spoiler Alert:</strong> No. It's too slow. But I found a way to make it work anyway.
                    </p>
                </Section>

                {/* Section 2: Architecture */}
                <Section number="02" title="The Architecture">
                    <p className="text-lg leading-relaxed text-slate-300 mb-12">
                        Connecting a game engine to a generative AI model requires a bridge. 
                        I built a WebSocket communication layer between Unity (C#) and a Python server running the inference.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <ArchitectureCard icon={<Cpu />} title="Unity (C#)" subtitle="Game Client" />
                        <div className="hidden md:flex items-center justify-center text-slate-600">
                            <ArrowLeft className="rotate-180" size={32} />
                        </div>
                        <ArchitectureCard icon={<Server />} title="Python" subtitle="WebSocket Server" />
                        <div className="hidden md:flex items-center justify-center text-slate-600">
                            <ArrowLeft className="rotate-180" size={32} />
                        </div>
                        <ArchitectureCard icon={<Database />} title="ElevenLabs" subtitle="Inference API" />
                    </div>
                </Section>

                {/* Section 3: The Nightmare */}
                <Section number="03" title="The 12-Second Nightmare">
                    <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-8 md:p-12 text-center mb-12">
                        <Clock className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h3 className="text-6xl md:text-8xl font-black text-red-500 mb-4 tabular-nums tracking-tighter">
                            12,000<span className="text-4xl">ms</span>
                        </h3>
                        <p className="text-red-400 text-lg font-mono">Latency for one footstep</p>
                    </div>
                    <p className="text-lg leading-relaxed text-slate-300">
                        In a 60 FPS game, a sound needs to play within <strong>16ms</strong>. 
                        My first attempt with AudioLDM took 12 seconds. That's <strong>750x too slow</strong>. 
                        Even faster models like MusicGen took 4 seconds. In game dev terms, that's an eternity.
                    </p>
                </Section>

                {/* Section 4: The Anomaly */}
                <Section number="04" title="The 0.03ms Anomaly">
                    <p className="text-lg leading-relaxed text-slate-300 mb-8">
                        I was ready to quit. Then I saw something in the logs during a debug session.
                    </p>
                    <div className="bg-black rounded-lg p-6 font-mono text-sm md:text-base border border-white/10 shadow-2xl mb-8">
                        <div className="text-slate-500">[LOG] Gen_Request_01: 4102ms</div>
                        <div className="text-slate-500">[LOG] Gen_Request_02: 4098ms</div>
                        <div className="text-emerald-400 font-bold">[LOG] Gen_Request_01: 0.03ms  &lt;-- ???</div>
                    </div>
                    <p className="text-lg leading-relaxed text-slate-300">
                        The second time I requested the same sound, it was instant. It pulled from memory. 
                        This led to the realization: <strong className="text-white">We don't need to be fast. We just need to be early.</strong>
                    </p>
                </Section>

                {/* Section 5: The Solution */}
                <Section number="05" title="Cheating Time">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="text-yellow-400" />
                                Prediction
                            </h3>
                            <p className="text-slate-400">
                                Instead of reacting to player actions, we predict them. 
                                Use loading screens and quiet moments to "hallucinate" the audio for the next level.
                            </p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Layers className="text-blue-400" />
                                Buffering
                            </h3>
                            <p className="text-slate-400">
                                Pre-generate assets into a RAM buffer. 
                                When the player pulls the trigger, the sound is already there, waiting.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Section 6: Current Status */}
                <Section number="06" title="Research Status">
                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-wider">Active Research</h3>
                        </div>
                        <p className="text-slate-300 mb-6">
                            The "0.03ms Cache" works, but scaling it is the challenge. 
                            I am currently developing a <strong>Predictive Buffering</strong> algorithm in Python 
                            that manages a 10-second "sliding window" of future audio events to balance RAM usage.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black/20 p-4 rounded border border-emerald-500/10">
                                <div className="text-2xl font-bold text-white mb-1">Smart Cleanup</div>
                                <div className="text-xs text-emerald-500/60 uppercase">Memory Management</div>
                            </div>
                            <div className="bg-black/20 p-4 rounded border border-emerald-500/10">
                                <div className="text-2xl font-bold text-white mb-1">10s Window</div>
                                <div className="text-xs text-emerald-500/60 uppercase">Prediction Horizon</div>
                            </div>
                        </div>
                    </div>
                </Section>

            </main>

            {/* Footer */}
            <footer className="py-20 text-center border-t border-white/5 bg-[#050505]">
                <Link 
                    to="/projects" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                </Link>
                <p className="mt-8 text-slate-500 text-sm">
                    Graduate Research Project • Ongoing • 2025 • Igor Szuniewicz
                </p>
            </footer>
        </div>
    );
};

const Section = ({ number, title, children }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section 
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="relative"
        >
            <div className="absolute -left-12 top-0 text-8xl font-black text-white/5 select-none hidden lg:block">
                {number}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-4">
                <span className="text-emerald-500 text-lg font-mono lg:hidden">{number}.</span>
                {title}
            </h2>
            {children}
        </motion.section>
    );
};

const ArchitectureCard = ({ icon, title, subtitle }: any) => (
    <div className="bg-[#111] p-6 rounded-xl border border-white/10 flex flex-col items-center text-center hover:border-emerald-500/30 transition-colors group">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-300 mb-4 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
            {icon}
        </div>
        <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{subtitle}</p>
    </div>
);

export default Gradwork;
