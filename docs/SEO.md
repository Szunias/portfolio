# Search visibility

The public site is `https://igorszuniewicz.com/`. The build emits one canonical
URL per page, a sitemap containing public pages only, crawlable static HTML,
social preview metadata and structured data describing Igor's role in each
project. Review layouts and the error page use `noindex` and stay out of the
sitemap. CSS, JavaScript and project assets remain accessible to crawlers.

`npm test` checks structured data identities, project credits and the old CV
address. `npm run build` also validates the rendered metadata, links, assets,
robots directives and sitemap. Its sitemap dates come from committed content
changes rather than the deployment time.

The historical `/old/public/cv/Igor_Szuniewicz_CV.pdf` and
`/cv/Igor_Szuniewicz_CV.pdf` URLs still appear in search results. `staticCopy`
serves the current root PDF at both addresses to preserve those links.
New links should use `/Igor_Szuniewicz_CV.pdf`. The homepage retains its
`#contact`, `#work` and `#about` anchors for existing links.

## Audit on 5 September 2026

All 20 public sitemap URLs returned HTTP 200, their expected canonical URLs,
indexable robots directives and parseable structured data. `robots.txt` and
`sitemap.xml` returned HTTP 200. A nonexistent URL returned HTTP 404. HTTP and
the default GitHub Pages address redirected to the HTTPS custom domain.

The `www` variant had a separate hosting issue: its CNAME pointed to the apex
domain, and GitHub served a certificate that did not cover
`www.igorszuniewicz.com`. GitHub's Pages health API reported
`peer_failed_verification` for that hostname. At the DNS provider, change the
existing `www` CNAME target to `szunias.github.io`, without a repository path.
Keep `igorszuniewicz.com` as the Pages custom domain and keep HTTPS enforcement
enabled. After DNS propagation and certificate provisioning, verify that
`https://www.igorszuniewicz.com/` redirects to `https://igorszuniewicz.com/`
without a certificate error. This follows [GitHub's custom-domain
instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain).

A mobile PageSpeed Insights request returned HTTP 429, so this audit did not
produce a Lighthouse score or real-user Core Web Vitals. The homepage uses a
26 KB poster and about 49 KB of self-hosted fonts. Its 1.66 MB mobile background
video was subsequently replaced by a 1.08 MB landscape preview for the revised
mobile layout. These sizes alone do not establish
a passing or failing Core Web Vitals result.

## Checks in Google Search Console

Technical accessibility does not confirm indexing or a search position. In the
verified domain property:

1. Check that `https://igorszuniewicz.com/sitemap.xml` has been read successfully.
2. Inspect the homepage, contact page and main project URLs. Compare the
   Google-selected canonical with the declared canonical and review the last
   crawl and indexing status.
3. Use the live URL test after deployment if a page has a rendering or access
   issue. Request indexing for substantially updated pages when appropriate.
4. Review Page indexing for unexpected exclusions. Review layouts excluded by
   `noindex` are intentional; investigate public portfolio pages separately.
5. Review Performance by query, page, country and device. Compare like-for-like
   date ranges and distinguish name searches from searches for game audio work.
   Low-volume averages are not a reliable claim of a stable ranking.

Google chooses whether to index pages and how to rank them. Clear project
evidence, accurate descriptions and relevant links from actual collaborators or
project repositories matter more than repeating keywords. A sitemap submission
or structured data does not guarantee inclusion or enhanced search results.
See Google's [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
and [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
