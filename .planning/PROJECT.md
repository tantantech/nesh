# ClaudeShell

## What This Is

An AI-native shell that wraps Claude Code SDK to provide intelligent command-line assistance directly in the terminal. Users type an `a` command (e.g., `a find all large files`) and Claude processes the request in the background — no separate Claude Code UI needed. It behaves like a standard shell (zsh/bash replacement) but with AI superpowers baked in.

## Core Value

Running AI-assisted commands feels as natural and fast as running normal shell commands — zero context switching, zero UI overhead.

## Requirements

### Validated

- ✓ Shell launches as interactive REPL with standard commands — v1.0
- ✓ `a` prefix routes input to Claude Code SDK — v1.0
- ✓ Claude responses stream back in real-time — v1.0
- ✓ Standard shell commands pass through to system shell — v1.0
- ✓ Shell maintains session context (cwd, env vars) — v1.0
- ✓ Claude has filesystem and command execution access — v1.0
- ✓ History management with persistence — v1.0
- ✓ Configurable API key (env var + config file) — v1.0
- ✓ Works on macOS and Linux — v1.0
- ✓ npm global install (`npm install -g claudeshell`) — v1.0
- ✓ Markdown rendering of AI responses — v1.0
- ✓ Interactive prompt template selector (5 themes) — v1.0
- ✓ AI session context across multiple `a` commands — v2.0
- ✓ Fresh context slash command (`/new`) — v2.0
- ✓ Model selection (Haiku/Sonnet/Opus) per query or session — v2.0
- ✓ Pipe-friendly AI output (`cat log.txt | a summarize`) — v2.0
- ✓ Automatic error recovery (diagnose + offer fix) — v2.0
- ✓ Project context awareness (package.json, Cargo.toml, etc.) — v2.0
- ✓ Permission control for AI file edits and command execution — v2.0
- ✓ Token/cost display after each AI response — v2.0
- ✓ Interactive command support via PTY (vim, ssh, less) — v2.0
- ✓ Per-project configuration overrides — v2.0
- ✓ Configurable AI command prefix — v2.0
- ✓ Multi-provider support (15 providers) — v2.0

### Active

- [ ] Plugin framework engine with loader, lifecycle, enable/disable
- [ ] All ~300 oh-my-zsh plugins ported to TypeScript
- [ ] Profile system (core, developer, devops, cloud, ai-engineer)
- [ ] Plugin install/update from git repos
- [ ] Native auto-suggestions and syntax highlighting
- [ ] Plugin management CLI and interactive UI
- [ ] Per-plugin and per-project plugin configuration
- [ ] Cross-platform plugin design (no zsh dependency)

## Current Milestone: v3.0 Oh-My-Nesh Plugin Ecosystem

**Goal:** Make Nesh a full oh-my-zsh replacement by building a native TypeScript plugin framework with all ~300 OMZ plugins ported, organized into user profiles, and cross-platform.

**Target features:**
- Plugin framework engine (loader, lifecycle, enable/disable, dependency resolution)
- All ~300 oh-my-zsh plugins ported to TypeScript
- Built-in profile system (core, developer, devops, cloud, ai-engineer)
- Plugin install/update from git repos
- Native TypeScript re-implementations of complex plugins (auto-suggestions, syntax highlighting)
- Plugin management CLI and interactive UI
- Plugin configuration per-plugin and per-project
- Cross-platform design (no zsh dependency)

### Out of Scope

- GUI or TUI with panels/splits — terminal-native shell, not a terminal emulator
- Cloud sync of history/config — local-first for simplicity

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
| Use `a` as AI command prefix | Shortest possible prefix, easy to type, memorable | ✓ Good |
| TypeScript implementation | Matches Claude Code SDK language, rich ecosystem | ✓ Good |
| Claude Code SDK over raw API | Full tool-use, file access, command execution built-in | ✓ Good |
| Shell replacement vs wrapper | Start as wrapper (launched from zsh/bash), can evolve | ✓ Good |
| OMZ plugins in TypeScript (not zsh subprocess) | Cross-platform, no dual-shell, future Windows support | — Pending |
| Reverse "OMZ out of scope" decision | Plugin ecosystem is now core differentiator for v3.0 | — Pending |
| Bundled + git installable plugins | Core plugins ship built-in, long tail from git repos | — Pending |
| Profile-based defaults | Users pick a profile (dev, devops, cloud, ai) instead of configuring 300 plugins | — Pending |

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
*Last updated: 2026-04-03 after milestone v3.0 start*
