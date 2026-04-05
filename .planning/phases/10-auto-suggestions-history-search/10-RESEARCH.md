# Phase 10: Auto-Suggestions & History Search - Research

**Researched:** 2026-04-05
**Domain:** Node.js readline keypress API, terminal ANSI rendering, ghost text suggestions
**Confidence:** HIGH (all critical questions answered with empirical Node 22 tests)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Ghost Text Rendering**
- D-01: Output-only rendering — ghost text written to stdout as dim ANSI after cursor, erased on next keypress. `rl.line` ALWAYS remains plain text.
- D-02: ANSI sequences: `\x1b[2m` (dim) for suggestion, `\x1b[0m` (reset) after, `\x1b[K` (clear to end of line) to erase previous suggestion.
- D-03: Suggestion text is suffix only — if user typed `git ch` and suggestion is `git checkout`, display only `eckout` in dim after cursor.
- D-04: New module `src/suggestions/renderer.ts` — handles ghost text rendering/clearing on the terminal.
- D-05: Rendering is a pure side-effect on stdout — no modification to readline's internal state.

**Keypress Interception**
- D-06: Listen to `process.stdin` 'keypress' events (emitted by readline) — NOT raw mode keypress handling.
- D-07: Debounce suggestion lookup at 50ms.
- D-08: Right-arrow key acceptance: detect right-arrow keypress, if suggestion active, write remaining text via `rl.write(suggestion_suffix)` and clear ghost text.
- D-09: Any other keypress while suggestion visible: clear ghost text, update suggestion for new input.
- D-10: New module `src/suggestions/keypress.ts` — keypress handler + debounce logic.
- D-11: Escape key or Ctrl+C while suggestion visible: clear suggestion without accepting.

**History Search**
- D-12: Reverse linear scan of history array with prefix matching — start from most recent, exit on first match.
- D-13: Prefix match: `rl.line` content must be a prefix of the history entry (case-sensitive).
- D-14: Skip history entries that exactly match current input.
- D-15: New module `src/suggestions/history-search.ts` — `findSuggestion(prefix: string, history: readonly string[], filters: readonly RegExp[]): string | null`.
- D-16: History array accessed via `(rl as any).history` (already used in shell.ts for save).

**Sensitive Pattern Filtering**
- D-17: Default sensitive patterns: API keys, common env var patterns, password flags.
- D-18: Configurable via config: `"suggestions": { "sensitive_patterns": ["custom_regex"] }` — merged with defaults.
- D-19: Filtering during history search — matching entries are skipped entirely.
- D-20: Default patterns are conservative — better to over-filter than leak a secret.

**Config Integration**
- D-21: New config field: `"suggestions": { "enabled": true, "debounce_ms": 50, "sensitive_patterns": [] }`.
- D-22: `enabled: false` disables auto-suggestions completely.
- D-23: Feature check in shell.ts: `if (config.suggestions?.enabled !== false)` — enabled by default.
- D-24: Extend `NeshConfig` interface in `src/config.ts` with `suggestions?: SuggestionsConfig`.

**Module Architecture**
- D-25: `src/suggestions/renderer.ts`, `src/suggestions/keypress.ts`, `src/suggestions/history-search.ts`, `src/suggestions/index.ts`.
- D-26: Facade exports `setupAutoSuggestions(rl, history, config)` — called from shell.ts, returns cleanup function.
- D-27: Cleanup function removes keypress listener on shell exit.

### Claude's Discretion
- Exact regex patterns for default sensitive filters
- Whether to support partial word matching (vs strict prefix only)
- Terminal width handling for long suggestions that would wrap
- Whether suggestions persist during Tab completion or are cleared

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUGG-01 | Fish-like ghost text appears from history as user types, accepted with right-arrow | Verified: rl.line updated before keypress fires; rl.write(suffix) correctly inserts text; dim ANSI rendering pattern confirmed |
| SUGG-02 | Suggestion engine searches history with reverse linear scan and early exit | Verified: (rl as any).history array is available; reverse prefix scan is O(n) with early exit |
| SUGG-03 | Keypress handler debounced to prevent typing lag (>5 chars/sec feels instant) | Verified: 50ms debounce via setTimeout/clearTimeout; keypress fires after rl.line updated |
| SUGG-04 | History filtering excludes commands containing sensitive patterns (API keys, passwords, tokens) | Default regex patterns documented; filter-at-search-time pattern established |
| SUGG-05 | Auto-suggestions independently disablable in config | NeshConfig extension pattern established; config validation pattern from existing codebase |
</phase_requirements>

