---
phase: 11-syntax-highlighting-profiles-plugin-management
plan: 01
subsystem: ui
tags: [ansi, syntax-highlighting, tokenizer, shell, readline]

requires: []
provides:
  - "Pure shell tokenizer (tokenize) classifying command/flag/string/path/operator/argument tokens"
  - "Command validity cache via compgen -c with non-blocking 60s refresh"
  - "ANSI syntax highlighting renderer with 16ms frame budget and cursor restore"
affects: [11-05-wiring-plan]

tech-stack:
  added: []
  patterns: [raw-ansi-colors, pure-tokenizer, fire-and-forget-refresh, visible-length-arithmetic]

key-files:
  created:
    - src/highlighting/tokenizer.ts
    - src/highlighting/commands.ts
    - src/highlighting/renderer.ts
    - tests/highlighting/tokenizer.test.ts
    - tests/highlighting/renderer.test.ts
  modified: []

key-decisions:
  - "Raw ANSI codes instead of picocolors for renderer -- always-on colors since renderer only runs in TTY mode"
  - "Fire-and-forget compgen -c refresh with 5s subprocess timeout"
  - "Visible length via ANSI-strip regex for all cursor arithmetic"

patterns-established:
  - "Raw ANSI color map pattern for TTY-only rendering (bypasses picocolors env detection)"
  - "Token start-offset tracking for whitespace-preserving colorization"
  - "Module-level Set with non-blocking background refresh for command cache"

requirements-completed: [HLGT-01, HLGT-02, HLGT-03]

duration: 4min
completed: 2026-04-05
---

# Phase 11 Plan 01: Syntax Highlighting Engine Summary

**Pure shell tokenizer, compgen-based command cache, and ANSI renderer with 16ms frame budget for real-time input coloring**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-05T16:28:17Z
- **Completed:** 2026-04-05T16:31:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Pure tokenizer classifying 7 token types (command, command-invalid, flag, string, path, operator, argument) with correct start offsets
- Command validity cache populated via `compgen -c` with 60s non-blocking refresh and plugin alias merging
- ANSI renderer with raw color codes, cursor position restore via visible-length arithmetic, and 16ms frame budget enforcement

## Task Commits

Each task was committed atomically:

1. **Task 1: Tokenizer and command cache modules** - `129ff4c` (feat)
2. **Task 2: Highlighting renderer with 16ms frame budget** - `4858830` (feat)

## Files Created/Modified
- `src/highlighting/tokenizer.ts` - Pure tokenize() function splitting shell input into typed tokens with start offsets
- `src/highlighting/commands.ts` - Command validity cache via compgen -c with fire-and-forget refresh
- `src/highlighting/renderer.ts` - ANSI colorize/renderHighlighted/clearHighlighting with 16ms budget
- `tests/highlighting/tokenizer.test.ts` - 15 tests covering all token types, operators, offsets, edge cases
- `tests/highlighting/renderer.test.ts` - 12 tests covering colorize output, TTY guard, clear sequence

## Decisions Made
- Used raw ANSI escape codes instead of picocolors for the renderer since it only runs in TTY mode and picocolors disables colors in non-TTY environments (like tests)
- Fire-and-forget compgen -c refresh with 5s subprocess timeout to prevent blocking
- Visible length via ANSI-strip regex (`/\x1b\[[^m]*m/g`) for all cursor movement arithmetic

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Switched from picocolors to raw ANSI codes in renderer**
- **Found during:** Task 2 (Highlighting renderer)
- **Issue:** Plan specified picocolors but it auto-disables colors in non-TTY environments, producing no ANSI output in tests and potentially in piped scenarios
- **Fix:** Used raw ANSI escape codes with a COLOR_MAP record, since the renderer is guarded by isTTY check anyway
- **Files modified:** src/highlighting/renderer.ts
- **Verification:** All 12 renderer tests pass with ANSI assertions
- **Committed in:** 4858830

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for testability and correctness. No scope creep.

## Issues Encountered
None beyond the picocolors deviation noted above.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all modules are fully implemented with real data sources.

## Next Phase Readiness
- Tokenizer, command cache, and renderer are ready to be wired into shell.ts keypress events (Plan 05)
- Command cache integrates with plugin registry via addKnownCommands()

---
*Phase: 11-syntax-highlighting-profiles-plugin-management*
*Completed: 2026-04-05*
