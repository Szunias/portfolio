import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Linkedin, Github, Copy, Check } from 'lucide-react';

import ContactForm from '../components/features/ContactForm';
import SEO from '../components/layout/SEO';
import { usePortfolioData } from '../hooks/usePortfolioData';

/** Base64-encoded email to deter scraper bots from harvesting it in static HTML. */
const ENCODED_EMAIL = 'aWdvcnN6dW5pZXdpY3p3b3JrQGdtYWlsLmNvbQ==';

/** Contact page with info card (email, location, socials) and the EmailJS contact form. */
const Contact = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation('contact');
  const [copied, setCopied] = useState(false);
  const email = useMemo(() => atob(ENCODED_EMAIL), []);

  const copyToClipboard = () => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for browsers where clipboard API is unavailable
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={t('seo_title', 'Contact')}
        description={t('seo_description', 'Get in touch with Igor Szuniewicz for game audio, tool development, and middleware integration.')}
      />

      <div className="relative z-10 pt-32 pb-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-6xl">

          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display text-cream-light mb-4 tracking-wide">{t('contact_title', 'Get In Touch')}</h1>
            <p className="text-dim text-lg max-w-xl mx-auto leading-7">
              {t('contact_intro', "I'm currently looking for internship opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

             {/* Contact Info Card */}
             <div className="bg-secondary border border-border rounded-sm p-8">
                <h2 className="text-xl font-display text-cream-light mb-8">{t('contact_info_title', 'Contact Info')}</h2>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <Mail size={20} className="text-accent flex-shrink-0" />
                      <div>
                         <p className="text-dim text-xs mb-0.5">{t('contact_info_email', 'Email')}</p>
                         <div className="flex items-center gap-2">
                            {email ? (
                              <a href={`mailto:${email}`} className="text-cream hover:text-accent transition-colors font-medium">
                                {email}
                              </a>
                            ) : (
                              <span className="text-dim">...</span>
                            )}
                            <button
                              onClick={copyToClipboard}
                              className="text-dim hover:text-cream transition-colors p-1"
                              title={t('tooltips.copy_email', 'Copy Email')}
                              aria-label={t('tooltips.copy_email', 'Copy Email')}
                              disabled={!email}
                            >
                              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <MapPin size={20} className="text-accent flex-shrink-0" />
                      <div>
                         <p className="text-dim text-xs mb-0.5">{t('contact_info_location', 'Location')}</p>
                         <p className="text-cream font-medium">
                           {personal_info.location.city}, {personal_info.location.country}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                   <p className="text-dim text-xs mb-4">{t('contact_social_title', 'Find me on')}</p>
                   <div className="flex gap-3">
                      <a
                        href={personal_info.social_media.linkedin}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label="LinkedIn"
                        className="flex items-center justify-center w-12 h-12 border border-border rounded-sm text-dim hover:border-border-hover hover:text-cream transition-colors duration-200"
                      >
                         <Linkedin size={20} />
                      </a>
                      <a
                        href={personal_info.social_media.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="flex items-center justify-center w-12 h-12 border border-border rounded-sm text-dim hover:border-border-hover hover:text-cream transition-colors duration-200"
                      >
                         <Github size={20} />
                      </a>
                   </div>
                </div>
             </div>

             {/* Contact Form */}
             <div>
                <ContactForm />
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
