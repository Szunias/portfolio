#!/usr/bin/env node
/**
 * Generates sitemap.xml based on canonical URLs declared in HTML files.
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'sitemap.xml');
const CANONICAL_PREFIX = 'https://igorszuniewicz.com';

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'assets',
  'docs',
  'scripts',
  'src',
  'public',
  'locales',
  'usefuldocsdontpushtogithub',
  '.vscode'
]);

/** @type {Record<string, {priority:number, changefreq:string}>} */
const PRIORITY_RULES = {
  '/': { priority: 1.0, changefreq: 'weekly' },
  '/projects/': { priority: 0.9, changefreq: 'weekly' },
  '/about.html': { priority: 0.9, changefreq: 'monthly' },
  '/music.html': { priority: 0.8, changefreq: 'weekly' },
  '/contact.html': { priority: 0.8, changefreq: 'monthly' },
  '/cv/igor-cv-dark.html': { priority: 0.7, changefreq: 'yearly' }
};

const DEFAULT_PRIORITY = 0.6;
const DEFAULT_CHANGEFREQ = 'monthly';

async function main() {
  const entries = await collectHtmlFiles(ROOT);
  const pages = await extractCanonicalPages(entries);
  const xml = buildSitemap(pages);
  await fs.writeFile(OUTPUT, xml, 'utf8');
  process.stdout.write(`Sitemap generated with ${pages.length} entries -> ${path.relative(ROOT, OUTPUT)}\n`);
}

async function collectHtmlFiles(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (IGNORE_DIRS.has(item.name)) continue;
      results.push(...await collectHtmlFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

async function extractCanonicalPages(files) {
  const unique = new Map();

  for (const file of files) {
    const relPath = path.relative(ROOT, file);
    const content = await fs.readFile(file, 'utf8');
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (!canonicalMatch) continue;

    const canonicalUrl = canonicalMatch[1].trim();
    if (!canonicalUrl.startsWith(CANONICAL_PREFIX)) continue;

    const loc = canonicalUrl.replace(CANONICAL_PREFIX, '');

    // Avoid listing the same URL twice (e.g. templates)
    if (unique.has(loc)) continue;

    const stats = await fs.stat(file);
    const lastmod = stats.mtime.toISOString().split('T')[0];
    const rule = getRuleFor(loc);

    unique.set(loc, {
      loc: canonicalUrl,
      lastmod,
      changefreq: rule.changefreq,
      priority: rule.priority
    });
  }

  return Array.from(unique.values()).sort((a, b) => a.loc.localeCompare(b.loc));
}

function getRuleFor(pathname) {
  if (PRIORITY_RULES[pathname]) {
    return PRIORITY_RULES[pathname];
  }

  if (pathname.startsWith('/projects/')) {
    return { priority: 0.7, changefreq: 'monthly' };
  }

  return { priority: DEFAULT_PRIORITY, changefreq: DEFAULT_CHANGEFREQ };
}

function buildSitemap(pages) {
  const urls = pages.map(page => {
    return [
      '  <url>',
      `    <loc>${page.loc}</loc>`,
      `    <lastmod>${page.lastmod}</lastmod>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority.toFixed(1)}</priority>`,
      '  </url>'
    ].join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
