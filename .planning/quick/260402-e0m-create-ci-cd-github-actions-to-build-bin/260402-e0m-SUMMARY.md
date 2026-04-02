---
phase: quick
plan: 260402-e0m
subsystem: ci-cd
tags: [github-actions, sea, binary, release, npm-publish]
dependency_graph:
  requires: []
  provides: [release-pipeline, standalone-binaries]
  affects: [distribution, npm-publish]
tech_stack:
  added: [esbuild (SEA bundling), postject (SEA injection), Node.js SEA]
  patterns: [matrix builds, artifact upload/download, codesigning]
key_files:
  created:
    - scripts/build-binaries.sh
    - .github/workflows/release.yml
  modified:
    - .gitignore
decisions:
  - Used esbuild instead of tsdown for SEA CJS bundle because tsdown externalizes node_modules by default and SEA require() only supports Node built-ins
  - Dynamic SEA fuse detection from node binary instead of hardcoding (fuse string varies between Node.js versions)
  - Patching package.json require at build time to inline version string (SEA has no filesystem access)
metrics:
  duration: ~25min
  completed: "2026-04-02T07:32:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Quick Task 260402-e0m: CI/CD GitHub Actions Release Pipeline

CI/CD pipeline that builds Node.js SEA standalone binaries for 3 platforms and publishes to npm on GitHub release creation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Node.js SEA binary build script | 6ced48e | scripts/build-binaries.sh, .gitignore |
| 2 | Create GitHub Actions release workflow | 32f5c7d | .github/workflows/release.yml |

## What Was Built

### scripts/build-binaries.sh
- Detects platform (macos/linux) and architecture (arm64/x64) automatically
- Builds a fully self-contained CJS bundle using esbuild (all deps inlined)
- Generates SEA config and blob via `node --experimental-sea-config`
- Dynamically detects the SEA fuse sentinel from the node binary (version-safe)
- Injects blob with postject, handles macOS codesigning
- Patches package.json require to inline version string for SEA runtime
- Cleans up all temporary files

### .github/workflows/release.yml
- **Trigger:** `on: release: types: [published]`
- **Job 1 - test:** Ubuntu + Node 22, runs npm ci/build/test as gate
- **Job 2 - build-binaries:** Matrix of 3 platforms (macos-arm64, macos-x64, linux-x64), runs build script, uploads artifacts
- **Job 3 - upload-release-assets:** Downloads all artifacts, uploads to GitHub release via `gh` CLI
- **Job 4 - npm-publish:** Publishes to npm registry with NPM_TOKEN secret
- Uses only official `actions/*` GitHub Actions
- Concurrency group prevents duplicate runs
- Safe env-var pattern for release tag (no template injection)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] tsdown cannot produce fully-bundled CJS for SEA**
- **Found during:** Task 1
- **Issue:** tsdown externalizes node_modules deps by default (picocolors, marked, marked-terminal kept as require() calls). Node.js SEA require() only supports built-in modules.
- **Fix:** Used esbuild with `--bundle --format=cjs --platform=node` to inline all dependencies
- **Files modified:** scripts/build-binaries.sh
- **Commit:** 6ced48e

**2. [Rule 1 - Bug] Hardcoded SEA fuse sentinel doesn't match Node.js 22.12.0**
- **Found during:** Task 1
- **Issue:** The documented fuse `NODE_SEA_FUSE_fce680ab2cc467b6ac44c7517b7c16b6` doesn't exist in Node 22.12.0 binary (actual fuse: `...e072b8b5df1996b2`)
- **Fix:** Dynamic fuse detection using `strings` + `grep` on the node binary
- **Files modified:** scripts/build-binaries.sh
- **Commit:** 6ced48e

**3. [Rule 1 - Bug] SEA binary crashes on package.json require**
- **Found during:** Task 1
- **Issue:** esbuild's CJS output uses `require2("../package.json")` which fails in SEA context (no filesystem access)
- **Fix:** sed patch replaces the require call with an inline object containing version and name
- **Files modified:** scripts/build-binaries.sh
- **Commit:** 6ced48e

## Verification Results

- Binary build succeeds locally on macOS arm64
- `./claudeshell-macos-arm64 --version` outputs `claudeshell v0.1.0`
- Workflow YAML validates (101 lines, no tabs, correct structure)
- All 4 jobs present with correct dependencies (test gates everything)
- NPM_TOKEN and GITHUB_TOKEN secrets referenced correctly

## Setup Required

Before the first release, configure these GitHub repository secrets:
- **NPM_TOKEN**: npm access token for publishing (generate at npmjs.com -> Access Tokens)

`GITHUB_TOKEN` is provided automatically by GitHub Actions.

## Known Stubs

None - all functionality is complete and verified.
