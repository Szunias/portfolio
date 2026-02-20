const fs = require('fs');
const path = require('path');

// 1. Index.html - Font Preload
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf-8');
const fontLink = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />';
const fontPreload = `    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />`;
if (indexContent.includes(fontLink)) {
  indexContent = indexContent.replace(fontLink, fontPreload);
  fs.writeFileSync(indexPath, indexContent);
  console.log('Fixed index.html');
}

// 2. ContactForm.tsx - autoComplete
const contactFormPath = path.join(__dirname, 'src/components/features/ContactForm.tsx');
let cfContent = fs.readFileSync(contactFormPath, 'utf-8');
if (!cfContent.includes('autoComplete="name"')) {
  cfContent = cfContent.replace('name="from_name"', 'name="from_name"\n            autoComplete="name"');
  cfContent = cfContent.replace('name="from_email"', 'name="from_email"\n            autoComplete="email"');
  fs.writeFileSync(contactFormPath, cfContent);
  console.log('Fixed ContactForm.tsx');
}

// 3. Contact.tsx - useMemo
const contactPath = path.join(__dirname, 'src/pages/Contact.tsx');
let contactContent = fs.readFileSync(contactPath, 'utf-8');
if (contactContent.includes('useEffect')) {
  contactContent = contactContent.replace("import { useState, useEffect } from 'react';", "import { useState, useMemo } from 'react';");
  contactContent = contactContent.replace("const [email, setEmail] = useState('');\n\n  useEffect(() => {\n    setEmail(atob(ENCODED_EMAIL));\n  }, []);", "const email = useMemo(() => atob(ENCODED_EMAIL), []);");
  fs.writeFileSync(contactPath, contactContent);
  console.log('Fixed Contact.tsx');
}

// 4. Navbar.tsx - scroll lock
const navbarPath = path.join(__dirname, 'src/components/layout/Navbar.tsx');
let navContent = fs.readFileSync(navbarPath, 'utf-8');
if (!navContent.includes('document.body.style.overflow')) {
  const insertIndex = navContent.indexOf('// Scroll detection');
  const scrollLockCode = `// Body scroll lock on mobile menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);\n\n  `;
  navContent = navContent.slice(0, insertIndex) + scrollLockCode + navContent.slice(insertIndex);
  fs.writeFileSync(navbarPath, navContent);
  console.log('Fixed Navbar.tsx');
}

// 5. Public robots.txt & sitemap.xml
const robotsPath = path.join(__dirname, 'public/robots.txt');
const robotsContent = `User-agent: *
Allow: /

Sitemap: https://igorszuniewicz.com/sitemap.xml
`;
fs.writeFileSync(robotsPath, robotsContent);
console.log('Created robots.txt');

const sitemapPath = path.join(__dirname, 'public/sitemap.xml');
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://igorszuniewicz.com/</loc>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="pl" href="https://igorszuniewicz.com/" />
    <xhtml:link rel="alternate" hreflang="nl" href="https://igorszuniewicz.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://igorszuniewicz.com/" />
  </url>
  <url><loc>https://igorszuniewicz.com/projects</loc><priority>0.8</priority></url>
  <url><loc>https://igorszuniewicz.com/music</loc><priority>0.8</priority></url>
  <url><loc>https://igorszuniewicz.com/about</loc><priority>0.8</priority></url>
  <url><loc>https://igorszuniewicz.com/contact</loc><priority>0.8</priority></url>
</urlset>
`;
fs.writeFileSync(sitemapPath, sitemapContent);
console.log('Created sitemap.xml');

// 6. ESLint config
const eslintPath = path.join(__dirname, 'eslint.config.js');
let eslintContent = fs.readFileSync(eslintPath, 'utf-8');
if (!eslintContent.includes("'.next'")) {
  eslintContent = eslintContent.replace(
    "{ ignores: ['dist', 'public', 'postcss.config.js', 'tailwind.config.js', 'vite.config.ts', 'old_design'] }",
    "{ ignores: ['dist', 'public', 'postcss.config.js', 'tailwind.config.js', 'vite.config.ts', 'old_design', '.next', 'v2', 'node_modules'] }"
  );
  fs.writeFileSync(eslintPath, eslintContent);
  console.log('Fixed eslint.config.js');
}

console.log('All patches applied.');
