import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

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
  image = '/assets/cv-image/cvsmile.jpg', // Domyślny obrazek udostępniania (Twoje zdjęcie lub logo)
  url
}: SEOProps) => {
  const { i18n } = useTranslation();
  const siteTitle = "Igor Szuniewicz | Audio Designer & Developer";
  const defaultDescription = "Portfolio of Igor Szuniewicz - Audio Designer & Developer specializing in Game Audio, Wwise/FMOD implementation, and Interactive Systems.";
  
  // Jeśli podano tytuł, dodaj sufiks strony, w przeciwnym razie użyj domyślnego
  const fullTitle = title ? `${title} | Igor Szuniewicz` : siteTitle;
  const metaDescription = description || defaultDescription;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <html lang={i18n.language} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={window.location.origin + image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Igor Szuniewicz Portfolio" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@Szunias" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={window.location.origin + image} />
    </Helmet>
  );
};

export default SEO;