---

## Summary

Phase 10 implements fish-shell-style ghost text auto-suggestions in a Node.js readline environment. The core challenge — rendering visual-only text after the cursor without corrupting `rl.line` — is fully solvable within the existing readline architecture. All critical timing questions have been answered by empirical testing against Node.js v22.12.0.

The most important finding is the **keypress event timing**: `process.stdin` keypress fires **after** `rl.line` is already updated. This means the suggestion handler always sees the current complete input state when deciding what to render. There is no "read old value" race condition.

The second critical finding concerns **ghost text erase strategy**: simple printable character keypresses do NOT trigger `_refreshLine` (readline just appends the char to stdout). This means ghost text rendered after the cursor **persists** across simple keypresses and must be explicitly erased. By contrast, backspace, cursor movement, and `_refreshLine` all emit `ESC[0J` (clear from cursor to end of screen), which naturally wipes any ghost text. The renderer must erase ghost text on EVERY keypress before writing a new suggestion.

**Primary recommendation:** Implement the four-module `src/suggestions/` architecture as specified in the decisions. The rendering approach — write dim ANSI suffix to stdout, track a "ghost active" flag, clear with `\x1b[K` on every keypress before re-rendering — is the correct pattern. Right-arrow acceptance via `rl.write(suffix)` is verified to correctly update `rl.line`.

---

## Standard Stack

### Core (no new dependencies required)

| Library | Source | Purpose | Why Standard |
|---------|--------|---------|--------------|
| `node:readline` (built-in) | Node.js 22 | keypress events, rl.line, rl.cursor, rl.write | Already used; emitKeypressEvents already called by readline |
| `process.stdout` (built-in) | Node.js 22 | ANSI ghost text rendering | Direct terminal output |
| `setTimeout/clearTimeout` | Node.js built-in | 50ms debounce | No library needed for simple debounce |

No new npm packages are required. This phase is entirely implemented with Node.js built-ins and the existing TypeScript codebase.

**Installation:** None required.

---

## Architecture Patterns

### Recommended Module Structure

```
src/
└── suggestions/
    ├── index.ts          # Facade: setupAutoSuggestions(rl, history, config) -> cleanup fn
    ├── keypress.ts       # Keypress handler with 50ms debounce, right-arrow intercept
    ├── renderer.ts       # Ghost text render/clear via stdout ANSI writes
    └── history-search.ts # findSuggestion(prefix, history, filters) -> string | null
```

### Pattern 1: Keypress Event Timing (VERIFIED on Node 22)

**What:** `process.stdin` 'keypress' fires **after** `rl.line` has been updated by readline's internal `_ttyWrite`/`_insertString`. When your keypress handler runs, `rl.line` already contains the new character.

**Empirical proof:**
```
Sequence for typing 'a':
1. before_insert: { line: "", cursor: 0 }
2. after_insert:  { line: "a", cursor: 1 }     ← rl.line updated
3. keypress_fired: { line: "a", cursor: 1 }    ← fires here, AFTER update
```

**Implication:** The keypress handler reads `rl.line` directly — it is always current. No need to concatenate `rl.line + key.sequence`.

```typescript
// Source: empirical test on Node.js v22.12.0
process.stdin.on('keypress', (str: string, key: readline.Key) => {
  // rl.line already contains the new character here
  const currentInput = rl.line  // correct — always up-to-date
  scheduleUpdate(currentInput)
})
```

### Pattern 2: Ghost Text Rendering Model (VERIFIED)

**What:** readline does NOT emit `ESC[K` (clear to EOL) on simple printable character input — it only writes the character itself. Ghost text after the cursor therefore **persists** across character appends. The renderer must ALWAYS clear ghost text at the start of each keypress handler invocation.

**Render/erase cycle:**
```
Keypress fires (rl.line already updated)
  → clear current ghost text (write \x1b[K at cursor)
  → debounce timer fires at 50ms
  → findSuggestion(rl.line, history, filters)
  → if suggestion found: write \x1b[2m{suffix}\x1b[0m to stdout
                         then move cursor back: readline.moveCursor(process.stdout, -suffix.length, 0)
  → if no suggestion:    nothing to write
```

