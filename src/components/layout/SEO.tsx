import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  name?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title, 
  description, 
  type = 'website',
  image = '/assets/cv-image/cvsmile.jpg', // Corrected path to main portrait
  url
}: SEOProps) => {
  const { i18n } = useTranslation('common');
  const location = useLocation();
  const siteTitle = "Igor Szuniewicz | Audio Designer & Developer";
  const defaultDescription = "Portfolio of Igor Szuniewicz - Audio Designer & Developer specializing in Game Audio, Wwise/FMOD implementation, and Interactive Systems.";
  
  // If title is provided, add site suffix; otherwise use default
  const fullTitle = title ? `${title} | Igor Szuniewicz` : siteTitle;
  const metaDescription = description || defaultDescription;
  
  // SSR-safe URL handling
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://igorszuniewicz.com'; // Fallback for SSR
  };
  
  const baseUrl = getBaseUrl();
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : `${baseUrl}${location.pathname}`);
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

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
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="author" content="Igor Szuniewicz" />
      <meta name="keywords" content="Audio Designer, Game Audio, Wwise, FMOD, Unreal Engine, Sound Design, Audio Programming, Interactive Audio" />
      <link rel="canonical" href={currentUrl} />
      <html lang={i18n.language} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Igor Szuniewicz Portfolio" />
      <meta property="og:locale" content={i18n.language === 'pl' ? 'pl_PL' : i18n.language === 'nl' ? 'nl_NL' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@Szunias" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
