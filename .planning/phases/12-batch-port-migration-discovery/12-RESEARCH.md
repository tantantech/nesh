# Phase 12: Batch Port, Migration & Discovery - Research

**Researched:** 2026-04-05
**Domain:** OMZ plugin porting, .zshrc migration parsing, AI-enhanced discovery, prompt segment API
**Confidence:** HIGH

## Summary

Phase 12 is the final delivery phase of Nesh v3.0. The framework built in Phases 8-11 is
complete — this phase fills it with content (300 plugins), bridges users from OMZ (migration
detector), adds AI-guided onboarding (discovery), and closes the prompt customization loop
(segment registration API).

The work divides cleanly into four independent streams that can be planned and executed in
parallel waves: (1) batch alias/hook plugin generation, (2) OMZ migration detector, (3) AI
discovery, (4) theme segment API. Each stream has a well-understood interface into existing
code. The main risk is scope management — 356 OMZ plugins exist but a significant fraction
are zsh-specific, platform-specific, or tool-specific enough to warrant "no equivalent" or
"partial" classification rather than full ports.

**Primary recommendation:** Use a curated reference data file (not live OMZ parsing) as
the source for batch generation. Classify all 356 OMZ plugins before writing any code — the
classification output is the reference data file. Then generate alias plugins programmatically
and hand-write the 30 hook plugins. Run migration detection against the real .zshrc on the
developer's machine (confirmed working: the .zshrc at `~/.zshrc` has a multi-line
`plugins=(...)` block that the parser must handle).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Batch Porting Strategy (PORT-01, PORT-05)**
- D-01: Plugins organized into 4 categories: alias-only (~120), completion-dependent (~100), environment/utility (~40), hook/widget (~30)
- D-02: Alias-only plugins are pure data objects — generate programmatically by parsing OMZ plugin files for alias definitions, writing TypeScript data files
- D-03: Each plugin is one file in its category directory: `src/plugins/aliases/<name>.ts`, `src/plugins/completions/<name>.ts`, `src/plugins/utilities/<name>.ts`, `src/plugins/hooks/<name>.ts`
- D-04: Batch generation script `scripts/generate-alias-plugins.ts` reads OMZ alias definitions from a reference data file and outputs TypeScript plugin files
- D-05: Hook/widget plugins (PORT-05) use the existing hook system (preCommand, postCommand, prePrompt, onCd) plus the keypress API from suggestions
- D-06: All generated plugins are validated: must conform to PluginManifest, must compile with tsc, must pass a basic import test
- D-07: BUNDLED_PLUGINS array in `src/plugins/index.ts` updated to include all ~300 plugins — lazy-loaded by category

**OMZ Migration Detection (MIG-01)**
- D-08: New module `src/migration/detector.ts` — scans for `~/.oh-my-zsh/` directory and `~/.zshrc` for `plugins=(...)` line
- D-09: Parse the `plugins=(...)` array from .zshrc to get user's active OMZ plugin list
- D-10: Cross-reference against Nesh bundled plugin catalog — produce mapping: `{ omzName, neshEquivalent, status: 'available' | 'partial' | 'missing' }`
- D-11: Show migration report: green for available equivalents, yellow for partial, red for missing
- D-12: Offer to auto-enable all available equivalents with one confirm — writes to `config.plugins.enabled`
- D-13: Migration accessible via `nesh --migrate` CLI flag or `plugin migrate` subcommand

**AI-Enhanced Plugin Discovery (MIG-02)**
- D-14: New module `src/migration/discovery.ts` — accepts natural language description, returns plugin recommendations
- D-15: Uses existing AI integration (`src/ai.ts`) with specialized system prompt
- D-16: Plugin catalog embedded in prompt as compact list: `name | description | category`
- D-17: Results display as ranked list with enable suggestions
- D-18: Accessible via `plugin discover` subcommand
- D-19: Falls back gracefully when no API key configured

