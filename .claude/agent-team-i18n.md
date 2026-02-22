# 🌍 Claude Code Agent Teams – i18n Translation Management

> **Prompt do wklejenia w Claude Code**, żeby odpalić drużynę agentów do zarządzania tłumaczeniami.
> Skopiuj cały blok poniżej i wklej jako prompt w Claude Code (z włączonym Agent Teams).

---

## 🚀 Master Prompt (wklej to w Claude Code)

```
Create an agent team to fully audit and improve all i18n translations in this project.

## Project Context
- i18next with react-i18next
- 3 languages: English (en - source of truth), Polish (pl), Dutch (nl)
- 22 namespace JSON files per language in public/locales/{lang}/*.json
- Existing verification script: node scripts/verify-i18n.cjs
- Namespaces: common, home, about, contact, projects, projectDetail, music, soundDesign, gradwork, middlewareOptimization, shadowFrames, audioq, amorak, akantilado, pauseAndDeserve, notTodayDarling, wwiseUnrealFixer, rayAnimation, richter, unrealEngineRebuilder, transientica, notFound

## Team Structure – 4 Agents

### Agent 1: "SCOUT" – Finds Missing Keys
Role: Auditor / Detective
Task:
1. Run `node scripts/verify-i18n.cjs` and capture the output
2. For each namespace, load en/*.json, pl/*.json, and nl/*.json
3. Flatten all keys and cross-compare between languages
4. Produce a detailed report listing:
   - Keys present in EN but missing in PL
   - Keys present in EN but missing in NL
   - Keys present in PL or NL but missing in EN (orphans)
   - Empty string values ("") that need filling
   - Keys used in source code (src/**/*.tsx, src/**/*.ts) but not present in any locale file
5. Save the report as .claude/teams/i18n-audit-report.md
6. Broadcast the report to all teammates when done

Rules:
- Do NOT modify any translation files
- Be thorough – check every single namespace
- Flag any structural mismatches (e.g., key is a string in EN but an object in PL)

### Agent 2: "FIXER" – Fills Missing Translations
Role: Translator / Patcher
Task:
1. Wait for SCOUT's audit report
2. For each missing key identified by SCOUT:
   - If missing in PL: translate the EN value to natural Polish
   - If missing in NL: translate the EN value to natural Dutch
   - If missing in EN: check if the key is used in code; if yes create a sensible EN value, if orphaned leave a note
3. Add the missing keys to the correct namespace JSON files, maintaining alphabetical order within each nesting level
4. Preserve existing translations – do NOT overwrite any existing values
5. After all fixes, run `node scripts/verify-i18n.cjs` to confirm zero missing keys
6. Broadcast completion status to all teammates

Rules:
- Polish translations: write in natural, everyday Polish. Igor is a sound designer / audio designer – match that vibe
- Dutch translations: write in natural, standard Dutch (Netherlands, not Belgian)
- Maintain exact JSON structure and formatting (2-space indentation)
- Keep technical terms (React, TypeScript, Tailwind CSS, Wwise, Unreal Engine, MIDI) untranslated
- "Audio Designer" stays in English across all languages (it's a brand choice)

### Agent 3: "HUMANIZER" – Quality & Tone Review
Role: Linguist / Copy Editor
Task:
1. Wait for FIXER to complete
2. Go through ALL translation values in ALL namespaces for PL and NL
3. Flag and fix translations that:
   - Sound robotic, overly formal, or machine-translated
   - Use awkward phrasing or unnatural word order
   - Have inconsistent terminology (e.g., same concept translated differently across namespaces)
   - Use incorrect grammar, spelling, or diacritics
   - Don't match the tone: casual-professional, creative portfolio of a young sound designer
4. For Polish specifically:
   - Ensure proper Polish declension and conjugation
   - Avoid literal translations from English that sound unnatural
   - Use "Ty" form (informal) consistently for UI elements addressing the user
5. For Dutch specifically:
   - Use "je/jij" (informal) consistently, not "u" (formal)
   - Ensure proper Dutch word order (especially in subordinate clauses: SOV)
   - Check compound words are properly formed
6. Create a changelog: .claude/teams/i18n-humanization-log.md listing every change with before/after
7. Broadcast the changelog to all teammates

Rules:
- You MAY modify existing translations if they sound robotic or unnatural
- Document every change with reasoning
- When in doubt about a creative/artistic term, keep the English original
- The portfolio owner is Igor Szuniewicz – a sound/audio designer. Translations should feel like a creative professional's website, not a corporate site

### Agent 4: "GUARDIAN" – Final Verification & Consistency
Role: QA Engineer / Validator
Task:
1. Wait for HUMANIZER to complete
2. Run final validation:
   - `node scripts/verify-i18n.cjs` must pass with zero errors
   - Load every JSON file and verify it's valid JSON (no syntax errors)
   - Verify all three languages have identical key structures (same keys at same nesting levels)
   - Check no translation value is identical to its EN counterpart (unless it should be, like brand names or tech terms)
   - Verify no empty strings ("") remain
   - Check for any duplicate keys within the same file
3. Cross-reference with source code:
   - Grep src/**/*.tsx and src/**/*.ts for all t('...') and tCommon('...') calls
   - Verify every referenced key exists in all 3 languages
4. Produce final status report: .claude/teams/i18n-final-report.md with:
   - Total keys per language per namespace
   - Any remaining issues or warnings
   - Summary of all changes made by the team
5. If issues found, message FIXER or HUMANIZER to fix them

Rules:
- This is the last line of defense – be strict
- If verification fails, coordinate with the responsible agent to fix it
- The project must build successfully after all changes: `npm run build`

## Coordination Rules
- SCOUT goes first, then FIXER, then HUMANIZER, then GUARDIAN
- Each agent broadcasts their completion status
- If any agent finds critical issues, they message the relevant agent
- All reports go to .claude/teams/ directory
- When done, GUARDIAN summarizes everything for me
```

---

## ⚙️ Jak użyć

### Krok 1: Włącz Agent Teams
```powershell
# W ustawieniach Claude Code lub jako env variable:
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
Najlepiej w tmux / Windows Terminal z wieloma panelami:
```powershell
claude --teammate-mode tmux
```

---

## 📋 Czego się spodziewać

| Agent | Co robi | Output |
|-------|---------|--------|
| 🔍 SCOUT | Skanuje wszystkie 22 × 3 pliki JSON + source code | `i18n-audit-report.md` |
| 🔧 FIXER | Uzupełnia brakujące klucze tłumaczeniami PL/NL | Zmodyfikowane pliki JSON |
| ✨ HUMANIZER | Poprawia brzmienie na naturalne i spójne | `i18n-humanization-log.md` |
| 🛡️ GUARDIAN | Walidacja końcowa + build check | `i18n-final-report.md` |

---

## 🎯 Uwagi
- **EN jest source of truth** – od niego zaczynamy
- **"Audio Designer"** zostaje po angielsku we wszystkich wersjach (decyzja brandingowa)
- Techniczne nazwy (React, Wwise, Unreal Engine itp.) nie są tłumaczone
- Ton: profesjonalny ale kreatywny, portfolio młodego sound designera, nie korporacja
