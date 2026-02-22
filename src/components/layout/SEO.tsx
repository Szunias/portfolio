import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  name?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
}

/** Sets <head> meta tags for SEO, Open Graph, Twitter cards, and JSON-LD structured data. */
const SEO = ({
  title,
  description,
  type = 'website',
  image = '/assets/cv-image/cvsmile.jpg',
  url,
  noindex = false
}: SEOProps) => {
  const { i18n } = useTranslation('common');
  const location = useLocation();
  const siteTitle = "Igor Szuniewicz | Audio Designer & Developer";
  const defaultDescription = "Portfolio of Igor Szuniewicz - Audio Designer & Developer specializing in Game Audio, Wwise/FMOD implementation, and Interactive Systems.";

  const fullTitle = title ? `${title} | Igor Szuniewicz` : siteTitle;
  const metaDescription = description || defaultDescription;

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://igorszuniewicz.com';
  };

  const baseUrl = getBaseUrl();
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : `${baseUrl}${location.pathname}`);
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  const isHomePage = location.pathname === '/' || location.pathname === '';

  // OG locale mapping
  const ogLocale = i18n.language === 'pl' ? 'pl_PL' : i18n.language === 'nl' ? 'nl_NL' : 'en_US';
  const alternateLocales = ['en_US', 'pl_PL', 'nl_NL'].filter(l => l !== ogLocale);

  // Person schema only on homepage
  const personData = isHomePage ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Igor Szuniewicz",
    "jobTitle": "Audio Designer & Developer",
    "description": metaDescription,
    "url": baseUrl,
    "image": imageUrl,
    "sameAs": [
      "https://github.com/Szunias",
      "https://www.linkedin.com/in/igorszuniewicz",
      "https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6",
      "https://igorszuniewicz.itch.io"
    ],
    "knowsAbout": [
      "Game Audio",
      "Wwise",
      "FMOD",
      "Unreal Engine",
      "Audio Programming",
      "Sound Design"
    ]
  } : null;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="author" content="Igor Szuniewicz" />
      <meta name="keywords" content="Audio Designer, Game Audio, Wwise, FMOD, Unreal Engine, Sound Design, Audio Programming, Interactive Audio" />
      <link rel="canonical" href={currentUrl} />
      <html lang={i18n.language} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Hreflang omitted: language is stored in localStorage, not in URL path/subdomain,
         so all hreflang tags would point to the same URL — misleading for search engines. */}

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Igor Szuniewicz Portfolio" />
      <meta property="og:locale" content={ogLocale} />
      {alternateLocales.map(locale => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@Szunias" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data — Person only on homepage */}
      {personData && (
        <script type="application/ld+json">
          {JSON.stringify(personData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