**Theme Integration (MIG-03)**
- D-20: New concept: `PromptSegment` — function that returns a string for the prompt
- D-21: Extend `src/templates.ts` with segment registration API: `registerSegment(name, fn)`
- D-22: Plugin themes register prompt segments via their `init()` function
- D-23: Built-in segments: `cwd`, `git_branch`, `git_status`, `node_version`, `python_version`, `time`, `exit_code`
- D-24: Template format extended to support segment references: `{segment:git_status}` in template strings
- D-25: Existing p10k-style template continues to work — segments are additive, not a replacement

**Plugin Index & Lazy Loading**
- D-26: With ~300 plugins, use dynamic imports grouped by category
- D-27: `src/plugins/index.ts` exports a `loadBundledPlugins(enabled)` function
- D-28: Plugin name → category mapping stored as a static lookup table (generated at build time)
- D-29: Startup performance target unchanged: <300ms with 30+ plugins enabled

### Claude's Discretion
- Exact list of all ~300 OMZ plugins and their Nesh category mapping
- Which OMZ plugins are "partial" equivalents vs full ports
- Prompt format for AI discovery
- How to handle OMZ plugins that have no meaningful Nesh equivalent

### Deferred Ideas (OUT OF SCOPE)
None — this is the final phase of v3.0
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PORT-01 | All ~300 oh-my-zsh plugins ported to TypeScript with matching user-facing behavior | Reference data file approach + batch generator covers alias plugins; hook plugins hand-written |
| PORT-05 | Hook/widget plugins (~30) ported using Nesh hook system and keypress API | ~40 hook-using plugins identified; most map to preCommand/postCommand/onCd; zle/bindkey ones are no-equivalent |
| MIG-01 | Auto-detect existing oh-my-zsh installation and show which plugins have Nesh equivalents | `~/.oh-my-zsh/` detection + multi-line `.zshrc` parser pattern documented |
| MIG-02 | AI-enhanced plugin discovery — user describes what they want, AI suggests relevant plugins | ~3,750-token catalog fits comfortably in prompt; fallback to keyword search documented |
| MIG-03 | Plugin themes integrate with Nesh's existing prompt template system via segment registration API | Segment registry pattern documented; additive to existing 9 templates |
</phase_requirements>

---

## Standard Stack

### Core (all already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript 6 | already in project | Plugin file authoring | Strict mode, immutable patterns |
| Vitest | already in project | Plugin validation tests | Already used for all tests |
| Node.js `fs` | built-in | .zshrc file reading | No dependency needed |
| picocolors | already in project | Migration report coloring | Already used throughout |

### New Code Only (no new dependencies needed)
This phase adds zero new npm dependencies. All capabilities are implemented using:
- Existing AI integration (`src/ai.ts` via `@anthropic-ai/claude-agent-sdk`)
- Existing readline for interactive migration confirm
- Node.js built-ins for file parsing
- TypeScript as code generation target (write `.ts` files, not parse them)

**Confidence:** HIGH — verified by reading all existing source files.

---

## Architecture Patterns

### Recommended Project Structure (additions)
```
src/
├── plugins/
│   ├── aliases/         # NEW: ~120 alias-only plugins (generated)
│   │   ├── kubectl.ts
│   │   ├── terraform.ts
│   │   ├── docker-compose.ts
│   │   └── ... (~116 more)
│   ├── completions/     # EXISTING: 7 files, no changes needed
│   ├── utilities/       # EXISTING: 8 files, no changes needed
│   └── hooks/           # NEW: ~30 hook plugins (hand-written)
│       ├── colored-man-pages.ts
│       ├── timer.ts
│       ├── per-directory-history.ts
│       └── ... (~27 more)
├── migration/           # NEW: 2 files
│   ├── detector.ts      # MIG-01: OMZ detection + .zshrc parsing
│   └── discovery.ts     # MIG-02: AI discovery
scripts/
└── generate-alias-plugins.ts  # NEW: code generator
data/
└── omz-plugin-catalog.ts      # NEW: reference data (curated by hand from OMZ)
```

