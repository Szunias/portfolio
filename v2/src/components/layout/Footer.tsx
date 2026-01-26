'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Github, Linkedin, Mail, Music } from 'lucide-react';

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/iszfrn', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/igorszuniewicz', icon: Linkedin },
  { name: 'Spotify', href: 'https://open.spotify.com/artist/your-id', icon: Music },
  { name: 'Email', href: 'mailto:contact@igorszuniewicz.com', icon: Mail },
];

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link
              href="/"
              className="text-xl font-display font-bold text-text-primary hover:text-accent transition-colors"
            >
              Igor<span className="text-accent">.</span>
            </Link>
            <p className="mt-3 text-text-secondary text-sm max-w-xs">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              {t('navigation')}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-text-secondary hover:text-accent transition-colors text-sm">
                {t('about')}
              </Link>
              <Link href="/projects" className="text-text-secondary hover:text-accent transition-colors text-sm">
                {t('projects')}
              </Link>
              <Link href="/music" className="text-text-secondary hover:text-accent transition-colors text-sm">
                {t('music')}
              </Link>
              <Link href="/contact" className="text-text-secondary hover:text-accent transition-colors text-sm">
                {t('contact')}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              {t('connect')}
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-elevated border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                  aria-label={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            {currentYear} Igor Szuniewicz. {t('rights')}
          </p>
          <p className="text-text-muted text-xs">
            {t('madeWith')}
          </p>
        </div>
      </div>
    </footer>
  );
}
