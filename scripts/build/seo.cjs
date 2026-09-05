/** Structured data generation and validation for the static portfolio. */

function jsonLdTag(graph) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function schemaTags(page, siteOrigin) {
  if (page.noindex) return '';
  const siteId = `${siteOrigin}/#website`;
  const personId = `${siteOrigin}/#igor`;
  const pageId = `${page.canonical}#webpage`;
  const pageName = page.ogTitle || page.title;
  const person = {
    '@type': 'Person',
    '@id': personId,
    name: 'Igor Szuniewicz',
    url: `${siteOrigin}/`,
    jobTitle: 'Technical Sound Designer & Audio Programmer',
    description: 'Technical sound designer and audio programmer working on game audio, VR sound and audio production tools.',
    knowsAbout: [
      'Game audio',
      'Technical sound design',
      'Wwise',
      'FMOD',
      'Unreal Engine',
      'Unity',
      'MetaSounds',
      'Spatial audio',
      'C++ audio tools',
      'JUCE'
    ],
    sameAs: [
      'https://www.linkedin.com/in/igorszuniewicz',
      'https://github.com/Szunias',
      'https://igorszuniewicz.itch.io',
      'https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6',
      'https://www.therookies.co/u/szuniewiczigor'
    ]
  };
  const website = {
    '@type': 'WebSite',
    '@id': siteId,
    url: `${siteOrigin}/`,
    name: 'Igor Szuniewicz',
    description: 'Game audio and technical sound design portfolio by Igor Szuniewicz.',
    publisher: { '@id': personId }
  };
  // The page node is always a WebPage subtype; a typed work (VideoGame,
  // SoftwareApplication, ScholarlyArticle) hangs off it as mainEntity rather
  // than replacing it, so the graph stays valid for both kinds of consumers.
  const webPage = {
    // schemaPageType lets a page name its own WebPage subtype when neither the
    // slug nor the layout implies one; contact uses it for ContactPage.
    '@type': page.schemaPageType
      || (page.slug === 'index' ? 'ProfilePage' : (page.layout === 'music' ? 'CollectionPage' : 'WebPage')),
    '@id': pageId,
    url: page.canonical,
    name: pageName,
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': siteId }
  };
  if (page.ogImage) webPage.image = page.ogImage;
  const graph = [person, website, webPage];
  if (page.slug === 'index') {
    webPage.mainEntity = { '@id': personId };
  } else {
    webPage.author = { '@id': personId };
    webPage.creator = { '@id': personId };
    if (page.schemaType) {
      const workId = `${page.canonical}#work`;
      // On a team project Igor authored the audio, not the work itself, so the
      // page declares contributor instead. Claiming author on a collaborative
      // game contradicts the credits stated on the page.
      const work = {
        '@type': page.schemaType,
        '@id': workId,
        name: pageName.replace(/\s+\|\s+.*$/, ''),
        url: page.canonical,
        description: page.description,
        [page.schemaRole || 'author']: { '@id': personId },
        mainEntityOfPage: { '@id': pageId }
      };
      if (page.schemaApplicationCategory) work.applicationCategory = page.schemaApplicationCategory;
      if (page.schemaOperatingSystem) work.operatingSystem = page.schemaOperatingSystem;
      if (page.schemaDatePublished) work.datePublished = page.schemaDatePublished;
      if (page.ogImage) work.image = page.ogImage;
      webPage.mainEntity = { '@id': workId };
      graph.push(work);
    }
  }
  if (page.slug !== 'index') {
    webPage.breadcrumb = { '@id': `${page.canonical}#breadcrumb` };
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${page.canonical}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteOrigin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageName.replace(/\s+\|\s+.*$/, '').replace(/\s+-\s+Igor Szuniewicz$/, ''),
          item: page.canonical
        }
      ]
    });
  }
  return jsonLdTag(graph);
}

/** Catch missing graphs and broken page/work identities before deployment. */
function structuredDataIssues(html, page, siteOrigin) {
  const issues = [];
  const nodes = [];
  for (const match of html.matchAll(/<script\b(?=[^>]*\btype=(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[2]);
      if (data['@context'] !== 'https://schema.org') issues.push('JSON-LD missing schema.org context');
      if (!Array.isArray(data['@graph']) || !data['@graph'].length) {
        issues.push('JSON-LD graph is empty or missing');
      } else {
        nodes.push(...data['@graph']);
      }
    } catch (error) {
      issues.push(`invalid JSON-LD (${error.message})`);
    }
  }
  if (!page || page.noindex) return issues;

  const pageId = `${page.canonical}#webpage`;
  const personId = `${siteOrigin}/#igor`;
  const siteId = `${siteOrigin}/#website`;
  const byId = new Map();
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || !node['@id']) {
      issues.push('JSON-LD graph node is missing an identity');
      continue;
    }
    if (byId.has(node['@id'])) issues.push(`duplicate JSON-LD identity ${node['@id']}`);
    byId.set(node['@id'], node);
  }
  const webPage = byId.get(pageId);
  if (!webPage || webPage.url !== page.canonical || webPage.isPartOf?.['@id'] !== siteId) {
    issues.push('JSON-LD page must identify its canonical URL and website');
  }
  if (byId.get(personId)?.['@type'] !== 'Person' || byId.get(siteId)?.['@type'] !== 'WebSite') {
    issues.push('JSON-LD must identify the portfolio owner and website');
  }
  if (page.slug === 'index') {
    if (webPage?.mainEntity?.['@id'] !== personId) issues.push('ProfilePage must identify the portfolio owner');
  } else {
    const breadcrumbId = `${page.canonical}#breadcrumb`;
    const breadcrumb = byId.get(breadcrumbId);
    if (webPage?.breadcrumb?.['@id'] !== breadcrumbId || breadcrumb?.['@type'] !== 'BreadcrumbList') {
      issues.push('JSON-LD page is missing its breadcrumb reference');
    }
  }
  if (page.schemaType) {
    const workId = `${page.canonical}#work`;
    const work = byId.get(workId);
    const role = page.schemaRole || 'author';
    if (webPage?.mainEntity?.['@id'] !== workId || work?.['@type'] !== page.schemaType || work?.mainEntityOfPage?.['@id'] !== pageId) {
      issues.push('JSON-LD project must identify its work and containing page');
    }
    if (work?.[role]?.['@id'] !== personId || (role === 'contributor' && work?.author?.['@id'] === personId)) {
      issues.push('JSON-LD project credit must match the configured author or contributor role');
    }
  }
  return issues;
}

module.exports = { schemaTags, structuredDataIssues };