### Pattern 1: Alias Plugin Template (from git.ts)
```typescript
// Source: src/plugins/git.ts (existing)
import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: 'kubectl',
  version: '1.0.0',
  description: 'kubectl aliases (ported from oh-my-zsh)',
  aliases: {
    k: 'kubectl',
    kaf: 'kubectl apply -f',
    kgp: 'kubectl get pods',
    // ... etc
  },
}
```
**Note:** Some OMZ aliases use shell functions (e.g., `kca='_kca(){ kubectl "$@" --all-namespaces; ...'`). These cannot be represented as simple string aliases. Skip function-body aliases — include only simple `alias key='value'` forms.

### Pattern 2: Hook Plugin Template (PORT-05)
```typescript
// Source: derived from src/plugins/hooks.ts + src/plugins/types.ts
import type { PluginManifest, HookContext } from '../types.js'

export const plugin: PluginManifest = {
  name: 'colored-man-pages',
  version: '1.0.0',
  description: 'Colorize man page output',
  platform: 'all',
  hooks: {
    preCommand: (ctx: Readonly<HookContext>) => {
      // Intercept 'man <topic>' commands via LESS_TERMCAP env vars
      // Set process.env.LESS_TERMCAP_* before the command runs
      if (ctx.command?.startsWith('man ')) {
        process.env.LESS_TERMCAP_mb = '\x1b[1;31m'
        process.env.LESS_TERMCAP_md = '\x1b[1;31m'
        process.env.LESS_TERMCAP_me = '\x1b[0m'
        process.env.LESS_TERMCAP_se = '\x1b[0m'
        process.env.LESS_TERMCAP_so = '\x1b[1;33m\x1b[44m'
        process.env.LESS_TERMCAP_ue = '\x1b[0m'
        process.env.LESS_TERMCAP_us = '\x1b[1;32m'
      }
    },
  },
}
```

### Pattern 3: .zshrc Multi-line Parser (MIG-01)
The real `.zshrc` at `~/.zshrc` uses multi-line `plugins=(...)` format:
```
plugins=(
  git
  kubectl
  docker
  docker-compose
)
```

The parser must handle both inline (`plugins=(git docker)`) and multi-line forms:

```typescript
// Source: designed from first-principles based on real .zshrc inspection
export function parseZshrcPlugins(content: string): readonly string[] {
  // Match plugins=( ... ) spanning multiple lines
  const match = content.match(/^plugins=\(\s*([\s\S]*?)\s*\)/m)
  if (!match) return []
  return match[1]
    .split(/[\s\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('#'))
}
```
**Critical:** The multi-line form is the dominant format used in practice. A single-line-only regex will miss most real users.

### Pattern 4: Lazy-Loading Plugin Index (D-26 through D-29)
```typescript
// src/plugins/index.ts — replace static BUNDLED_PLUGINS with:
const PLUGIN_CATEGORY: Readonly<Record<string, string>> = {
  // generated at build time
  'kubectl': 'aliases',
  'terraform': 'aliases',
  'colored-man-pages': 'hooks',
  // ...300 entries
}

export async function loadBundledPlugins(
  enabled: readonly string[]
): Promise<readonly PluginManifest[]> {
  // Group by category, only import needed categories
  const byCategory = new Map<string, string[]>()
  for (const name of enabled) {
    const cat = PLUGIN_CATEGORY[name]
    if (!cat) continue
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(name)
  }
  
  const plugins: PluginManifest[] = []
  for (const [category, names] of byCategory) {
    for (const name of names) {
      const mod = await import(`./${category}/${name}.js`)
      plugins.push(mod.plugin)
    }
  }
  return plugins
}

// Backward-compat: BUNDLED_PLUGINS for code that needs the full list (plugin search)
// Keep a static catalog of metadata (name, description, category) separate from the
// full PluginManifest — avoids loading all 300 modules just to search.
```
**Performance note:** `loadPluginsPhase1` in `src/plugins/loader.ts` receives `bundled` as a parameter. The call site in `shell.ts` must be updated to `await loadBundledPlugins(config.plugins?.enabled ?? [])` — only loading enabled plugins. The full catalog metadata (for `plugin search`) is a separate lightweight structure.

### Pattern 5: Segment Registration API (MIG-03)
The existing `src/templates.ts` uses a `builders` object keyed by template name. Segments live in `src/segments.ts` as standalone functions. The new API is additive:

