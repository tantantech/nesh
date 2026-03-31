# Phase 1: Shell Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 01-shell-foundation
**Areas discussed:** Prompt Design, Command Delegation, Shell Builtins, History Behavior
**Mode:** Auto (all areas auto-selected, recommended defaults chosen)

---

## Prompt Design

| Option | Description | Selected |
|--------|-------------|----------|
| Directory-based minimal prompt | `claudeshell ~/Projects >` — shows cwd, clean | ✓ |
| Full path prompt | Shows complete path always, no abbreviation | |
| Powerline-style prompt | Git branch, exit code, fancy symbols | |

**User's choice:** Directory-based minimal prompt (auto-selected recommended default)
**Notes:** Minimal prompt aligns with "feels like a shell" value prop. Abbreviates ~ for home.

---

## Command Delegation

| Option | Description | Selected |
|--------|-------------|----------|
| Spawn bash -c per command | Delegates all syntax parsing to bash | ✓ |
| Persistent bash subprocess | Keep bash running, pipe commands to it | |
| Parse and execute directly | Handle pipes/redirects in Node.js | |

**User's choice:** Spawn bash -c per command (auto-selected recommended default)
**Notes:** Research unanimously recommends this. Parsing shell syntax in JS is the #1 pitfall identified.

---

## Shell Builtins

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal set (cd, exit, export, clear) | Only intercept what must run in-process | ✓ |
| Extended set (+ alias, source, history) | More bash-like but more complex | |
| cd-only | Absolute minimum, everything else to bash | |

**User's choice:** Minimal set (auto-selected recommended default)
**Notes:** cd and export must be in-process (child process can't change parent env). clear is convenience. exit/quit for clean shutdown.

---

## History Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Unified history with readline | Single ~/.claudeshell_history, readline built-in | ✓ |
| Separate AI/shell history | Two history files, separate navigation | |
| In-memory only | No persistence across sessions | |

**User's choice:** Unified history with readline defaults (auto-selected recommended default)
**Notes:** Phase 1 has no AI commands, so unified is natural. Phase 2 can split if needed.

---

## Claude's Discretion

- TypeScript project structure
- Specific readline configuration
- Build tooling choice

## Deferred Ideas

None — discussion stayed within phase scope
