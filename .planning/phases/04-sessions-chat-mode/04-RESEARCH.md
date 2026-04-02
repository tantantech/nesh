# Phase 4: Sessions & Chat Mode - Research

**Researched:** 2026-03-31
**Domain:** Claude Agent SDK session management, chat-mode REPL, model selection, cost tracking
**Confidence:** HIGH

## Summary

Phase 4 transforms ClaudeShell from stateless single-shot AI queries into persistent conversation sessions with a dedicated chat mode, per-query model selection, and token/cost visibility. The critical finding is that the Claude Agent SDK v0.2.88 already provides ALL required session, model, and cost infrastructure natively -- zero new dependencies are needed.

The SDK's `Options.resume` field accepts a session ID string, `Options.model` accepts a model string, and `SDKResultMessage` contains `total_cost_usd`, `usage` (input/output tokens), and `modelUsage` (per-model breakdown). The `Query` object exposes `sessionId` for capturing the active session ID after the first message. The main implementation work is wiring these SDK capabilities into the existing REPL loop, adding a chat-mode readline loop, and creating thin modules for session lifecycle, model resolution, and cost formatting.

**Primary recommendation:** Use explicit `resume: sessionId` for all session continuity (never `continue: true`), create `session.ts`, `cost.ts` as new modules, extend `classify.ts` for model flags and slash commands, and add a chat-mode loop in `shell.ts` that shares the same renderer and AI pipeline.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Typing `a` with no prompt enters chat mode -- a dedicated readline loop where every line goes to AI
- D-02: Chat mode prompt is `ai > ` (distinct from shell prompt so user always knows which mode)
- D-03: Chat mode exits on `/exit`, `/shell`, or Ctrl+D -- returns to shell prompt instantly
- D-04: `/new` in chat mode starts a fresh AI context (new session ID) without leaving chat mode
- D-05: Chat mode and shell mode share the same terminal -- no split panes, no separate window
- D-06: Transition between modes is instant -- no delay, no loading, no context serialization visible to user
- D-07: Chat mode uses the same renderer (markdown + tool visibility) as single-shot `a` commands
- D-08: History in chat mode is separate from shell history -- stored as chat-specific history
- D-09: Use SDK `resume` option with explicit `sessionId` (NOT `continue` which is CWD-dependent and breaks on `cd`)
- D-10: Store current session ID in ShellState -- create new session on shell launch
- D-11: `/new` generates a fresh session ID and clears conversation context
- D-12: Session IDs are SDK-managed -- ClaudeShell only stores the ID string, not conversation data
- D-13: Create `src/session.ts` module to manage session lifecycle (create, resume, reset)
- D-14: Single-shot `a <prompt>` commands share the session (conversation continues across commands)
- D-15: Per-query: `a --haiku <prompt>`, `a --sonnet <prompt>`, `a --opus <prompt>` -- flag parsed before sending to SDK
- D-16: Default model: configurable in `~/.claudeshell/config.json` as `"model": "claude-sonnet-4-5-20250514"`
- D-17: Model shorthands: `haiku` -> `claude-haiku-4-5-20251001`, `sonnet` -> `claude-sonnet-4-5-20250514`, `opus` -> `claude-opus-4-6-20250414`
- D-18: In chat mode, model can be changed mid-session via `/model haiku` slash command
- D-19: Update `src/classify.ts` to parse `--haiku`, `--sonnet`, `--opus` flags from AI input
- D-20: After each AI response, show a dim footer: `tokens: 1,234 in / 567 out | cost: $0.0045`
- D-21: In chat mode, also show cumulative: `session: $0.0234 (5 messages)`
- D-22: Extract token/cost data from SDK `SDKResultMessage` fields (verify exact field names at implementation)
- D-23: Create `src/cost.ts` module for formatting and accumulation
- D-24: Cost display goes to stderr (doesn't pollute piped output)
- D-25: `/exit` or `/shell` -- return to shell mode
- D-26: `/new` -- start fresh AI context
- D-27: `/model <name>` -- switch model mid-session
- D-28: Slash commands are only active in chat mode, not in shell mode
- D-29: Unknown slash commands show help: `"Unknown command. Available: /exit, /new, /model <name>"`

### Claude's Discretion
- System prompt content for session context (what info to include about cwd, OS, etc.)
- Whether to show a "Session started" message on chat mode entry
- Internal session ID format/generation
- How to handle SDK session errors (expired, corrupted) -- likely just start fresh

### Deferred Ideas (OUT OF SCOPE)
- Session history browser (list/resume old sessions) -- ADV-01, future milestone
- Session export to file -- ADV-02, future milestone
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SESS-01 | AI remembers context across multiple `a` commands in the same session | SDK `resume: sessionId` on `Options` -- pass stored session ID to every `query()` call; SDK handles all conversation persistence |
| SESS-02 | User can type `/new` to start a fresh AI context without restarting the shell | Clear `sessionId` from ShellState; next `query()` call without `resume` starts fresh session; capture new `session_id` from `SDKResultMessage` |
| SESS-03 | User can select AI model per query or set default in config | SDK `Options.model` accepts full model string; parse `--haiku`/`--sonnet`/`--opus` flags in `classify.ts`; config `model` field already exists |
| SESS-04 | User can enter chat mode by typing `a` with no prompt | Detect empty prompt in classify result; enter dedicated readline loop with `ai > ` prompt; every line goes to `executeAI()` with session resume |
| SESS-05 | Chat mode and shell mode transitions are instant | No serialization needed -- session ID is just a string in memory; readline can be paused/resumed or a second interface created |
| SESS-06 | Chat mode shows a distinct prompt (`ai > `) | Use picocolors (existing dep) to color the `ai > ` prompt differently from the shell prompt |
| VIS-01 | After each AI response, show token count and estimated cost | `SDKResultMessage` contains `total_cost_usd: number`, `usage: { input_tokens, output_tokens }`, `modelUsage: Record<string, ModelUsage>` -- all verified in SDK types |
| VIS-02 | In chat mode, show cumulative session cost | Accumulate `total_cost_usd` and token counts across messages in a `CostAccumulator` object stored in ShellState |
</phase_requirements>

## Standard Stack

### Core (unchanged -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/claude-agent-sdk | ^0.2.88 | Sessions, model selection, cost data | SDK natively provides `resume`, `model`, `total_cost_usd`, `usage`, `modelUsage` |
| picocolors | ^1.1.1 | Dim cost footer, colored chat prompt | Already installed; used for tool indicators |
| node:readline/promises | built-in (Node 22) | Chat mode readline loop | Already used for shell REPL |
| node:crypto | built-in | `crypto.randomUUID()` for session IDs | Standard UUID generation |

### No New Dependencies Required

All Phase 4 features are implemented with existing dependencies plus Node.js built-ins. The SDK provides session management, model routing, and cost/token data. No new npm packages are needed.

## Architecture Patterns

### New Modules
```
src/
  session.ts    # NEW: session lifecycle (create, resume, reset)
  cost.ts       # NEW: cost extraction, formatting, accumulation
  types.ts      # EXTEND: ShellState + InputAction + CostAccumulator
  classify.ts   # EXTEND: --model flags, slash commands (chat mode only)
  ai.ts         # EXTEND: sessionId, model params to SDK query
  shell.ts      # EXTEND: chat mode loop, slash command dispatch
  config.ts     # EXTEND: model field usage (already declared)
  renderer.ts   # EXTEND: cost footer on finish()
```

### Pattern 1: Session State as String
**What:** Store only the session ID string in ShellState. The SDK manages all conversation data on disk.
**When:** Every AI call.
**Example:**
```typescript
// session.ts
import { randomUUID } from 'node:crypto'

export function createSessionId(): string {
  return randomUUID()
}

export function buildResumeOptions(sessionId: string | undefined): { resume?: string } {
  return sessionId ? { resume: sessionId } : {}
}

export function extractSessionId(resultMessage: SDKResultMessage): string {
  return resultMessage.session_id
}
```
Source: SDK type `SDKResultSuccess.session_id: string` (sdk.d.ts line 2431)

### Pattern 2: Chat Mode as Nested Loop
**What:** Chat mode is a `while` loop inside the main REPL's `case 'ai'` branch (when prompt is empty). It creates its own readline question calls with the `ai > ` prompt, dispatches slash commands internally, and returns to the outer loop on `/exit`, `/shell`, or Ctrl+D.
**When:** User types `a` with no arguments.
**Example:**
```typescript
// In shell.ts, inside case 'ai' when prompt is empty:
async function runChatMode(params: {
  rl: readline.Interface,
  state: ShellState,
  abortController: AbortController,
}): Promise<ShellState> {
  let chatState = params.state
  const chatPrompt = pc.cyan('ai > ')
  
  while (true) {
    let line: string
    try {
      line = await params.rl.question(chatPrompt)
    } catch {
      break // Ctrl+D
    }
    
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Slash commands
    if (trimmed.startsWith('/')) {
      const result = handleSlashCommand(trimmed, chatState)
      if (result.exit) break
      chatState = result.state
      continue
    }
    
    // Send to AI with session resume
    chatState = await executeChatMessage(trimmed, chatState)
  }
  
  return chatState
}
```

### Pattern 3: Model Flag Extraction in classify.ts
**What:** Parse `--haiku`, `--sonnet`, `--opus` flags from the AI prompt string. Return the model override alongside the cleaned prompt.
**When:** Any `a --<model> <prompt>` input.
**Example:**
```typescript
// Extend InputAction type
| { readonly type: 'ai'; readonly prompt: string; readonly model?: string }

// In classifyInput:
if (trimmed === 'a' || trimmed.startsWith('a ')) {
  const prompt = trimmed.slice(2).trim()
  const { model, cleanPrompt } = extractModelFlag(prompt)
  return { type: 'ai', prompt: cleanPrompt, model }
}

function extractModelFlag(prompt: string): { model?: string; cleanPrompt: string } {
  const MODEL_FLAGS: Record<string, string> = {
    '--haiku': 'claude-haiku-4-5-20251001',
    '--sonnet': 'claude-sonnet-4-5-20250514',
    '--opus': 'claude-opus-4-6-20250414',
  }
  for (const [flag, model] of Object.entries(MODEL_FLAGS)) {
    if (prompt.startsWith(flag + ' ') || prompt === flag) {
      return { model, cleanPrompt: prompt.slice(flag.length).trim() }
    }
  }
  return { cleanPrompt: prompt }
}
```

### Pattern 4: Cost Extraction and Accumulation
**What:** Extract cost data from `SDKResultMessage`, format for display, accumulate across a session.
**When:** After every AI response completes.
**Example:**
```typescript
// cost.ts
export interface UsageInfo {
  readonly inputTokens: number
  readonly outputTokens: number
  readonly costUsd: number
  readonly durationMs: number
}

export interface CostAccumulator {
  readonly totalCostUsd: number
  readonly totalInputTokens: number
  readonly totalOutputTokens: number
  readonly messageCount: number
}

export const EMPTY_ACCUMULATOR: CostAccumulator = {
  totalCostUsd: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  messageCount: 0,
}

export function extractUsage(msg: SDKResultMessage): UsageInfo {
  return {
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
    costUsd: msg.total_cost_usd,
    durationMs: msg.duration_ms,
  }
}

export function accumulate(acc: CostAccumulator, usage: UsageInfo): CostAccumulator {
  return {
    totalCostUsd: acc.totalCostUsd + usage.costUsd,
    totalInputTokens: acc.totalInputTokens + usage.inputTokens,
    totalOutputTokens: acc.totalOutputTokens + usage.outputTokens,
    messageCount: acc.messageCount + 1,
  }
}

export function formatUsage(usage: UsageInfo): string {
  const inK = (usage.inputTokens / 1000).toFixed(1)
  const outK = (usage.outputTokens / 1000).toFixed(1)
  const cost = usage.costUsd < 0.01
    ? `$${usage.costUsd.toFixed(4)}`
    : `$${usage.costUsd.toFixed(2)}`
  return `tokens: ${inK}k in / ${outK}k out | cost: ${cost}`
}

export function formatSessionCost(acc: CostAccumulator): string {
  const cost = acc.totalCostUsd < 0.01
    ? `$${acc.totalCostUsd.toFixed(4)}`
    : `$${acc.totalCostUsd.toFixed(2)}`
  return `session: ${cost} (${acc.messageCount} messages)`
}
```

### Pattern 5: SDK Options Builder (extended executeAI)
**What:** Compose session, model, and existing options into a single SDK `query()` call.
**When:** Every AI invocation.
**Example:**
```typescript
// ai.ts -- extended executeAI signature
export async function executeAI(
  prompt: string,
  options: {
    readonly cwd: string
    readonly lastError: LastError | undefined
    readonly abortController: AbortController
    readonly callbacks: AICallbacks
    readonly sessionId?: string        // NEW
    readonly model?: string            // NEW
  }
): Promise<AIResult> {
  // ...
  const stream = sdk.query({
    prompt: fullPrompt,
    options: {
      abortController,
      includePartialMessages: true,
      allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
      permissionMode: 'acceptEdits' as const,
      cwd,
      systemPrompt,
      model: options.model,                          // NEW
      ...buildResumeOptions(options.sessionId),       // NEW
    }
  })
  // ... stream processing ...
  // Return result message for cost extraction
}
```

### Anti-Patterns to Avoid
- **Using `continue: true`:** Breaks on `cd` because SDK looks up sessions by encoded CWD path. Always use explicit `resume: sessionId`.
- **Storing conversation history in ClaudeShell:** The SDK handles ALL session persistence. Store only the session ID string.
- **Monolithic chat mode function:** Keep chat mode as a loop that delegates to existing `executeAI()` + `createRenderer()`. Do not duplicate AI call logic.
- **Mutating ShellState:** Continue the immutable spread pattern. Chat mode returns updated state, never mutates in place.
- **Parsing slash commands outside chat mode:** Per D-28, slash commands are chat-mode only. The main REPL should not intercept `/` commands.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Custom JSONL conversation storage | SDK `resume: sessionId` | SDK handles storage, compaction, forking automatically |
| Session ID generation | Custom ID scheme | `crypto.randomUUID()` | SDK expects valid UUIDs for `sessionId` field |
| Token counting | Manual token estimation | SDK `SDKResultMessage.usage` | SDK provides exact counts from the API response |
| Cost calculation | Price-per-token math | SDK `SDKResultMessage.total_cost_usd` | SDK has current pricing built in |
| Model validation | Hardcoded model list | SDK `Query.supportedModels()` (future) | SDK knows which models are available |
| Conversation compaction | Custom summarization | SDK built-in compaction | SDK handles context window management |

## Common Pitfalls

### Pitfall 1: Session Resume Fails Silently on CWD Change
**What goes wrong:** Using `continue: true` instead of `resume: sessionId` causes the SDK to look for sessions under `~/.claude/projects/<encoded-cwd>/`. If the user runs `cd` between `a` commands, the encoded path changes and the SDK silently starts a fresh session instead of resuming.
**Why it happens:** The SDK's `continue` option is CWD-dependent by design.
**How to avoid:** Always use `resume: sessionId` with the explicitly stored session ID from ShellState. This is locked in D-09.
**Warning signs:** AI "forgets" what was discussed after a `cd` command.

### Pitfall 2: Not Capturing session_id from First Response
**What goes wrong:** On the first AI call in a new session, no `sessionId` is passed (fresh session). The SDK generates one and returns it in `SDKResultMessage.session_id`. If this isn't captured and stored in ShellState, the next `a` command starts yet another fresh session -- defeating session continuity.
**Why it happens:** The session ID is only available AFTER the first response completes. It must be extracted from the result message and stored.
**How to avoid:** After the `for await` loop completes, check for `msg.type === 'result'` and extract `msg.session_id`. Store it in ShellState immediately.
**Warning signs:** Every `a` command creates a new session instead of continuing.

### Pitfall 3: Chat Mode Readline Conflict
**What goes wrong:** Creating a second `readline.Interface` for chat mode while the shell's readline is still active causes stdin conflicts -- lost keystrokes or doubled input.
**Why it happens:** Node.js only supports one `readline.Interface` reading from `process.stdin` at a time.
**How to avoid:** Reuse the existing readline interface for chat mode. Change the prompt string to `ai > ` via `rl.setPrompt()` or simply use `rl.question(chatPrompt)` in the chat loop. Do NOT create a new `readline.createInterface()`.
**Warning signs:** Characters disappear or echo twice when entering/leaving chat mode.

### Pitfall 4: Ctrl+D in Chat Mode Kills Shell
**What goes wrong:** Ctrl+D in chat mode triggers readline's `close` event, which the main REPL interprets as "exit shell". The user just wanted to leave chat mode.
**Why it happens:** The `rl.on('close')` handler sets `state.running = false`.
**How to avoid:** In chat mode, catch the `ERR_USE_AFTER_CLOSE` error from `rl.question()` or handle `close` differently when in chat mode. Ctrl+D in chat mode should return to shell mode, not exit the shell. May need to recreate the readline interface after chat mode Ctrl+D.
**Warning signs:** Pressing Ctrl+D in chat mode exits the entire shell.

### Pitfall 5: Cost Display Appears Before Response Finishes
**What goes wrong:** The cost footer renders while the markdown response is still being formatted, causing interleaved output.
**Why it happens:** The `SDKResultMessage` with cost data arrives as the last message in the stream. If cost rendering isn't explicitly sequenced after `renderer.finish()`, it can race.
**How to avoid:** Extract cost data from the result message during stream processing, but only render it AFTER `renderer.finish()` is called. The sequence must be: stream completes -> `renderer.finish()` -> cost footer to stderr.
**Warning signs:** Cost line appears mid-response or before the markdown rendering.

### Pitfall 6: Model Shorthands Become Stale
**What goes wrong:** Model strings like `claude-sonnet-4-5-20250514` include dates and version numbers. When Anthropic releases new models, the hardcoded shorthands point to old versions.
**Why it happens:** Model IDs are baked into the source code.
**How to avoid:** Use the SDK's model aliases where possible (e.g., `claude-sonnet-4-6` without date suffix may resolve to latest). Fall back to explicit dated strings. Consider a config override for model mappings. Note: the SDK `Options.model` examples use `'claude-sonnet-4-6'` without date suffixes.
**Warning signs:** Users get older model versions than expected.

## Code Examples

### SDK Result Message Shape (verified from sdk.d.ts)
```typescript
// Source: node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts lines 2415-2431
type SDKResultSuccess = {
  type: 'result'
  subtype: 'success'
  duration_ms: number
  duration_api_ms: number
  is_error: boolean
  num_turns: number
  result: string
  stop_reason: string | null
  total_cost_usd: number        // <-- cost in USD
  usage: {                       // <-- NonNullableUsage (from BetaUsage)
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens: number
    cache_read_input_tokens: number
  }
  modelUsage: Record<string, {   // <-- per-model breakdown
    inputTokens: number
    outputTokens: number
    cacheReadInputTokens: number
    cacheCreationInputTokens: number
    webSearchRequests: number
    costUSD: number
    contextWindow: number
    maxOutputTokens: number
  }>
  session_id: string             // <-- capture this for resume
}
```

### SDK Query with Resume and Model
```typescript
// Source: sdk.d.ts Options type, lines 1115, 1196
import * as sdk from '@anthropic-ai/claude-agent-sdk'

const stream = sdk.query({
  prompt: userPrompt,
  options: {
    cwd: process.cwd(),
    model: 'claude-sonnet-4-5-20250514',  // Options.model
    resume: 'uuid-of-previous-session',   // Options.resume
    abortController: new AbortController(),
    includePartialMessages: true,
    allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
    permissionMode: 'acceptEdits',
  }
})
```

### ShellState Extension
```typescript
// types.ts -- immutable state with new fields
export interface ShellState {
  readonly cdState: CdState
  readonly running: boolean
  readonly lastError: LastError | undefined
  readonly aiStreaming: boolean
  // Phase 4 additions:
  readonly sessionId: string | undefined
  readonly chatMode: boolean
  readonly currentModel: string | undefined
  readonly sessionCost: CostAccumulator
}
```

### InputAction Extension
```typescript
// types.ts -- extended union
export type InputAction =
  | { readonly type: 'builtin'; readonly name: BuiltinName; readonly args: string }
  | { readonly type: 'passthrough'; readonly command: string }
  | { readonly type: 'ai'; readonly prompt: string; readonly model?: string }
  | { readonly type: 'empty' }
```

### executeAI Return Type (new)
```typescript
// ai.ts -- return result data for cost extraction
export interface AIResult {
  readonly sessionId: string | undefined
  readonly usage: UsageInfo | undefined
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `continue: true` (CWD-dependent) | `resume: sessionId` (explicit) | SDK v0.2.x | Must use explicit resume; `continue` breaks on `cd` |
| Manual token counting | SDK `total_cost_usd` + `usage` fields | SDK v0.2.x | No need to maintain pricing tables |
| Custom session files | SDK JSONL session storage | SDK v0.2.x | Zero custom storage code needed |

## Open Questions

1. **Ctrl+D handling in chat mode**
   - What we know: Ctrl+D triggers readline `close` event, which currently exits the shell
   - What's unclear: Whether we can intercept Ctrl+D in `rl.question()` without it propagating to `close`, or if we need to recreate the readline interface after chat mode exit via Ctrl+D
   - Recommendation: Wrap `rl.question()` in try/catch for `ERR_USE_AFTER_CLOSE`; if caught in chat mode, recreate the readline interface and return to shell mode

2. **Chat mode history separation (D-08)**
   - What we know: readline supports a `history` array; shell history is managed in `history.ts`
   - What's unclear: Whether readline allows swapping the history array at runtime, or if we need separate storage
   - Recommendation: Save/restore the readline history array when entering/leaving chat mode. Store chat history in `~/.claudeshell/chat_history`

3. **Session ID on first call**
   - What we know: First call has no sessionId to pass. SDK generates one and returns it in `SDKResultMessage.session_id`
   - What's unclear: Whether we can pre-set a sessionId via `Options.sessionId` on the first call to avoid the "capture from result" pattern
   - Recommendation: Use `Options.sessionId` (verified in sdk.d.ts line 1202) with `crypto.randomUUID()` on shell startup. This gives us the session ID before the first API call. Note the constraint: "Cannot be used with `continue` or `resume` unless `forkSession` is also set."

4. **Model shorthand freshness**
   - What we know: D-17 specifies exact model strings with dates
   - What's unclear: Whether the SDK accepts short aliases like `claude-sonnet-4-6` (without date suffix) and resolves them to the latest version
   - Recommendation: Use the dated strings from D-17 as defaults. Allow config override. Consider calling `Query.supportedModels()` to validate in a future phase.

## Sources

### Primary (HIGH confidence)
- `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts` -- SDK type definitions for `Options`, `SDKResultMessage`, `ModelUsage`, `Query`, `SDKSessionInfo` (source of truth)
- `.planning/research/STACK.md` -- Milestone-level stack research (verified against SDK types)
- `.planning/research/ARCHITECTURE.md` -- Architecture patterns and data flow
- `.planning/research/PITFALLS.md` -- Session resume CWD pitfall, permission escalation

### Secondary (MEDIUM confidence)
- [Claude Agent SDK Sessions docs](https://platform.claude.com/docs/en/agent-sdk/sessions) -- referenced in STACK.md
- [Claude Agent SDK TypeScript reference](https://platform.claude.com/docs/en/agent-sdk/typescript) -- referenced in STACK.md

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified all SDK types against installed v0.2.88 type definitions; zero new deps needed
- Architecture: HIGH -- patterns match existing codebase conventions; SDK APIs verified in .d.ts files
- Pitfalls: HIGH -- CWD-based session resume pitfall documented in official SDK docs; readline stdin conflict documented in Node.js issues

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (SDK API is stable; model strings may need updating sooner)