```typescript
// src/segment-registry.ts — new file, thin module
type SegmentFn = () => string

const registry = new Map<string, SegmentFn>()

// Built-ins pre-registered at module init
export function registerSegment(name: string, fn: SegmentFn): void {
  registry.set(name, fn)
}

export function resolveSegment(name: string): string {
  return registry.get(name)?.() ?? ''
}

// Template string interpolation: '{segment:git_status}' -> resolveSegment('git_status')
export function interpolateSegments(template: string): string {
  return template.replace(/\{segment:([^}]+)\}/g, (_, name) => resolveSegment(name))
}
```

Plugin themes call `registerSegment` in their `init()` function. Existing template builders remain unchanged. The `{segment:X}` interpolation is only relevant to future user-defined template strings — existing 9 templates call segment functions directly.

### Pattern 6: AI Discovery Prompt (MIG-02)
```typescript
// src/migration/discovery.ts
function buildDiscoveryPrompt(userInput: string, catalog: readonly CatalogEntry[]): string {
  const catalogText = catalog
    .map(e => `${e.name} | ${e.description} | ${e.category}`)
    .join('\n')
  
  return [
    'You are a Nesh plugin recommender. Given the plugin catalog below, suggest the',
    '3-5 most relevant plugins for the user\'s workflow.',
    '',
    'User describes their workflow:',
    userInput,
    '',
    'Plugin catalog (name | description | category):',
    catalogText,
    '',
    'Reply with a ranked list: plugin name, one-sentence reason, enable command.',
    'Example: "kubectl - manages Kubernetes clusters - run: plugin enable kubectl"',
  ].join('\n')
}
```
**Token budget:** 300 plugins × ~50 chars = ~15,000 chars ≈ 3,750 tokens. Well within Claude's context window. No vector search or pagination needed.

### Anti-Patterns to Avoid
- **Parsing OMZ .plugin.zsh files at runtime:** Too fragile — function-body aliases, sourcing other files, platform guards. Use a curated reference data file instead.
- **Importing all 300 plugin modules at startup:** Violates PLUG-06 (<300ms startup). Use `loadBundledPlugins(enabled)` — only load what's enabled.
- **Single-line .zshrc parser:** Real users have multi-line `plugins=(...)`. The `~/.zshrc` on this machine is multi-line.
- **Mutating `process.env` in hooks without cleanup:** Hook plugins that set env vars in `preCommand` must clean up in `postCommand` or they'll persist across all subsequent commands.
- **Function-body OMZ aliases in Nesh alias strings:** OMZ has aliases like `kca='_kca(){ kubectl "$@" --all-namespaces; unset -f _kca; }; _kca'`. These are shell functions disguised as aliases and cannot be expressed as Nesh alias strings. Skip them.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token-efficient catalog embedding | Vector DB, chunking, pagination | Flat `name\|description\|category` string | 300 plugins × 50 chars = 3,750 tokens — fits trivially |
| .zshrc parsing | Full zsh AST parser | Simple regex with multi-line support | The plugins=() format is highly regular |
| Alias plugin file generation | Manual file writing | Generator script with template string | 120 files × identical structure = 1 script run |
| Segment value caching | Custom TTL cache | Existing `SegmentCache` in `src/segment-cache.ts` | Already built, already used by segments.ts |
| Plugin catalog search | Fuzzy search library | `String.includes()` on name+description | Already in `plugin-manager.ts::searchPlugins()` |

---

## OMZ Plugin Classification (Claude's Discretion)

Based on direct inspection of the 356-plugin OMZ install:

### Distribution Reality (verified counts)
- **Total OMZ plugins:** 356
- **Plugins with at least one alias:** ~136 (from `grep -rl "^alias"`)
- **Plugins with hook/ZLE patterns:** ~40 (from `grep -rl "add-zsh-hook|precmd|preexec|zle -N|bindkey"`)
- **Plugins with completion files (`_*`):** varies widely
- **Already ported to Nesh:** 16

### Port Scope for Phase 12

