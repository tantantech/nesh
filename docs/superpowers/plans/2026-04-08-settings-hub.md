# Unified Settings Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate all nesh configuration into a single `settings` command with grouped categories, consistent back-navigation, and fix all known QA bugs.

**Architecture:** Replace the current flat settings menu and standalone commands (theme/model/keys/plugin/aliases) with a hub-and-category design. The hub lives in a rewritten `settings.ts`. Each category (Appearance, AI, Plugins, Shell) has its own screen that loops back to the category after changes, and `q` always goes back one level. Existing modules (model-switcher, key-manager, wizard, prompt-config) are called from the hub but no longer wired into shell.ts directly.

**Tech Stack:** TypeScript, Node.js readline, picocolors, vitest

---

### Task 1: Update types and config schema

**Files:**
- Modify: `src/types.ts`
- Modify: `src/config.ts`
- Test: `tests/config.test.ts`

- [ ] **Step 1: Write failing test for user_aliases in config**

```typescript
// In tests/config.test.ts — add at the end of the file
import { loadConfig, saveConfig } from '../src/config.js'

describe('user_aliases config', () => {
  it('round-trips user_aliases through save and load', () => {
    const config = loadConfig()
    const updated = { ...config, user_aliases: { gs: 'git status', ll: 'ls -la' } }
    saveConfig(updated)
    const reloaded = loadConfig()
    expect(reloaded.user_aliases).toEqual({ gs: 'git status', ll: 'ls -la' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/config.test.ts -t "round-trips user_aliases" -v`
Expected: FAIL — `user_aliases` not on type

- [ ] **Step 3: Add user_aliases to NeshConfig**

In `src/config.ts`, add to `NeshConfig` interface after `highlighting`:

```typescript
  readonly user_aliases?: Readonly<Record<string, string>>
```

- [ ] **Step 4: Update BuiltinName type**

In `src/types.ts`, replace line 1:

```typescript
export type BuiltinName = 'cd' | 'exit' | 'quit' | 'clear' | 'export' | 'settings'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/config.test.ts -t "round-trips user_aliases" -v`
Expected: PASS

- [ ] **Step 6: Run full type check**

Run: `npx tsc --noEmit`
Expected: Errors in shell.ts, classify.ts, builtins.ts (they reference removed builtins). This is expected — we fix them in later tasks.

- [ ] **Step 7: Commit**

```bash
git add src/types.ts src/config.ts tests/config.test.ts
git commit -m "feat: add user_aliases to config, slim down BuiltinName"
```

---

### Task 2: Create menu navigation utilities

**Files:**
- Create: `src/menu.ts`
- Create: `tests/menu.test.ts`

- [ ] **Step 1: Write failing tests for menu utilities**

```typescript
// tests/menu.test.ts
import { describe, it, expect, vi } from 'vitest'
import { parseMenuChoice } from '../src/menu.js'

describe('parseMenuChoice', () => {
  it('returns quit for q', () => {
    expect(parseMenuChoice('q', 5)).toEqual({ type: 'quit' })
  })

  it('returns quit for Q', () => {
    expect(parseMenuChoice('Q', 5)).toEqual({ type: 'quit' })
  })

  it('returns selection for valid number', () => {
    expect(parseMenuChoice('3', 5)).toEqual({ type: 'selection', index: 3 })
  })

  it('returns invalid for out of range', () => {
    expect(parseMenuChoice('6', 5)).toEqual({ type: 'invalid' })
  })

  it('returns invalid for 0', () => {
    expect(parseMenuChoice('0', 5)).toEqual({ type: 'invalid' })
  })

  it('returns invalid for non-numeric', () => {
    expect(parseMenuChoice('abc', 5)).toEqual({ type: 'invalid' })
  })

  it('returns invalid for empty string', () => {
    expect(parseMenuChoice('', 5)).toEqual({ type: 'invalid' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/menu.test.ts -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement menu.ts**

```typescript
// src/menu.ts
import pc from 'picocolors'
import type { Interface as ReadlineInterface } from 'node:readline/promises'

export type MenuChoice =
  | { readonly type: 'quit' }
  | { readonly type: 'selection'; readonly index: number }
  | { readonly type: 'invalid' }

export function parseMenuChoice(input: string, maxOption: number): MenuChoice {
  const trimmed = input.trim().toLowerCase()
  if (trimmed === 'q') return { type: 'quit' }
  const num = parseInt(trimmed, 10)
  if (isNaN(num) || num < 1 || num > maxOption) return { type: 'invalid' }
  return { type: 'selection', index: num }
}

export interface MenuItem {
  readonly label: string
  readonly description?: string
}

export function renderMenu(title: string, items: readonly MenuItem[]): void {
  process.stdout.write(`\n${pc.bold(title)}\n\n`)
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const desc = item.description ? pc.dim(` — ${item.description}`) : ''
    process.stdout.write(`  [${i + 1}] ${item.label}${desc}\n`)
  }
  process.stdout.write('\n')
}

