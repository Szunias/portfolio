import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const ContactForm = () => {
  const { t } = useTranslation();
  const { personal_info } = usePortfolioData();
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Simulate network delay for realism
    setTimeout(() => {
      // Construct mailto link
      const mailtoLink = `mailto:${personal_info.email}?subject=[Portfolio Contact] ${encodeURIComponent(subject)}&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0A%0A${encodeURIComponent(message)}`;
      
      window.location.href = mailtoLink;
      setStatus('success');
      
      // Reset after delay
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="bg-secondary p-8 rounded-2xl border border-white/10 shadow-xl">
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
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={status === 'sending' || status === 'success'}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all
            ${status === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-accent text-primary hover:bg-white'
            }
          `}
        >
          {status === 'idle' && (
            <>
              <Send size={18} />
              {t('contact_form_submit', 'Send Message')}
            </>
          )}
          {status === 'sending' && (
            <span className="animate-pulse">{t('contact.processing', 'Processing...')}</span>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={18} />
              Sent!
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;