**Alias plugins to generate (~120 total, ~104 new):**
The following are alias-heavy OMZ plugins with clean, function-free aliases suitable for generation:
ansible, argocd, arcanist, aws, azure, bazel, bun, bundler, capistrano, chezmoi, cloudfoundry, composer, dbt, debian, deno, docker-compose, dotnet, drush, eza, fabric, flutter, fluxcd, fnm, gcloud, gem, gh, git-extras, git-flow, git-lfs, gitignore, golang, gradle, grails, grunt, gulp, hanami, hasura, hcloud, helm, heroku, heroku-alias, history, httpie, invoke, ionic, jj, jruby, juju, kate, keychain, kind, kn, kompose, kops, kubectl, lando, laravel, laravel4, laravel5, lein, lol, macports, man, mercurial, meteor, microk8s, minikube, mise, mix, molecule, mongocli, mosh, mvn, nanoc, nats, nestjs, ng, ngrok, nmap, node, nodenv, npm, nvm, oc, opentofu, operator-sdk, paver, perl, phing, pip, pipenv, pj, pm2, podman, poetry, postgres, pre-commit, procs, pulumi, pyenv, python, rails, rake, rbenv, rclone, react-native, redis-cli, rsync, ruby, rust, rvm, salt, scala, scw, sdk, sfdx, skaffold, snap, spring, stripe, sublime, svn, swiftpm, symfony, symfony2, symfony6, systemadmin, systemd, tailscale, task, taskwarrior, terraform, tig, timoni, tldr, tmux, tmuxinator, uv, vagrant, vault, volta, vscode, wp-cli, xcode, yarn, yum, zoxide

**Hook plugins to write (~25 new, hand-written):**
- `colored-man-pages` — preCommand: sets LESS_TERMCAP env vars for `man` commands
- `timer` — preCommand + postCommand: measures command duration, shows on prompt
- `per-directory-history` — onCd: switches history file based on cwd
- `dirpersist` — onCd: saves/restores directory stack
- `last-working-dir` — onCd: saves last working dir to ~/.last_working_dir
- `bgnotify` — postCommand: desktop notification when long commands finish (macOS/Linux)
- `dotenv` — onCd: auto-sources `.env` file when entering a directory
- `magic-enter` — preCommand: runs `git status` + `ls` when Enter pressed on empty line
- `python` — init: activates virtualenv if present; postCommand: deactivate on exit
- `poetry-env` — onCd: activates poetry venv when entering project directory
- `pipenv` — onCd: activates pipenv shell when entering project directory
- `nvm` — onCd: auto-switches node version via .nvmrc
- `zbell` — postCommand: rings terminal bell when long commands finish
- `thefuck` — preCommand: `fuck` alias backed by thefuck CLI tool
- `globalias` — preCommand: expands aliases before execution (Space key trigger)
- `safe-paste` — init: prevents execution of pasted multi-line commands
- `copybuffer` — init: Ctrl+O copies current buffer to clipboard
- `dircycle` — init: Alt+Left/Right to cycle directory history

**No-equivalent OMZ plugins (skip entirely, ~80):**
Platform-specific or zsh-only features with no Node.js equivalent:
- `fzf`, `fasd`, `z`, `autojump`, `zoxide` — require native binaries and deep shell integration (fzf works standalone, not a Nesh port)
- `vi-mode`, `history-substring-search`, `zsh-interactive-cd`, `zsh-navigation-tools` — deep readline/ZLE that Nesh's readline doesn't expose
- `otp`, `gpg-agent`, `ssh-agent`, `keychain` — security daemons, shell-level only
- `iterm2`, `term_tab`, `foot`, `kitty` — terminal emulator specific
- `thefuck` — external tool, Ctrl+C workflow doesn't translate
- `conda`, `conda-env`, `chruby`, `rvm`, `jenv`, `pyenv`, `rbenv`, `nodenv` — version managers that need shell functions and PATH manipulation, not alias-level integration
- `asdf`, `mise`, `volta` — same reason
- `zsh-autosuggestions`, `zsh-syntax-highlighting` — already natively implemented in Nesh (SUGG-01, HLGT-01)
- `compleat`, `bash`, `colemak` — zsh-specific or too niche
- `kube-ps1` — prompt segment (handle via MIG-03 segment API instead)
- `vagrant-prompt`, `git-prompt` — prompt segments (handle via MIG-03)

