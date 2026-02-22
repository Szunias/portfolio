import { useState, useRef, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

import { Button } from '../ui/Button';

type FormStatus = 'idle' | 'sending' | 'sent' | 'error' | 'cooldown';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_MS = 30_000;
const SENT_DISPLAY_MS = 3_000;
const ERROR_DISPLAY_MS = 4_000;

/** Strips HTML tags and trims whitespace from a string. */
function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

/** Contact form that sends messages via EmailJS. Manages idle/sending/sent/error states. */
const ContactForm = () => {
  const { t } = useTranslation('contact');
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [configError, setConfigError] = useState(false);
  const [validationError, setValidationError] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const cooldownRef = useRef<ReturnType<typeof setTimeout>>();
  const isSubmittingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Validate env vars on mount; clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setConfigError(true);
    }

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');

    // Double-submission guard
    if (isSubmittingRef.current) return;

    // Cooldown guard
    if (status === 'cooldown') return;

    // Null-check the form ref
    if (!formRef.current) return;

    // Client-side email validation
    const formData = new FormData(formRef.current);
    const emailValue = (formData.get('from_email') as string) ?? '';
    if (!EMAIL_REGEX.test(emailValue)) {
      setValidationError(t('contact_form_invalid_email', 'Please enter a valid email address.'));
      return;
    }

    // Sanitize text fields before sending
    const nameInput = formRef.current.elements.namedItem('from_name') as HTMLInputElement | null;
    const subjectInput = formRef.current.elements.namedItem('subject') as HTMLInputElement | null;
    const messageInput = formRef.current.elements.namedItem('message') as HTMLTextAreaElement | null;
    if (nameInput) nameInput.value = sanitize(nameInput.value);
    if (subjectInput) subjectInput.value = sanitize(subjectInput.value);
    if (messageInput) messageInput.value = sanitize(messageInput.value);

    isSubmittingRef.current = true;
    setStatus('sending');

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      if (!isMountedRef.current) return;

      setStatus('sent');
      formRef.current.reset();

      // Show "sent" briefly, then enter cooldown
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setStatus('cooldown');

        cooldownRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setStatus('idle');
        }, COOLDOWN_MS);
      }, SENT_DISPLAY_MS);
    } catch {
      if (!isMountedRef.current) return;
      setStatus('error');
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setStatus('idle');
      }, ERROR_DISPLAY_MS);
    } finally {
      isSubmittingRef.current = false;
    }
  }, [status, t]);

  if (configError) {
    return (
      <div className="bg-secondary p-8 rounded-sm border border-border">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle size={18} />
          <p>{t('contact_form_config_error', 'Contact form is temporarily unavailable. Please email directly.')}</p>
        </div>
      </div>
    );
  }

  const isDisabled = status === 'sending' || status === 'cooldown';

  return (
    <div className="bg-secondary p-8 rounded-sm border border-border">
      <div className="flex items-center gap-2 mb-4 text-dim text-sm">
        <Mail size={16} />
        {t('contact_form_title', 'Send a Message')}
      </div>
      <h3 className="text-2xl font-display text-cream-light mb-6">
        {t('contact_form_title', 'Send a Message')}
      </h3>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-label text-dim mb-1">
            {t('contact_form_name', 'Your Name')}
          </label>
          <input
            type="text"
            id="name"
            name="from_name"
            autoComplete="name"
            required
            aria-required="true"
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-label text-dim mb-1">
            {t('contact_form_email', 'Email Address')}
          </label>
          <input
            type="email"
            id="email"
            name="from_email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={validationError ? 'true' : undefined}
            aria-describedby={validationError ? 'email-error' : undefined}
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary transition-colors"
          />
          {validationError && (
            <p id="email-error" className="text-error text-sm mt-1" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-label text-dim mb-1">
            {t('contact_form_subject', 'Subject')}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            autoComplete="off"
            required
            aria-required="true"
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-label text-dim mb-1">
            {t('contact_form_message', 'Your Message')}
          </label>
          <textarea
            id="message"
            name="message"
            autoComplete="off"
            rows={5}
            required
            aria-required="true"
            className="w-full bg-primary border border-border rounded-sm px-4 py-3 text-cream focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary transition-colors resize-none"
          ></textarea>
        </div>

        <Button
          type="submit"
          disabled={isDisabled}
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
              <CheckCircle size={18} className="text-success" />
              {t('contact_form_sent', 'Message sent!')}
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle size={18} className="text-error" />
              {t('contact_form_error', 'Failed to send. Try again.')}
            </>
          )}
          {status === 'cooldown' && (
            <>
              <CheckCircle size={18} className="text-success" />
              {t('contact_form_cooldown', 'Message sent! Please wait before sending another.')}
            </>
          )}
        </Button>

        {/* Aria-live region for screen reader announcements */}
        <div aria-live="polite" className="sr-only">
          {status === 'sent' && t('contact_form_sent', 'Message sent!')}
          {status === 'error' && t('contact_form_error', 'Failed to send. Try again.')}
          {status === 'cooldown' && t('contact_form_cooldown', 'Message sent! Please wait before sending another.')}
          {status === 'sending' && t('contact_form_sending', 'Sending...')}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
