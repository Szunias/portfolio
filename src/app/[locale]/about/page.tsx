'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { motion } from 'framer-motion';
import { Mail, MapPin, Calendar, GraduationCap, Music, Code, Award, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { personal_info, education, professional_summary, core_skills, statistics, technical_skills_matrix } = usePortfolioData();

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
              {t('about_title')}
            </h1>
            <p className="text-2xl text-slate-300 font-light mb-4">
              {t('about_role')}
            </p>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              {t('about_bio')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">
                {statistics.years_of_music}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">
                {t('about_stat_music')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">
                {statistics.completed_projects}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">
                {t('about_stat_projects')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">
                {statistics.tools_built}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">
                Tools Built
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">
                {personal_info.languages.length}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">
                {t('about_stat_languages')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
              {t('about_journey_title')}
            </h2>
            <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
              <p>{t('about_journey_p1')}</p>
              <p>{t('about_journey_p2')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
              {t('philosophy_title')}
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              {t('philosophy_subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Skills */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {t('about_skills_title')}
            </h2>
            <p className="text-slate-400 text-lg">
              {t('skills_subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.values(core_skills).map((skillGroup, idx) => (
              <motion.div
                key={skillGroup.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Code className="text-accent" size={20} />
                  {skillGroup.title}
                </h3>
                <ul className="space-y-2">
                  {skillGroup.skills.map((skill) => (
                    <li key={skill} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
              {t('about_education_title')}
            </h2>

            <div className="space-y-6">
              {/* Current Education */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <GraduationCap className="text-accent" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {education.current.institution}
                    </h3>
                    <p className="text-slate-300 mb-2">
                      {education.current.program}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {education.current.location}
                      </span>
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                        {education.current.status === 'ongoing' ? 'Ongoing' : education.current.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Education */}
              {education.previous.map((edu, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <Award className="text-slate-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {edu.institution}
                      </h3>
                      <p className="text-slate-300 mb-2">
                        {edu.program}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {edu.location}
                        </span>
                        <span className="px-2 py-1 bg-white/5 text-slate-400 rounded-full text-xs">
                          {edu.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Availability & Contact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              {personal_info.availability.status}
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              {t('contact_title')}
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              {t('contact_subtitle')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-black font-bold rounded-lg hover:bg-white hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-300"
            >
              <Mail size={20} />
              {t('contact_badge') || 'Get in Touch'}
              <ExternalLink size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