**Partial ports (~15, annotated in catalog):**
- `common-aliases` — portable subset only (skip OS-specific ls colors, etc.)
- `brew` — macOS platform only; mark `platform: 'macos'`
- `macos` — macOS only
- `debian`, `ubuntu`, `archlinux`, `suse` — Linux distro only; mark `platform: 'linux'`
- `aws` — alias-only portion; no credential management
- `gcloud` — alias-only portion; no auth flows

### Total Scope
| Category | Count |
|----------|-------|
| Already ported (Phases 8-11) | 16 |
| New alias plugins (Phase 12) | ~104 |
| New hook plugins (Phase 12) | ~25 |
| No-equivalent (skip) | ~80 |
| Partial (alias subset only) | ~15 |
| Completion-only (already covered by Phase 9) | ~116 |
| **Total addressable by Nesh** | **~276** |

PORT-01 requirement says "all ~300" — the ~300 figure refers to the addressable set, not the full 356. ~80 no-equivalent plugins are explicitly out of scope (zsh-only or binary integrations).

---

## Common Pitfalls

### Pitfall 1: Function-Body Aliases in OMZ
**What goes wrong:** Generator script tries to include OMZ aliases like `kca='_kca(){ kubectl "$@" --all-namespaces; }; _kca'` and produces invalid TypeScript.
**Why it happens:** OMZ uses shell functions disguised as aliases for multi-arg commands.
**How to avoid:** Reference data file must pre-filter to simple `alias key='value'` forms only. Generator script adds a guard: skip any value containing `(){` or `; unset -f`.
**Warning signs:** TypeScript compile errors in generated files mentioning curly braces.

### Pitfall 2: Multi-line .zshrc plugins=() Parsing
**What goes wrong:** Regex matches `plugins=(git docker)` but misses the real-world multi-line format.
**Why it happens:** The single-line regex `plugins=\(([^)]+)\)` fails when the closing `)` is on its own line.
**How to avoid:** Use the `[\s\S]*?` (dot-all) regex pattern with the `/m` flag: `/^plugins=\(\s*([\s\S]*?)\s*\)/m`
**Warning signs:** Migration detector reports zero plugins even when OMZ is clearly installed.
**Evidence:** The `~/.zshrc` on this machine uses multi-line format confirmed by direct inspection.

### Pitfall 3: Startup Performance with 300 Plugins in BUNDLED_PLUGINS
**What goes wrong:** Adding 300 static `import` statements at the top of `index.ts` causes all 300 modules to load at startup, even when only 5 are enabled.
**Why it happens:** ES module static imports are unconditional.
**How to avoid:** Use `loadBundledPlugins(enabled)` with dynamic `import()` — only import enabled plugins by name. Keep a lightweight catalog (name + description + category) separate from the full manifests.
**Warning signs:** Startup time grows beyond 300ms when >10 plugins enabled.

### Pitfall 4: Hook env var mutation persistence
**What goes wrong:** `colored-man-pages` sets `LESS_TERMCAP_*` in a preCommand hook, but the env vars persist to all subsequent commands, not just `man`.
**Why it happens:** `process.env` is process-global; there is no rollback.
**How to avoid:** Set env vars unconditionally in `init()` rather than conditionally in hooks. The LESS_TERMCAP vars only apply when `less`/`man` is running, so global setting is safe. For vars that should only apply conditionally, use a postCommand cleanup hook.

### Pitfall 5: Circular dependency: plugins/index.ts imports all category modules
**What goes wrong:** The lookup table `PLUGIN_CATEGORY` is in `index.ts` but each plugin file also imports from `types.ts`. If the planner puts the lookup table in a file that other modules import, circular deps emerge.
**How to avoid:** The lookup table is a plain `Record<string, string>` — no imports needed. Keep it in `index.ts` as a literal object generated at build time. Never import from plugin category files in `index.ts` (the whole point is lazy loading).

