# Phase 3: Distribution & Platform - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Package ClaudeShell for npm global installation, implement a config file at `~/.claudeshell/config`, and validate all functionality works identically on macOS and Linux.

</domain>

<decisions>
## Implementation Decisions

### npm Package Configuration
- **D-01:** Package name: `claudeshell` (check npm registry availability)
- **D-02:** Binary name: `claudeshell` via `"bin": { "claudeshell": "./dist/cli.js" }` in package.json
- **D-03:** Build with `tsdown` (already in devDeps) to produce `dist/` directory
- **D-04:** Add `"files": ["dist"]` to package.json to ship only built output
- **D-05:** Add `build` script: `"build": "tsdown src/cli.ts --format esm --out-dir dist"`
- **D-06:** Add `prepublishOnly` script that runs build + tests
- **D-07:** Set `"type": "module"` (already set from Phase 1)
- **D-08:** Ensure shebang `#!/usr/bin/env node` is preserved in dist/cli.js after build

### Config File
- **D-09:** Config location: `~/.claudeshell/config.json` (JSON format)
- **D-10:** Config schema: `{ "api_key"?: string, "model"?: string, "history_size"?: number }`
- **D-11:** Extend existing `src/config.ts` to handle full config file (not just API key)
- **D-12:** Create config directory on first write if it doesn't exist
- **D-13:** Config file is optional — shell works without it using env vars and defaults
- **D-14:** Invalid JSON in config file: warn and use defaults (don't crash)

### Linux Compatibility
- **D-15:** Audit all path operations for OS-agnostic `path.join()` / `path.resolve()` usage
- **D-16:** Verify `process.env.HOME` works on both macOS and Linux (it does)
- **D-17:** Test bash spawn works on Linux (bash is standard on both)
- **D-18:** No macOS-specific APIs used (already verified — pure Node.js stdlib + npm packages)
- **D-19:** Add a CI-style test script that can run on Linux containers

### Claude's Discretion
- Exact tsdown configuration flags beyond the basics
- Whether to add a `--version` flag to the CLI
- README content and npm description
- Whether to add a postinstall welcome message

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Implementation
- `src/cli.ts` — CLI entry point with shebang (needs build step)
- `src/config.ts` — Config resolver (extend for full config file)
- `package.json` — Current package config (add bin, files, build scripts)
- `tsconfig.json` — TypeScript config (verify build compatibility)

### Project Docs
- `.planning/PROJECT.md` — Project vision and constraints
- `.planning/REQUIREMENTS.md` — CONF-03, PLAT-02, PLAT-03
- `.planning/research/STACK.md` — Build tooling decisions (tsdown)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/config.ts`: Already reads `~/.claudeshell/config` for API key — extend to full config
- `src/cli.ts`: Already has shebang and launches shell — just needs build step
- `package.json`: Already has tsdown in devDeps

### Established Patterns
- All paths use `path.join()` / `path.resolve()` with `os.homedir()` — Linux compatible
- No macOS-specific APIs anywhere in codebase
- ESM throughout with `"type": "module"`

### Integration Points
- `package.json`: Add bin, files, build, prepublishOnly
- `src/config.ts`: Extend loadConfig() for full schema
- Build pipeline: tsdown src/cli.ts → dist/cli.js

</code_context>

<specifics>
## Specific Ideas

- `npm install -g claudeshell` should "just work" — no post-install configuration needed
- First run should detect missing API key and give clear instructions
- Config file is a power-user feature, not required for basic usage

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-distribution-platform*
*Context gathered: 2026-03-31*
