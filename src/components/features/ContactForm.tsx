import { useState, useRef, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Button } from '../ui/Button';

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

const ContactForm = () => {
  const { t } = useTranslation('contact');
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current!,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setStatus('sent');
      formRef.current?.reset();
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="bg-secondary p-8 rounded-sm border border-border">
      <div className="flex items-center gap-2 mb-4 text-dim text-sm">
        <Mail size={16} />
        {t('contact_form_title', 'Send a Message')}
      </div>
      <h3 className="text-2xl font-display text-cream-light mb-6">
        {t('contact_form_title', 'Send a Message')}
      </h3>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-mono text-dim mb-1">
            {t('contact_form_name', 'Your Name')}
          </label>
          <input
            type="text"
            id="name"
            name="from_name"
            required
            aria-required="true"
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-mono text-dim mb-1">
            {t('contact_form_email', 'Email Address')}
          </label>
          <input
            type="email"
            id="email"
            name="from_email"
            required
            aria-required="true"
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
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
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
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
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors resize-none"
          ></textarea>
        </div>

        <Button
          type="submit"
          disabled={status === 'sending'}
          variant="primary"
          className="w-full py-3 gap-2 group"
        >
          {status === 'idle' && (
            <>
              <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
              {t('contact_form_submit', 'Send Message')}
            </>
          )}
          {status === 'sending' && (
            <>
              <Mail size={18} className="animate-spin" />
              {t('contact_form_sending', 'Sending...')}
            </>
          )}
          {status === 'sent' && (
            <>
              <CheckCircle size={18} className="text-green-400" />
              {t('contact_form_sent', 'Message sent!')}
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle size={18} className="text-red-400" />
              {t('contact_form_error', 'Failed to send. Try again.')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