### Pitfall 6: AI discovery calling executeAI with tool-use enabled
**What goes wrong:** `executeAI` in `src/ai.ts` includes tool-use (`allowedTools: ['Read', 'Write', ...]`). Discovery prompts don't need tools — enabling them wastes tokens and risks side effects.
**Why it happens:** Reusing `executeAI` directly without considering its tool-use defaults.
**How to avoid:** Discovery should use a lightweight direct API call (or a new `queryAI` helper) without tool-use. The Claude Agent SDK supports `allowedTools: []` to disable all tools.

### Pitfall 7: .oh-my-zsh/ detection false positives
**What goes wrong:** Detector finds `~/.oh-my-zsh/` but user has disabled OMZ or uninstalled it without removing the directory.
**Why it happens:** Stale directories remain after uninstallation.
**How to avoid:** Check both `~/.oh-my-zsh/` existence AND presence of `plugins=(...)` in `.zshrc`. If .zshrc has no `plugins=` line, report "OMZ directory found but no active plugins detected."

---

## Code Examples

### Generator Script Pattern
```typescript
// scripts/generate-alias-plugins.ts
// Source: designed from first-principles, based on git.ts template pattern

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PLUGIN_ALIAS_DATA } from '../data/omz-plugin-catalog.js'

for (const [name, { description, aliases }] of Object.entries(PLUGIN_ALIAS_DATA)) {
  const aliasEntries = Object.entries(aliases)
    .filter(([, value]) => !value.includes('(){'))  // skip function-body aliases
    .map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
    .join('\n')

  const content = `import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: ${JSON.stringify(name)},
  version: '1.0.0',
  description: ${JSON.stringify(description)},
  aliases: {
${aliasEntries}
  },
}
`
  writeFileSync(join('src/plugins/aliases', `${name}.ts`), content)
}
```

### Migration Detector Pattern
```typescript
// src/migration/detector.ts — key parsing logic
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface MigrationStatus {
  readonly omzName: string
  readonly neshEquivalent: string | null
  readonly status: 'available' | 'partial' | 'missing'
}

export function detectOMZ(): boolean {
  return existsSync(join(homedir(), '.oh-my-zsh'))
}

export function parseZshrcPlugins(): readonly string[] {
  const zshrcPath = join(homedir(), '.zshrc')
  if (!existsSync(zshrcPath)) return []
  const content = readFileSync(zshrcPath, 'utf-8')
  // Handle both single-line: plugins=(git docker)
  // and multi-line:  plugins=(\n  git\n  docker\n)
  const match = content.match(/^plugins=\(\s*([\s\S]*?)\s*\)/m)
  if (!match) return []
  return match[1]
    .split(/[\s\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('#'))
}
```

