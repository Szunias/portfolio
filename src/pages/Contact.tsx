import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Linkedin, Github, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ContactForm from '../components/ContactForm';
import { usePortfolioData } from '../hooks/usePortfolioData';

const Contact = () => {
  const { personal_info } = usePortfolioData();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(personal_info.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center pt-32">
      <div className="w-full max-w-5xl">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display font-bold text-white mb-4">{t('nav_contact', 'Get In Touch')}</h1>
          <p className="text-dim text-lg max-w-2xl mx-auto">
            {t('contact_intro', "I'm currently looking for internship opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
           
           {/* Contact Info Card */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-secondary p-8 rounded-2xl border border-white/10"
           >
              <h2 className="text-2xl font-display font-bold text-white mb-8">{t('contact_info_title', 'Contact Info')}</h2>
              
              <div className="space-y-8">
                 <div className="flex items-start">
                    <div className="p-3 bg-white/5 rounded-lg text-accent mr-4 border border-white/10">
                       <Mail size={24} />
                    </div>
                    <div>
                       <p className="text-dim text-xs font-mono uppercase tracking-widest mb-1">{t('contact_info_email', 'Email')}</p>
                       <div className="flex items-center gap-2">
                          <a href={`mailto:${personal_info.email}`} className="text-white hover:text-accent transition font-medium text-lg">
                             {personal_info.email}
                          </a>
                          <button 
                            onClick={copyToClipboard}
                            className="text-dim hover:text-white transition p-1"
                            title={t('tooltips.copy_email', 'Copy Email')}
                          >
                            {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-start">
                    <div className="p-3 bg-white/5 rounded-lg text-accent mr-4 border border-white/10">
                       <MapPin size={24} />
                    </div>
                    <div>
                       <p className="text-dim text-xs font-mono uppercase tracking-widest mb-1">{t('contact_info_location', 'Location')}</p>
                       <p className="text-white font-medium text-lg">
                         {personal_info.location.city}, {personal_info.location.country}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                 <h3 className="text-dim text-xs font-mono uppercase tracking-widest mb-4">{t('contact_social_title', 'Find me on')}</h3>
                 <div className="flex gap-4">
                    <a 
                      href={personal_info.social_media.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-lg text-dim hover:bg-white hover:text-primary transition-all"
                    >
                       <Linkedin size={24} />
                    </a>
                    <a 
                      href={personal_info.social_media.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-lg text-dim hover:bg-white hover:text-primary transition-all"
                    >
                       <Github size={24} />
                    </a>
                 </div>
              </div>
           </motion.div>

           {/* Functional Contact Form */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
           >
              <ContactForm />
           </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;