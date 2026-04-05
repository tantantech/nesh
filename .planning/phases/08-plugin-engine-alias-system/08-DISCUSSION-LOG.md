# Phase 8: Plugin Engine & Alias System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 08-plugin-engine-alias-system
**Areas discussed:** Plugin manifest format, Plugin directory structure, Alias expansion insertion point, Config schema for plugins
**Mode:** Auto (all areas auto-selected, recommended defaults chosen)

---

## Plugin Manifest Format

| Option | Description | Selected |
|--------|-------------|----------|
| TypeScript interface with static export | Plugin is a TS module exporting a typed object — no separate files, type-safe, tree-shakeable | ✓ |
| Separate JSON manifest + TS code | JSON file for metadata, TS file for behavior — familiar from VS Code extensions | |
| Convention-based (directory name = plugin name) | Infer metadata from file structure — minimal boilerplate | |

**User's choice:** [auto] TypeScript interface with static export (recommended default)
**Notes:** Keeps everything in one language. Alias-only plugins are just data objects, complex plugins add init/destroy functions. Matches existing TypeScript-everywhere approach.

---

## Plugin Directory Structure

| Option | Description | Selected |
|--------|-------------|----------|
| src/plugins/ with file-per-simple, dir-per-complex | Simple alias plugins = single file, complex = directory. Index re-exports all. | ✓ |
| src/plugins/ flat (all single files) | Every plugin is one file regardless of complexity | |
| src/plugins/ all directories | Every plugin gets a directory even if it's one file | |

**User's choice:** [auto] src/plugins/ with file-per-simple, dir-per-complex (recommended default)
**Notes:** Matches module-per-concern pattern. Git plugin is `src/plugins/git.ts`. External plugins go to `~/.nesh/plugins/` (loaded in Phase 11).

---

## Alias Expansion Insertion Point

| Option | Description | Selected |
|--------|-------------|----------|
| Before classifyInput() on raw string | New step expands aliases before classification — keeps classify pure | ✓ |
| Inside classifyInput() as first step | Classify handles expansion internally — single entry point | |
| After classify, before execution | Only expand passthrough commands — AI/builtin inputs untouched | |

**User's choice:** [auto] Before classifyInput() on raw string (recommended default)
**Notes:** Alias expansion is orthogonal to input classification. Expanding first means `gst` becomes `git status` before classify sees it, so classify routes it naturally to passthrough. Clean separation of concerns.

---

## Config Schema for Plugins

| Option | Description | Selected |
|--------|-------------|----------|
| plugins object with enabled array + per-plugin overrides | `"plugins": { "enabled": [...], "aliases": {...}, "git": { "disabled_aliases": [...] } }` | ✓ |
| Simple enabled array only | `"plugins": ["git", "docker"]` — no per-plugin config | |
| Enable-all with blocklist | All bundled plugins enabled by default, user disables unwanted ones | |

**User's choice:** [auto] plugins object with enabled array + per-plugin overrides (recommended default)
**Notes:** Explicit opt-in (enabled array) matches the principle of zero overhead when no plugins configured. Per-plugin overrides allow disabling specific aliases without disabling the whole plugin.

---

## Claude's Discretion

- Exact PluginManifest and AliasRegistry interface typing
- Hook context object field details
- Startup plugin summary display
- Internal naming conventions

## Deferred Ideas

None — all discussion stayed within Phase 8 scope.
