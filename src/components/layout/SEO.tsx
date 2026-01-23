'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface SEOProps {
  title?: string;
  description?: string;
}

const SEO = ({
  title,
  description,
}: SEOProps) => {
  const locale = useLocale();
  const pathname = usePathname();
  const defaultDescription = "Portfolio of Igor Szuniewicz - Audio Designer & Developer specializing in Game Audio, Wwise/FMOD implementation, and Interactive Systems.";

  const metaDescription = description || defaultDescription;

  // SSR-safe URL handling
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://igorszuniewicz.github.io';
  };

  const baseUrl = getBaseUrl();
  const imageUrl = `${baseUrl}/assets/cv-image/cvsmile.jpg`;

  // Structured Data (JSON-LD) for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Igor Szuniewicz",
    "jobTitle": "Audio Designer & Developer",
    "description": metaDescription,
    "url": baseUrl,
    "image": imageUrl,
    "sameAs": [
      "https://github.com/igorszuniewicz",
      "https://www.linkedin.com/in/igorszuniewicz"
    ],
    "knowsAbout": [
      "Game Audio",
      "Wwise",
      "FMOD",
      "Unreal Engine",
      "Audio Programming",
      "Sound Design"
    ]
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default SEO;
