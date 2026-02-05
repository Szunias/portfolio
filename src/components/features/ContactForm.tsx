import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ExternalLink } from 'lucide-react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { Button } from '../ui/Button';

const ContactForm = () => {
  const { t } = useTranslation();
  const { personal_info } = usePortfolioData();

  const [status, setStatus] = useState<'idle' | 'preparing'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('preparing');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Prepare mailto link and open email client
    const body = `From: ${name}\n\n${message}`;
    const mailtoLink = `mailto:${personal_info.email}?subject=${encodeURIComponent(`[Portfolio] ${subject}`)}&body=${encodeURIComponent(body)}`;

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
        {t('contact.opens_email', 'Opens your email client')}
      </div>
      <h3 className="text-2xl font-display font-bold text-white mb-6">
        {t('contact_form_title', 'Send a Message')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-mono text-dim mb-1">
            {t('contact_form_name', 'Your Name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            aria-required="true"
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-mono text-dim mb-1">
            {t('contact_form_email', 'Email Address')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            aria-required="true"
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-mono text-dim mb-1">
            {t('contact_form_subject', 'Subject')}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            aria-required="true"
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-mono text-dim mb-1">
            {t('contact_form_message', 'Your Message')}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            aria-required="true"
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
              {t('contact_form_submit', 'Open in Email App')}
            </>
          ) : (
            <>
              <Mail size={18} className="animate-spin" />
              {t('contact.preparing', 'Opening...')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;