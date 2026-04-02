---
phase: 04-sessions-chat-mode
plan: 02
subsystem: ai
tags: [claude-sdk, model-selection, session-resume, cost-display, streaming]

requires:
  - phase: 04-01
    provides: "UsageInfo, CostAccumulator, AIResult types; session.ts helpers; cost.ts extractUsage/formatUsage"
provides:
  - "Model flag parsing (--haiku/--sonnet/--opus) in classify.ts"
  - "Session resume and model selection wired into SDK query in ai.ts"
  - "AIResult return type from executeAI with session_id and usage"
  - "renderCostFooter standalone export in renderer.ts"
affects: [04-03, shell.ts integration, chat-mode]

tech-stack:
  added: []
  patterns: ["model flag extraction before prompt parsing", "SDK result capture pattern for session/usage"]

key-files:
  created: []
  modified: [src/classify.ts, src/ai.ts, src/renderer.ts, tests/classify.test.ts]

key-decisions:
  - "Model flags parsed as first token after 'a ' prefix, not as general flags"
  - "renderCostFooter is standalone export, not part of Renderer interface -- shell.ts controls when to show"
  - "SDK result message cast through unknown for safe property access without coupling to SDK types"

patterns-established:
  - "extractModelFlag pattern: first-token flag extraction returning cleaned prompt"
  - "AIResult capture: stream loop captures session_id and usage from result message"

requirements-completed: [SESS-01, SESS-03, VIS-01]

duration: 3min
completed: 2026-04-02
---

# Phase 04 Plan 02: Wire Session/Model/Cost into AI Pipeline Summary

**Model flag parsing (--haiku/--sonnet/--opus), session resume via SDK, and cost footer rendering wired into AI pipeline**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-02T18:13:05Z
- **Completed:** 2026-04-02T18:16:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- classifyInput now parses --haiku, --sonnet, --opus flags from AI prompts and returns mapped model IDs
- executeAI accepts sessionId/model options, passes resume/model to SDK query, returns AIResult with captured session_id and usage
- renderCostFooter writes dim-formatted token count and cost to stderr, with optional session accumulator display
- 6 new classify tests for model flag parsing, all 147 tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add model flag parsing to classify.ts and update ai.ts for session/model** - `3d5feed` (feat)
2. **Task 2: Add cost footer rendering to renderer.ts** - `aa883a1` (feat)

## Files Created/Modified
- `src/classify.ts` - Added MODEL_FLAGS map, extractModelFlag(), model field in AI action
- `src/ai.ts` - Added session/model options, AIResult return, buildResumeOptions/extractUsage integration
- `src/renderer.ts` - Added renderCostFooter() standalone export writing to stderr
- `tests/classify.test.ts` - 6 new tests for model flag parsing

## Decisions Made
- Model flags parsed as first token after `a ` prefix, keeping extraction simple and predictable
- renderCostFooter is standalone (not in Renderer interface) so shell.ts controls display timing
- SDK result message accessed via `unknown` cast to avoid tight coupling to SDK types

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript cast error for SDK result message**
- **Found during:** Task 1
- **Issue:** Direct cast from SDKMessage to Record<string, unknown> failed strict type checking
- **Fix:** Added intermediate `unknown` cast: `msg as unknown as Record<string, unknown>`
- **Files modified:** src/ai.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 3d5feed (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type-safety fix, no scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- classify.ts, ai.ts, and renderer.ts are wired for session/model/cost
- shell.ts integration (Plan 03) can now call executeAI with sessionId/model and use renderCostFooter after completion
- Chat mode REPL loop can leverage AIResult to maintain session state across turns

---
*Phase: 04-sessions-chat-mode*
*Completed: 2026-04-02*
