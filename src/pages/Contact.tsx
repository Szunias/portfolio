import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Linkedin, Github, Copy, Check } from 'lucide-react';
import ContactForm from '../components/features/ContactForm';
import { usePortfolioData } from '../hooks/usePortfolioData';
import SEO from '../components/layout/SEO';

// Base64-encoded email — bots won't scrape it from static HTML
const ENCODED_EMAIL = 'aWdvcnN6dW5pZXdpY3p3b3JrQGdtYWlsLmNvbQ==';

const Contact = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation('contact');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setEmail(atob(ENCODED_EMAIL));
  }, []);

  const copyToClipboard = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={t('seo_title', 'Contact')}
        description={t('seo_description', 'Get in touch with Igor Szuniewicz for game audio, tool development, and middleware integration.')}
      />
      {/* Gradient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/6 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center pt-32">
        <div className="w-full max-w-5xl">

          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">{t('contact_title', 'Get In Touch')}</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('contact_intro', "I'm currently looking for internship opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

             {/* Contact Info Card */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-8">{t('contact_info_title', 'Contact Info')}</h2>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                         <Mail size={20} />
                      </div>
                      <div>
                         <p className="text-slate-500 text-xs mb-0.5">{t('contact_info_email', 'Email')}</p>
                         <div className="flex items-center gap-2">
                            {email ? (
                              <a href={`mailto:${email}`} className="text-white hover:text-blue-400 transition font-medium">
                                {email}
                              </a>
                            ) : (
                              <span className="text-dim">...</span>
                            )}
                            <button
                              onClick={copyToClipboard}
                              className="text-slate-500 hover:text-white transition p-1"
                              title={t('tooltips.copy_email', 'Copy Email')}
                              disabled={!email}
                            >
                              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                         <MapPin size={20} />
                      </div>
                      <div>
                         <p className="text-slate-500 text-xs mb-0.5">{t('contact_info_location', 'Location')}</p>
                         <p className="text-white font-medium">
                           {personal_info.location.city}, {personal_info.location.country}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                   <p className="text-slate-500 text-xs mb-4">{t('contact_social_title', 'Find me on')}</p>
                   <div className="flex gap-3">
                      <a
                        href={personal_info.social_media.linkedin}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-all"
                      >
                         <Linkedin size={20} />
                      </a>
                      <a
                        href={personal_info.social_media.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-all"
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
