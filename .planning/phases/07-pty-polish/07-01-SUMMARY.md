---
phase: 07-pty-polish
plan: 01
subsystem: terminal
tags: [pty, interactive, spawn, stdio-inherit, vim, ssh]

requires:
  - phase: 01-shell-foundation
    provides: CommandResult type and spawn pattern from passthrough.ts
provides:
  - isInteractiveCommand detection function with D-07 command list
  - executeInteractive with stdio inherit for full terminal control
  - interactiveRunning field on ShellState
  - interactive_commands config option for user extensibility
affects: [07-02-pty-polish]

tech-stack:
  added: []
  patterns: [stdio-inherit spawn for interactive commands, pipe-detection guard]

key-files:
  created: [src/interactive.ts, tests/interactive.test.ts]
  modified: [src/types.ts, src/config.ts, src/shell.ts]

key-decisions:
  - "Pipes always reject interactive detection per D-09 -- simplest safe heuristic"
  - "stderr is always empty string for interactive commands since stdio is fully inherited"

patterns-established:
  - "Interactive detection: extract first word, check against set, reject pipes"
  - "User-extensible command lists via config array merged at call site"

requirements-completed: [PTY-01]

duration: 2min
completed: 2026-04-02
---

# Phase 7 Plan 1: Interactive Command Detection Summary

**Interactive command detection module with 16-command default set, pipe rejection, user-extensible list, and stdio-inherit execution**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-02T19:53:57Z
- **Completed:** 2026-04-02T19:56:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created interactive.ts with isInteractiveCommand and executeInteractive exports
- DEFAULT_INTERACTIVE covers 16 commands: vim, vi, nvim, nano, emacs, less, more, man, top, htop, btop, ssh, telnet, tmux, screen, fzf
- Pipe detection rejects commands containing | to avoid broken interactive sessions
- User-extensible via interactive_commands config array
- 23 unit tests covering all detection and execution behaviors
- ShellState and NeshConfig updated with new fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Create interactive.ts module with detection and execution** - `62f8cb0` (feat)
2. **Task 2: Add interactiveRunning to ShellState and interactive_commands to Config** - `ddac79a` (feat)

## Files Created/Modified
- `src/interactive.ts` - Interactive command detection and stdio-inherit execution
- `tests/interactive.test.ts` - 23 unit tests for detection and execution
- `src/types.ts` - Added interactiveRunning boolean to ShellState
- `src/config.ts` - Added interactive_commands array to NeshConfig with parsing
- `src/shell.ts` - Initialize interactiveRunning to false

## Decisions Made
- Pipes always reject interactive detection per D-09 -- simplest safe heuristic that avoids broken terminal states
- stderr is always empty string for interactive commands since all stdio is inherited (no capture possible)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added interactiveRunning initialization in shell.ts**
- **Found during:** Task 2
- **Issue:** Adding interactiveRunning to ShellState interface caused TypeScript error in shell.ts where state object is created
- **Fix:** Added `interactiveRunning: false` to initial state object in shell.ts
- **Files modified:** src/shell.ts
- **Verification:** npx tsc --noEmit passes cleanly
- **Committed in:** ddac79a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for TypeScript compilation. No scope creep.

## Issues Encountered
- Pre-existing failures in tests/shell.integration.test.ts (6 tests) unrelated to this plan's changes. Verified by running tests before and after changes -- same failures both times.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- interactive.ts ready for integration in Plan 02 (shell.ts wiring)
- interactiveRunning state field ready for toggle during interactive execution
- interactive_commands config ready for user customization

---
*Phase: 07-pty-polish*
*Completed: 2026-04-02*