**On _refreshLine triggers (backspace, arrow keys, line edit):**
readline emits `ESC[1G` (go to col 1) + `ESC[0J` (clear to end of screen) + full line redraw. Ghost text is automatically wiped. But the keypress handler still clears ghost text first (harmless redundancy, simpler state).

```typescript
// Source: empirical test on Node.js v22.12.0
// renderer.ts
let ghostLength = 0  // chars currently displayed as ghost text

export function renderGhost(suffix: string): void {
  if (!suffix || !process.stdout.isTTY) return
  process.stdout.write(`\x1b[2m${suffix}\x1b[0m`)
  // Move cursor back to before the ghost text
  readline.moveCursor(process.stdout, -suffix.length, 0)
  ghostLength = suffix.length
}

export function clearGhost(): void {
  if (ghostLength === 0) return
  // ESC[K = clear from cursor to end of line
  process.stdout.write('\x1b[K')
  ghostLength = 0
}
```

### Pattern 3: Right-Arrow Acceptance (VERIFIED)

**What:** Right-arrow keypress fires after readline has already moved the cursor one position right (if there is text to the right of cursor). When a suggestion is active and cursor is at end of input, right-arrow moves cursor off the end (no visible change). We intercept in keypress, call `rl.write(suffix)` to insert the full suggestion suffix, which correctly updates `rl.line` and moves cursor.

**Empirical proof:**
```
rl.write('git ch')  → rl.line: "git ch", cursor: 6
rl.write('eckout')  → rl.line: "git checkout", cursor: 12
```

Right-arrow key object shape (verified):
```typescript
// key = { sequence: '\x1b[C', name: 'right', ctrl: false, meta: false, shift: false }
```

```typescript
// Source: empirical test on Node.js v22.12.0
// keypress.ts
process.stdin.on('keypress', (_str: string, key: readline.Key) => {
  if (key.name === 'right' && activeSuggestion !== null) {
    // Cursor is at end of input (suggestion active means cursor === rl.line.length)
    clearGhost()
    rl.write(activeSuggestion)  // inserts suffix into rl.line
    activeSuggestion = null
    return
    // Note: readline's cursor move from right-arrow already happened,
    // but rl.write overwrites correctly because rl.line is updated
  }
  // ... handle all other keys
})
```

**Important edge case:** When cursor is NOT at end of input (user moved cursor left), right-arrow should NOT accept suggestion — it should move cursor normally. Check `rl.cursor === rl.line.length` before accepting.

### Pattern 4: Debounce with setTimeout/clearTimeout

Standard pattern, consistent with completions engine (which uses `Promise.race` with timeout):

```typescript
// Source: project pattern from src/completions/engine.ts
let debounceTimer: ReturnType<typeof setTimeout> | undefined

function scheduleUpdate(input: string): void {
  if (debounceTimer !== undefined) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = undefined
    const suggestion = findSuggestion(input, history, sensitiveFilters)
    clearGhost()
    if (suggestion !== null && input.length > 0) {
      renderGhost(suggestion.slice(input.length))
    }
  }, DEBOUNCE_MS)
}
```

### Pattern 5: History Search

```typescript
// Source: decision D-15, consistent with PITFALLS.md Pitfall 8 (reverse scan + early exit)
export function findSuggestion(
  prefix: string,
  history: readonly string[],
  filters: readonly RegExp[]
): string | null {
  if (prefix.length === 0) return null
  // history is stored newest-first in (rl as any).history
  for (const entry of history) {
    if (entry === prefix) continue                           // D-14: skip exact match
    if (!entry.startsWith(prefix)) continue                 // D-13: prefix match only
    if (filters.some(re => re.test(entry))) continue        // D-19: skip sensitive
    return entry
  }
  return null
}
```

### Pattern 6: Config Extension

Follow the exact validation pattern from `src/config.ts`:

```typescript
// src/config.ts extension
export interface SuggestionsConfig {
  readonly enabled?: boolean
  readonly debounce_ms?: number
  readonly sensitive_patterns?: readonly string[]
}

export interface NeshConfig {
  // ... existing fields ...
  readonly suggestions?: SuggestionsConfig
}

// In loadConfig() validation block:
...(typeof obj.suggestions === 'object' && obj.suggestions !== null
  ? { suggestions: validateSuggestionsConfig(obj.suggestions as Record<string, unknown>) }
  : {}),
```

### Pattern 7: Facade Setup Function

Consistent with `createCompletionEngine` factory pattern:

```typescript
// src/suggestions/index.ts
export function setupAutoSuggestions(
  rl: readline.Interface,
  config: NeshConfig
): () => void {  // returns cleanup function
  if (config.suggestions?.enabled === false) {
    return () => {}  // no-op cleanup
  }
  const history = (rl as unknown as { history: string[] }).history
  const filters = buildSensitiveFilters(config.suggestions?.sensitive_patterns ?? [])
  const debounceMs = config.suggestions?.debounce_ms ?? DEFAULT_DEBOUNCE_MS
  // ... attach keypress listener
  const handler = createKeypressHandler(rl, history, filters, debounceMs)
  process.stdin.on('keypress', handler)
  return () => {
    process.stdin.removeListener('keypress', handler)
  }
}
```

### Anti-Patterns to Avoid

- **Reading `rl.line` in a `setImmediate` after keypress:** Unnecessary — `rl.line` is already updated when keypress fires.
- **Writing ANSI into `rl.line`:** Corrupts cursor calculations. Ghost text is stdout-only, never touches `rl.line`.
- **Using `rl.cursor` to position ghost text via absolute column:** Use relative `moveCursor` — simpler, immune to prompt length changes.
- **Not clearing ghost text on every keypress:** Simple char append does NOT trigger `_refreshLine`. Ghost text persists until explicitly cleared with `\x1b[K`.
- **Accepting right-arrow when cursor is not at end of line:** Check `rl.cursor === rl.line.length` before accepting suggestion. If cursor is mid-line, right-arrow should navigate normally.
- **Checking `rl.cursor` in keypress for right-arrow when cursor is at end:** On Node 22, right-arrow at end-of-line does NOT move cursor past end — `rl.cursor` stays at `rl.line.length`. The check `rl.cursor === rl.line.length` is always true when a suggestion is active (user typed to end).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounce | Custom debounce class | `setTimeout/clearTimeout` | Two-liner; no library needed |
| Sensitive pattern matching | Custom parser for API key detection | `RegExp.test()` with curated patterns | Regex is precise; parsing is over-engineered |
| ANSI cursor movement | Manual escape code construction | `readline.moveCursor`, `readline.clearLine` | Node built-ins handle terminal edge cases |
| History access | Duplicating history array | `(rl as any).history` | Already maintained by readline; single source of truth |

**Key insight:** This phase requires zero new npm dependencies. The Node.js readline API provides everything needed.

---

## Common Pitfalls

### Pitfall 1: Ghost Text Persists After Simple Character Append
**What goes wrong:** Developer tests with backspace (which triggers `_refreshLine` + `ESC[0J`) and believes ghost text auto-clears. But simple printable chars only write the char to stdout — ghost text remains. After several keypresses, ghost text fragments stack up on screen.

**Why it happens:** readline's fast path for printable chars avoids the full `_refreshLine` cycle. Only edit operations (backspace, cursor moves, paste) trigger `ESC[0J`.

**How to avoid:** `clearGhost()` is called at the START of every keypress handler invocation — before debounce, before condition checks.

**Warning signs:** Ghost text visible as overlapping or mispositioned dim text when typing quickly.

### Pitfall 2: Right-Arrow Acceptance When Cursor is Mid-Line
**What goes wrong:** User presses right-arrow to navigate mid-line, accidentally accepts suggestion because handler doesn't check cursor position.

**How to avoid:** Guard with `if (rl.cursor === rl.line.length)` before treating right-arrow as suggestion acceptance.

### Pitfall 3: Suggestion Active State Desync After _refreshLine
**What goes wrong:** `activeSuggestion` variable holds a suggestion, but readline has redrawn the line (e.g., user pasted text, triggered `_refreshLine`), wiping the ghost text from the screen. State says "ghost active" but terminal shows nothing.

**How to avoid:** `clearGhost()` is idempotent (checks `ghostLength === 0`). Call it unconditionally at start of every keypress handler. The `ghostLength` variable is the source of truth for whether ghost text is actually on screen.

### Pitfall 4: Keypress Listener Not Removed on Shell Exit
**What goes wrong:** `process.stdin` keypress listener keeps a reference to readline interface after it's closed. Causes "write after close" errors or memory leaks in long sessions.

**How to avoid:** `setupAutoSuggestions` returns a cleanup function. Shell.ts calls it alongside `rl.close()` in the cleanup handler.

### Pitfall 5: Empty Input Shows Suggestion
**What goes wrong:** On empty line (`rl.line === ""`), any history entry matches the empty prefix. Ghost text appears immediately at empty prompt, looking bizarre.

**How to avoid:** `findSuggestion` returns null when `prefix.length === 0`. Also: debounce naturally handles this (suggestion cleared when input cleared, no new suggestion scheduled when line is empty after debounce fires).

### Pitfall 6: Sensitive Filter Regex Catastrophic Backtracking
**What goes wrong:** A poorly written sensitive filter regex with nested quantifiers causes catastrophic backtracking on certain history entries, making suggestion lookup hang for seconds.

**How to avoid:** Keep default patterns simple and linear. Avoid `(a+)+` or similar patterns. Test each regex against worst-case inputs (long lines of repeated chars). The pattern `/(KEY|TOKEN|SECRET|PASSWORD)\s*[=:]\s*\S+/i` is safe — linear scan.

---

## Code Examples

### Complete Verified Patterns

#### Ghost text render + erase sequence
```typescript
// Source: empirical test on Node.js v22.12.0
// After keypress fires (rl.line already updated):

// Step 1: Always clear existing ghost text first
process.stdout.write('\x1b[K')  // ESC[K = erase from cursor to end of line

// Step 2: (after 50ms debounce) Write new ghost text
const suffix = suggestion.slice(rl.line.length)  // only the part not yet typed
process.stdout.write(`\x1b[2m${suffix}\x1b[0m`)  // dim + reset
readline.moveCursor(process.stdout, -suffix.length, 0)  // move cursor back
```

#### Right-arrow key object (verified shape)
```typescript
// Source: empirical test on Node.js v22.12.0
// key = { sequence: '\x1b[C', name: 'right', ctrl: false, meta: false, shift: false, code: '[C' }
if (key.name === 'right' && rl.cursor === rl.line.length && activeSuggestion) {
  clearGhost()
  rl.write(activeSuggestion.slice(rl.line.length))
  activeSuggestion = null
}
```

#### rl.write() acceptance (verified behavior)
```typescript
// Source: empirical test on Node.js v22.12.0
// Before: rl.line = "git ch", rl.cursor = 6
rl.write('eckout')
// After:  rl.line = "git checkout", rl.cursor = 12
// rl.write() correctly inserts text and updates cursor
```

#### Sensitive filter defaults (Claude's discretion)
```typescript
// Recommended conservative defaults
const DEFAULT_SENSITIVE_PATTERNS: readonly RegExp[] = [
  /(KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL)\s*[=:]\s*\S+/i,
  /\b(sk-|ghp_|gho_|github_pat_|xoxb-|xapp-|ya29\.|AIza)\S+/,  // common API key prefixes
  /--password[= ]\S+/,
  /-p\s+\S{4,}/,         // mysql/redis -p flag with non-trivial value
  /Bearer\s+\S{10,}/i,
]
```

#### History array access (existing pattern from shell.ts)
```typescript
// Source: src/shell.ts line 403 — already established pattern
const history = (rl as unknown as { history: string[] }).history
// history[0] is the most recent entry (readline stores newest-first)
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| `node-color-readline` (abandoned 9yr ago) | Output-only rendering with ANSI to stdout | No cursor corruption |
| Raw mode + manual keypress parsing | `readline.emitKeypressEvents` + stdin keypress listener | Less complexity; works with existing readline |
| Checking `rl.line` + key.sequence to build current input | Read `rl.line` directly (already updated by the time keypress fires) | Simpler, no concatenation bugs |
| `rl.clearLine()` for ghost erase | `\x1b[K` written directly | Equivalent; direct ANSI is slightly faster |

---

## Open Questions

1. **Terminal width wrapping for long suggestions**
   - What we know: `process.stdout.columns` gives terminal width. `rl.cursor` gives char offset in line. Prompt length affects effective column.
   - What's unclear: `rl._getCursorPos()` returns `{rows, cols}` including prompt offset — but it's a private method. Could use it to detect wrap boundary.
   - Recommendation (Claude's discretion): For v1, truncate ghost text at `process.stdout.columns - rl.cursor - promptLength - 1` chars. If truncation would cut to <3 chars, don't show suggestion. Full wrap handling deferred.

2. **Tab completion interaction with ghost text**
   - What we know: Tab triggers `_tabComplete` which calls `_refreshLine` → emits `ESC[0J` → naturally wipes ghost text.
   - What's unclear: Does the keypress event fire for Tab before `_tabComplete` runs? If so, ghost text would be cleared then immediately re-queried.
   - Recommendation (Claude's discretion): In keypress handler, if `key.name === 'tab'`, clear ghost and do NOT schedule a new suggestion. Tab completion and suggestions are mutually exclusive in the same keypress cycle.

3. **Exact cursor column for ghost text start**
   - What we know: After readline renders, stdout cursor is positioned at `rl.cursor` chars into the input. Ghost text written to stdout appears at that position.
   - What's unclear: Multi-byte Unicode characters (emoji, CJK) have different display widths than `.length`. `rl.cursor` counts code units, not display columns.
   - Recommendation (Claude's discretion): For v1, treat all characters as 1 display column wide. Flag as known limitation. A `wcwidth` utility port can be added in a follow-up.

---

## Project Constraints (from CLAUDE.md)

- **Immutable state:** `ShellState` uses spread pattern; `activeSuggestion` should be a module-level variable in the suggestions facade (not in `ShellState`), since it is transient display state, not shell state.
- **No console.log:** Use `process.stderr.write` for any debug output; remove before commit.
- **Strict TypeScript:** All new modules must pass `npx tsc --noEmit`. `(rl as any).history` → use `(rl as unknown as { history: string[] }).history` for strict-mode compatibility.
- **File size:** 200-400 lines per file typical. Four modules in `src/suggestions/` keeps each focused.
- **Functions < 50 lines:** Split `setupAutoSuggestions` and `createKeypressHandler` if they grow.
- **Vitest:** Tests go in `tests/` with `*.test.ts` naming. The four new modules each get a test file: `tests/suggestions/history-search.test.ts`, `tests/suggestions/renderer.test.ts`, `tests/suggestions/keypress.test.ts`, `tests/suggestions/index.test.ts`.
- **No new npm packages:** This phase requires zero new dependencies — all built with Node.js built-ins.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is a code-only change using Node.js built-ins already available in the project runtime (Node.js 22.12.0 confirmed). No external tools, services, or CLI utilities required.

---

## Validation Architecture

`workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`. This section is skipped.

---

## Sources

### Primary (HIGH confidence)
- Empirical Node.js v22.12.0 tests (run during this research session) — keypress timing, `_refreshLine` output, `rl.write` behavior, right-arrow key shape
- Node.js readline API documentation (https://nodejs.org/api/readline.html) — `rl.line`, `rl.cursor`, `emitKeypressEvents`, `clearLine`, `moveCursor`, `cursorTo`
- `src/shell.ts` lines 70-85, 403 — established `(rl as unknown as { history: string[] }).history` pattern
- `src/completions/engine.ts` — `Promise.race` timeout pattern, factory function pattern
- `.planning/research/PITFALLS.md` Pitfall 1 (readline rendering), Pitfall 8 (keypress latency), Pitfall 15 (sensitive history) — HIGH confidence, previously verified

### Secondary (MEDIUM confidence)
- `.planning/phases/10-auto-suggestions-history-search/10-CONTEXT.md` — all locked decisions (D-01 through D-27)
- `.planning/STATE.md` — "rl.line must ALWAYS remain plain text" global decision

---

## Metadata

**Confidence breakdown:**
- Keypress timing (rl.line update order): HIGH — empirically verified with Node 22.12.0
- Ghost text rendering (ESC sequences, refresh behavior): HIGH — empirically verified
- Right-arrow acceptance via rl.write: HIGH — empirically verified
- Sensitive filter patterns: MEDIUM — conservative defaults recommended; exact patterns at Claude's discretion
- Terminal width / Unicode edge cases: LOW — acknowledged as known limitation; basic case is HIGH

**Research date:** 2026-04-05
**Valid until:** 2026-07-05 (stable Node.js readline API; 90-day window)
