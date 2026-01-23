'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import ContactForm from '@/components/features/ContactForm';
import { motion } from 'framer-motion';
import { Mail, MapPin, Linkedin, Github, Music } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { personal_info } = usePortfolioData();

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
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
              {t('contact_page_title') || 'Get in Touch'}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t('contact_page_description') || 'Have a project in mind? Let\'s talk about game audio, sound design, or audio programming.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1fr_400px] gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ContactForm />
            </motion.div>

            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Availability Status */}
              <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <span className="text-accent font-semibold">{t('status') || 'Status'}</span>
                </div>
                <p className="text-white font-medium mb-2">
                  {personal_info.availability.status}
                </p>
                <p className="text-slate-400 text-sm">
                  {personal_info.availability.period && `${personal_info.availability.period} • `}
                  {personal_info.availability.duration && `${personal_info.availability.duration}`}
                </p>
              </div>

              {/* Location */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-accent" size={20} />
                  <h3 className="text-white font-semibold">{t('location') || 'Location'}</h3>
                </div>
                <p className="text-slate-300">
                  {personal_info.location.city}, {personal_info.location.country}
                </p>
                {personal_info.availability.relocation && (
                  <p className="text-slate-500 text-sm mt-2">
                    {personal_info.availability.relocation}
                  </p>
                )}
              </div>

              {/* Direct Email */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="text-accent" size={20} />
                  <h3 className="text-white font-semibold">{t('email') || 'Email'}</h3>
                </div>
                <a
                  href={`mailto:${personal_info.email}`}
                  className="text-slate-300 hover:text-accent transition-colors break-all"
                >
                  {personal_info.email}
                </a>
              </div>

              {/* Social Links */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{t('footer.connect') || 'Connect'}</h3>
                <div className="space-y-3">
                  <a
                    href={personal_info.social_media.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-400 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Linkedin size={18} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={personal_info.social_media.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-400 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Github size={18} />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={personal_info.social_media.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-400 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Music size={18} />
                    <span>Spotify</span>
                  </a>
                  <a
                    href={personal_info.social_media.itch_io}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-400 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <span className="text-sm font-mono">itch.io</span>
                  </a>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-all duration-300">
                <h3 className="text-white font-semibold mb-4">{t('languages') || 'Languages'}</h3>
                <ul className="space-y-2">
                  {personal_info.languages.map((lang, idx) => (
                    <li key={idx} className="text-slate-300 text-sm">
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
