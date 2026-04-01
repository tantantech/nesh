---
phase: quick
plan: 01
subsystem: prompt-templates
tags: [ux, prompt, templates, personalization]
dependency_graph:
  requires: []
  provides: [template-library, theme-command, config-persistence]
  affects: [shell-repl, prompt-rendering, builtins]
tech_stack:
  added: []
  patterns: [template-builder-map, interactive-readline-selector]
key_files:
  created:
    - src/templates.ts
    - tests/templates.test.ts
  modified:
    - src/types.ts
    - src/classify.ts
    - src/config.ts
    - src/builtins.ts
    - src/shell.ts
    - tests/shell.integration.test.ts
decisions:
  - "Default template set to 'minimal' (safe for all terminals without Nerd Font)"
  - "Template builders stored as keyed record, not methods on PromptTemplate, to keep interface serializable"
  - "No circular dependency: templates.ts imports from prompt.ts; shell.ts imports from both"
metrics:
  duration: 4min
  completed: "2026-04-01T15:02:27Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 17
  tests_total: 127
---

# Quick Task 260401-oup: Add Interactive Prompt Template Selector Summary

Five built-in prompt templates (minimal, classic, powerline, hacker, pastel) with interactive `theme` command and config persistence in ~/.claudeshell/config.json.

## What Was Built

### Task 1: Template Library and Prompt Builder (TDD)
- **src/templates.ts**: 5 templates with `PromptTemplate` interface, `buildPromptFromTemplate`, `getTemplateByName`, `DEFAULT_TEMPLATE_NAME`
- **tests/templates.test.ts**: 17 tests covering all templates, git branch inclusion, trailing space, Nerd Font isolation
- Templates: minimal (ASCII), classic (box-drawing), powerline (Nerd Font glyphs), hacker (green two-line), pastel (soft colors)
- Commit: `069ab49`

### Task 2: Theme Builtin Command with Interactive Selection
- **src/types.ts**: Added `'theme'` to `BuiltinName` union
- **src/classify.ts**: Added `'theme'` to `BUILTINS` set
- **src/config.ts**: Added `prompt_template` field and `saveConfig()` function
- **src/builtins.ts**: Added `executeTheme()` with numbered list, live previews, readline input
- **src/shell.ts**: Wired theme command, loads template from config on startup, saves on selection
- **tests/shell.integration.test.ts**: Updated to match new default minimal prompt character
- Commit: `cff5337`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated integration test for new default template**
- **Found during:** Task 2
- **Issue:** Integration test expected `❯` character from powerline prompt, but default changed to minimal which uses `>`
- **Fix:** Updated test assertion from `❯` to `>`
- **Files modified:** tests/shell.integration.test.ts
- **Commit:** cff5337

## Verification

- `npx vitest run` -- 127 tests pass (10 test files)
- `npx tsc --noEmit` -- no type errors
- `npm run build` -- builds successfully (18.49 kB)

## Known Stubs

None.

## Self-Check: PASSED

All 7 source/test files verified present. Both commit hashes (069ab49, cff5337) confirmed in git log.
