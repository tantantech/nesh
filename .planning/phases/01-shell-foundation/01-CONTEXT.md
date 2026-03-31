# Phase 1: Shell Foundation - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a functional interactive shell (REPL) that users can launch and use for everyday terminal work. This includes command passthrough to the system shell, directory navigation, signal handling, command history, and crash resilience. No AI features in this phase — this is the foundation that Phase 2 builds on.

</domain>

<decisions>
## Implementation Decisions

### Prompt Design
- **D-01:** Prompt format is `claudeshell <cwd> > ` — shows the shell name and current working directory, minimal and clean
- **D-02:** Use `picocolors` for prompt coloring (shell name in dim, directory in cyan, `>` in default)
- **D-03:** Prompt updates after every `cd` command to reflect new directory
- **D-04:** Home directory abbreviated as `~` in prompt (standard shell convention)

### Command Delegation
- **D-05:** All non-builtin commands are executed via `spawn('bash', ['-c', command])` — delegate ALL shell syntax parsing to bash
- **D-06:** Do NOT attempt to parse pipes, redirects, globs, or any shell syntax in JavaScript
- **D-07:** Inherit the user's environment variables from the parent process
- **D-08:** Command stdout and stderr stream directly to the terminal (inherit stdio where possible)

### Shell Builtins
- **D-09:** Minimal builtin set: `cd`, `exit`, `quit`, `clear`, `export`
- **D-10:** `cd` uses `process.chdir()` to change the actual process working directory
- **D-11:** `cd` with no arguments goes to `$HOME` (matches bash behavior)
- **D-12:** `cd -` returns to the previous directory (track `OLDPWD`)
- **D-13:** `export KEY=VALUE` sets environment variables on `process.env`
- **D-14:** `exit` and `quit` both close the shell cleanly (exit code 0)
- **D-15:** `clear` clears the terminal screen

### Signal Handling
- **D-16:** Ctrl+C (SIGINT) at an empty prompt: clear the current line, show a fresh prompt (do NOT exit)
- **D-17:** Ctrl+C during a running child process: forward SIGINT to the child process
- **D-18:** Ctrl+D at an empty prompt: exit the shell cleanly (like bash)
- **D-19:** Ctrl+D with text on the line: ignore (standard readline behavior)

### History
- **D-20:** History file at `~/.claudeshell_history`
- **D-21:** Use Node.js `readline` built-in history support
- **D-22:** History persists across sessions (read on startup, append on exit)
- **D-23:** Duplicate consecutive commands are not added to history
- **D-24:** Lines starting with a space are not saved to history (privacy, like bash HISTCONTROL)

### Error Resilience
- **D-25:** Wrap the main REPL loop in try/catch — never crash from user input
- **D-26:** Display non-zero exit codes from failed commands (like `[exit: 1]`)
- **D-27:** Handle missing commands gracefully (`command not found` from bash, not a crash)

### Claude's Discretion
- TypeScript project structure (src/ layout, tsconfig settings)
- Specific readline configuration options beyond the decisions above
- Build tooling choice (tsc, tsup, esbuild — whatever works for a simple CLI)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:
- `.planning/PROJECT.md` — Project vision, constraints, key decisions
- `.planning/REQUIREMENTS.md` — SHELL-01 through SHELL-09, ERR-03, PLAT-01
- `.planning/research/ARCHITECTURE.md` — Component boundaries and data flow
- `.planning/research/PITFALLS.md` — Critical pitfalls for shell foundation (cd handling, signal handling, TTY cleanup)
- `.planning/research/STACK.md` — Technology choices and versions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established in this phase

### Integration Points
- This phase establishes the REPL loop that Phase 2 will hook into for `a` command routing
- The command classifier (builtin vs passthrough) will be extended in Phase 2 to detect the `a` prefix

</code_context>

<specifics>
## Specific Ideas

- The shell should feel snappy — startup time under 500ms (no heavy imports at launch)
- Lazy-load any heavy dependencies (the Claude Agent SDK in Phase 2 will be lazy-loaded on first `a` command)
- The `a` prefix should be reserved even in Phase 1 — if user types `a something`, show a message like "AI commands available after setup" or similar placeholder

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-shell-foundation*
*Context gathered: 2026-03-31*
