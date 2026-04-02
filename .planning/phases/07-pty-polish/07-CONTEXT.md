# Phase 7: PTY & Polish - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Make interactive terminal commands (vim, ssh, less, htop, top, nano) work correctly in ClaudeShell. Ensure the shell prompt restores cleanly after interactive commands exit. This is the final phase of v2.0.

</domain>

<decisions>
## Implementation Decisions

### PTY Strategy
- **D-01:** First approach: rely on existing `spawn('bash', ['-c', cmd], { stdio: 'inherit' })` — this already passes stdin/stdout/stderr directly to the child, which handles many interactive programs
- **D-02:** Test with vim, less, ssh, htop, nano, top to validate stdio:inherit coverage
- **D-03:** If stdio:inherit fails for specific commands, add `node-pty` as an `optionalDependency` (not required — graceful degradation if it fails to install)
- **D-04:** Create `src/interactive.ts` module that wraps the passthrough with PTY-aware logic
- **D-05:** Before spawning an interactive command, pause the readline interface to release stdin ownership
- **D-06:** After interactive command exits, resume readline and redraw the prompt

### Interactive Command Detection
- **D-07:** Maintain a known-interactive list: `vim`, `vi`, `nvim`, `nano`, `less`, `more`, `man`, `ssh`, `htop`, `top`, `tmux`, `screen`, `fzf`
- **D-08:** Detection heuristic: extract first word (command name) from input, check against list
- **D-09:** Commands with pipes are NOT treated as interactive (e.g., `less` alone is interactive, `cat file | less` still works via stdio:inherit)
- **D-10:** If a non-listed command needs a TTY and fails, show hint: "Command may need interactive mode. Add it to config: interactive_commands"
- **D-11:** Config field: `"interactive_commands": ["vim", "vi", ...]` — user-extensible list

### Readline Lifecycle
- **D-12:** Before interactive command: call `rl.pause()` and set `process.stdin.setRawMode(false)` if in raw mode
- **D-13:** After interactive command: call `rl.resume()`, restore raw mode if needed, redraw prompt
- **D-14:** Track readline state in ShellState: `interactiveRunning: boolean`
- **D-15:** Ctrl+C during interactive command: let the child process handle it (don't intercept)

### Prompt Restoration
- **D-16:** After interactive command exits, clear any residual terminal state with `process.stdout.write('\x1b[0m')` (reset ANSI)
- **D-17:** Redraw the prompt on a fresh line — don't assume cursor position
- **D-18:** If terminal dimensions changed during interactive command (resize), prompt still renders correctly (already dynamic)

### Claude's Discretion
- Whether to add node-pty at all (try stdio:inherit first, may be sufficient)
- Exact raw mode handling details
- Whether to show "entering interactive mode..." indicator
- How to handle interactive commands in chat mode (likely: temporarily exit chat, run command, return)

</decisions>

<canonical_refs>
## Canonical References

### Existing Implementation
- `src/passthrough.ts` — `executeCommand()` with `stdio: 'inherit'` — may already handle most cases
- `src/shell.ts` — readline interface, SIGINT handling
- `src/classify.ts` — input classification — add interactive detection
- `src/types.ts` — ShellState — add interactiveRunning
- `src/config.ts` — add interactive_commands field

### Research
- `.planning/research/PITFALLS.md` — PTY processes leak on crash, readline/node-pty stdin conflict
- `.planning/research/ARCHITECTURE.md` — stdio:inherit as simpler PTY alternative

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/passthrough.ts`: `executeCommand()` — extend or wrap for interactive mode
- `src/classify.ts`: `classifyInput()` — add interactive detection before passthrough routing
- `src/config.ts`: Config schema extension pattern

### Integration Points
- `src/shell.ts`: Pause readline before interactive, resume after
- `src/classify.ts`: Detect interactive commands, return specialized action type
- `src/passthrough.ts`: Spawn with proper stdio handling for interactive vs normal

</code_context>

<specifics>
## Specific Ideas

- Most users won't notice this phase — interactive commands should "just work" without any visible change
- The key test: can you type `vim file.txt`, edit, save, and return to ClaudeShell cleanly?
- Don't over-engineer — stdio:inherit may be all that's needed

</specifics>

<deferred>
## Deferred Ideas

None — this is the final phase

</deferred>

---

*Phase: 07-pty-polish*
*Context gathered: 2026-04-02*
