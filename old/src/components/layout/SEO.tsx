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

const SITE_URL = 'https://igorszuniewicz.com';

/** Sets <head> meta tags for SEO, Open Graph, Twitter cards, and JSON-LD structured data. */
const SEO = ({
  title,
  description,
  type = 'website',
  image,
  url,
  noindex = false
}: SEOProps) => {
  const { i18n } = useTranslation('common');
  const location = useLocation();
  const siteTitle = "Igor Szuniewicz | Audio Designer & Developer";
  const defaultDescription = "Igor Szuniewicz - Audio Designer & Developer. Game audio, sound design, Wwise/FMOD implementation, and audio programming.";

  const fullTitle = title ? `${title} | Igor Szuniewicz` : siteTitle;
  const metaDescription = description || defaultDescription;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  const currentUrl = url || `${baseUrl}${location.pathname}`;
  const defaultImage = `${SITE_URL}/assets/images/backgrounds/bg.jpg`;
  const imageUrl = image
    ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
    : defaultImage;

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
    "url": SITE_URL,
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

  // BreadcrumbList schema for non-homepage
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbData = !isHomePage && pathSegments.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      ...pathSegments.map((segment, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": segment.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        "item": `${SITE_URL}/${pathSegments.slice(0, i + 1).join('/')}`
      }))
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
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
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

      {/* Structured Data — Breadcrumbs on inner pages */}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
