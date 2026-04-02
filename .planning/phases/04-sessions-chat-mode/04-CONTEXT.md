# Phase 4: Sessions & Chat Mode - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform ClaudeShell from stateless single-shot AI queries to persistent conversation sessions with a seamless chat mode. Add model selection per query, token/cost visibility, and fresh-context command. The session ID becomes the shared state primitive that later phases (permissions, context) attach to.

</domain>

<decisions>
## Implementation Decisions

### Chat Mode UX
- **D-01:** Typing `a` with no prompt enters chat mode — a dedicated readline loop where every line goes to AI
- **D-02:** Chat mode prompt is `ai > ` (distinct from shell prompt so user always knows which mode)
- **D-03:** Chat mode exits on `/exit`, `/shell`, or Ctrl+D — returns to shell prompt instantly
- **D-04:** `/new` in chat mode starts a fresh AI context (new session ID) without leaving chat mode
- **D-05:** Chat mode and shell mode share the same terminal — no split panes, no separate window
- **D-06:** Transition between modes is instant — no delay, no loading, no context serialization visible to user
- **D-07:** Chat mode uses the same renderer (markdown + tool visibility) as single-shot `a` commands
- **D-08:** History in chat mode is separate from shell history — stored as chat-specific history

### Session Persistence
- **D-09:** Use SDK `resume` option with explicit `sessionId` (NOT `continue` which is CWD-dependent and breaks on `cd`)
- **D-10:** Store current session ID in ShellState — create new session on shell launch
- **D-11:** `/new` generates a fresh session ID and clears conversation context
- **D-12:** Session IDs are SDK-managed — ClaudeShell only stores the ID string, not conversation data
- **D-13:** Create `src/session.ts` module to manage session lifecycle (create, resume, reset)
- **D-14:** Single-shot `a <prompt>` commands share the session (conversation continues across commands)

### Model Selection
- **D-15:** Per-query: `a --haiku <prompt>`, `a --sonnet <prompt>`, `a --opus <prompt>` — flag parsed before sending to SDK
- **D-16:** Default model: configurable in `~/.claudeshell/config.json` as `"model": "claude-sonnet-4-5-20250514"`
- **D-17:** Model shorthands: `haiku` → `claude-haiku-4-5-20251001`, `sonnet` → `claude-sonnet-4-5-20250514`, `opus` → `claude-opus-4-6-20250414`
- **D-18:** In chat mode, model can be changed mid-session via `/model haiku` slash command
- **D-19:** Update `src/classify.ts` to parse `--haiku`, `--sonnet`, `--opus` flags from AI input

### Cost & Token Display
- **D-20:** After each AI response, show a dim footer: `tokens: 1,234 in / 567 out | cost: $0.0045`
- **D-21:** In chat mode, also show cumulative: `session: $0.0234 (5 messages)`
- **D-22:** Extract token/cost data from SDK `SDKResultMessage` fields (verify exact field names at implementation)
- **D-23:** Create `src/cost.ts` module for formatting and accumulation
- **D-24:** Cost display goes to stderr (doesn't pollute piped output)

### Slash Commands (Chat Mode)
- **D-25:** `/exit` or `/shell` — return to shell mode
- **D-26:** `/new` — start fresh AI context
- **D-27:** `/model <name>` — switch model mid-session
- **D-28:** Slash commands are only active in chat mode, not in shell mode
- **D-29:** Unknown slash commands show help: `"Unknown command. Available: /exit, /new, /model <name>"`

### Claude's Discretion
- System prompt content for session context (what info to include about cwd, OS, etc.)
- Whether to show a "Session started" message on chat mode entry
- Internal session ID format/generation
- How to handle SDK session errors (expired, corrupted) — likely just start fresh

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Implementation (integrate with these)
- `src/types.ts` — ShellState to extend with sessionId, chatMode fields
- `src/classify.ts` — parse --model flags from AI input
- `src/ai.ts` — add resume/sessionId to SDK query options
- `src/shell.ts` — add chat mode loop, slash command handling
- `src/config.ts` — add model field to config schema
- `src/renderer.ts` — cost footer rendering

### Research
- `.planning/research/STACK.md` — SDK session API (resume, sessionId, continue)
- `.planning/research/ARCHITECTURE.md` — Session integration architecture
- `.planning/research/PITFALLS.md` — Session resume CWD pitfall, permission escalation via resume

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/ai.ts`: `executeAI()` — extend with sessionId and model options
- `src/classify.ts`: `classifyInput()` — extend to parse model flags
- `src/config.ts`: `ClaudeShellConfig` — add model field
- `src/renderer.ts`: `createRenderer()` — add cost footer to finish()

### Established Patterns
- Immutable ShellState with spread updates
- Module-per-concern (new: session.ts, cost.ts)
- Builtins return updated state
- Dim text on stderr for meta-info (tool visibility pattern)

### Integration Points
- `src/shell.ts` REPL loop: add chat mode as alternate loop
- `src/types.ts`: extend ShellState with `sessionId: string`, `chatMode: boolean`, `sessionCost: CostAccumulator`
- `src/classify.ts`: parse `--haiku`/`--sonnet`/`--opus` flags, return model override in InputAction

</code_context>

<specifics>
## Specific Ideas

- Chat mode should feel like talking to a person — type, get response, type again. No ceremony.
- The `ai >` prompt should be visually distinct (different color) so there's zero confusion about which mode you're in
- Transition back to shell should be ONE keystroke away (`/exit` or Ctrl+D) — not a multi-step process
- Cost display should be subtle — dim text, not attention-grabbing. Power users want it, casual users shouldn't be distracted by it

</specifics>

<deferred>
## Deferred Ideas

- Session history browser (list/resume old sessions) — ADV-01, future milestone
- Session export to file — ADV-02, future milestone

</deferred>

---

*Phase: 04-sessions-chat-mode*
*Context gathered: 2026-04-02*
