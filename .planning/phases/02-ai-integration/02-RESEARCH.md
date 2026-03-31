# Phase 2: AI Integration - Research

**Researched:** 2026-03-31
**Domain:** Claude Agent SDK integration, streaming output, terminal markdown rendering
**Confidence:** HIGH

## Summary

Phase 2 wires the Claude Agent SDK into ClaudeShell's existing REPL loop so that `a <prompt>` commands route to Claude and stream responses in real-time with tool-use visibility. The SDK package is `@anthropic-ai/claude-agent-sdk` (v0.2.88, formerly `claude-code-sdk`). The primary function is `query()` which returns an `AsyncGenerator<SDKMessage>` with an `interrupt()` method for Ctrl+C cancellation via the `abortController` option.

The streaming pattern is well-documented: enable `includePartialMessages: true`, then process `stream_event` messages containing `content_block_start`, `content_block_delta` (with `text_delta` for text and `input_json_delta` for tool inputs), and `content_block_stop` events. Markdown rendering uses `marked` + `marked-terminal` (the `markedTerminal` extension API). Error handling maps `SDKAssistantMessageError` subtypes (`authentication_failed`, `rate_limit`, `billing_error`, etc.) to user-friendly messages.

**Primary recommendation:** Create `src/ai.ts` as a thin wrapper around `query()` with lazy-loading, `src/renderer.ts` as a streaming state machine, update `src/classify.ts` to replace `ai_placeholder` with `ai` action type, and modify `src/passthrough.ts` to capture stderr for the error explanation feature.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Lazy-load the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) on first `a` command -- do NOT import at shell startup
- **D-02:** Use the SDK's `query()` async generator with `includePartialMessages: true` for streaming
- **D-03:** Pass `permissionMode: "acceptEdits"` to allow Claude to read/write files and execute commands without per-action prompts (v1)
- **D-04:** Create a dedicated `src/ai.ts` module that encapsulates all SDK interaction
- **D-05:** The existing `classifyInput()` already returns `ai_placeholder` for `a` prefix -- update it to route to the AI module instead of showing the placeholder message
- **D-06:** Use `marked` + `marked-terminal` to render Claude's markdown responses with syntax highlighting and formatting
- **D-07:** Stream tokens to stdout as they arrive -- do NOT buffer the full response
- **D-08:** Use `picocolors` (already installed) for status/info messages distinct from AI output
- **D-09:** After the AI response completes, print a blank line before the next prompt for readability
- **D-10:** When stdout is not a TTY (piped), output plain text without colors or markdown formatting
- **D-11:** When Claude uses a tool, display an inline status line: e.g., `  -> Reading src/types.ts...`
- **D-12:** Use dim/gray color for tool status lines to distinguish from AI response text
- **D-13:** Show tool results briefly when relevant (e.g., command exit code, file path)
- **D-14:** Tool status lines go to stderr so they don't pollute piped stdout
- **D-15:** Missing API key: show helpful message and return to prompt (don't crash)
- **D-16:** Rate limit: show `"Rate limited -- wait a moment and try again"` with retry-after if available
- **D-17:** Network error: show `"Network error -- check your connection"`
- **D-18:** Authentication failure: show `"Invalid API key -- check ANTHROPIC_API_KEY"`
- **D-19:** All errors return to the shell prompt -- never crash from an SDK error
- **D-20:** Wrap the entire AI execution in try/catch at the top level
- **D-21:** When user presses Ctrl+C during an AI response, use `AbortController` to cancel the SDK query
- **D-22:** After cancellation, print `"\n[cancelled]"` and return to the prompt cleanly
- **D-23:** The existing SIGINT handler in shell.ts needs to be extended to detect "AI streaming" state
- **D-24:** When a standard command fails, offer to explain: `"Command failed [exit: N]. Type 'a explain' to ask AI about the error."`
- **D-25:** Store the last failed command's stderr in shell state for the AI to reference
- **D-26:** `a explain` (or `a why`) is a shortcut that passes the last error context to Claude
- **D-27:** Check `ANTHROPIC_API_KEY` environment variable (primary)
- **D-28:** Also check `~/.claudeshell/config` for an `api_key` field (secondary)
- **D-29:** If neither found, show the helpful error on first `a` command (not at startup)

### Claude's Discretion
- Exact SDK `query()` options beyond what's specified (temperature, max tokens, system prompt content)
- How to structure the system prompt for shell context (cwd, OS, shell info)
- Whether to show a "thinking..." indicator before the first token arrives
- Internal retry logic for transient SDK errors

### Deferred Ideas (OUT OF SCOPE)
- Session/conversation context across multiple `a` commands (v2 -- SESS-01)
- Model selection per query (v2 -- SESS-03)
- Token/cost display (v2 -- PWR-05)
- Permission control for AI actions (v2 -- PWR-04)
- Pipe-friendly AI output `cat file | a summarize` (v2 -- PWR-01)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AI-01 | User can type `a <prompt>` to send a request to Claude via Claude Agent SDK | SDK `query()` function accepts string prompt; classify.ts already detects `a` prefix |
| AI-02 | Claude's response streams back to the terminal in real-time | `includePartialMessages: true` yields `stream_event` messages with `text_delta` events |
| AI-03 | User can press Ctrl+C during an AI response to cancel the streaming query | `Options.abortController` + `Query.interrupt()` method |
| AI-04 | Claude has access to read and write files via SDK tools | `allowedTools: ["Read", "Write", "Edit", "Glob", "Grep"]` with `permissionMode: "acceptEdits"` |
| AI-05 | Claude can execute shell commands as part of its response via SDK tools | `allowedTools` includes `"Bash"` tool |
| AI-06 | User sees when Claude is using tools in real-time | `content_block_start` events with `tool_use` type expose tool name |
| AI-07 | AI responses are rendered with markdown formatting and syntax highlighting | `marked` v17 + `marked-terminal` v7.3 with `markedTerminal()` extension |
| CONF-01 | User can configure API key via ANTHROPIC_API_KEY environment variable | SDK reads `ANTHROPIC_API_KEY` from env automatically |
| CONF-02 | Shell shows helpful error if API key is missing when `a` command is used | Lazy validation on first `a` command; check env + config file |
| ERR-01 | When a command fails, user can ask AI to explain the error | Store last error in ShellState; `a explain` shortcut passes context to Claude |
| ERR-02 | SDK errors show clear user-friendly messages | `SDKAssistantMessage.error` field maps to: `authentication_failed`, `rate_limit`, `billing_error`, `server_error`, etc. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/claude-agent-sdk` | 0.2.88 | AI agent loop, tool use, streaming | Official SDK powering Claude Code. Provides `query()` async generator, built-in tools, permission modes, session management. |
| `marked` | 17.0.5 | Markdown parser | Standard markdown parser for Node.js. Used by `marked-terminal`. |
| `marked-terminal` | 7.3.0 | Terminal markdown renderer | Renders markdown with ANSI formatting, syntax highlighting via cli-highlight. Battle-tested. |

### Already Installed (from Phase 1)
| Library | Version | Purpose |
|---------|---------|---------|
| `picocolors` | ^1.1.1 | ANSI colors for status messages |
| `vitest` | ^4.1.2 | Testing framework |
| `tsx` | ^4.21.0 | Dev-time TS execution |
| `typescript` | ^6.0.2 | Type safety |

### Supporting (use when needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ora` | ^8.x | Spinner indicator | Optional "thinking..." indicator before first token. Claude's discretion. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `marked` + `marked-terminal` | `cli-markdown` | cli-markdown is simpler but less mature; marked-terminal has syntax highlighting and better table support |
| `marked` + `marked-terminal` | Raw `process.stdout.write` | No markdown formatting; users see raw `**bold**` and `# headings` |
| `AbortController` | Manual signal handling | AbortController is the SDK's native cancellation mechanism |

**Installation:**
```bash
npm install @anthropic-ai/claude-agent-sdk marked marked-terminal
```

**Version verification:** Versions confirmed via npm registry on 2026-03-31:
- `@anthropic-ai/claude-agent-sdk`: 0.2.88 (latest)
- `marked`: 17.0.5 (latest)
- `marked-terminal`: 7.3.0 (latest)

## Architecture Patterns

### New/Modified Files
```
src/
  ai.ts              # NEW: Claude Agent SDK wrapper (lazy-loaded)
  renderer.ts        # NEW: Streaming output state machine
  classify.ts        # MODIFY: ai_placeholder -> ai action type
  types.ts           # MODIFY: Add LastError, extend ShellState
  shell.ts           # MODIFY: Add AI execution path, SIGINT state
  passthrough.ts     # MODIFY: Capture stderr on failure
  config.ts          # NEW: API key resolution (env + config file)
tests/
  ai.test.ts         # NEW: AI module unit tests
  renderer.test.ts   # NEW: Renderer state machine tests
  config.test.ts     # NEW: Config resolution tests
  classify.test.ts   # MODIFY: Update for new ai action type
```

### Pattern 1: Lazy-Loaded SDK Module
**What:** Dynamic `import()` of `@anthropic-ai/claude-agent-sdk` on first AI command to avoid startup latency.
**When to use:** Every `a` command invocation.
**Example:**
```typescript
// Source: Official SDK docs + D-01 decision
// src/ai.ts
let queryFn: typeof import('@anthropic-ai/claude-agent-sdk').query | null = null;

async function getQuery() {
  if (!queryFn) {
    const sdk = await import('@anthropic-ai/claude-agent-sdk');
    queryFn = sdk.query;
  }
  return queryFn;
}
```

### Pattern 2: Streaming State Machine (renderer.ts)
**What:** State machine that processes SDK `stream_event` messages and renders text/tool indicators.
**When to use:** For every streamed AI response.
**Example:**
```typescript
// Source: platform.claude.com/docs/en/agent-sdk/streaming-output
// "Build a streaming UI" example adapted for ClaudeShell
type RenderState = 'idle' | 'streaming_text' | 'tool_running';

let state: RenderState = 'idle';
let inTool = false;

function handleStreamEvent(event: BetaRawMessageStreamEvent, isTTY: boolean): void {
  if (event.type === 'content_block_start') {
    if (event.content_block.type === 'tool_use') {
      // D-11: Tool status line to stderr (D-14)
      process.stderr.write(
        isTTY ? dim(`\n  -> Using ${event.content_block.name}...`) : ''
      );
      inTool = true;
    }
  } else if (event.type === 'content_block_delta') {
    if (event.delta.type === 'text_delta' && !inTool) {
      // D-07: Stream tokens immediately
      process.stdout.write(event.delta.text);
    }
  } else if (event.type === 'content_block_stop') {
    if (inTool) {
      process.stderr.write(isTTY ? dim(' done\n') : '');
      inTool = false;
    }
  }
}
```

### Pattern 3: AbortController for Ctrl+C (ai.ts)
**What:** Pass AbortController to SDK, call abort on SIGINT during AI streaming.
**When to use:** Every AI query execution.
**Example:**
```typescript
// Source: SDK Options.abortController docs
// D-21, D-22, D-23
export async function executeAI(
  prompt: string,
  options: { cwd: string; onStream: (event: StreamEvent) => void }
): Promise<AIResult> {
  const abortController = new AbortController();

  // Register SIGINT handler for this query
  const sigintHandler = () => {
    abortController.abort();
    process.stderr.write('\n[cancelled]\n');
  };
  process.on('SIGINT', sigintHandler);

  try {
    const queryFn = await getQuery();
    const q = queryFn({
      prompt,
      options: {
        abortController,
        includePartialMessages: true,
        allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
        permissionMode: 'acceptEdits',
        cwd: options.cwd,
        systemPrompt: buildSystemPrompt(options.cwd),
      }
    });

    for await (const message of q) {
      // Process messages...
    }
  } finally {
    process.removeListener('SIGINT', sigintHandler);
  }
}
```

### Pattern 4: Error Classification
**What:** Map SDK error types to user-friendly messages.
**When to use:** In the try/catch wrapper of AI execution.
**Example:**
```typescript
// Source: SDK SDKAssistantMessage.error types + SDKResultMessage subtypes
// D-15 through D-19
function classifyError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('api key') || msg.includes('authentication'))
      return 'Invalid API key -- check ANTHROPIC_API_KEY';
    if (msg.includes('rate limit'))
      return 'Rate limited -- wait a moment and try again';
    if (msg.includes('network') || msg.includes('ECONNREFUSED'))
      return 'Network error -- check your connection';
  }
  return `AI error: ${(error as Error)?.message ?? String(error)}`;
}

// Also handle SDKAssistantMessage.error field inline:
// 'authentication_failed' -> D-18 message
// 'rate_limit' -> D-16 message
// 'billing_error' -> billing-specific message
// 'server_error' -> generic retry message
```

### Pattern 5: Markdown Rendering with TTY Detection
**What:** Render AI text through marked-terminal when TTY, plain text when piped.
**When to use:** Final rendering of accumulated text blocks.
**Example:**
```typescript
// Source: marked-terminal npm README + D-10
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

// Configure once (lazy, alongside SDK)
let markedConfigured = false;
function ensureMarkedConfigured(): void {
  if (markedConfigured) return;
  if (process.stdout.isTTY) {
    marked.use(markedTerminal());
  }
  markedConfigured = true;
}

function renderMarkdown(text: string): string {
  ensureMarkedConfigured();
  if (!process.stdout.isTTY) return text; // D-10: plain text when piped
  return marked.parse(text) as string;
}
```

### Pattern 6: Last Error State for `a explain`
**What:** Capture stderr from failed commands and store in ShellState for AI context.
**When to use:** After any passthrough command failure.
**Example:**
```typescript
// Source: D-24, D-25, D-26
// types.ts extension
export interface LastError {
  readonly command: string;
  readonly stderr: string;
  readonly exitCode: number;
}

export interface ShellState {
  readonly cdState: CdState;
  readonly running: boolean;
  readonly lastError: LastError | undefined;
  readonly aiStreaming: boolean;  // for SIGINT routing
}

// passthrough.ts: capture stderr instead of inheriting it
// Use spawn with pipe for stderr, inherit for stdout/stdin
```

### Anti-Patterns to Avoid
- **Buffering full response before display:** Stream `text_delta` to stdout immediately (D-07). The SDK's streaming UI example shows exactly this pattern.
- **Importing SDK at top level:** Dynamic `import()` only on first `a` command (D-01). The SDK binary is heavy.
- **Custom streaming implementation:** Use the SDK's async generator directly. Do not build your own token accumulator -- just process `stream_event` messages.
- **Calling `process.exit()` on SDK errors:** All errors return to prompt (D-19). Wrap in try/catch, show message, continue REPL.
- **Parsing tool_use input JSON:** You don't need to parse the tool input -- just show the tool name from `content_block_start`. The SDK handles tool execution internally.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AI agent loop (tool use + response) | Custom tool-use loop with raw Anthropic API | `@anthropic-ai/claude-agent-sdk` `query()` | SDK handles the full agent loop: tool invocation, result passing, multi-turn reasoning. Hundreds of edge cases. |
| Markdown terminal rendering | Custom ANSI escape code generator | `marked` + `marked-terminal` | Handles bold, italic, code blocks, tables, syntax highlighting, links. Edge cases with nested formatting. |
| Stream cancellation | Manual HTTP request abort | `Options.abortController` + `Query.interrupt()` | SDK manages cleanup, partial state, and graceful shutdown internally. |
| API key resolution | Custom env/file lookup chain | SDK's built-in `ANTHROPIC_API_KEY` detection | SDK already checks env var. We only add config file fallback. |
| Tool execution | Implementing Read/Write/Bash tools | SDK built-in tools | SDK includes Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch with proper sandboxing. |

**Key insight:** The Claude Agent SDK is not just an API client -- it is a full agent runtime. It handles the tool-use loop, file operations, command execution, context management, and session persistence. Our job is to wire its output to the terminal, not to reimplement any of its internals.

## Common Pitfalls

### Pitfall 1: Silent SDK Errors
**What goes wrong:** The `for await` loop over `query()` silently stops on network/auth errors. User sees nothing.
**Why it happens:** Async generator errors require try/catch around the loop. The SDK may also surface errors as `SDKAssistantMessage.error` fields rather than thrown exceptions.
**How to avoid:** Wrap the entire `for await` in try/catch (D-20). Also check `message.type === 'assistant' && message.error` for inline error reporting. Check `message.type === 'result' && message.is_error` for result-level errors.
**Warning signs:** AI command produces no output at all. No error message displayed.

### Pitfall 2: SIGINT Kills Shell Instead of Cancelling AI
**What goes wrong:** Ctrl+C during AI streaming exits the entire shell process instead of just cancelling the current query.
**Why it happens:** Default Node.js SIGINT behavior exits the process. The readline SIGINT handler and the AI abort handler conflict.
**How to avoid:** Track `aiStreaming` state in ShellState. When true, SIGINT calls `abortController.abort()` and does NOT propagate. When false (idle at prompt), let readline handle it normally. Remove the SIGINT listener after each AI query completes (D-23).
**Warning signs:** Shell exits on Ctrl+C during AI response.

### Pitfall 3: Prompt Position After Streaming
**What goes wrong:** After AI response completes, the prompt appears on the same line as the last output or at a wrong position.
**Why it happens:** `process.stdout.write()` for streaming doesn't add trailing newlines. The renderer state machine may not emit a final newline.
**How to avoid:** After the AI response loop completes, always write `\n` before returning to the REPL (D-09). Check if the last character written was already a newline to avoid double-spacing.
**Warning signs:** Prompt appears inline with AI text, or there's no visual separation.

### Pitfall 4: Stderr Capture Breaks Interactive Output
**What goes wrong:** To capture stderr for `a explain` (D-25), passthrough.ts changes from `stdio: 'inherit'` to piping stderr. This breaks programs that use stderr for progress indicators (curl, git, npm).
**Why it happens:** Many CLI tools write progress bars and status to stderr. Piping stderr means those indicators don't appear.
**How to avoid:** Capture stderr to a buffer while ALSO writing it to the real stderr in real-time using a tee pattern: `child.stderr.on('data', chunk => { stderrBuf.push(chunk); process.stderr.write(chunk); })`. Only change stdin/stdout to 'inherit', pipe stderr.
**Warning signs:** Commands like `git clone` or `npm install` show no progress output.

### Pitfall 5: Markdown Rendering During Streaming
**What goes wrong:** If you try to render markdown on each `text_delta` chunk, you get broken formatting because markdown structures (code blocks, tables) span multiple chunks.
**Why it happens:** Each `text_delta` is a fragment. A code block's opening ``` may arrive in one chunk and the closing in another.
**How to avoid:** Stream raw text directly during streaming (D-07). Apply markdown rendering only on the complete response text, OR render paragraph-by-paragraph when you detect paragraph boundaries. A simpler approach: write raw text during streaming, and if the user scrolls back, the raw text is readable enough. Full markdown rendering can be a v2 polish item.
**Warning signs:** Half-rendered code blocks, broken table formatting during streaming.

### Pitfall 6: SDK Startup Latency
**What goes wrong:** First `a` command takes 3-5 seconds before any response because the SDK module is being loaded.
**Why it happens:** The SDK binary is large and spawns a Claude Code subprocess.
**How to avoid:** Show immediate feedback ("Thinking...") before the first token arrives. The lazy-load ensures this only happens on first `a` command, not shell startup. Consider showing a dim status line on stderr while waiting.
**Warning signs:** Multi-second delay with no visual feedback on first AI command.

## Code Examples

### Complete AI Module Structure (src/ai.ts)
```typescript
// Source: platform.claude.com/docs/en/agent-sdk/typescript + streaming-output
import type { ShellState, LastError } from './types.js';

// Lazy-loaded SDK reference
let sdkModule: typeof import('@anthropic-ai/claude-agent-sdk') | null = null;

async function loadSDK() {
  if (!sdkModule) {
    sdkModule = await import('@anthropic-ai/claude-agent-sdk');
  }
  return sdkModule;
}

export function resolveApiKey(): string | undefined {
  // D-27: Check env first
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  // D-28: Check config file (secondary)
  // ... read ~/.claudeshell/config
  return undefined;
}

export async function executeAI(
  prompt: string,
  state: ShellState,
  callbacks: {
    onText: (text: string) => void;
    onToolStart: (name: string) => void;
    onToolEnd: (name: string) => void;
    onError: (message: string) => void;
  }
): Promise<void> {
  // D-15: Check API key before loading SDK
  const apiKey = resolveApiKey();
  if (!apiKey) {
    callbacks.onError(
      'Set ANTHROPIC_API_KEY to use AI commands. Example: export ANTHROPIC_API_KEY=sk-ant-...'
    );
    return;
  }

  const { query } = await loadSDK();
  const abortController = new AbortController();

  // Build prompt with error context for "a explain" (D-26)
  const fullPrompt = buildPromptWithContext(prompt, state.lastError);

  try {
    for await (const message of query({
      prompt: fullPrompt,
      options: {
        abortController,
        includePartialMessages: true,
        allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
        permissionMode: 'acceptEdits',
        cwd: process.cwd(),
        systemPrompt: buildSystemPrompt(),
      }
    })) {
      if (message.type === 'stream_event') {
        const event = message.event;
        if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
          callbacks.onToolStart(event.content_block.name);
        } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          callbacks.onText(event.delta.text);
        } else if (event.type === 'content_block_stop') {
          // May need to track if this was a tool block
          callbacks.onToolEnd('');
        }
      } else if (message.type === 'assistant' && message.error) {
        callbacks.onError(mapSDKError(message.error));
      } else if (message.type === 'result' && message.is_error) {
        // Handle result-level errors
      }
    }
  } catch (error) {
    callbacks.onError(classifyError(error));
  }
}
```

### Updated classifyInput (src/classify.ts)
```typescript
// Source: Existing classify.ts + D-05
export type InputAction =
  | { readonly type: 'builtin'; readonly name: BuiltinName; readonly args: string }
  | { readonly type: 'passthrough'; readonly command: string }
  | { readonly type: 'ai'; readonly prompt: string }  // Changed from ai_placeholder
  | { readonly type: 'empty' }

// In classifyInput:
if (trimmed === 'a' || trimmed.startsWith('a ')) {
  return { type: 'ai', prompt: trimmed.slice(2).trim() }
}
```

### Passthrough with Stderr Capture
```typescript
// Source: D-24, D-25 + tee pattern for stderr
import { spawn } from 'node:child_process';

export interface CommandResult {
  readonly exitCode: number;
  readonly stderr: string;
}

export function executeCommand(command: string, cwd?: string): Promise<CommandResult> {
  return new Promise((resolve) => {
    const stderrChunks: Buffer[] = [];
    const child = spawn('bash', ['-c', command], {
      stdio: ['inherit', 'inherit', 'pipe'],  // pipe stderr only
      cwd: cwd ?? process.cwd(),
      env: process.env,
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk);
      process.stderr.write(chunk);  // tee: show stderr in real-time
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
      });
    });

    child.on('error', (err) => {
      process.stderr.write(`Failed to execute: ${err.message}\n`);
      resolve({ exitCode: 127, stderr: err.message });
    });
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@anthropic-ai/claude-code-sdk` | `@anthropic-ai/claude-agent-sdk` | 2026 Q1 | Package renamed. Same npm scope, new name. Migration guide available. |
| `TerminalRenderer` class (marked-terminal v6) | `markedTerminal()` extension (v7+) | 2025 | New API: `marked.use(markedTerminal())` instead of `new TerminalRenderer()` |
| SDK `maxThinkingTokens` option | `thinking` option (ThinkingConfig) | SDK 0.2.x | `maxThinkingTokens` deprecated. Use `thinking: { type: 'adaptive' }` (default) |
| No V2 API | TypeScript V2 preview with `send()`/`stream()` | 2026 | Simplified multi-turn API available as preview. V1 `query()` still stable and recommended for our use case. |

**Deprecated/outdated:**
- `@anthropic-ai/claude-code-sdk`: Renamed to `claude-agent-sdk`. Old name may still resolve but use new name.
- `marked-terminal` class-based API: Use the extension API (`markedTerminal()`) with `marked.use()`.
- SDK `maxThinkingTokens`: Use `thinking` option instead.

## Open Questions

1. **Markdown rendering during streaming vs post-stream**
   - What we know: Streaming text_deltas are fragments that may break markdown structures mid-render.
   - What's unclear: Whether to render markdown on each delta (risk of broken output) or accumulate and render per-paragraph or post-completion.
   - Recommendation: Stream raw text during output for responsiveness, apply markdown rendering per complete paragraph when a double-newline is detected. This is Claude's discretion per CONTEXT.md.

2. **System prompt content for shell context**
   - What we know: SDK accepts `systemPrompt` as string or preset. We need to provide cwd, OS, shell info.
   - What's unclear: Optimal system prompt structure for a shell assistant.
   - Recommendation: Use a custom string prompt including cwd, OS name, Node version, and "You are ClaudeShell, an AI assistant running inside a terminal shell." This is Claude's discretion per CONTEXT.md.

3. **"Thinking..." indicator before first token**
   - What we know: SDK may take 1-3 seconds before first stream event.
   - What's unclear: Whether to use `ora` spinner or a simple dim text indicator.
   - Recommendation: Use a simple dim text "Thinking..." on stderr that gets cleared when first text_delta arrives. Simpler than ora, no extra dependency. This is Claude's discretion per CONTEXT.md.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | >=22.0.0 (per engines field) | -- |
| npm | Package installation | Yes | (bundled with Node) | -- |
| `ANTHROPIC_API_KEY` | AI features | Unknown (user-specific) | -- | Config file or helpful error message |
| Network access | SDK API calls | Assumed | -- | Error message (D-17) |

**Missing dependencies with no fallback:**
- None (SDK installation is the only new external dependency)

**Missing dependencies with fallback:**
- `ANTHROPIC_API_KEY`: Falls back to `~/.claudeshell/config` file, then shows helpful error (D-15, D-28, D-29)

## Project Constraints (from CLAUDE.md)

- **Immutability:** All state updates use spread operator (`{ ...state, newField: value }`) -- maintain for AI state extensions (ShellState.lastError, ShellState.aiStreaming)
- **File organization:** Many small files > few large files. 200-400 lines typical, 800 max. `ai.ts` and `renderer.ts` as separate modules aligns with this.
- **Error handling:** Always handle errors comprehensively with user-friendly messages.
- **No console.log:** Use `process.stdout.write` and `process.stderr.write` for output.
- **Testing:** Minimum 80% coverage. TDD mandatory. Vitest with descriptive test names.
- **Security:** No hardcoded secrets. API key from env/config only. Never log API key.
- **Commit style:** Conventional commits (`feat:`, `fix:`, etc.)
- **Functions small:** <50 lines per function.
- **No deep nesting:** Max 4 levels.

## Sources

### Primary (HIGH confidence)
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview) - Package name, installation, `query()` usage, built-in tools, permissions, sessions
- [Claude Agent SDK TypeScript Reference](https://platform.claude.com/docs/en/agent-sdk/typescript) - Full `Options` type, `Query` interface, `SDKMessage` union type, `PermissionMode`, `AbortController` option, all message types
- [Claude Agent SDK Streaming Output](https://platform.claude.com/docs/en/agent-sdk/streaming-output) - `includePartialMessages`, `StreamEvent` structure, `content_block_delta`/`text_delta` handling, streaming UI example
- npm registry: `@anthropic-ai/claude-agent-sdk` v0.2.88, `marked` v17.0.5, `marked-terminal` v7.3.0 -- verified 2026-03-31

### Secondary (MEDIUM confidence)
- [marked-terminal npm README](https://www.npmjs.com/package/marked-terminal) - `markedTerminal()` extension API, syntax highlighting options
- `.planning/research/PITFALLS.md` - SDK error handling patterns, SIGINT behavior, TTY state corruption risks
- `.planning/research/ARCHITECTURE.md` - Component boundaries, data flow patterns, renderer state machine design

### Tertiary (LOW confidence)
- None -- all findings verified against official SDK documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - SDK API verified against official TypeScript reference docs
- Architecture: HIGH - Streaming patterns verified against official "Build a streaming UI" example
- Pitfalls: HIGH - Error types verified from SDK type definitions; SIGINT patterns from Node.js docs and project PITFALLS.md

**Research date:** 2026-03-31
**Valid until:** 2026-04-14 (SDK is v0.2.x, API surface may shift; pin exact version)
