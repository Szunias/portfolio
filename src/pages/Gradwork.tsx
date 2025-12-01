import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/layout/SEO';
import { useTranslation } from 'react-i18next';

const Gradwork = () => {
    const { t } = useTranslation('gradwork');

    return (
        <div className="min-h-screen bg-primary text-slate-300">
            <SEO
                title="AI Audio Research | Igor Szuniewicz"
                description="Graduate Research: Real-time AI Audio in Games"
            />

            {/* Hero */}
            <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 border-b border-white/5">
                <div className="max-w-4xl text-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-accent mb-6 block">
                        {t('hero.badge')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </section>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-20 space-y-24">

                <Section num="1" title={t('section1.title')}>
                    <p className="mb-6">{t('section1.intro')}</p>
                    <p className="mb-6">{t('section1.testing')}</p>
                    <blockquote className="border-l-2 border-accent pl-6 py-2 my-8 text-white text-xl italic">
                        "{t('section1.question')}"
                    </blockquote>
                    <p className="text-accent font-medium mb-2">{t('section1.current_findings')}</p>
                    <p>{t('section1.findings')}</p>
                </Section>

                <Section num="2" title={t('section2.title')}>
                    <p className="mb-6">{t('section2.intro')}</p>
                    <div className="bg-black/30 border border-white/10 rounded-lg p-6 font-mono text-sm mb-6">
                        {t('section2.architecture_flow')}
                    </div>
                    <p className="mb-4">{t('section2.results_intro')}</p>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10">
                                <tr>
                                    <th className="py-2 pr-4">{t('section2.table_sound')}</th>
                                    <th className="py-2 pr-4">{t('section2.table_latency')}</th>
                                    <th className="py-2">{t('section2.table_verdict')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-400">
                                <tr className="border-b border-white/5">
                                    <td className="py-2 pr-4">{t('section2.footstep')}</td>
                                    <td className="py-2 pr-4 font-mono">45ms</td>
                                    <td className="py-2 text-emerald-400">{t('section2.excellent')}</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-2 pr-4">{t('section2.gunshot')}</td>
                                    <td className="py-2 pr-4 font-mono">52ms</td>
                                    <td className="py-2 text-emerald-400">{t('section2.excellent')}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">{t('section2.impact')}</td>
                                    <td className="py-2 pr-4 font-mono">38ms</td>
                                    <td className="py-2 text-emerald-400">{t('section2.excellent')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-slate-500 text-sm">{t('section2.results_note')}</p>
                </Section>

                <Section num="3" title={t('section3.title')}>
                    <p className="mb-8" dangerouslySetInnerHTML={{ __html: t('section3.intro') }} />
                    <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-8 text-center mb-8">
                        <div className="text-6xl md:text-7xl font-bold text-red-500 font-mono mb-2">
                            {t('section3.failure_stat')}
                        </div>
                        <div className="text-red-400/70 text-sm">{t('section3.failure_context')}</div>
                    </div>
                    <p>{t('section3.narrative')}</p>
                </Section>

                <Section num="4" title={t('section4.title')}>
                    <p className="mb-6">{t('section4.intro')}</p>
                    <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm mb-6 space-y-1">
                        <div className="text-slate-500">[LOG] Gen_Request_01: 4102ms</div>
                        <div className="text-slate-500">[LOG] Gen_Request_02: 4098ms</div>
                        <div className="text-emerald-400">[LOG] Gen_Request_01: 0.03ms  &lt;-- ???</div>
                    </div>
                    <p className="mb-6">{t('section4.epiphany')}</p>
                    <blockquote className="border-l-2 border-accent pl-6 py-2 text-white text-xl font-medium">
                        "{t('section4.question')}"
                    </blockquote>
                </Section>

                <Section num="5" title={t('section5.title')}>
                    <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('section5.intro') }} />
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-8 text-center mb-8">
                        <div className="text-4xl font-bold text-emerald-400 mb-2">{t('section5.solution_stat')}</div>
                        <div className="text-emerald-400/70 text-sm uppercase tracking-wider">{t('section5.solution_label')}</div>
                    </div>
                    <p>{t('section5.explanation')}</p>
                </Section>

                <Section num="6" title={t('section6.title')}>
                    <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('section6.intro') }} />
                    <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('section6.problem') }} />
                    <p dangerouslySetInnerHTML={{ __html: t('section6.current_work') }} />
                </Section>

                <Section num="7" title={t('section7.title')}>
                    <p className="mb-8">{t('section7.intro')}</p>
                    <div className="space-y-4 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-1">{t('section7.exp1_title')}</h4>
                            <p className="text-sm text-slate-400">{t('section7.exp1_desc')}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-1">{t('section7.exp2_title')}</h4>
                            <p className="text-sm text-slate-400">{t('section7.exp2_desc')}</p>
                        </div>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
                                {t('section7.status_title')}
                            </span>
                        </div>
                        <p className="text-slate-300">{t('section7.status_desc')}</p>
                    </div>
                </Section>

            </main>

            {/* Footer */}
            <footer className="py-16 text-center border-t border-white/5">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('back')}
                </Link>
                <p className="mt-6 text-slate-600 text-sm">{t('footer.status')}</p>
            </footer>
        </div>
    );
};

interface SectionProps {
    num: string;
    title: string;
    children: React.ReactNode;
}

const Section = ({ num, title, children }: SectionProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-baseline gap-4 mb-6">
                <span className="text-accent font-mono text-sm">{num}.</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
            </div>
            <div className="text-slate-300 leading-relaxed">
                {children}
            </div>
        </motion.section>
    );
};

export default Gradwork;
