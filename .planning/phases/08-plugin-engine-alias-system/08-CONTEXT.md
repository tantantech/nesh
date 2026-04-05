# Phase 8: Plugin Engine & Alias System - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the core plugin framework: loader, registry, hooks, error boundaries, manifest format, dependency resolution, and alias expansion. Prove the system end-to-end with the git plugin (most popular OMZ plugin). Users can enable plugins in config, aliases expand transparently, crashing plugins never crash the shell.

This phase does NOT include: completion engine, auto-suggestions, syntax highlighting, plugin management CLI, profile system, or git-installable plugins. Those are Phases 9-12.

</domain>

<decisions>
## Implementation Decisions

### Plugin Manifest Format
- **D-01:** Plugins export a TypeScript object conforming to a `PluginManifest` interface — no separate JSON files
- **D-02:** Required fields: `name`, `version`, `description`, `aliases` (Record<string, string>)
- **D-03:** Optional fields: `dependencies` (other plugin names), `platform` (`'macos' | 'linux' | 'all'`), `permissions` (future), `hooks` (lifecycle event handlers), `init` (async function), `destroy` (async function)
- **D-04:** Alias-only plugins (like git) need no `init`/`destroy` — just a data object with `name` + `aliases`
- **D-05:** Complex plugins with runtime behavior provide `init`/`destroy` functions for lifecycle management

### Plugin Directory Structure
- **D-06:** Bundled plugins live in `src/plugins/` — one file per simple alias-only plugin, directory per complex plugin
- **D-07:** Git plugin example: `src/plugins/git.ts` exporting `{ name: 'git', version: '1.0.0', aliases: { gst: 'git status', ... } }`
- **D-08:** Plugin index: `src/plugins/index.ts` re-exports all bundled plugins as an array
- **D-09:** External (git-installed) plugins go in `~/.nesh/plugins/` — loaded dynamically (Phase 11 scope, but directory convention set now)

### Alias Expansion
- **D-10:** Alias expansion is a new step that runs on the raw input string BEFORE `classifyInput()` — keeps classify pure
- **D-11:** New module `src/alias.ts` with `expandAlias(input: string, registry: AliasRegistry): string`
- **D-12:** Expand-once rule: aliases expand at most once per command to prevent infinite loops (no recursive expansion)
- **D-13:** User aliases (from config) always override plugin aliases — checked first in lookup order
- **D-14:** When multiple plugins define the same alias, the last-loaded plugin wins AND a collision warning is emitted to stderr on startup
- **D-15:** Alias expansion only applies to the first word of the command (the command position) — arguments are never expanded

### Plugin Loader & Registry
- **D-16:** New module `src/plugin-loader.ts` — loads and initializes plugins at shell startup
- **D-17:** Two-phase loading per PLUG-01: Phase 1 (sync, <50ms) registers alias data from all enabled plugins; Phase 2 (async, deferred after first prompt) calls `init()` on plugins that have it
- **D-18:** New module `src/plugin-registry.ts` — O(1) lookup maps for aliases, hooks, and plugin metadata
- **D-19:** Registry is immutable — built once at startup, replaced on plugin enable/disable (future hot-reload)
- **D-20:** Plugin load order follows topological sort of dependency graph; cycle detection errors logged to stderr

### Error Boundaries
- **D-21:** Every plugin `init()` and `destroy()` call is wrapped in try/catch — a crashing plugin logs a warning and is marked as `failed` in the registry, never crashes the shell
- **D-22:** Every hook dispatch is wrapped — a crashing hook handler is caught, logged, and skipped
- **D-23:** Failed plugins are tracked in registry state; `nesh aliases` shows which plugins failed to load

### Hook System
- **D-24:** Plugin hooks: `preCommand`, `postCommand`, `prePrompt`, `onCd` — dispatched from shell.ts at the appropriate points
- **D-25:** Hooks are async functions; dispatched in parallel with `Promise.allSettled()` — no hook blocks the REPL
- **D-26:** Hook dispatch is fire-and-forget for prePrompt; await for preCommand/postCommand (they may modify state)
- **D-27:** Hook handlers receive a read-only context object: `{ cwd, command, exitCode, state }`

### Safe Mode
- **D-28:** `nesh --safe` starts with zero plugins loaded — for recovery when a plugin breaks startup
- **D-29:** Safe mode is a CLI flag check in `cli.ts` that skips the plugin loader entirely

