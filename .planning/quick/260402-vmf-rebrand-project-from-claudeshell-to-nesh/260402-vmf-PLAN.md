# Quick Task 260402-vmf: Rebrand claudeshell → nesh

**Mode:** quick
**Date:** 2026-04-02
**Description:** Complete rebrand from claudeshell to nesh (nesh.sh domain)

## Task 1: Rebrand source code (TypeScript)

**Files:**
- `src/config.ts` — `ClaudeShellConfig` → `NeshConfig`, `~/.claudeshell` → `~/.nesh`, `.claudeshell.json` → `.nesh.json`
- `src/types.ts` — `ClaudeShellPermission` → `NeshPermission`
- `src/ai.ts` — imports + system prompt "You are ClaudeShell" → "You are Nesh"
- `src/cli.ts` — version string + error messages
- `src/shell.ts` — imports
- `src/chat.ts` — imports
- `src/pipe.ts` — error messages
- `src/prompt.ts` — prompt text "claudeshell" → "nesh"
- `src/templates.ts` — all 5 template prompt strings
- `src/history.ts` — `.claudeshell_history` → `.nesh_history`

**Action:** Find and replace all `ClaudeShell`/`claudeshell` references. Type/interface renames: `ClaudeShellConfig` → `NeshConfig`, `ClaudeShellPermission` → `NeshPermission`.

**Verify:** `npx tsc --noEmit` passes, `npx vitest run` passes

## Task 2: Rebrand package.json, README, CLAUDE.md, CI/CD, scripts

**Files:**
- `package.json` — name, bin, description, keywords, repository URL
- `README.md` — full rebrand (name, install commands, config paths, GitHub URLs, repo URL)
- `CLAUDE.md` — all references
- `.github/workflows/release.yml` — artifact names
- `scripts/build-binaries.sh` — binary name, comments

**Action:** Replace all `claudeshell`/`ClaudeShell` with `nesh`/`Nesh`. Update GitHub URLs from `tantantech/claudeshell` to `tantantech/nesh`. Update npm URLs. Domain references to `nesh.sh`.

**Verify:** Build succeeds, binary name correct

## Task 3: Rebrand landing page

**Files:**
- `landing/src/app/layout.tsx` — metadata title/description/keywords
- `landing/src/components/landing/hero.tsx` — install command, GitHub link, copy text
- `landing/src/components/landing/nav.tsx` — logo text, GitHub link
- `landing/src/components/landing/footer.tsx` — logo text, npm/GitHub links
- `landing/src/components/landing/cta.tsx` — install command, GitHub/npm links
- `landing/src/components/landing/terminal-demo.tsx` — PromptSegment text, title bar
- `landing/src/components/landing/features.tsx` — feature descriptions
- `landing/src/components/landing/how-it-works.tsx` — step descriptions

**Action:** Replace all `claudeshell`/`ClaudeShell` with `nesh`/`Nesh`. Update GitHub URLs to `tantantech/nesh`. Update npm URLs to `npmjs.com/package/nesh`. Update domain to `nesh.sh`.

**Verify:** `cd landing && npx next build` or visual check

## Task 4: Rebrand test files

**Files:** All files in `tests/` that reference `ClaudeShellConfig`, `ClaudeShellPermission`, `claudeshell`, etc.

**Action:** Update imports and string references to match renamed types and paths.

**Verify:** `npx vitest run` all tests pass

## Task 5: Rename GitHub repository

**Action:** Use `gh repo rename nesh` to rename the GitHub repository from `claudeshell` to `nesh`.

**Verify:** `gh repo view` shows new name
