---
phase: 12-batch-port-migration-discovery
plan: 03
subsystem: plugins
tags: [hooks, plugins, lazy-loading, dynamic-import, oh-my-zsh]

requires:
  - phase: 12-batch-port-migration-discovery/01
    provides: Plugin catalog (PLUGIN_CATALOG) with 300+ entries including hook category
provides:
  - 18 hand-written hook plugins in src/plugins/hooks/
  - Lazy-loading loadBundledPlugins() function with dynamic imports
  - PLUGIN_CATEGORY lookup table for category-based module resolution
  - PLUGIN_CATALOG_LIST lightweight search array
affects: [12-batch-port-migration-discovery, plugin-manager, shell-startup]

tech-stack:
  added: []
  patterns: [hook-plugin-pattern, lazy-loading-dynamic-import, category-directory-routing]

key-files:
  created:
    - src/plugins/hooks/colored-man-pages.ts
    - src/plugins/hooks/timer.ts
    - src/plugins/hooks/per-directory-history.ts
    - src/plugins/hooks/dotenv.ts
    - src/plugins/hooks/last-working-dir.ts
    - src/plugins/hooks/bgnotify.ts
    - src/plugins/hooks/magic-enter.ts
    - src/plugins/hooks/nvm-auto.ts
    - src/plugins/hooks/safe-paste.ts
    - src/plugins/hooks/copybuffer.ts
    - src/plugins/hooks/dircycle.ts
    - src/plugins/hooks/dirpersist.ts
    - src/plugins/hooks/poetry-env.ts
    - src/plugins/hooks/pipenv-env.ts
    - src/plugins/hooks/globalias.ts
    - src/plugins/hooks/zbell.ts
    - src/plugins/hooks/python-venv.ts
    - src/plugins/hooks/thefuck.ts
    - tests/hooks-plugins.test.ts
  modified:
    - src/plugins/index.ts

key-decisions:
  - "Used catalog names (e.g., python-venv, nvm-auto, pipenv-env) instead of plan shortnames for consistency with PLUGIN_CATALOG"
  - "safe-paste is a documentation-only placeholder since bracketed paste requires terminal raw mode"
  - "BUNDLED_PLUGINS retained as synchronous export for backward compatibility with shell.ts, plugin-reload.ts, plugin-manager.ts"

patterns-established:
  - "Hook plugin pattern: export const plugin: PluginManifest with hooks/aliases/init properties, try/catch in all handlers"
  - "Category directory routing: PLUGIN_CATEGORY maps name to subdirectory for dynamic import()"
  - "Lazy loading: loadBundledPlugins() only imports enabled plugins, root-level plugins resolve from static BUNDLED_PLUGINS"

requirements-completed: [PORT-05, PORT-01]

duration: 3min
completed: 2026-04-05
---

# Phase 12 Plan 03: Hook Plugins and Lazy-Loading Index Summary

**18 hand-written hook plugins (env, notifications, venv auto-activation, directory persistence) with lazy-loading index refactor using dynamic imports and category routing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-05T18:07:26Z
- **Completed:** 2026-04-05T18:10:49Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments
- Created 18 hook plugins covering env manipulation, desktop notifications, Python venv auto-activation, directory persistence, and command timing
- Refactored plugin index with loadBundledPlugins() async function using dynamic import() for on-demand loading
- Added PLUGIN_CATEGORY lookup table and PLUGIN_CATALOG_LIST for downstream consumers
- All 628 tests pass including 37 new hook plugin validation tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create hook plugins (~18 hand-written)** - `1ea87f9` (feat)
2. **Task 2: Refactor plugin index to lazy-loading with PLUGIN_CATEGORY lookup** - `b0a7fd8` (feat)

## Files Created/Modified
- `src/plugins/hooks/colored-man-pages.ts` - Sets LESS_TERMCAP env vars for colorized man pages
- `src/plugins/hooks/timer.ts` - Shows execution time for commands exceeding 5s threshold
- `src/plugins/hooks/per-directory-history.ts` - Per-directory HISTFILE based on cwd hash
- `src/plugins/hooks/dotenv.ts` - Auto-loads .env files on cd
- `src/plugins/hooks/last-working-dir.ts` - Saves/restores last working directory
- `src/plugins/hooks/bgnotify.ts` - Desktop notification for long-running commands (macOS/Linux)
- `src/plugins/hooks/magic-enter.ts` - Runs git status + ls on empty enter
- `src/plugins/hooks/nvm-auto.ts` - Auto-switches Node version via .nvmrc
- `src/plugins/hooks/safe-paste.ts` - Placeholder (requires terminal raw mode)
- `src/plugins/hooks/copybuffer.ts` - Clipboard copy alias (pbcopy/xclip)
- `src/plugins/hooks/dircycle.ts` - Directory stack cycling
- `src/plugins/hooks/dirpersist.ts` - Persistent directory stack to ~/.nesh/dirstack
- `src/plugins/hooks/poetry-env.ts` - Auto-activates Poetry virtualenv on cd
- `src/plugins/hooks/pipenv-env.ts` - Auto-activates Pipenv virtualenv on cd
- `src/plugins/hooks/globalias.ts` - Global alias expansion hook
- `src/plugins/hooks/zbell.ts` - Terminal bell for commands exceeding 15s
- `src/plugins/hooks/python-venv.ts` - Auto-activates venv/.venv on cd
- `src/plugins/hooks/thefuck.ts` - Alias for thefuck command correction
- `tests/hooks-plugins.test.ts` - Import validation tests for all 18 plugins
- `src/plugins/index.ts` - Added loadBundledPlugins, PLUGIN_CATEGORY, PLUGIN_CATALOG_LIST

## Decisions Made
- Used catalog names (python-venv, nvm-auto, pipenv-env) instead of plan shortnames for consistency with PLUGIN_CATALOG
- safe-paste is documentation-only placeholder since bracketed paste requires terminal raw mode access
- BUNDLED_PLUGINS retained as synchronous export for backward compatibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Vitest dynamic imports needed `.ts` extension instead of `.js` — fixed import paths in test file
- safe-paste has no hooks/aliases/init — adjusted test to accept description-only plugins

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 18 hook plugins ready for use via the plugin framework
- loadBundledPlugins() ready for integration into shell startup path
- PLUGIN_CATEGORY and PLUGIN_CATALOG_LIST available for plugin management CLI

---
*Phase: 12-batch-port-migration-discovery*
*Completed: 2026-04-05*
