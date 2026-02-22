# 🧹 Claude Code Agent Teams – Full Codebase Cleanup & Polish

> **Prompt do wklejenia w Claude Code**, żeby odpalić drużynę agentów do kompletnego sprzątania i uporządkowania kodu.
> Skopiuj cały blok poniżej i wklej jako prompt w Claude Code (z włączonym Agent Teams).

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to perform a comprehensive codebase cleanup and polish. Every file, every line, every import – make it pristine.

## Project Context
- Vite + React 18 + TypeScript + Tailwind CSS 3 + Framer Motion
- i18next for translations (3 languages: en, pl, nl)
- Deployed to GitHub Pages
- Structure: src/ with components/ (features/, home/, layout/, ui/), pages/, types/, hooks/, utils/, constants/, context/, data/
- ESLint flat config with strict TypeScript rules
- Path alias: @/* -> src/*

## Known Issues Found During Audit
Root-level junk files: b64.js, b64.py, builder.cjs, w.cjs, check_audio.js, fix_all.js, fix_script.py, force_audio.js, diff_ap.txt, diff_hero.txt, diff_layout.txt, diff_navbar.txt, full_diff.txt, uncommitted_diff.txt, temp_research.md
Dead directories: v2/, new-portfolio/
Legacy scripts: scripts/legacy/ (21 files)
Empty animation config in tailwind.config.js
Mixed line-endings (CRLF/LF) in some files

## Team Structure – 8 Agents

### Agent 1: "JANITOR" – Root-Level Cleanup
Role: File System Cleaner
Task:
1. Identify and list ALL files in the project root that are NOT essential project config
2. Essential root files to KEEP: index.html, package.json, package-lock.json, tsconfig.json, tsconfig.node.json, vite.config.ts, vitest.config.ts, eslint.config.js, postcss.config.js, tailwind.config.js, README.md, .gitignore, .env
3. Files to DELETE (after confirming they're not imported/referenced anywhere):
   - b64.js, b64.py, builder.cjs, w.cjs
   - check_audio.js, fix_all.js, fix_script.py, force_audio.js
   - diff_ap.txt, diff_hero.txt, diff_layout.txt, diff_navbar.txt, full_diff.txt, uncommitted_diff.txt
   - temp_research.md
4. Evaluate the scripts/legacy/ directory (21 files) – if none are imported or used by package.json scripts, delete the entire legacy/ folder
5. Check if v2/ and new-portfolio/ directories are referenced anywhere – if not, add them to .gitignore (do NOT delete, user may want them)
6. Check dist/ is in .gitignore (build artifact)
7. Update .gitignore if needed
8. Broadcast list of deletions to all teammates

Rules:
- Before deleting ANY file, grep the entire project for references to it
- If uncertain, add to .gitignore instead of deleting
- Create a backup list in .claude/teams/deleted-files-manifest.md with the full path and first 5 lines of each deleted file
- Do NOT touch node_modules, .git, .github, .claude, .auto-claude, or public/ directories

### Agent 2: "ARCHITECT" – Project Structure & Config
Role: Configuration & Structure Optimizer
Task:
1. Review and optimize vite.config.ts:
   - Fix mixed line endings (normalize to LF)
   - Ensure manualChunks is optimal for the current dependency set
   - Verify the copy-404 plugin is clean and well-typed
2. Review and optimize tailwind.config.js:
   - Remove the empty `animation: {}` object
   - Verify all custom colors are actually used in the codebase
   - Check that the `gold` color isn't duplicating `accent` (both are #c17f3e)
   - Ensure fontFamily entries match actual Google Fonts loaded in index.html
3. Review and optimize eslint.config.js:
   - Verify ignore patterns are complete and current
   - Consider adding accessibility rules (eslint-plugin-jsx-a11y) if not too invasive
4. Review postcss.config.js for completeness
5. Review tsconfig.json:
   - Verify compiler options are optimal for the project
   - Ensure path aliases work correctly
6. Review package.json:
   - Check for unused dependencies
   - Verify all scripts still work and are needed
   - Ensure version numbers are appropriate
7. Normalize ALL config files to consistent line endings (LF)
8. Broadcast all config changes to teammates

Rules:
- Do NOT change the visual appearance of the site
- Maintain backward compatibility with existing code
- Document every config change with a comment explaining why

### Agent 3: "TYPEGUARD" – TypeScript Types & Interfaces
Role: Type System Perfectionist
Task:
1. Audit all files in src/types/:
   - Ensure consistent naming conventions (PascalCase for types/interfaces)
   - Remove any unused type exports
   - Add proper JSDoc comments to complex types
   - Ensure no `any` types exist (tsconfig has strict: true)
   - Check for duplicate type definitions across files
   - Verify index.ts re-exports everything cleanly
2. Audit ALL component files for inline types:
   - Extract component prop types to dedicated interfaces
   - Move shared types to src/types/ if used by multiple components
   - Ensure all event handlers are properly typed
   - Replace `React.FC` with explicit return types if used inconsistently
3. Audit hooks (usePortfolioData.ts, useProjectFilter.ts):
   - Ensure return types are explicit
   - Ensure proper generic constraints
4. Audit utils/index.ts:
   - Verify all utility function parameter and return types
5. Audit context/AudioContext.tsx:
   - Ensure context value type is properly defined
   - Check for proper null/undefined handling
6. Create a brief type audit report: .claude/teams/type-audit.md
7. After all changes, run `npx tsc --noEmit` to verify zero TypeScript errors

Rules:
- Never use `any` type – find the proper type
- Prefer `interface` over `type` for object shapes (unless union types needed)
- Use `readonly` where appropriate
- Ensure consistent formatting of type files (alphabetical exports, grouped imports)

### Agent 4: "STYLIST" – CSS & Tailwind Cleanup
Role: Styling Perfectionist
Task:
1. Audit src/index.css:
   - Normalize line endings
   - Organize sections with clear comment headers
   - Remove any duplicate or overridden styles
   - Verify all custom classes (.skip-to-main, .animate-fade-in-up, .editorial-rule, .drop-cap, .bg-noise) are actually used
   - Ensure CSS custom properties align with Tailwind config
2. Audit ALL component files for Tailwind usage:
   - Find and fix inconsistent spacing patterns (e.g., mixing p-4 and p-[16px])
   - Identify duplicate utility combinations that could be extracted to components
   - Check for hardcoded colors that should use Tailwind theme tokens
   - Verify responsive breakpoints are used consistently (sm:, md:, lg:, xl:)
   - Find and fix any use of !important in Tailwind classes
3. Check for CSS/Tailwind anti-patterns:
   - Long className strings that should be split or extracted
   - Inline styles that should be Tailwind classes
   - Duplicate styling across similar components
4. Verify dark mode consistency (the entire site is dark-themed)
5. Check that all fonts referenced in CSS/Tailwind are loaded in index.html
6. Create style cleanup report: .claude/teams/style-audit.md

Rules:
- Do NOT change the visual design – only organize and clean the code
- Keep all custom CSS that has a purpose
- If extracting shared styles, use @apply in index.css or create component classes
- Ensure screen sizes / breakpoints are handled consistently across all pages

### Agent 5: "SURGEON" – Component Code Quality
Role: React Component Perfectionist
Task:
1. Audit EVERY component file (all 41+ components across features/, home/, layout/, ui/):
   - Ensure consistent file structure: imports → types → component → export
   - Standardize import ordering: React → third-party → internal → types → styles
   - Remove unused imports
   - Ensure all components have proper displayName for dev tools
   - Check for proper React key usage in lists
   - Verify useCallback/useMemo is used where appropriate (expensive computations, passed callbacks)
   - Check for memory leaks (cleanup in useEffect)
   - Ensure error boundaries wrap appropriate sections
2. Audit ALL page files (11 pages):
   - Same standards as components
   - Verify SEO component is used on every page
   - Check that lazy loading is properly implemented
   - Verify proper loading states
3. Review App.tsx:
   - Clean up safeLazy implementation
   - Verify route structure matches ROUTES constants
4. Review main.tsx for best practices
5. Check src/hooks/:
   - Ensure hooks follow rules of hooks
   - Proper dependency arrays in useEffect/useMemo/useCallback
   - Return cleanup functions where needed
6. Check src/context/AudioContext.tsx:
   - Proper context pattern (separate Provider component)
   - Proper memoization of context value
7. Handle component-specific issues:
   - ContactForm.tsx: validate form handling
   - AudioPlayer.tsx: verify audio resource cleanup
   - Showreel.tsx, ImageLightbox.tsx: verify proper media handling
   - CodeViewer.tsx: check for proper code highlighting
8. Run ESLint after all changes: `npx eslint . --max-warnings 0`

Rules:
- Do NOT change component behavior or appearance
- Focus purely on code quality, consistency, and correctness
- Every component should follow the exact same structure pattern
- If splitting a component into smaller ones would improve readability, do it (but keep exports stable)
- Preserve all existing functionality perfectly

### Agent 6: "LIBRARIAN" – Imports, Exports & Module Organization
Role: Module Structure Specialist
Task:
1. Audit import paths across ALL source files:
   - Convert all relative imports that go up 2+ levels (../../) to use the @/ alias
   - Ensure consistent import style: `import X from '@/...'` for internal modules
   - Group and sort imports in every file:
     1. React & React DOM
     2. Third-party libs (framer-motion, react-router-dom, lucide-react, etc.)
     3. Internal components (@/components/...)
     4. Internal hooks (@/hooks/...)
     5. Internal utils (@/utils/...)
     6. Internal types (@/types/...)
     7. Internal constants & data (@/constants/..., @/data/...)
     8. Styles (if any CSS imports)
   - Remove all unused imports
2. Verify barrel exports:
   - src/types/index.ts exports everything correctly
   - Check if components/ needs barrel exports (index.ts files)
   - Verify constants/routes.ts is properly structured
3. Check for circular dependencies:
   - Trace import chains and identify any circular references
   - Restructure if found
4. Verify all default vs named exports are consistent:
   - Pages: default export (for lazy loading)
   - Components: default or named (be consistent within category)
   - Hooks: named export
   - Utils: named export
   - Types: named export
5. After all changes, verify build: `npm run build`

Rules:
- The @/ alias must resolve correctly (already configured in tsconfig and vite.config)
- Do NOT break any lazy imports in App.tsx (they require default exports)
- Keep import statements clean: one import per line for readability
- Use `import type { ... }` for type-only imports (TypeScript 5 feature)

### Agent 7: "SCRIBE" – Documentation & Comments
Role: Documentation Engineer
Task:
1. Add JSDoc comments to EVERY exported function, component, hook, and utility:
   - @description - what it does
   - @param - for each parameter
   - @returns - what it returns
   - @example - for complex utilities
2. Review and update README.md:
   - Accurate project description
   - Tech stack listing
   - Setup instructions (install, dev, build, deploy)
   - Project structure overview
   - Available scripts
3. Add file-level comments to key files explaining their purpose:
   - App.tsx, main.tsx, i18n.ts
   - Each page file
   - AudioContext.tsx
   - portfolioData.json structure
4. Clean up existing comments:
   - Remove TODO/FIXME comments that have been resolved
   - Remove commented-out code blocks
   - Fix typos in comments
   - Ensure all comments are in English
5. Add inline comments for complex logic:
   - safeLazy error recovery in App.tsx
   - Audio playback logic
   - Dynamic i18n key resolution
   - Portfolio data filtering logic
6. Check for empty or stub functions that lack explanation

Rules:
- Comments should explain WHY, not WHAT (the code already shows what)
- Keep JSDoc concise but complete
- Use standard JSDoc tags (@param, @returns, @throws, @example)
- Do NOT over-comment obvious code
- All comments in English
- Maximum 80 characters per comment line for readability

### Agent 8: "SENTINEL" – Final QA & Verification
Role: Quality Assurance Lead
Task:
1. Run ALL verification checks in order:
   a. `npx tsc --noEmit` → zero TypeScript errors
   b. `npx eslint . --max-warnings 0` → zero ESLint warnings/errors
   c. `npm run build` → successful production build
   d. `npm run test` → all tests pass
   e. `node scripts/verify-i18n.cjs` → zero i18n issues
2. Verify no regressions:
   - Check that all routes defined in constants/routes.ts match lazy imports in App.tsx
   - Verify portfolioData.json is valid JSON and all referenced image/media paths exist
   - Check that tracks.json is valid and all audio file paths are valid
   - Verify no broken imports (everything resolves)
3. File system cleanliness:
   - No leftover backup files (.bak, .orig, .old)
   - No leftover temp files
   - .gitignore covers all generated/temporary content
   - Check for any files > 100KB that shouldn't be in source control (excluding data JSONs and images)
4. Code consistency final pass:
   - All files use LF line endings
   - No trailing whitespace
   - Consistent indentation (2 spaces for TS/TSX, 2 spaces for JSON/CSS)
   - No console.log or console.error left in production code (except error boundaries)
   - No debugger statements
5. Performance sanity check:
   - Verify bundle chunks are reasonable sizes
   - Check for unnecessary re-renders (inline object/array props)
   - Verify images in public/ are reasonably sized
6. If ANY check fails, send a targeted message to the responsible agent to fix it
7. Produce the final report: .claude/teams/cleanup-final-report.md
   - Checklist of all verifications ✅/❌
   - Summary of total files modified, deleted, created
   - Before/after metrics (file count, total size, ESLint warnings)
   - Remaining recommendations that couldn't be auto-fixed

Rules:
- This is the FINAL GATEKEEPER – nothing ships without your sign-off
- Be ruthlessly thorough
- If any agent introduced a bug, coordinate the fix before signing off
- The production build MUST succeed
- Log every verification step and its result

## Execution Order & Dependencies

```
Phase 1 (parallel):
  JANITOR → cleans files
  ARCHITECT → fixes configs

Phase 2 (parallel, after Phase 1):
  TYPEGUARD → fixes types
  STYLIST → fixes CSS/Tailwind
  LIBRARIAN → fixes imports

Phase 3 (after Phase 2):
  SURGEON → fixes components (needs clean types, imports, and styles)

Phase 4 (after Phase 3):
  SCRIBE → documents everything (needs final code to document)

Phase 5 (after Phase 4):
  SENTINEL → validates everything (last line of defense)
```

## Coordination Rules
- Each agent broadcasts completion status after finishing their phase
- If an agent discovers something in another agent's domain, message that agent directly
- SENTINEL has authority to send any agent back to fix issues
- All reports go to .claude/teams/ directory
- When fully done, SENTINEL summarizes everything for me

## Critical Constraints
- DO NOT CHANGE visual appearance or behavior of the website
- All changes must be purely structural, organizational, and quality improvements
- The production build MUST work perfectly after all changes
- Preserve ALL existing functionality
- Git commit should be clean: one meaningful commit per agent, or squash into one "Codebase cleanup & polish" commit
```

---

## ⚙️ Jak użyć

### Krok 1: Włącz Agent Teams
```powershell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
```

### Krok 2: Odpal Claude Code w projekcie
```powershell
cd c:\Users\iszun\Documents\GitHub\igorszuniewicz
claude
```

### Krok 3: Wklej Master Prompt
Skopiuj cały blok z sekcji **Master Prompt** powyżej i wklej go jako swój prompt.

### Krok 4: Obserwuj pracę zespołu
```powershell
claude --teammate-mode tmux
```

---

## 📋 Przegląd Drużyny

| # | Agent | Rola | Faza | Co robi |
|---|-------|------|------|---------|
| 🧹 | **JANITOR** | Sprzątacz | 1 | Usuwa śmieci, legacy pliki, martwe katalogi |
| 🏗️ | **ARCHITECT** | Konfiguracja | 1 | Optymalizuje Vite, Tailwind, ESLint, tsconfig |
| 🛡️ | **TYPEGUARD** | Typy TS | 2 | Porządkuje system typów, eliminuje `any` |
| 🎨 | **STYLIST** | CSS/Tailwind | 2 | Czyści style, spójność kolorów i breakpointów |
| 📚 | **LIBRARIAN** | Importy | 2 | Porządkuje importy, @/ aliasy, barrel exports |
| 🔬 | **SURGEON** | Komponenty | 3 | Kod komponentów: structure, hooks, memoization |
| ✍️ | **SCRIBE** | Dokumentacja | 4 | JSDoc, README, komentarze, cleanup TODO |
| 🏁 | **SENTINEL** | QA Finałowy | 5 | Build, lint, tsc, testy — ostateczna walidacja |

---

## 🎯 Uwagi

- **Żadnych zmian wizualnych** — agenty poprawiają kod, nie design
- **Build musi przejść** — SENTINEL sprawdza to na końcu
- **Fazy są sekwencyjne** — każda buduje na poprzedniej
- **8 agentów = głębokość** — każdy ma wąską specjalizację, dzięki czemu nic nie umknie
- Można uruchomić ten team razem z **agent-team-i18n.md** jako oddzielny commit
