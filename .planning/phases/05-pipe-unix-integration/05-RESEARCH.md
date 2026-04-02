# Phase 5: Pipe & Unix Integration - Research

**Researched:** 2026-03-31
**Domain:** Node.js CLI pipe I/O, Unix process integration, error recovery UX
**Confidence:** HIGH

## Summary

Phase 5 transforms ClaudeShell from an interactive-only REPL into a proper Unix citizen. The work spans three distinct areas: (1) pipe-mode I/O where stdin detection routes to a single-shot AI call instead of the REPL loop, (2) automatic error recovery via `a fix` that leverages session context to suggest and execute fixes, and (3) configurable AI command prefix replacing the hardcoded `"a"`.

All three areas are pure integration work on top of existing infrastructure. The renderer already handles `isTTY: false` for plain-text output. The AI module already supports single-shot calls with session context. ShellState already tracks `lastError`. The config system already supports typed fields with validation. No new dependencies are required.

**Primary recommendation:** Implement pipe mode as a `runPipe()` function in `cli.ts` that exits before `runShell()` is ever called. Wire `a fix` as a special-case in the classifier or shell loop. Make prefix configurable by threading `config.prefix` through the classifier.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Detect pipe mode at startup: `!process.stdin.isTTY` means stdin is piped
- **D-02:** Pipe mode is a separate code path in `src/cli.ts` -- never enter the REPL loop
- **D-03:** Read all piped stdin content, then execute a single AI call with stdin as context appended to the prompt
- **D-04:** Usage: `cat log.txt | claudeshell "summarize this"` or `echo "explain this code" | claudeshell`
- **D-05:** If both stdin pipe and CLI argument exist, combine: argument is the prompt, stdin is the context
- **D-06:** If only stdin pipe (no argument), stdin IS the prompt
- **D-07:** Exit after single response (exit code 0 on success, 1 on error)
- **D-08:** When stdout is not a TTY (`!process.stdout.isTTY`), output plain text only -- no ANSI colors, no markdown formatting, no tool status lines
- **D-09:** Renderer already handles this (`isTTY: false` path) -- ensure pipe mode sets this correctly
- **D-10:** Cost footer goes to stderr (already does) -- visible to user even when stdout is piped
- **D-11:** Tool status lines go to stderr (already do) -- visible to user even when stdout is piped
- **D-12:** Enable chaining: `claudeshell "generate csv" | head -5` works because stdout is clean text
- **D-13:** When a command fails (non-zero exit), show the existing error hint PLUS an AI-suggested fix inline
- **D-14:** Fix suggestion format: `Suggested fix: <command>. Type 'a fix' to run it.`
- **D-15:** `a fix` executes the last suggested fix command (stored in ShellState)
- **D-16:** `a fix` first asks AI for the fix using lastError context, then executes the suggested command
- **D-17:** If AI can't determine a fix, say so honestly -- don't guess
- **D-18:** Error recovery uses the current session for context (knows what user was doing)
- **D-19:** Extend ShellState with `lastSuggestedFix?: string` field
- **D-20:** Config field: `"prefix": "a"` in `~/.claudeshell/config.json` (default: `"a"`)
- **D-21:** Classifier reads prefix from loaded config, uses it instead of hardcoded `"a"`
- **D-22:** Per-project `.claudeshell.json` can override prefix (Phase 6 will add per-project config loading)
- **D-23:** Prefix must be a single word (no spaces) -- validate on config load
- **D-24:** Chat mode entry still uses bare prefix (typing just the prefix word enters chat mode)
- **D-25:** Show configured prefix in error messages and help text

