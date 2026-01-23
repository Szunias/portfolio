'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, ExternalLink } from 'lucide-react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { Button } from '../ui/Button';

const ContactForm = () => {
  const t = useTranslations('contact');
  const tForm = useTranslations();
  const { personal_info } = usePortfolioData();

  const [status, setStatus] = useState<'idle' | 'preparing'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('preparing');

    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Prepare mailto link and open email client
    const mailtoLink = `mailto:${personal_info.email}?subject=${encodeURIComponent(`[Portfolio] ${subject}`)}&body=${encodeURIComponent(message)}`;

    // Small delay to show the preparing state
    setTimeout(() => {
      window.location.href = mailtoLink;
      setStatus('idle');
    }, 300);
  };

  return (
    <div className="bg-secondary p-8 rounded-2xl border border-white/10 shadow-xl">
      <div className="flex items-center gap-2 mb-4 text-dim text-sm">
        <Mail size={16} />
        {t('opens_email')}
      </div>
      <h3 className="text-2xl font-display font-bold text-white mb-6">
        {tForm('contact_form_title')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-mono text-dim mb-1">
            {tForm('contact_form_name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-mono text-dim mb-1">
            {tForm('contact_form_email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-mono text-dim mb-1">
            {tForm('contact_form_subject')}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-mono text-dim mb-1">
            {tForm('contact_form_message')}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors resize-none"
          ></textarea>
        </div>

        <Button
          type="submit"
          disabled={status === 'preparing'}
          variant="primary"
          className="w-full py-3 gap-2 group"
        >
          {status === 'idle' ? (
            <>
              <ExternalLink size={18} className="group-hover:translate-x-0.5 transition-transform" />
              {tForm('contact_form_submit')}
            </>
          ) : (
            <>
              <Mail size={18} className="animate-spin" />
              {t('preparing')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
