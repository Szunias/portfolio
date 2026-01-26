'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Github, Linkedin, Music, Gamepad2, Send, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const socialLinks = [
  {
    name: 'github',
    href: 'https://github.com/iszfrn',
    icon: Github,
  },
  {
    name: 'linkedin',
    href: 'https://linkedin.com/in/igorszuniewicz',
    icon: Linkedin,
  },
  {
    name: 'spotify',
    href: 'https://open.spotify.com/artist/your-id',
    icon: Music,
  },
  {
    name: 'itch',
    href: 'https://iszfrn.itch.io',
    icon: Gamepad2,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
  const t = useTranslations('contact');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you'd send the form data to your backend here
    setStatus('success');
    setFormState({ name: '', email: '', subject: '', message: '' });

    // Reset status after a delay
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            {t('intro.title')}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('intro.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    {t('form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder={t('form.namePlaceholder')}
                    required
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-muted"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    {t('form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder={t('form.emailPlaceholder')}
                    required
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-muted"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    {t('form.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    placeholder={t('form.subjectPlaceholder')}
                    required
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-muted"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    {t('form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder={t('form.messagePlaceholder')}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-muted resize-none"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={status === 'loading'}
                    leftIcon={
                      status === 'success' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )
                    }
                  >
                    {status === 'loading'
                      ? t('form.sending')
                      : status === 'success'
                      ? t('form.success')
                      : t('form.submit')}
                  </Button>

                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-red-400 text-sm flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {t('form.error')}
                    </motion.p>
                  )}
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Contact info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Info cards */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">{t('info.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">{t('info.email')}</p>
                      <a
                        href="mailto:contact@igorszuniewicz.com"
                        className="text-text-primary hover:text-accent transition-colors"
                      >
                        contact@igorszuniewicz.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">{t('info.location')}</p>
                      <p className="text-text-primary">{t('info.locationValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">{t('info.availability')}</p>
                      <p className="text-text-primary">{t('info.availabilityValue')}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Social links */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">{t('social.title')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-surface-elevated border border-border hover:border-accent/50 transition-colors group"
                    >
                      <link.icon className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
                      <span className="font-medium group-hover:text-accent transition-colors">
                        {t(`social.${link.name}`)}
                      </span>
                    </a>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
