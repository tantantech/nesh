---
phase: 12-batch-port-migration-discovery
plan: 05
subsystem: plugins
tags: [migration, discovery, cli, lazy-loading, profiles, omz]

requires:
  - phase: 12-batch-port-migration-discovery (Plans 02-04)
    provides: segment registry, lazy-loading index, migration detector, AI discovery
provides:
  - migrate subcommand wired into plugin manager
  - discover subcommand wired into plugin manager
  - --migrate CLI flag for pre-REPL migration flow
  - lazy-loading shell startup via loadBundledPlugins()
  - search expanded to full ~300 plugin catalog
  - profiles updated with Phase 12 alias and hook plugins
affects: [phase-13, plugin-ecosystem]

tech-stack:
  added: []
  patterns: [lazy-import for subcommands, loadBundledPlugins async startup]

key-files:
  created: []
  modified:
    - src/plugin-manager.ts
    - src/cli.ts
    - src/shell.ts
    - src/plugins/profiles.ts
    - tests/plugin-manager.test.ts

key-decisions:
  - "migrateCmd and discoverCmd use lazy dynamic imports to keep plugin-manager fast"
  - "Shell startup awaits loadBundledPlugins() -- safe since runShell is already async"
  - "Profiles add only plugins with existing files in aliases/ and hooks/ directories"

patterns-established:
  - "Lazy import pattern for optional subcommands: await import('./module.js') inside handler"

requirements-completed: [PORT-01, MIG-01, MIG-02, MIG-03]

duration: 4min
completed: 2026-04-05
---

# Phase 12 Plan 05: Integration Wiring Summary

**Wired migrate/discover subcommands, --migrate CLI flag, lazy-loading startup, and expanded profiles into the shell**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-05T18:12:38Z
- **Completed:** 2026-04-05T18:16:38Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `plugin migrate` subcommand that detects OMZ installation, generates migration report, and auto-enables available equivalents
- Added `plugin discover` subcommand with AI-powered and keyword-based plugin recommendations
- Added `--migrate` CLI flag that runs migration flow before entering the REPL
- Replaced static BUNDLED_PLUGINS with async loadBundledPlugins() for lazy-loading at shell startup
- Expanded plugin search from 16 to ~300 plugins using PLUGIN_CATALOG_LIST
- Updated all profiles (developer, devops, cloud, ai-engineer) with Phase 12 alias and hook plugins

## Task Commits

Each task was committed atomically:

1. **Task 1: Add migrate and discover subcommands to plugin manager + update search** - `c642368` (feat)
2. **Task 2: Add --migrate CLI flag, update shell startup, update profiles** - `4837fb8` (feat)

## Files Created/Modified
- `src/plugin-manager.ts` - Added migrateCmd, discoverCmd, updated searchPlugins to use PLUGIN_CATALOG_LIST, updated help
- `src/cli.ts` - Added --migrate flag detection, passed migrateMode to runShell
- `src/shell.ts` - Replaced BUNDLED_PLUGINS with loadBundledPlugins(), added migration mode handler before REPL
- `src/plugins/profiles.ts` - Added node, npm, yarn, python, ruby, rust, kubectl, terraform, helm, docker-compose, ansible, colored-man-pages, timer, aws, azure, gcloud, heroku, poetry-env, pip to profiles
- `tests/plugin-manager.test.ts` - Added PLUGIN_CATALOG_LIST to mock

## Decisions Made
- migrateCmd and discoverCmd use lazy dynamic imports to keep plugin-manager startup fast
- Shell startup awaits loadBundledPlugins() since runShell is already async -- no perf regression
- Only added plugins to profiles that have existing files in aliases/ and hooks/ directories

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated test mock for PLUGIN_CATALOG_LIST**
- **Found during:** Task 2 verification
- **Issue:** Test mock for plugins/index.js did not export PLUGIN_CATALOG_LIST, causing 3 test failures in search tests
- **Fix:** Added PLUGIN_CATALOG_LIST array to the vi.mock definition with sample entries matching test expectations
- **Files modified:** tests/plugin-manager.test.ts
- **Verification:** All 628 tests pass
- **Committed in:** 4837fb8 (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Test mock needed updating for the new export -- standard maintenance, no scope creep.

## Issues Encountered
None

## Known Stubs
None -- all wiring connects to real implementations from Plans 02-04.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 12 is now fully integrated -- all 5 plans complete
- Plugin ecosystem ready for testing and iteration
- Migration, discovery, lazy-loading, profiles, and catalog search all wired end-to-end

---
*Phase: 12-batch-port-migration-discovery*
*Completed: 2026-04-05*
