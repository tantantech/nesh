---
phase: 05-pipe-unix-integration
plan: 01
subsystem: pipe
tags: [pipe, unix, stdin, stdout, cli]
dependency_graph:
  requires: [ai.ts, renderer.ts, config.ts, types.ts]
  provides: [pipe.ts, pipe-mode-detection]
  affects: [cli.ts]
tech_stack:
  added: []
  patterns: [async-stdin-collection, tty-detection, unix-pipe-citizen]
key_files:
  created: [src/pipe.ts, tests/pipe.test.ts]
  modified: [src/cli.ts]
decisions:
  - "collectStdin accepts injectable stream param for testability (default process.stdin)"
  - "runPipe accepts injectable stream param for testability (default process.stdin)"
  - "Binary detection via null byte check after full collection (not per-chunk)"
metrics:
  duration: 2min
  completed: "2026-04-02T18:35:00Z"
---

# Phase 05 Plan 01: Pipe Mode Summary

Pipe-mode stdin detection and plain-text output routing via new pipe.ts module with TDD coverage.

## What Was Done

### Task 1: Create pipe.ts module with runPipe() and collectStdin() (TDD)
- **Commit:** df871d5
- Created `src/pipe.ts` with two exported functions:
  - `collectStdin(stream?)`: Async stdin collection with binary rejection (null bytes), 1MB hard limit, 100KB warning to stderr
  - `runPipe(cliPrompt, stream?)`: Combines CLI prompt with stdin content (separator: `\n\n---\n\n`), routes through executeAI with isTTY:false renderer, cost footer to stderr
- Created `tests/pipe.test.ts` with 10 unit tests covering all behaviors
- TDD flow: RED (module not found) -> GREEN (all 10 pass)

### Task 2: Wire pipe mode into cli.ts entry point
- **Commit:** b7072a2
- Updated `src/cli.ts` to detect `!process.stdin.isTTY` before REPL entry
- `--version` check remains first (handles `echo test | claudeshell --version`)
- Non-TTY stdin routes to `runPipe()` with CLI args as prompt
- REPL only entered when stdin IS a TTY (else block)

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Injectable stream parameters**: Both `collectStdin` and `runPipe` accept an optional stream parameter (defaulting to `process.stdin`) for testability without complex process.stdin mocking
2. **Binary detection after collection**: Null byte check runs on the full collected string rather than per-chunk, keeping the logic simple
3. **Error handler in pipe callbacks**: onError writes to stderr with newline (not using picocolors) since pipe output must be clean

## Verification

- All 10 pipe tests pass (`npx vitest run tests/pipe.test.ts`)
- TypeScript compiles with zero errors (`npx tsc --noEmit`)
- Pipe mode correctly detected via `!process.stdin.isTTY`

## Known Stubs

None -- all functionality is fully wired.

## Self-Check: PASSED

- src/pipe.ts: FOUND
- tests/pipe.test.ts: FOUND
- 05-01-SUMMARY.md: FOUND
- Commit df871d5: FOUND
- Commit b7072a2: FOUND
