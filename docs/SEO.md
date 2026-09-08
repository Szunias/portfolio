# Search visibility

The public site is `https://igorszuniewicz.com/`. The build emits one canonical
URL per content page, a sitemap containing public content pages only, crawlable
static HTML, social preview metadata and structured data describing Igor's role
in each project. Review layouts and the error page use `noindex` and stay out of
the sitemap. CSS, JavaScript and project assets remain accessible to crawlers.
Legacy redirect documents point to the corresponding content page's canonical;
they are not separate portfolio content and stay out of the sitemap.

`npm test` checks structured data identities, project credits, the old CV
addresses, legacy redirects and public copy/metadata consistency. `npm run build`
also validates the rendered metadata, links, assets, robots directives and
sitemap. Its sitemap dates come from committed content changes rather than the
deployment time.

The historical `/old/public/cv/Igor_Szuniewicz_CV.pdf` and
`/cv/Igor_Szuniewicz_CV.pdf` URLs still appear in search results. `staticCopy`
serves the current root PDF at both addresses to preserve those links.
New links should use `/Igor_Szuniewicz_CV.pdf`. The homepage retains its
`#contact`, `#work` and `#about` anchors for existing links.

## Copy and metadata ownership

Edit titles, descriptions and social metadata in `site.config.cjs`. The build
uses these same descriptions in page metadata and JSON-LD, so do not maintain
another competing SEO copy file. Descriptions summarize what is actually visible
on the page; they must not introduce clients, credits, availability dates,
response-time promises or services absent from the public work.

The homepage and contact page invite both freelance projects and studio roles.
Their existing paragraphs explain sound design, Wwise/Unreal/Unity implementation
and the project/scope/timeline information useful in an initial email. CSS,
layout templates, browser scripts, navigation, media and the hero treatment are
unchanged by the September 2026 SEO copy update. Text may naturally wrap
differently; a copy change is not a promise of pixel-identical screenshots.

The music description does not hardcode a track count; adding a track should not
make a search snippet inaccurate. Leave the explicit `noindex` review variants
alone when changing the public page. Do not add keyword stuffing, hidden SEO
paragraphs, fake reviews or speculative structured data. Google may select a
snippet from page content rather than use the supplied meta description:
[snippet guidance](https://developers.google.com/search/docs/appearance/snippet).

## Compatibility for old project URLs

`LEGACY_PATHS` in `site.config.cjs` is an explicit map from historical URL paths
to the redirect documents in `src/static/redirects/`. Each entry publishes an
`.html` alias and a directory `index.html`, covering the old extensionless,
trailing-slash and `.html` link forms on the static host. The existing `staticCopy`
pipeline stages and validates these files with the rest of the build. No separate
post-build writer or catch-all JavaScript redirect is used.

The source of the historical paths is `old/public/sitemap.xml`; the archived
root research page also declares `/gradwork.html` as its canonical. Equivalence
of the old research and middleware names can be checked in
`archive/gradwork.html` and `old/public/locales/en/projects.json`.

| Historical path (before .html or trailing slash) | Current destination |
| --- | --- |
| `/projects` | `/#work` |
| `/about` | `/#about` |
| `/projects/shadow_frames` | `/shadowframes.html` |
| `/projects/not_today_darling` | `/nottoday.html` |
| `/projects/transientica_audiolab` | `/transientica.html` |
| `/projects/audioq` | `/audioq.html` |
| `/projects/amorak` | `/amorak.html` |
| `/projects/sound-design` | `/sounddesign.html` |
| `/projects/ray_animation` | `/ray.html` |
| `/projects/middleware-optimization` | `/wwiseprojects.html` |
| `/projects/akantilado` | `/akantilado.html` |
| `/projects/richter` | `/richter.html` |
| `/projects/gradwork`, `/gradwork` | `/ai-audio-research.html` |
| `/projects/pause_and_deserve` | `/pausedeserve.html` |

These 15 mappings publish 30 small compatibility files. No current content URL
is renamed. The old `/music` and `/contact` paths already have matching current
HTML pages. `/projects/wwise_unreal_fixer` and
`/projects/unreal_engine_rebuilder` have no verified equivalent in the current
portfolio; they are deliberately not mapped to an unrelated project or homepage.
Unknown URLs must continue to return a real 404.

Each redirect has an instant `<meta http-equiv="refresh">`, an absolute canonical
without a fragment, and a normal fallback link to the exact destination. The
work/about refresh and link retain the intended section fragment. There is no
JavaScript, `noindex`, robots disallow or delayed countdown. Redirect sources
must remain crawlable but do not belong in the sitemap; only their destinations
do. Keep these compatibility files while historical links need to work.

**These are not HTTP 301 responses.** The static GitHub Pages output serves the
redirect HTML; Google documents instant meta refresh as a permanent redirect
signal when server-side redirects are not available. HTTP 301/308 at the hosting
or edge layer would be preferable when that configuration is available. Do not
claim a server-side redirect or recovered rankings from the presence of these
files. See [Google's redirect guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects).

Run `npm test` and `npm run build` after changes. The redirect tests check target
identity, target fragments, indexability, fallback links, sitemap exclusions,
legacy-sitemap coverage and the complete staged-copy path. After deployment,
check `/projects/richter.html`, `/projects/richter`, `/projects/richter/`,
`/projects/shadow_frames`, `/gradwork.html` and an unknown project URL on the
actual host. A local preview test does not establish how GitHub's edge handles
every path variant. Requesting a redirect with `curl -I` may show 200; inspect
the HTML refresh and final browser destination as well.

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

This is the historical audit record, not a new confirmation of the DNS/TLS
state. The SEO copy/redirect PR does not change DNS or certificate settings.

A mobile PageSpeed Insights request returned HTTP 429, so this audit did not
produce a Lighthouse score or real-user Core Web Vitals. Background video was
revised after that request; its current delivery settings are documented in
`showreel/README.md`. Media sizes alone do not establish a passing or failing
Core Web Vitals result.

## Checks in Google Search Console

Technical accessibility does not confirm indexing or a search position. In the
verified domain property:

1. Check that `https://igorszuniewicz.com/sitemap.xml` has been read successfully.
2. Inspect the homepage, contact page and main project URLs. Compare the
   Google-selected canonical with the declared canonical and review the last
   crawl and indexing status. Also inspect a restored legacy URL and confirm
   that Google discovers the corresponding current destination.
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
The code update does not diagnose a traffic drop, connect analytics, submit a
sitemap or change external professional profiles. Evaluate actual collaboration
inquiries separately from visits and email-link clicks.
See Google's [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
and [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
