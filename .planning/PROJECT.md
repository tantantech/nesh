# ClaudeShell

## What This Is

An AI-native shell that wraps Claude Code SDK to provide intelligent command-line assistance directly in the terminal. Users type an `a` command (e.g., `a find all large files`) and Claude processes the request in the background — no separate Claude Code UI needed. It behaves like a standard shell (zsh/bash replacement) but with AI superpowers baked in.

## Core Value

Running AI-assisted commands feels as natural and fast as running normal shell commands — zero context switching, zero UI overhead.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Shell launches as interactive REPL that accepts standard shell commands
- [ ] `a` prefix command routes input to Claude Code SDK for AI processing
- [ ] Claude responses stream back to the terminal in real-time
- [ ] Standard shell commands (ls, cd, git, etc.) pass through to the system shell
- [ ] Shell maintains session context (working directory, environment variables)
- [ ] Claude has access to the user's file system and can execute commands
- [ ] History management for both regular and AI commands
- [ ] Configurable Claude API key / authentication
- [ ] Works on macOS (primary) and Linux

### Out of Scope

- Full zsh/bash compatibility (plugin systems, oh-my-zsh themes) — too complex for v1, focus on core AI value
- GUI or TUI with panels/splits — this is a terminal-native shell, not a terminal emulator
- Multi-model support (GPT, Gemini, etc.) — Claude-first, single provider keeps it simple
- Cloud sync of history/config — local-first for v1

## Context

- Claude Code SDK (TypeScript) provides programmatic access to Claude's capabilities including tool use, file operations, and command execution
- The user wants to avoid opening Claude Code as a separate application — the shell IS the interface
- Similar to how GitHub Copilot CLI or aichat work, but deeper integration as the actual shell
- Target user: developers who use the terminal daily and want AI assistance without leaving their workflow
- The `a` command prefix is the key UX innovation — minimal friction to invoke AI

## Constraints

- **Tech Stack**: TypeScript/Node.js — Claude Code SDK is TypeScript-based
- **SDK**: Must use Claude Code SDK (not raw Anthropic API) for full tool-use capabilities
- **Platform**: macOS primary, Linux secondary — no Windows for v1
- **Shell**: Must be usable as a login shell or launched from existing shell
- **Performance**: AI commands should start streaming within 2-3 seconds
- **Authentication**: Must support existing Claude/Anthropic API key setup

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `a` as AI command prefix | Shortest possible prefix, easy to type, memorable | — Pending |
| TypeScript implementation | Matches Claude Code SDK language, rich ecosystem | — Pending |
| Claude Code SDK over raw API | Full tool-use, file access, command execution built-in | — Pending |
| Shell replacement vs wrapper | Start as wrapper (launched from zsh/bash), can evolve | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