### Claude's Discretion
- Exact format of the fix suggestion prompt to Claude
- Whether to show a brief "analyzing error..." indicator before the fix suggestion
- How to handle binary stdin (likely: reject with message "Binary input not supported")
- Maximum stdin size for pipe mode (recommend: 100KB warning, 1MB hard limit)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-01 | User can pipe input to AI (`cat log.txt \| a summarize`) -- stdin is passed as context | Pipe detection via `!process.stdin.isTTY`, `runPipe()` function in cli.ts, stdin collection via readable stream |
| PIPE-02 | When stdout is piped, AI output is plain text without colors or markdown formatting | Renderer `isTTY: false` path already outputs raw text; pipe mode creates renderer with `isTTY: false` |
| PIPE-03 | User can chain AI output into other commands (`a generate csv \| head -5`) | Clean stdout (text only) + stderr for meta-info already implemented in renderer |
| ERR-04 | When a command fails, AI automatically offers a suggested fix | Extend passthrough error handler to call AI with fix prompt, parse response for command |
| ERR-05 | User can type `a fix` to let AI attempt to fix the last failed command | New `lastSuggestedFix` in ShellState, classifier detects `a fix` / `<prefix> fix`, shell executes stored command |
| CFG-01 | User can configure a custom AI command prefix via config | Add `prefix` field to ClaudeShellConfig, thread through classifier, validate single-word |
</phase_requirements>

## Architecture Patterns

### Pipe Mode Flow (cli.ts)

The pipe mode intercept happens **before** `runShell()` is called. This is the cleanest separation -- pipe mode never touches readline, history, or the REPL loop.

```
cli.ts (entry)
  ├── --version → print and exit
  ├── !process.stdin.isTTY → runPipe() → single AI call → exit
  └── else → runShell() (existing REPL)
```

**Key design:** `runPipe()` is a new exported async function in `src/pipe.ts` (or inline in cli.ts). It:
1. Collects all stdin into a string via `process.stdin` readable stream
2. Extracts CLI args as prompt (`process.argv.slice(2).join(' ')`)
3. Combines prompt + stdin per D-05/D-06
4. Calls `executeAI()` with `isTTY: false` renderer
5. Exits with code 0 or 1

### Stdin Collection Pattern

```typescript
async function collectStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks).toString('utf-8')
}
```

This is the standard Node.js pattern for reading piped stdin. The `for await` loop completes when the pipe closes (sender EOF). No need for external libraries.

### Error Recovery Flow (shell.ts)

```
Command fails (exitCode !== 0)
  → Store lastError (already exists)
  → Call AI with fix-prompt (new: buildFixPrompt)
  → Parse AI response for suggested command
  → Display: "Suggested fix: <cmd>. Type 'a fix' to run it."
  → Store lastSuggestedFix in state

User types "a fix"
  → Classifier returns { type: 'ai', prompt: 'fix' }
  → Shell detects "fix" as special keyword
  → If lastSuggestedFix exists → executeCommand(lastSuggestedFix)
  → If not → tell user no fix available
```

**Fix prompt to AI:** The prompt should ask Claude to return a single shell command that would fix the error, formatted so it can be parsed. A structured approach:

