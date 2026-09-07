# Build and publication boundary audit — 2026-09-08

Base: `199727d81678699bf68f1c4400020efe106371f7` (PR #91 merged).
This pass covers the active HTML generator, publication inputs and the Windows
preview launcher. It does not change the portfolio's design or content.

## Reproduced defects and fixes

### Music metadata crossing into markup

The static music index interpolated attribute text directly into HTML and used
it in a JavaScript replacement string. A title containing `$&`, `$1` or
another replacement sequence was interpreted as an instruction, corrupting the
index. Quoted titles containing `>` also confused the opening-tag matcher.

A harmless local browser probe additionally confirmed executable markup could
be introduced by a title containing an unterminated `details` opening tag.
The original metadata attribute stayed inert, but the generated list created
an element and fired its event handler. Chromium 144 reproduced a test sentinel
changing to 1 before the fix and remaining 0 after it, using output from the
actual page-transformation pipeline. No network request or real user data was
involved.

The new `scripts/build/music-index.cjs` isolates this transformation, respects
quoted attributes, keeps character references intact, escapes literal angle
brackets, and uses function replacements. Metadata normalization precedes the
other markup passes so they cannot mistake text inside an attribute for a tag.

**Threat boundary:** this requires influence over repository track metadata
before a build. There is no demonstrated visitor-controlled input or URL-based
exploit. This helper is not a general-purpose sanitizer for hostile HTML, and
repository contributors can already change executable source code.

### Publication source boundaries

Referenced legacy media already received canonical path checks. `staticCopy`
and the root of the first-party asset tree did not. Tests with synthetic private
canary files reproduced copying through an external file symlink, a symlinked
parent directory, and an external asset-tree root.

`scripts/build/source-paths.cjs` now supplies one canonical input check for those
paths, referenced media and the root favicon. Unsupported nested asset links
fail explicitly instead of disappearing silently. Invalid static-copy inputs
fail before publication; existing output remains untouched.

This protects against accidental out-of-repository publication. It is not a
sandbox for malicious build code, concurrent filesystem mutation or hard links.
The build configuration remains trusted executable JavaScript.

### Nested 404 pages and video descriptions

The error layout used a root-relative stylesheet but a relative script URL.
At a nested missing address that requested a nonexistent nested `assets/` path.
Error-page scripts now use the same root-relative policy as their stylesheets.
Ordinary page asset URLs remain unchanged.

The video-caption transform generated a new `aria-describedby` value even when
the caption had its own ID; it could also collide with an existing generated-
looking ID. It now reuses authored IDs and reserves unique IDs when needed.

### Windows preview launcher

`serve.bat` used `npx --yes http-server`, bypassing the checked-in preview server
and downloading a package at launch. It now runs `scripts/serve-dist.cjs` on port
8080, matching `npm run preview` including its loopback-only bind, canonical path
checks and byte-range handling. It prints the local URLs without auto-launching
a browser. The batch file received a static contract test, not a Windows GUI test.

## Validation and scope

- 27 new dependency-free Node regression tests passed locally on Node 22.16.0.
- The integration fixture runs the real builder and its real helper modules on
  a small temporary repository, including page validation, publication and
  `--check` preservation. It substitutes configuration and inputs, not build
  logic. Importing the builder no longer runs its CLI as a side effect.
- Nine of the 15 build-boundary assertions failed against the original build
  implementation with only its test interface adapted; all passed after the
  fixes. These are regression scenarios, not nine independent vulnerabilities.
- The actual generated metadata probe was checked in Chromium before and after
  the fix. No full-site visual, media-codec, Safari/iOS or Windows GUI audit is
  claimed by this pass.
- The existing pull-request workflow runs all existing and new tests and the
  full 47-page production build. Its result is recorded in the pull request.

Historical applications, hosting configuration and repository permission policy
were not changed. These fixes do not certify the entire repository as bug-free.
