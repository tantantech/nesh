---
phase: quick
plan: 260403-isu
subsystem: shell-builtins
tags: [settings, menu, config, interactive]
dependency_graph:
  requires: [config, builtins, model-switcher, key-manager]
  provides: [unified-settings-menu]
  affects: [shell, classify, types]
tech_stack:
  added: []
  patterns: [inline-editor, delegation-to-existing-handlers]
key_files:
  created:
    - src/settings.ts
    - tests/settings.test.ts
  modified:
    - src/types.ts
    - src/classify.ts
    - src/shell.ts
decisions:
  - Prefix validation reuses same whitespace check as config.ts validatePrefix
  - History size minimum set to 100 (reasonable floor for usability)
  - Theme save in shell.ts settings case mirrors existing theme case pattern
  - historySize takes effect on next shell start (readline historySize is set at init)
metrics:
  duration: 2min
  completed: 2026-04-03
  tasks: 2
  files: 5
---

# Quick Task 260403-isu: Build Interactive Settings Menu Summary

Unified `settings` builtin command with 6-option numbered menu delegating to existing handlers and providing inline editors for scalar config values.

## What Was Built

### src/settings.ts (new)
- `executeSettings(rl, currentModel)` displays a numbered menu: Theme, Model, API Keys, Prefix, Permissions, History Size
- Options 1-3 delegate to `executeTheme`, `executeModelSwitcher`, `executeKeyManager`
- Option 4 (Prefix): shows current, prompts for new, validates no whitespace, saves via `saveConfig`
- Option 5 (Permissions): shows auto/ask/deny with green asterisk on current, saves selection
- Option 6 (History Size): shows current, prompts for number >= 100, validates, saves
- Returns `SettingsResult` with updated values for shell state synchronization
- Uses picocolors styling consistent with model-switcher and key-manager patterns

### Wiring (types.ts, classify.ts, shell.ts)
- Added `'settings'` to `BuiltinName` union type
- Added `'settings'` to `BUILTINS` set for input classification
- Added `case 'settings'` in shell builtin switch updating live state (model, prefix, permissions, template)

### tests/settings.test.ts (new)
- 13 tests covering: menu display, invalid/empty input cancellation, delegation to theme/model/keys, prefix editing with validation, permissions selection, history size validation

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` -- passes with zero errors
- `npx vitest run` -- 295 tests pass (20 test files)
- `npm run build` -- produces dist/cli.js (67.32 kB)

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | cf329d3 | Settings menu with inline editors and 13 tests |
| 2 | 4d0012e | Wire settings builtin into shell (types, classify, shell) |

## Known Stubs

None.

## Self-Check: PASSED