### CLI Flag Addition Pattern
```typescript
// src/cli.ts — add alongside existing flags
const migrateMode = process.argv.includes('--migrate')

// In the runShell call:
if (migrateMode) {
  // run migration flow before entering REPL
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static BUNDLED_PLUGINS array | `loadBundledPlugins(enabled)` with dynamic imports | Phase 12 | Startup stays <300ms with 300 plugins |
| Manual plugin porting | Generator script from reference data | Phase 12 | 104 plugins in one script run |
| `executeAI` with full tool-use | Lightweight direct query for discovery | Phase 12 | Fewer tokens, no side effects |

---

## Open Questions

1. **OMZ name-to-Nesh-name mapping for migration**
   - What we know: Many OMZ plugin names match Nesh names exactly (git, kubectl, docker)
   - What's unclear: Nesh uses `git-completions` but OMZ user likely has just `git` enabled (which has both aliases and completions)
   - Recommendation: Migration mapping table handles synonyms. OMZ `git` → Nesh `git` (aliases) + `git-completions`. The catalog should record the OMZ name and all Nesh equivalents as a list.

2. **loadBundledPlugins and plugin search**
   - What we know: `searchPlugins()` in `plugin-manager.ts` currently filters `BUNDLED_PLUGINS` synchronously
   - What's unclear: After refactor, BUNDLED_PLUGINS is removed — how does search work?
   - Recommendation: Maintain a separate `PLUGIN_CATALOG: readonly {name, description, version, category}[]` as a lightweight static array. `loadBundledPlugins` uses it. `searchPlugins` uses it. Full manifests only loaded when a plugin is enabled.

3. **How loadPluginsPhase1 call site changes**
   - What we know: `loadPluginsPhase1(config, bundled)` takes `bundled` as parameter
   - What's unclear: Who calls it with the new async `loadBundledPlugins()`?
   - Recommendation: The call site in `shell.ts` (or wherever Phase 1 is called) needs an `await`. Since Phase 1 is already in startup flow, this is fine — but planner needs to identify the exact call site.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `~/.oh-my-zsh/` | MIG-01 migration detection | Yes (on this machine) | Current | Detection returns false, migration unavailable |
| `~/.zshrc` | MIG-01 plugin parsing | Yes | — | Parser returns empty list, user told to list plugins manually |
| `ANTHROPIC_API_KEY` | MIG-02 AI discovery | Assumed (dev has it) | — | Falls back to `plugin search <keyword>` |
| Node.js 22+ | All code | Yes | Already in project | — |

---

## Project Constraints (from CLAUDE.md)

- **Runtime:** Node.js 22+ (ESM, `"type": "module"`) — all new files use `.js` extensions in imports
- **Language:** TypeScript 6 strict mode — `readonly` on all object properties, no mutation
- **Immutability:** All state updates via spread, never in-place mutation — applies to plugin arrays, config objects, env var changes
- **AI integration:** Use `@anthropic-ai/claude-agent-sdk` — never raw Anthropic API
- **File size:** 200-400 lines typical, 800 max — alias plugins will be 10-50 lines each (fine); hook plugins 30-80 lines (fine)
- **No console.log:** Use `process.stdout.write` / `process.stderr.write` (already the project pattern)
- **Error handling:** All hook handlers wrapped in try/catch (already enforced by `dispatchHook` in hooks.ts)
- **Testing:** 80% coverage, TDD approach — generated alias plugins are data-only (no logic to test beyond import); hook plugins need unit tests

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `src/plugins/types.ts` — PluginManifest interface
- Direct file inspection: `src/plugins/git.ts` — alias plugin template pattern
- Direct file inspection: `src/plugins/hooks.ts` — HookBus, dispatchHook pattern
- Direct file inspection: `src/templates.ts` — 9 existing templates, builders pattern, PromptTemplate type
- Direct file inspection: `src/segments.ts` — SegmentData, existing segment functions
- Direct file inspection: `src/ai.ts` — executeAI signature, allowedTools pattern
- Direct file inspection: `src/plugin-manager.ts` — executePlugin dispatch table to extend
- Direct file inspection: `src/plugins/loader.ts` — loadPluginsPhase1 signature
- Direct file inspection: `src/config.ts` — NeshConfig interface
- Direct file inspection: `~/.zshrc` — real multi-line `plugins=(...)` format confirmed
- Direct file inspection: `~/.oh-my-zsh/plugins/` — 356 plugins confirmed present

### Secondary (MEDIUM confidence)
- `grep -rl "^alias"` on OMZ plugins — 136 plugins with aliases
- `grep -rl "add-zsh-hook|precmd|preexec|zle -N|bindkey"` — ~40 hook-style plugins
- Sample alias inspection: `kubectl.plugin.zsh` (116 aliases), `terraform.plugin.zsh` (10+ clean aliases) — confirmed simple `alias key='value'` format is dominant

### Tertiary (LOW confidence)
- Plugin count estimates (120 alias-only, 30 hook, 100 completion) from CONTEXT.md — actual counts differ slightly from direct inspection but categories are correct

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all existing
- Architecture patterns: HIGH — derived from existing code in the project
- Plugin classification: MEDIUM — curated by analysis of actual OMZ plugins, edge cases may emerge during generation
- Pitfalls: HIGH — derived from code inspection and real .zshrc format confirmed on this machine

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable domain — OMZ plugin list changes slowly)