export async function promptMenu(
  rl: ReadlineInterface,
  title: string,
  items: readonly MenuItem[],
): Promise<MenuChoice> {
  renderMenu(title, items)
  const answer = await rl.question(`Select (1-${items.length}) or q: `)
  return parseMenuChoice(answer, items.length)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/menu.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/menu.ts tests/menu.test.ts
git commit -m "feat: add menu navigation utilities"
```

---

### Task 3: Rewrite settings hub with 4 categories

**Files:**
- Modify: `src/settings.ts` (full rewrite)
- Create: `tests/settings-hub.test.ts`

- [ ] **Step 1: Write failing test for hub main menu**

```typescript
// tests/settings-hub.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock readline to simulate user input
function createMockRl(inputs: string[]) {
  let callIndex = 0
  return {
    question: vi.fn(async () => {
      const input = inputs[callIndex] ?? 'q'
      callIndex++
      return input
    }),
  } as unknown as import('node:readline/promises').Interface
}

describe('Settings Hub', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('exits on q from main menu', async () => {
    const { executeSettings } = await import('../src/settings.js')
    const rl = createMockRl(['q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })

  it('enters appearance and exits back', async () => {
    const { executeSettings } = await import('../src/settings.js')
    // Select Appearance (1), then quit back (q), then quit main (q)
    const rl = createMockRl(['1', 'q', 'q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/settings-hub.test.ts -v`
Expected: FAIL — old executeSettings signature doesn't match

- [ ] **Step 3: Rewrite settings.ts**

```typescript
// src/settings.ts — full rewrite
import pc from 'picocolors'
import type { Interface as ReadlineInterface } from 'node:readline/promises'
import { promptMenu, parseMenuChoice, renderMenu } from './menu.js'
import type { MenuItem } from './menu.js'
import { executeWizard } from './wizard.js'
import { executePromptConfig } from './prompt-config.js'
import { executeModelSwitcher } from './model-switcher.js'
import { executeKeyManager } from './key-manager.js'
import { loadConfig, saveConfig } from './config.js'
import { TEMPLATES, buildPromptFromTemplate } from './templates.js'
import { COLOR_SCHEMES } from './prompt-config.js'
import { abbreviatePath } from './prompt.js'
import type { PluginRegistry } from './plugins/registry.js'
import type { HotReloadResult } from './plugin-reload.js'
import { BUNDLED_PLUGINS, PLUGIN_CATALOG_LIST } from './plugins/index.js'
import { PROFILES, expandProfile } from './plugins/profiles.js'
import { installPlugin, removePlugin } from './plugin-install.js'
import * as os from 'node:os'

export interface SettingsContext {
  readonly currentModel?: string
  readonly permissionMode?: 'auto' | 'ask' | 'deny'
  readonly pluginRegistry?: PluginRegistry
  readonly onHotReload?: (result: HotReloadResult) => void
}

export interface SettingsResult {
  readonly templateName?: string
  readonly colorScheme?: string
  readonly model?: string
  readonly prefix?: string
  readonly permissions?: 'auto' | 'ask' | 'deny'
  readonly historySize?: number
}

const MAIN_MENU: readonly MenuItem[] = [
  { label: 'Appearance', description: 'Theme, colors, segments' },
  { label: 'AI', description: 'Model, API keys, permissions' },
  { label: 'Plugins', description: 'Manage, install, profiles' },
  { label: 'Shell', description: 'Prefix, history, aliases' },
]

export async function executeSettings(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  while (true) {
    const choice = await promptMenu(rl, 'Nesh Settings', MAIN_MENU)

    switch (choice.type) {
      case 'quit':
        return accumulated
      case 'invalid':
        continue
      case 'selection':
        switch (choice.index) {
          case 1: {
            const result = await showAppearance(rl)
            accumulated = { ...accumulated, ...result }
            break
          }
          case 2: {
            const result = await showAI(rl, ctx)
            accumulated = { ...accumulated, ...result }
            break
          }
          case 3:
            await showPlugins(rl, ctx)
            break
          case 4: {
            const result = await showShell(rl)
            accumulated = { ...accumulated, ...result }
            break
          }
        }
    }
  }
}

// --- Appearance Category ---

const APPEARANCE_MENU: readonly MenuItem[] = [
  { label: 'Theme Wizard', description: 'Full guided setup' },
  { label: 'Template', description: 'Prompt layout style' },
  { label: 'Colors', description: 'Color scheme' },
  { label: 'Segments', description: 'Info segments & icons' },
]

async function showAppearance(rl: ReadlineInterface): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  while (true) {
    const choice = await promptMenu(rl, 'Appearance', APPEARANCE_MENU)

    switch (choice.type) {
      case 'quit':
        return accumulated
      case 'invalid':
        continue
      case 'selection':
        switch (choice.index) {
          case 1: {
            const result = await executeWizard(rl)
            if (result.templateName) accumulated = { ...accumulated, templateName: result.templateName }
            if (result.colorScheme) accumulated = { ...accumulated, colorScheme: result.colorScheme }
            break
          }
          case 2: {
            const result = await executeTemplateSelection(rl)
            if (result.templateName) accumulated = { ...accumulated, templateName: result.templateName }
            break
          }
          case 3: {
            const result = await executeColorSelection(rl)
            if (result.colorScheme) accumulated = { ...accumulated, colorScheme: result.colorScheme }
            break
          }
          case 4:
            await executePromptConfig(rl)
            break
        }
    }
  }
}

async function executeTemplateSelection(rl: ReadlineInterface): Promise<SettingsResult> {
  const cwd = process.cwd()
  const homedir = os.homedir()

  process.stdout.write('\nAvailable templates:\n\n')
  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i]
    const preview = buildPromptFromTemplate(t, cwd, homedir)
    process.stdout.write(`  [${i + 1}] ${t.label} — ${t.description}\n`)
    process.stdout.write(`      Preview: ${preview}\n\n`)
  }

  const answer = await rl.question(`Select (1-${TEMPLATES.length}) or q: `)
  const parsed = parseMenuChoice(answer, TEMPLATES.length)
  if (parsed.type !== 'selection') return {}

  const selected = TEMPLATES[parsed.index - 1].name
  saveConfig({ ...loadConfig(), prompt_template: selected })
  process.stdout.write(`Template set to: ${pc.bold(selected)}\n`)
  return { templateName: selected }
}

async function executeColorSelection(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const current = config.prompt_color_scheme ?? 'default'

  process.stdout.write('\nColor Schemes:\n\n')
  for (let i = 0; i < COLOR_SCHEMES.length; i++) {
    const s = COLOR_SCHEMES[i]
    const marker = s.name === current ? pc.green(' (current)') : ''
    const ESC = '\x1b'
    const swatch = `${ESC}[48;5;${s.primary}m  ${ESC}[0m${ESC}[48;5;${s.primaryDark}m  ${ESC}[0m${ESC}[48;5;${s.accent}m  ${ESC}[0m`
    process.stdout.write(`  [${i + 1}] ${s.label}${marker} — ${s.description}\n`)
    process.stdout.write(`      ${swatch}\n\n`)
  }

  const answer = await rl.question(`Select (1-${COLOR_SCHEMES.length}) or q: `)
  const parsed = parseMenuChoice(answer, COLOR_SCHEMES.length)
  if (parsed.type !== 'selection') return {}

  const selected = COLOR_SCHEMES[parsed.index - 1].name
  saveConfig({ ...config, prompt_color_scheme: selected })
  process.stdout.write(`Color scheme set to: ${pc.bold(selected)}\n`)
  return { colorScheme: selected }
}

// --- AI Category ---

const AI_MENU: readonly MenuItem[] = [
  { label: 'Model', description: 'Switch AI model' },
  { label: 'API Keys', description: 'View, add, remove' },
  { label: 'Permissions', description: 'AI tool access mode' },
]

const PERMISSIONS_OPTIONS = ['auto', 'ask', 'deny'] as const

async function showAI(rl: ReadlineInterface, ctx: SettingsContext): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  while (true) {
    const choice = await promptMenu(rl, 'AI', AI_MENU)

    switch (choice.type) {
      case 'quit':
        return accumulated
      case 'invalid':
        continue
      case 'selection':
        switch (choice.index) {
          case 1: {
            const model = await executeModelSwitcher(rl, ctx.currentModel)
            if (model) {
              accumulated = { ...accumulated, model }
              saveConfig({ ...loadConfig(), model })
            }
            break
          }
          case 2:
            await executeKeyManager(rl)
            break
          case 3: {
            const result = await editPermissions(rl)
            if (result.permissions) accumulated = { ...accumulated, ...result }
            break
          }
        }
    }
  }
}

async function editPermissions(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const current = config.permissions ?? 'auto'

  process.stdout.write('\nPermission mode:\n\n')
  for (let i = 0; i < PERMISSIONS_OPTIONS.length; i++) {
    const opt = PERMISSIONS_OPTIONS[i]
    const marker = opt === current ? pc.green(' (current)') : ''
    process.stdout.write(`  [${i + 1}] ${opt}${marker}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`Select (1-${PERMISSIONS_OPTIONS.length}) or q: `)
  const parsed = parseMenuChoice(answer, PERMISSIONS_OPTIONS.length)
  if (parsed.type !== 'selection') return {}

  const selected = PERMISSIONS_OPTIONS[parsed.index - 1]
  saveConfig({ ...config, permissions: selected })
  process.stdout.write(`Permissions set to: ${pc.bold(selected)}\n`)
  return { permissions: selected }
}

// --- Plugins Category ---

const PLUGINS_MENU: readonly MenuItem[] = [
  { label: 'List', description: 'Show all plugins with status' },
  { label: 'Enable/Disable', description: 'Toggle a plugin' },
  { label: 'Install', description: 'Install from git repo' },
  { label: 'Remove', description: 'Uninstall a plugin' },
  { label: 'Search', description: 'Search plugin catalog' },
  { label: 'Profile', description: 'Apply a preset' },
  { label: 'Doctor', description: 'Health check' },
]

async function showPlugins(rl: ReadlineInterface, ctx: SettingsContext): Promise<void> {
  while (true) {
    const choice = await promptMenu(rl, 'Plugins', PLUGINS_MENU)

    switch (choice.type) {
      case 'quit':
        return
      case 'invalid':
        continue
      case 'selection':
        switch (choice.index) {
          case 1:
            listPlugins(ctx)
            break
          case 2:
            await togglePlugin(rl, ctx)
            break
          case 3:
            await installPluginMenu(rl, ctx)
            break
          case 4:
            await removePluginMenu(rl, ctx)
            break
          case 5:
            await searchPluginMenu(rl)
            break
          case 6:
            await profileMenu(rl, ctx)
            break
          case 7:
            doctorMenu(ctx)
            break
        }
    }
  }
}

function listPlugins(ctx: SettingsContext): void {
  const config = loadConfig()
  const enabledSet = new Set(config.plugins?.enabled ?? [])

  // Show ALL enabled plugins from config, not just those in registry
  const enabledList = [...enabledSet].sort()

  process.stdout.write(`\n${pc.bold('Plugins')} (${enabledList.length} enabled)\n\n`)

  if (enabledList.length === 0) {
    process.stdout.write('  No plugins enabled. Use Profile to get started.\n')
  }

  // Get registry entries for status info
  const registry = ctx.pluginRegistry
  for (const name of enabledList) {
    const entry = registry?.getPlugins().find(p => p.manifest.name === name)
    const version = entry ? pc.dim(` v${entry.manifest.version}`) : ''
    const status = entry?.status === 'failed' ? pc.red(' (failed)') : pc.green(' [enabled]')
    const aliases = entry?.manifest.aliases
    const aliasCount = aliases ? pc.dim(` (${Object.keys(aliases).length} aliases)`) : ''
    process.stdout.write(`  ${name}${version}${status}${aliasCount}\n`)
  }
  process.stdout.write('\n')
}

async function togglePlugin(rl: ReadlineInterface, ctx: SettingsContext): Promise<void> {
  const config = loadConfig()
  const enabled = new Set(config.plugins?.enabled ?? [])

  // Show current state
  process.stdout.write(`\n${pc.bold('Toggle Plugin')}\n\n`)
  const name = (await rl.question('Plugin name (or q): ')).trim()
  if (name === 'q' || !name) return

  if (enabled.has(name)) {
    const newEnabled = [...enabled].filter(p => p !== name)
    saveConfig({ ...config, plugins: { ...config.plugins, enabled: newEnabled } })
    process.stdout.write(`Disabled: ${pc.bold(name)}\n`)
  } else {
    const newEnabled = [...enabled, name]
    saveConfig({ ...config, plugins: { ...config.plugins, enabled: newEnabled } })
    process.stdout.write(`Enabled: ${pc.bold(name)}\n`)
  }

  triggerHotReload(ctx)
}

async function installPluginMenu(rl: ReadlineInterface, ctx: SettingsContext): Promise<void> {
  process.stdout.write(`\n${pc.bold('Install Plugin')}\n\n`)
  const repo = (await rl.question('Git repo URL (or q): ')).trim()
  if (repo === 'q' || !repo) return

  const manifest = await installPlugin(repo, rl)
  if (manifest) {
    const config = loadConfig()
    const newEnabled = [...(config.plugins?.enabled ?? []), manifest.name]
    saveConfig({ ...config, plugins: { ...config.plugins, enabled: newEnabled } })
    triggerHotReload(ctx)
  }
}

async function removePluginMenu(rl: ReadlineInterface, ctx: SettingsContext): Promise<void> {
  process.stdout.write(`\n${pc.bold('Remove Plugin')}\n\n`)
  const name = (await rl.question('Plugin name (or q): ')).trim()
  if (name === 'q' || !name) return

  await removePlugin(name)
  const config = loadConfig()
  const newEnabled = (config.plugins?.enabled ?? []).filter(p => p !== name)
  saveConfig({ ...config, plugins: { ...config.plugins, enabled: newEnabled } })
  process.stdout.write(`Removed: ${pc.bold(name)}\n`)
  triggerHotReload(ctx)
}

async function searchPluginMenu(rl: ReadlineInterface): Promise<void> {
  process.stdout.write(`\n${pc.bold('Search Plugins')}\n\n`)
  const query = (await rl.question('Search query (or q): ')).trim()
  if (query === 'q' || !query) return

  const results = PLUGIN_CATALOG_LIST.filter(
    p => p.name.includes(query) || (p.description ?? '').toLowerCase().includes(query.toLowerCase()),
  )

  if (results.length === 0) {
    process.stdout.write('  No plugins found.\n')
  } else {
    for (const p of results.slice(0, 20)) {
      process.stdout.write(`  ${pc.bold(p.name)} — ${p.description ?? ''}\n`)
    }
    if (results.length > 20) {
      process.stdout.write(pc.dim(`  ... and ${results.length - 20} more\n`))
    }
  }
  process.stdout.write('\n')
}

async function profileMenu(rl: ReadlineInterface, ctx: SettingsContext): Promise<void> {
  const profileNames = Object.keys(PROFILES)
  const items: MenuItem[] = profileNames.map(name => ({
    label: name,
    description: `${PROFILES[name as keyof typeof PROFILES]?.length ?? 0} plugins`,
  }))

  const choice = await promptMenu(rl, 'Plugin Profiles', items)
  if (choice.type !== 'selection') return

  const selected = profileNames[choice.index - 1]
  const plugins = expandProfile(selected)
  const config = loadConfig()
  saveConfig({ ...config, plugins: { ...config.plugins, enabled: plugins } })
  process.stdout.write(`Applied profile: ${pc.bold(selected)} (${plugins.length} plugins)\n`)
  triggerHotReload(ctx)
}

function doctorMenu(ctx: SettingsContext): void {
  const config = loadConfig()
  const enabled = config.plugins?.enabled ?? []
  const registry = ctx.pluginRegistry
  const entries = registry?.getPlugins() ?? []
  const failed = entries.filter(e => e.status === 'failed')

  process.stdout.write(`\n${pc.bold('Plugin Doctor')}\n\n`)
  process.stdout.write(`  Total enabled: ${enabled.length}\n`)
  process.stdout.write(`  Loaded: ${entries.length}\n`)
  process.stdout.write(`  Failed: ${failed.length}\n`)

  if (failed.length > 0) {
    process.stdout.write('\n  Failed plugins:\n')
    for (const f of failed) {
      process.stdout.write(`    ${pc.red(f.manifest.name)}\n`)
    }
  } else {
    process.stdout.write(`\n  ${pc.green('All plugins healthy.')}\n`)
  }
  process.stdout.write('\n')
}

function triggerHotReload(ctx: SettingsContext): void {
  // Hot reload is triggered by the shell.ts callback
  // The ctx.onHotReload fires if provided
  if (ctx.onHotReload) {
    // The actual reload is async and handled by plugin-reload module
    // We just need to signal it — the shell wiring does the real work
    import('./plugin-reload.js').then(mod => {
      const config = loadConfig()
      mod.hotReload(config.plugins?.enabled ?? []).then(result => {
        ctx.onHotReload!(result)
      }).catch(() => {})
    }).catch(() => {})
  }
}

// --- Shell Category ---

const SHELL_MENU: readonly MenuItem[] = [
  { label: 'AI Prefix', description: 'Change the trigger prefix' },
  { label: 'History Size', description: 'Set history line limit' },
  { label: 'Aliases', description: 'View, add, remove custom aliases' },
]

async function showShell(rl: ReadlineInterface): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  while (true) {
    const choice = await promptMenu(rl, 'Shell', SHELL_MENU)

    switch (choice.type) {
      case 'quit':
        return accumulated
      case 'invalid':
        continue
      case 'selection':
        switch (choice.index) {
          case 1: {
            const result = await editPrefix(rl)
            if (result.prefix) accumulated = { ...accumulated, ...result }
            break
          }
          case 2: {
            const result = await editHistorySize(rl)
            if (result.historySize) accumulated = { ...accumulated, ...result }
            break
          }
          case 3:
            await showAliases(rl)
            break
        }
    }
  }
}

async function editPrefix(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const current = config.prefix ?? 'a'
  process.stdout.write(`\nCurrent prefix: ${pc.bold(current)}\n`)

  const answer = await rl.question('New prefix (no spaces, or q): ')
  const trimmed = answer.trim()
  if (trimmed === 'q' || !trimmed) return {}

  if (/\s/.test(trimmed)) {
    process.stdout.write('Invalid prefix (must have no whitespace).\n')
    return {}
  }

  saveConfig({ ...config, prefix: trimmed })
  process.stdout.write(`Prefix set to: ${pc.bold(trimmed)}\n`)
  return { prefix: trimmed }
}

async function editHistorySize(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const current = config.history_size ?? 1000
  process.stdout.write(`\nCurrent history size: ${pc.bold(String(current))}\n`)

  const answer = await rl.question('New history size (min 100, or q): ')
  const trimmed = answer.trim()
  if (trimmed === 'q') return {}

  const num = parseInt(trimmed, 10)
  if (isNaN(num) || num < 100) {
    process.stdout.write('Invalid value (must be >= 100).\n')
    return {}
  }

  saveConfig({ ...config, history_size: num })
  process.stdout.write(`History size set to: ${pc.bold(String(num))}\n`)
  return { historySize: num }
}

// --- Aliases ---

const ALIASES_MENU: readonly MenuItem[] = [
  { label: 'List All', description: 'Show all aliases by source' },
  { label: 'Add Alias', description: 'Create a custom alias' },
  { label: 'Remove Alias', description: 'Delete a custom alias' },
]

async function showAliases(rl: ReadlineInterface): Promise<void> {
  while (true) {
    const choice = await promptMenu(rl, 'Aliases', ALIASES_MENU)

    switch (choice.type) {
      case 'quit':
        return
      case 'invalid':
        continue
      case 'selection':
        switch (choice.index) {
          case 1:
            listAliases()
            break
          case 2:
            await addAlias(rl)
            break
          case 3:
            await removeAlias(rl)
            break
        }
    }
  }
}

function listAliases(): void {
  const config = loadConfig()
  const userAliases = config.user_aliases ?? {}
  const userEntries = Object.entries(userAliases).sort(([a], [b]) => a.localeCompare(b))

  process.stdout.write(`\n${pc.bold('User Aliases')}\n`)
  if (userEntries.length === 0) {
    process.stdout.write('  No custom aliases defined.\n')
  } else {
    for (const [name, expansion] of userEntries) {
      process.stdout.write(`  ${pc.bold(name)} ${pc.dim('->')} ${expansion}\n`)
    }
  }
  process.stdout.write('\n')

  // Plugin aliases are read-only info
  process.stdout.write(pc.dim('  Plugin aliases are managed by their respective plugins.\n'))
  process.stdout.write(pc.dim('  Enable/disable plugins to control their aliases.\n\n'))
}

async function addAlias(rl: ReadlineInterface): Promise<void> {
  process.stdout.write(`\n${pc.bold('Add Alias')}\n\n`)
  const name = (await rl.question('Alias name (or q): ')).trim()
  if (name === 'q' || !name) return

  if (/\s/.test(name)) {
    process.stdout.write('Alias name cannot contain spaces.\n')
    return
  }

  const expansion = (await rl.question('Expansion (the command it runs): ')).trim()
  if (!expansion) {
    process.stdout.write('Expansion cannot be empty.\n')
    return
  }

  const config = loadConfig()
  const userAliases = { ...(config.user_aliases ?? {}), [name]: expansion }
  saveConfig({ ...config, user_aliases: userAliases })
  process.stdout.write(`Added alias: ${pc.bold(name)} -> ${expansion}\n`)
}

async function removeAlias(rl: ReadlineInterface): Promise<void> {
  const config = loadConfig()
  const userAliases = config.user_aliases ?? {}
  const names = Object.keys(userAliases).sort()

  if (names.length === 0) {
    process.stdout.write('\nNo custom aliases to remove.\n')
    return
  }

  process.stdout.write(`\n${pc.bold('Remove Alias')}\n\n`)
  for (let i = 0; i < names.length; i++) {
    process.stdout.write(`  [${i + 1}] ${names[i]} ${pc.dim('->')} ${userAliases[names[i]]}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`Select (1-${names.length}) or q: `)
  const parsed = parseMenuChoice(answer, names.length)
  if (parsed.type !== 'selection') return

  const toRemove = names[parsed.index - 1]
  const { [toRemove]: _, ...remaining } = userAliases
  saveConfig({ ...config, user_aliases: Object.keys(remaining).length > 0 ? remaining : undefined })
  process.stdout.write(`Removed alias: ${pc.bold(toRemove)}\n`)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/settings-hub.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/settings.ts tests/settings-hub.test.ts
git commit -m "feat: rewrite settings as unified hub with 4 categories"
```

---

### Task 4: Update classify.ts — remove old builtins

**Files:**
- Modify: `src/classify.ts`
- Modify: `tests/classify.test.ts`

- [ ] **Step 1: Write failing test for removed builtins**

Add to `tests/classify.test.ts`:

```typescript
describe('removed builtins', () => {
  it('treats theme as passthrough', () => {
    expect(classifyInput('theme')).toEqual({ type: 'passthrough', command: 'theme' })
  })

  it('treats model as passthrough', () => {
    expect(classifyInput('model')).toEqual({ type: 'passthrough', command: 'model' })
  })

  it('treats keys as passthrough', () => {
    expect(classifyInput('keys')).toEqual({ type: 'passthrough', command: 'keys' })
  })

  it('treats plugin as passthrough', () => {
    expect(classifyInput('plugin list')).toEqual({ type: 'passthrough', command: 'plugin list' })
  })

  it('treats aliases as passthrough', () => {
    expect(classifyInput('aliases')).toEqual({ type: 'passthrough', command: 'aliases' })
  })

  it('still recognizes settings as builtin', () => {
    expect(classifyInput('settings')).toEqual({ type: 'builtin', name: 'settings', args: '' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/classify.test.ts -t "removed builtins" -v`
Expected: FAIL — theme/model/keys/plugin/aliases still classified as builtins

- [ ] **Step 3: Update classify.ts BUILTINS set**

In `src/classify.ts`, replace line 4:

```typescript
const BUILTINS: ReadonlySet<string> = new Set(['cd', 'exit', 'quit', 'clear', 'export', 'settings'])
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/classify.test.ts -v`
Expected: PASS (check that existing tests for cd/exit/clear still pass too)

- [ ] **Step 5: Commit**

```bash
git add src/classify.ts tests/classify.test.ts
git commit -m "refactor: remove theme/model/keys/plugin/aliases from builtins"
```

---

### Task 5: Update shell.ts — remove old builtin cases, wire new settings

**Files:**
- Modify: `src/shell.ts`

- [ ] **Step 1: Remove old builtin imports**

In `src/shell.ts`, remove these imports:
- `executeTheme` from `./builtins.js`
- `executeModelSwitcher` from `./model-switcher.js`
- `executeKeyManager` from `./key-manager.js`
- `executeAliases` from `./builtins.js`
- `executePlugin` from `./plugin-manager.js`

Keep the `executeSettings` import but update to new signature:

```typescript
import { executeSettings } from './settings.js'
import type { SettingsContext } from './settings.js'
```

- [ ] **Step 2: Remove old builtin switch cases**

In `src/shell.ts`, remove the entire switch cases for: `theme`, `model`, `keys`, `aliases`, `plugin`.

- [ ] **Step 3: Update the settings case**

Replace the `case 'settings'` block (lines 314-332) with:

```typescript
            case 'settings': {
              const settingsCtx: SettingsContext = {
                currentModel: state.currentModel,
                permissionMode: state.permissionMode,
                pluginRegistry,
                onHotReload: (r) => {
                  pluginRegistry = r.registry
                  hookBus = r.hookBus
                  enabledPlugins = r.enabled
                  addKnownCommands(pluginRegistry.getAll().keys())
                },
              }
              const settingsResult = await executeSettings(rl, settingsCtx)
              if (settingsResult.templateName) {
                currentTemplate = settingsResult.templateName
              }
              if (settingsResult.model) {
                state = { ...state, currentModel: settingsResult.model }
              }
              if (settingsResult.prefix) {
                prefix = settingsResult.prefix
              }
              if (settingsResult.permissions) {
                state = { ...state, permissionMode: settingsResult.permissions }
              }
              break
            }
```

- [ ] **Step 4: Load user aliases into the alias expander**

Find the `expandAlias` call (line 258) and ensure user aliases from config are also expanded. In `src/shell.ts`, after loading config at startup, load user aliases:

```typescript
// Near the top of runShell, after loading config:
const userAliases = config.user_aliases ?? {}
```

Then pass to the `expandAlias` function. If `expandAlias` doesn't support user aliases yet, add support: check `userAliases[firstWord]` before checking the plugin registry.

- [ ] **Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS (no type errors)

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: Some existing tests that reference old builtins may fail — fix them in the next task.

- [ ] **Step 7: Commit**

```bash
git add src/shell.ts
git commit -m "refactor: wire unified settings hub into shell REPL"
```

---

### Task 6: Update chat.ts — add /settings, remove /model /permissions

**Files:**
- Modify: `src/chat.ts`
- Modify: `tests/chat.test.ts`

- [ ] **Step 1: Write failing test for /settings command**

Add to `tests/chat.test.ts`:

```typescript
it('parses /settings as settings command', () => {
  expect(parseSlashCommand('/settings')).toEqual({ type: 'settings' })
})

it('parses /model as unknown', () => {
  expect(parseSlashCommand('/model')).toEqual({ type: 'unknown', input: '/model' })
})

it('parses /permissions as unknown', () => {
  expect(parseSlashCommand('/permissions')).toEqual({ type: 'unknown', input: '/permissions' })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/chat.test.ts -t "/settings" -v`
Expected: FAIL

- [ ] **Step 3: Update parseSlashCommand**

In `src/chat.ts`, update the `SlashCommandResult` type:

```typescript
export type SlashCommandResult =
  | { readonly type: 'exit' }
  | { readonly type: 'new' }
  | { readonly type: 'settings' }
  | { readonly type: 'unknown'; readonly input: string }
```

Update `parseSlashCommand`:

```typescript
export function parseSlashCommand(raw: string): SlashCommandResult {
  const input = raw.trim()

  if (input === '/exit' || input === '/shell') {
    return { type: 'exit' }
  }

  if (input === '/new') {
    return { type: 'new' }
  }

  if (input === '/settings') {
    return { type: 'settings' }
  }

  return { type: 'unknown', input }
}
```

- [ ] **Step 4: Update runChatMode to handle /settings**

In the switch block inside `runChatMode`, replace the `model` and `permissions_*` cases with:

```typescript
        case 'settings': {
          // Import and run settings hub inline
          const { executeSettings } = await import('./settings.js')
          const settingsResult = await executeSettings(rl, {
            currentModel: state.currentModel,
            permissionMode: state.permissionMode,
          })
          if (settingsResult.model) state = { ...state, currentModel: settingsResult.model }
          if (settingsResult.permissions) state = { ...state, permissionMode: settingsResult.permissions }
          continue
        }
```

Update the help text (line 74) to show only the new commands:

```typescript
  process.stderr.write(pc.dim('Chat mode -- type /exit to return to shell, /new for fresh context, /settings to configure\n'))
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/chat.test.ts -v`
Expected: PASS (update any existing tests for /model and /permissions to expect `unknown`)

- [ ] **Step 6: Commit**

```bash
git add src/chat.ts tests/chat.test.ts
git commit -m "refactor: replace chat /model /permissions with /settings"
```

---

### Task 7: Fix model switcher — add (current) marker

**Files:**
- Modify: `src/model-switcher.ts`

- [ ] **Step 1: Read current model-switcher.ts fully**

Read `src/model-switcher.ts` to find where models are printed.

- [ ] **Step 2: Add current marker**

Find the line that prints each model (the `process.stdout.write` with model name). Add a check:

```typescript
const marker = m.shorthand === currentModel || m.entry.modelId === currentModel
  ? pc.green(' (current)')
  : ''
```

Include `marker` in the output string after the model display name.

- [ ] **Step 3: Run build and verify**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/model-switcher.ts
git commit -m "fix: show (current) marker in model picker"
```

---

### Task 8: Fix $? propagation in passthrough

**Files:**
- Modify: `src/shell.ts`
- Create: `tests/exit-code.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/exit-code.test.ts
import { describe, it, expect } from 'vitest'

function runShell(input: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const { spawn } = require('node:child_process')
    const child = spawn('npx', ['tsx', 'src/cli.ts', '--interactive'], {
      cwd: process.cwd(),
      env: { ...process.env, TERM: 'dumb' },
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    child.stdin.write(input)
    child.stdin.end()
    child.on('close', (code: number | null) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 })
    })
  })
}

describe('Exit code propagation', { timeout: 30_000 }, () => {
  it('$? reflects last command exit code', async () => {
    const { stdout } = await runShell('false\necho $?\nexit\n')
    expect(stdout).toContain('1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/exit-code.test.ts -v`
Expected: FAIL — $? returns 0 instead of 1

- [ ] **Step 3: Propagate exit code into shell environment**

In `src/shell.ts`, after the passthrough command completes (where `commandResult.exitCode` is available), add:

```typescript
// Set $? for subsequent shell commands
process.env.NESH_LAST_EXIT = String(commandResult.exitCode)
```

Then in the passthrough execution, prepend the command with the exit code assignment. In `src/passthrough.ts`, modify `executeCommand` to accept a `lastExitCode` parameter, and in the spawned bash command, prefix with:

```typescript
const wrappedCommand = `(exit ${lastExitCode ?? 0}); ${command}`
```

This makes `$?` reflect the previous command's exit code at the start of each bash invocation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/exit-code.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shell.ts src/passthrough.ts tests/exit-code.test.ts
git commit -m "fix: propagate exit code to \$? for subsequent commands"
```

---

### Task 9: Clean up builtins.ts — remove migrated code

**Files:**
- Modify: `src/builtins.ts`

- [ ] **Step 1: Remove executeTheme and executeAliases**

Remove the `executeTheme`, `executeQuickEdit`, `executeTemplateSelection`, `executeColorSelection`, and `executeAliases` functions from `src/builtins.ts`. Keep `executeCd`, `executeExport`, `expandTilde`, and the `ThemeResult` type (if still used by wizard.ts).

Remove unused imports: `TEMPLATES`, `buildPromptFromTemplate`, `COLOR_SCHEMES`, `getColorSchemeByName`, `executePromptConfig`, `executeWizard`, `PluginRegistry`.

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: PASS — all 628+ tests pass

- [ ] **Step 4: Commit**

```bash
git add src/builtins.ts
git commit -m "refactor: remove migrated theme and alias code from builtins"
```

---

### Task 10: Update existing tests for new architecture

**Files:**
- Modify: `tests/classify.test.ts`
- Modify: `tests/shell.integration.test.ts`
- Modify: any other test files referencing old commands

- [ ] **Step 1: Fix classify tests**

Update any tests in `tests/classify.test.ts` that expect `theme`, `model`, `keys`, `plugin`, or `aliases` to be classified as builtins. They should now be classified as `passthrough`.

- [ ] **Step 2: Fix integration tests**

In `tests/shell.integration.test.ts`, remove or update any tests that directly use `theme`, `model`, `keys`, `plugin`, or `aliases` commands. Add a test that `settings` opens and `q` exits:

```typescript
  it('settings command opens and q exits', async () => {
    const { exitCode } = await runShell('settings\nq\nexit\n')
    expect(exitCode).toBe(0)
  })
```

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: ALL PASS

- [ ] **Step 4: Build and reinstall**

Run: `npm run build && npm install -g .`

- [ ] **Step 5: Commit**

```bash
git add tests/
git commit -m "test: update tests for unified settings hub"
```

---

### Task 11: Final integration verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: ALL PASS

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Manual smoke test**

Launch nesh and verify:
1. `settings` → shows 4 categories
2. Select Appearance → shows 4 options, `q` goes back
3. Select AI → shows model with (current) marker
4. Select Plugins → List shows all enabled plugins
5. Select Shell → Aliases → Add/List/Remove work
6. `theme` → passes through to bash (not a builtin)
7. Chat mode → `/settings` works, `/model` shows unknown

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete unified settings hub with all QA fixes"
```