### Config Schema
- **D-30:** New config section in `~/.nesh/config.json`: `"plugins"` object
- **D-31:** Schema: `{ "enabled": ["git", "docker", ...], "aliases": { "gs": "git status" }, "<plugin-name>": { "disabled_aliases": ["gp"] } }`
- **D-32:** `enabled` array lists active plugins by name; empty array or missing means no plugins
- **D-33:** `aliases` object holds user-defined aliases that override all plugin aliases
- **D-34:** Per-plugin config allows disabling specific aliases: `"git": { "disabled_aliases": ["gp", "gcm"] }`

### Builtin Command: `nesh aliases`
- **D-35:** New builtin `aliases` (added to builtins set in classify.ts) — lists all active aliases grouped by source (user config, then each plugin)
- **D-36:** Output format: `[plugin-name] alias → expansion` with dim coloring for plugin name

### Claude's Discretion
- Exact typing for PluginManifest and AliasRegistry interfaces (guided by the decisions above)
- How to structure the hook context object fields beyond the basics listed
- Whether to show a startup summary of loaded plugins (e.g., "12 plugins loaded, 45 aliases")
- Internal naming of types and helper functions

### Folded Todos
None — no matching todos found.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Architecture
- `src/classify.ts` — Input classification; alias expansion inserts before this
- `src/shell.ts` — REPL loop; plugin init at startup, hook dispatch points
- `src/config.ts` — Config loading pattern; extend with plugins section
- `src/types.ts` — ShellState and InputAction types; extend with plugin state
- `src/builtins.ts` — Builtin registration; add `aliases` command
- `src/passthrough.ts` — Command execution; alias-expanded commands flow here

### Research & Requirements
- `.planning/REQUIREMENTS.md` — PLUG-01 through PLUG-08, ALIAS-01 through ALIAS-06, PORT-02
- `.planning/ROADMAP.md` — Phase 8 success criteria (5 criteria)
- `.planning/research/ARCHITECTURE.md` — Overall architecture decisions
- `.planning/research/PITFALLS.md` — Known pitfalls (bundle size, readline timing)

### Prior Phase Context
- `.planning/phases/07-pty-polish/07-CONTEXT.md` — Interactive command handling (coexists with plugins)
- `.planning/phases/06-context-permissions/06-CONTEXT.md` — Config merge pattern, project context pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/config.ts`: `NeshConfig` interface, `loadConfig()`, validation patterns — extend for plugin config
- `src/classify.ts`: `classifyInput()` discriminated union — add alias expansion step before this
- `src/shell.ts`: REPL loop structure — insert plugin init at startup, hook dispatch at command boundaries
- `src/builtins.ts`: Builtin command pattern — add `aliases` command

### Established Patterns
- **Immutable state**: All state updates via spread `{ ...state, field: value }` — plugin registry follows this
- **Module-per-concern**: Each new capability gets its own module (`alias.ts`, `plugin-loader.ts`, `plugin-registry.ts`)
- **Lazy loading**: AI SDK loaded on first `a` command — plugin Phase 2 init follows same deferred pattern
- **Error resilience**: Shell never crashes from external failures — plugin error boundaries follow this
- **Config validation**: Type guards with safe defaults — plugin config validated same way

### Integration Points
- `src/cli.ts` line ~1: `--safe` flag detection before `runShell()`
- `src/shell.ts` line ~40: Plugin loader init after config load, before REPL loop
- `src/shell.ts` line ~95: Hook dispatch (preCommand before action, postCommand after)
- `src/shell.ts` REPL while loop: Alias expansion on raw `line` before `classifyInput()`
- `src/types.ts`: Extend `BuiltinName` union with `'aliases'`
- `src/config.ts`: Extend `NeshConfig` with `plugins` field

</code_context>

<specifics>
## Specific Ideas

- The git plugin is the proof-of-concept — if `gst` expands to `git status` transparently, the system works
- PORT-02 requires ~120 alias-only plugins ported as pure data objects — git plugin is the template, rest follow the same pattern
- Two-phase loading is critical for the 300ms startup budget — sync alias registration is just building a Map from static data
- Plugin infrastructure should feel invisible to users who don't configure any plugins — zero overhead when `plugins.enabled` is empty or missing

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-plugin-engine-alias-system*
*Context gathered: 2026-04-05*
