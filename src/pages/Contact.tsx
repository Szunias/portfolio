import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Linkedin, Github, Copy, Check, Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import ContactForm from '../components/features/ContactForm';
import SEO from '../components/layout/SEO';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { fadeUpVariants } from '@/constants/motion';

const noMotionVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/** Base64-encoded email to deter scraper bots from harvesting it in static HTML. */
const ENCODED_EMAIL = 'aWdvcnN6dW5pZXdpY3p3b3JrQGdtYWlsLmNvbQ==';

/** Contact page with info card (email, location, socials) and the EmailJS contact form. */
const Contact = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation('contact');
  const [copied, setCopied] = useState(false);
  const email = useMemo(() => atob(ENCODED_EMAIL), []);
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? noMotionVariants : fadeUpVariants;

  const copyToClipboard = () => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Clipboard API not available - show email for manual copy
      window.prompt('Copy this email:', email);
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={t('seo_title', 'Contact')}
        description={t('seo_description', 'Get in touch with Igor Szuniewicz for game audio, tool development, and middleware integration.')}
      />

      <div className="relative z-10 pt-24 pb-16 px-6 sm:pt-28 sm:pb-20 md:px-12 md:pt-32 md:pb-28 lg:px-16">
        <div className="w-full max-w-content-wide mx-auto">

          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={variants}
          >
            <h1 className="font-display text-h1 text-text-primary mb-4">{t('contact_title', 'Get In Touch')}</h1>
            <p className="text-text-secondary text-body max-w-2xl mx-auto">
              {t('contact_intro', "I'm currently looking for internship opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

             {/* Contact Info Card */}
             <motion.div
               className="bg-surface-raised border border-border rounded-xl p-8"
               initial="hidden"
               animate="visible"
               variants={variants}
               transition={{ delay: 0.1 }}
             >
                <h2 className="text-h3 font-display text-text-primary mb-6">{t('contact_info_title', 'Contact Info')}</h2>

                <div className="space-y-6">
                   {/* Email - Prominent */}
                   <div className="flex items-start gap-4">
                      <Mail size={24} className="text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                      <div className="flex-1">
                         <p className="text-text-secondary text-body-sm mb-1.5">{t('contact_info_email', 'Email')}</p>
                         <div className="flex items-center gap-2 flex-wrap">
                            {email ? (
                              <a
                                href={`mailto:${email}`}
                                className="text-accent hover:text-accent-hover transition-colors text-body font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised rounded-sm"
                              >
                                {email}
                              </a>
                            ) : (
                              <span className="text-text-tertiary">...</span>
                            )}
                            <button
                              onClick={copyToClipboard}
                              className="text-text-secondary hover:text-text-primary transition-colors p-2.5 rounded-md hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
                              aria-label={copied ? t('tooltips.email_copied', 'Email copied') : t('tooltips.copy_email', 'Copy Email')}
                              disabled={!email}
                            >
                              {copied ? <Check size={16} className="text-success" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                            </button>
                            <span className="sr-only" aria-live="polite">
                              {copied ? t('tooltips.email_copied', 'Email copied to clipboard') : ''}
                            </span>
                         </div>
                      </div>
                   </div>

                   {/* LinkedIn - Prominent */}
                   <div className="flex items-start gap-4">
                      <Linkedin size={24} className="text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                      <div className="flex-1">
                         <p className="text-text-secondary text-body-sm mb-1.5">{t('contact_info_linkedin', 'LinkedIn')}</p>
                         <a
                           href={personal_info.social_media.linkedin}
                           target="_blank"
                           rel="noopener noreferrer me"
                           className="text-accent hover:text-accent-hover transition-colors text-body font-semibold inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised rounded-sm"
                         >
                           {t('contact_info_linkedin_label', 'View Profile')}
                         </a>
                      </div>
                   </div>

                   {/* Location with Timezone */}
                   <div className="flex items-start gap-4">
                      <MapPin size={24} className="text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                      <div className="flex-1">
                         <p className="text-text-secondary text-body-sm mb-1.5">{t('contact_info_location', 'Location')}</p>
                         <p className="text-text-primary font-semibold text-body">
                           {personal_info.location.city}, {personal_info.location.country}
                         </p>
                      </div>
                   </div>

                   {/* Timezone */}
                   <div className="flex items-start gap-4">
                      <Clock size={24} className="text-accent flex-shrink-0 mt-1" aria-hidden="true" />
                      <div className="flex-1">
                         <p className="text-text-secondary text-body-sm mb-1.5">{t('contact_info_timezone', 'Timezone')}</p>
                         <p className="text-text-primary font-semibold text-body">
                           {t('contact_info_timezone_value', 'CET/CEST (UTC+1/+2)')}
                         </p>
                      </div>
                   </div>
                </div>

                {/* Availability Status Badge */}
                <div className="mt-8 pt-6 border-t border-border">
                   <div className="inline-flex items-center gap-2 bg-success/10 text-success border border-success/20 rounded-md px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow"></div>
                      <span className="text-body-sm font-medium">{t('contact_availability_internship', 'Available for internship')}</span>
                   </div>
                </div>

                <div className="mt-6">
                   <a
                     href={personal_info.social_media.github}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised rounded-sm"
                   >
                      <Github size={18} aria-hidden="true" />
                      <span>{String(t('contact_github_label', 'View GitHub'))}</span>
                   </a>
                </div>
             </motion.div>

             {/* Contact Form */}
             <motion.div
               initial="hidden"
               animate="visible"
               variants={variants}
               transition={{ delay: 0.2 }}
             >
                <ContactForm />
             </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