```typescript
function buildFixPrompt(lastError: LastError): string {
  return [
    'The following command failed:',
    `\`${lastError.command}\``,
    `Exit code: ${lastError.exitCode}`,
    'Stderr:',
    lastError.stderr,
    '',
    'Suggest a single shell command that would fix this error.',
    'Reply with ONLY the command on the first line, then a brief explanation.',
    'If you cannot determine a fix, reply with: NO_FIX',
  ].join('\n')
}
```

**Parsing the response:** Look for the first line of the AI text response. If it starts with `NO_FIX`, report that no fix is available. Otherwise, the first line is the suggested command.

**Discretion choice -- show indicator:** Yes, show `pc.dim('Analyzing error...\r')` before the fix AI call, matching the existing "Thinking..." pattern in `ai.ts`.

### Configurable Prefix (classify.ts)

Current classifier has hardcoded `'a'`:
```typescript
if (trimmed === 'a' || trimmed.startsWith('a ')) {
```

Change to accept prefix as parameter:
```typescript
export function classifyInput(line: string, prefix: string = 'a'): InputAction {
  const trimmed = line.trim()
  if (!trimmed) return { type: 'empty' }

  if (trimmed === prefix || trimmed.startsWith(prefix + ' ')) {
    const rawPrompt = trimmed.slice(prefix.length + 1).trim()
    // ... rest unchanged
  }
  // ...
}
```

**Threading:** `shell.ts` loads config at startup, passes `config.prefix ?? 'a'` to every `classifyInput()` call. Same for `chat.ts` if needed (but chat mode doesn't use the classifier -- it sends all input to AI).

### Recommended New File

```
src/
  pipe.ts          # NEW: runPipe() for pipe-mode execution
```

All other changes are modifications to existing files.

### Anti-Patterns to Avoid
- **Never enter REPL in pipe mode:** The readline interface expects a TTY for input. Piped stdin would be consumed by readline and break everything.
- **Never use `process.stdin.resume()` before checking isTTY:** Calling resume on a TTY stdin when you don't need it can hang the process.
- **Never mutate ShellState:** Continue using spread pattern for `lastSuggestedFix` updates.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stdin collection | Custom event listener management | `for await (const chunk of process.stdin)` | Standard async iterable pattern, handles backpressure and EOF |
| TTY detection | Custom terminal checks | `process.stdin.isTTY` / `process.stdout.isTTY` | Node.js built-in, returns `undefined` (falsy) for non-TTY |
| ANSI stripping | regex-based color removal | Renderer `isTTY: false` path | Already implemented -- outputs raw text when not TTY |
| Config validation | ad-hoc string checks | `typeof obj.prefix === 'string' && /^\S+$/.test(obj.prefix)` | Simple regex, no need for Zod for a single field |

## Common Pitfalls

### Pitfall 1: Pipe Mode Detecting `--version` Flag
**What goes wrong:** `process.argv` still contains `--version` or other flags when piped. If pipe detection runs before flag parsing, pipe mode could eat version requests.
**Why it happens:** CLI entry point order matters.
**How to avoid:** Keep `--version` check first (already is), then pipe detection second.
**Warning signs:** `echo "test" | claudeshell --version` should still print version.

### Pitfall 2: Stdin Hanging When No Pipe
**What goes wrong:** If `runPipe()` tries to read stdin when stdin is actually a TTY (e.g., user runs `claudeshell "prompt"` without piping), the process hangs waiting for input.
**Why it happens:** `!process.stdin.isTTY` is the only signal. Direct invocation with args but no pipe has `isTTY === true`.
**How to avoid:** Only enter pipe mode when `!process.stdin.isTTY`. When stdin is a TTY with args, could either enter REPL or do a single-shot (design decision -- D-02 says pipe mode is for non-TTY stdin only).
**Warning signs:** Process hangs after `claudeshell "hello"` with no pipe.

### Pitfall 3: Binary Stdin Crashing toString
**What goes wrong:** Binary data piped in (`cat image.png | claudeshell "describe"`) produces garbage when converted to UTF-8 string.
**Why it happens:** `Buffer.toString('utf-8')` on binary data creates replacement characters.
**How to avoid:** Check for null bytes in the first N bytes of stdin. If found, reject with "Binary input not supported" message. Also enforce size limit (100KB warning, 1MB hard reject per discretion).
**Warning signs:** Garbled prompt text, huge token consumption.

### Pitfall 4: Fix Prompt Leaking into Normal AI Flow
**What goes wrong:** The `a fix` command is classified as `{ type: 'ai', prompt: 'fix' }` -- same as a user asking about "fix" something.
**Why it happens:** `fix` is a valid English word that could be part of a normal prompt.
**How to avoid:** Detect `a fix` (or `<prefix> fix`) as an exact match special case. Only when prompt is exactly `'fix'` and `lastSuggestedFix` exists, run the fix flow. If `lastSuggestedFix` is undefined, fall through to normal AI.
**Warning signs:** User types `a fix my docker setup` and gets the stored fix command instead of AI help.

### Pitfall 5: Error Recovery AI Call Blocks Shell
**What goes wrong:** After every failed command, the shell makes an AI API call to get a fix suggestion. This adds latency (2-5 seconds) to every error.
**Why it happens:** D-13 says "automatically offers a suggested fix inline."
**How to avoid:** Two approaches: (a) Make the fix call async and show suggestion when ready, or (b) accept the latency since errors are infrequent. Recommend (b) with the "Analyzing error..." indicator, matching the "Thinking..." pattern. The user expects some processing time after an error.
**Warning signs:** Every typo command takes 3 extra seconds.

### Pitfall 6: Prefix Validation Edge Cases
**What goes wrong:** User sets prefix to empty string, single character that conflicts with shell, or a string with special regex characters.
**Why it happens:** Insufficient validation.
**How to avoid:** Validate: must be 1+ non-whitespace characters, no spaces. Use string comparison (not regex) in classifier -- `trimmed === prefix || trimmed.startsWith(prefix + ' ')` -- so no regex escaping needed.
**Warning signs:** Empty prefix matches everything, breaking the shell.

## Code Examples

### Pipe Mode Entry (cli.ts)

```typescript
import { runPipe } from './pipe.js'

// After --version check, before runShell():
if (!process.stdin.isTTY) {
  const prompt = process.argv.slice(2).join(' ')
  runPipe(prompt).catch((err) => {
    process.stderr.write(`ClaudeShell error: ${(err as Error).message}\n`)
    process.exit(1)
  })
} else {
  runShell().catch((err) => {
    process.stderr.write(`ClaudeShell fatal error: ${(err as Error).message}\n`)
    process.exit(1)
  })
}
```

### Pipe Mode Implementation (pipe.ts)

```typescript
import { executeAI } from './ai.js'
import { createRenderer, renderCostFooter } from './renderer.js'
import { loadConfig, resolveApiKey } from './config.js'

const MAX_STDIN_BYTES = 1_048_576 // 1MB
const WARN_STDIN_BYTES = 102_400  // 100KB

async function collectStdin(): Promise<string> {
  const chunks: Buffer[] = []
  let totalBytes = 0
  for await (const chunk of process.stdin) {
    const buf = chunk as Buffer
    totalBytes += buf.length
    if (totalBytes > MAX_STDIN_BYTES) {
      throw new Error(`Stdin exceeds 1MB limit (${totalBytes} bytes). Pipe smaller input.`)
    }
    chunks.push(buf)
  }
  const content = Buffer.concat(chunks).toString('utf-8')

  // Reject binary content (check for null bytes)
  if (content.includes('\0')) {
    throw new Error('Binary input not supported. Pipe text content only.')
  }

  if (totalBytes > WARN_STDIN_BYTES) {
    process.stderr.write(`Warning: large input (${Math.round(totalBytes / 1024)}KB)\n`)
  }

  return content
}

export async function runPipe(cliPrompt: string): Promise<void> {
  const stdinContent = await collectStdin()

  // D-05: Both prompt and stdin → combine
  // D-06: Only stdin → stdin is the prompt
  const prompt = cliPrompt
    ? `${cliPrompt}\n\n---\n\n${stdinContent}`
    : stdinContent

  if (!prompt.trim()) {
    process.stderr.write('No input provided.\n')
    process.exit(1)
  }

  const renderer = createRenderer({ isTTY: false })
  const abortController = new AbortController()

  const result = await executeAI(prompt, {
    cwd: process.cwd(),
    lastError: undefined,
    abortController,
    callbacks: {
      onText: renderer.onText,
      onToolStart: renderer.onToolStart,
      onToolEnd: renderer.onToolEnd,
      onError: (msg) => process.stderr.write(msg + '\n'),
    },
  })

  renderer.finish()

  if (result.usage) {
    renderCostFooter(result.usage)
  }

  process.exit(0)
}
```

### Fix Prompt Builder (ai.ts)

```typescript
function buildFixPrompt(lastError: LastError): string {
  return [
    'The following command failed:',
    `\`${lastError.command}\``,
    `Exit code: ${lastError.exitCode}`,
    'Stderr:',
    lastError.stderr,
    '',
    'Suggest a single shell command to fix this error.',
    'Reply with ONLY the command on the first line.',
    'On subsequent lines, briefly explain why.',
    'If no fix is possible, reply with exactly: NO_FIX',
  ].join('\n')
}
```

### Configurable Prefix in Classifier (classify.ts)

```typescript
export function classifyInput(line: string, prefix: string = 'a'): InputAction {
  const trimmed = line.trim()
  if (!trimmed) return { type: 'empty' }

  // Configurable prefix routes to AI
  if (trimmed === prefix || trimmed.startsWith(prefix + ' ')) {
    const rawPrompt = trimmed.slice(prefix.length).trim()
    const { model, cleanPrompt } = extractModelFlag(rawPrompt)
    if (model) {
      return { type: 'ai', prompt: cleanPrompt, model }
    }
    return { type: 'ai', prompt: rawPrompt }
  }

  // ... rest unchanged
}
```

### Config Prefix Validation (config.ts)

```typescript
function validatePrefix(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return undefined  // reject empty or contains spaces
  return trimmed
}

// In loadConfig:
...(validatePrefix(obj.prefix) ? { prefix: validatePrefix(obj.prefix) } : {}),
```

### ShellState Extension (types.ts)

```typescript
export interface ShellState {
  readonly cdState: CdState
  readonly running: boolean
  readonly lastError: LastError | undefined
  readonly aiStreaming: boolean
  readonly sessionId: string | undefined
  readonly chatMode: boolean
  readonly currentModel: string | undefined
  readonly sessionCost: CostAccumulator
  readonly lastSuggestedFix: string | undefined  // NEW
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `process.stdin.setEncoding('utf8'); stdin.on('data')` | `for await (const chunk of process.stdin)` | Node 10+ async iterables | Cleaner, handles backpressure |
| `process.stdin.isTTY === undefined` check | `!process.stdin.isTTY` (falsy check) | Always been this way | `undefined` for pipes, `true` for TTY -- falsy check is correct |
| Custom arg parsing | `process.argv.slice(2)` | N/A | No flags needed for pipe mode -- just positional args as prompt |

## Open Questions

1. **Single-shot with args but no pipe**
   - What we know: D-02 says pipe mode is for `!process.stdin.isTTY` only. When stdin is TTY and args are provided (`claudeshell "hello"`), we enter the REPL.
   - What's unclear: Should `claudeshell "hello"` (no pipe, with args) do a single-shot AI call and exit? Or enter REPL?
   - Recommendation: Per D-02, only non-TTY stdin triggers pipe mode. If user provides args with TTY stdin, enter REPL normally (args are ignored). This matches the locked decision. Future enhancement could add a `--pipe` flag.

2. **Fix command extraction reliability**
   - What we know: AI responses are non-deterministic. Parsing the "first line" as a command is fragile.
   - What's unclear: What if AI wraps the command in backticks, or prefixes with `$`?
   - Recommendation: Strip leading `$`, backticks, and whitespace from the first line. If the result is empty or multi-line, treat as NO_FIX. The prompt engineering should minimize this, but defensive parsing is cheap.

## Project Constraints (from CLAUDE.md)

- **Immutable state**: ShellState updated via spread only. `lastSuggestedFix` follows this pattern.
- **Lazy SDK loading**: Pipe mode AI call still uses dynamic `import()` via existing `executeAI()`.
- **Shell passthrough**: `a fix` executes via `executeCommand()` (existing passthrough function).
- **No console.log**: Use `process.stderr.write` / `process.stdout.write` only.
- **TypeScript strict mode**: All new types must be readonly.
- **Vitest for testing**: New tests in `tests/pipe.test.ts` and updated `tests/classify.test.ts`.
- **File size < 800 lines**: `pipe.ts` will be ~60 lines. All modifications are small.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/cli.ts`, `src/shell.ts`, `src/ai.ts`, `src/classify.ts`, `src/renderer.ts`, `src/config.ts`, `src/types.ts`, `src/chat.ts`, `src/passthrough.ts`
- Node.js docs: `process.stdin.isTTY`, `process.stdout.isTTY`, async iterables on readable streams
- CONTEXT.md: 25 locked decisions from discussion phase

### Secondary (MEDIUM confidence)
- `tests/classify.test.ts`: Testing patterns and conventions for classifier

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all existing Node.js APIs
- Architecture: HIGH - Patterns directly visible in codebase, locked decisions are specific
- Pitfalls: HIGH - Well-known Node.js CLI patterns, verified against codebase

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable -- no external dependency changes)
