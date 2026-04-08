import pc from 'picocolors'
import type { Interface as ReadlineInterface } from 'node:readline/promises'
import { promptMenu, parseMenuChoice } from './menu.js'
import type { MenuItem } from './menu.js'
import { executeWizard } from './wizard.js'
import { executePromptConfig, COLOR_SCHEMES } from './prompt-config.js'
import { executeModelSwitcher } from './model-switcher.js'
import { executeKeyManager } from './key-manager.js'
import { loadConfig, saveConfig } from './config.js'
import { TEMPLATES } from './templates.js'
import type { PluginRegistry } from './plugins/registry.js'
import type { HotReloadResult } from './plugin-reload.js'
import { PLUGIN_CATALOG_LIST } from './plugins/index.js'
import { PROFILES, expandProfile } from './plugins/profiles.js'
import { installPlugin, removePlugin } from './plugin-install.js'

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

const PERMISSIONS_OPTIONS = ['auto', 'ask', 'deny'] as const

const MAIN_MENU_ITEMS: readonly MenuItem[] = [
  { label: 'Appearance', description: 'Theme, colors, segments' },
  { label: 'AI', description: 'Model, API keys, permissions' },
  { label: 'Plugins', description: 'Manage, install, profiles' },
  { label: 'Shell', description: 'Prefix, history, aliases' },
]

const APPEARANCE_ITEMS: readonly MenuItem[] = [
  { label: 'Theme Wizard' },
  { label: 'Template' },
  { label: 'Colors' },
  { label: 'Segments' },
]

const AI_ITEMS: readonly MenuItem[] = [
  { label: 'Model' },
  { label: 'API Keys' },
  { label: 'Permissions' },
]

const PLUGINS_ITEMS: readonly MenuItem[] = [
  { label: 'List' },
  { label: 'Enable/Disable' },
  { label: 'Install' },
  { label: 'Remove' },
  { label: 'Search' },
  { label: 'Profile' },
  { label: 'Doctor' },
]

const SHELL_ITEMS: readonly MenuItem[] = [
  { label: 'AI Prefix' },
  { label: 'History Size' },
  { label: 'Aliases' },
]

const ALIASES_ITEMS: readonly MenuItem[] = [
  { label: 'List All' },
  { label: 'Add Alias' },
  { label: 'Remove Alias' },
]

// ---------------------------------------------------------------------------
// Hot-reload helper
// ---------------------------------------------------------------------------

function triggerHotReload(ctx: SettingsContext): void {
  if (ctx.onHotReload) {
    import('./plugin-reload.js').then(mod => {
      mod.hotReload().then(result => {
        ctx.onHotReload!(result)
      }).catch(() => {})
    }).catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function executeSettings(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  // Main menu loop
  for (;;) {
    const choice = await promptMenu(rl, 'Nesh Settings', MAIN_MENU_ITEMS)

    if (choice.type === 'quit') break
    if (choice.type === 'invalid') continue

    switch (choice.index) {
      case 1: {
        const result = await appearanceMenu(rl)
        accumulated = { ...accumulated, ...result }
        break
      }
      case 2: {
        const result = await aiMenu(rl, ctx)
        accumulated = { ...accumulated, ...result }
        break
      }
      case 3: {
        await pluginsMenu(rl, ctx)
        break
      }
      case 4: {
        const result = await shellMenu(rl)
        accumulated = { ...accumulated, ...result }
        break
      }
    }
  }

  return accumulated
}

// ---------------------------------------------------------------------------
// Appearance category
// ---------------------------------------------------------------------------

async function appearanceMenu(rl: ReadlineInterface): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  for (;;) {
    const choice = await promptMenu(rl, 'Appearance', APPEARANCE_ITEMS)

    if (choice.type === 'quit') break
    if (choice.type === 'invalid') continue

    switch (choice.index) {
      case 1: {
        const wizResult = await executeWizard(rl)
        if (wizResult.templateName) {
          accumulated = { ...accumulated, templateName: wizResult.templateName }
        }
        if (wizResult.colorScheme) {
          accumulated = { ...accumulated, colorScheme: wizResult.colorScheme }
        }
        break
      }
      case 2: {
        const result = await pickTemplate(rl)
        accumulated = { ...accumulated, ...result }
        break
      }
      case 3: {
        const result = await pickColorScheme(rl)
        accumulated = { ...accumulated, ...result }
        break
      }
      case 4: {
        await executePromptConfig(rl)
        break
      }
    }
  }

  return accumulated
}

async function pickTemplate(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const currentName = config.prompt_template ?? 'minimal'

  process.stdout.write(`\n${pc.bold('Select Template')}\n\n`)
  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i]
    const marker = t.name === currentName ? pc.green(' (current)') : ''
    const nf = t.requiresNerdFont ? pc.dim(' [Nerd Font]') : ''
    process.stdout.write(`  [${i + 1}] ${t.label}${nf} — ${pc.dim(t.description)}${marker}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`Select (1-${TEMPLATES.length}) or q: `)
  const parsed = parseMenuChoice(answer, TEMPLATES.length)

  if (parsed.type !== 'selection') return {}

  const selected = TEMPLATES[parsed.index - 1]
  saveConfig({ ...config, prompt_template: selected.name })
  process.stdout.write(`Template set to: ${pc.bold(selected.label)}\n`)
  return { templateName: selected.name }
}

async function pickColorScheme(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const currentName = config.prompt_color_scheme ?? 'default'

  process.stdout.write(`\n${pc.bold('Select Color Scheme')}\n\n`)
  for (let i = 0; i < COLOR_SCHEMES.length; i++) {
    const s = COLOR_SCHEMES[i]
    const marker = s.name === currentName ? pc.green(' (current)') : ''
    process.stdout.write(`  [${i + 1}] ${s.label} — ${pc.dim(s.description)}${marker}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`Select (1-${COLOR_SCHEMES.length}) or q: `)
  const parsed = parseMenuChoice(answer, COLOR_SCHEMES.length)

  if (parsed.type !== 'selection') return {}

  const selected = COLOR_SCHEMES[parsed.index - 1]
  saveConfig({ ...config, prompt_color_scheme: selected.name })
  process.stdout.write(`Color scheme set to: ${pc.bold(selected.label)}\n`)
  return { colorScheme: selected.name }
}

// ---------------------------------------------------------------------------
// AI category
// ---------------------------------------------------------------------------

async function aiMenu(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  for (;;) {
    const choice = await promptMenu(rl, 'AI', AI_ITEMS)

    if (choice.type === 'quit') break
    if (choice.type === 'invalid') continue

    switch (choice.index) {
      case 1: {
        const model = await executeModelSwitcher(rl, ctx.currentModel)
        if (model) {
          accumulated = { ...accumulated, model }
        }
        break
      }
      case 2: {
        await executeKeyManager(rl)
        break
      }
      case 3: {
        const result = await pickPermissions(rl, ctx)
        accumulated = { ...accumulated, ...result }
        break
      }
    }
  }

  return accumulated
}

async function pickPermissions(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<SettingsResult> {
  const config = loadConfig()
  const current = ctx.permissionMode ?? config.permissions ?? 'auto'

  process.stdout.write(`\n${pc.bold('Permission Mode')}\n\n`)
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

// ---------------------------------------------------------------------------
// Plugins category
// ---------------------------------------------------------------------------

async function pluginsMenu(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<void> {
  for (;;) {
    const choice = await promptMenu(rl, 'Plugins', PLUGINS_ITEMS)

    if (choice.type === 'quit') break
    if (choice.type === 'invalid') continue

    switch (choice.index) {
      case 1:
        pluginsList(ctx)
        break
      case 2:
        await pluginsToggle(rl, ctx)
        break
      case 3:
        await pluginsInstall(rl, ctx)
        break
      case 4:
        await pluginsRemove(rl, ctx)
        break
      case 5:
        await pluginsSearch(rl)
        break
      case 6:
        await pluginsProfile(rl, ctx)
        break
      case 7:
        pluginsDoctor(ctx)
        break
    }
  }
}

function pluginsList(ctx: SettingsContext): void {
  const config = loadConfig()
  const enabled = config.plugins?.enabled ?? []

  if (enabled.length === 0) {
    process.stdout.write(`\n${pc.dim('No plugins enabled.')}\n`)
    return
  }

  process.stdout.write(`\n${pc.bold('Enabled Plugins')}\n\n`)

  const registry = ctx.pluginRegistry
  const entries = registry ? registry.getPlugins() : []

  for (const name of enabled) {
    const entry = entries.find(e => e.manifest.name === name)
    if (entry) {
      const version = entry.manifest.version ?? '?'
      const status = entry.status === 'loaded' ? pc.green('loaded') : pc.yellow(entry.status)
      const aliasCount = entry.manifest.aliases ? Object.keys(entry.manifest.aliases).length : 0
      const aliasPart = aliasCount > 0 ? pc.dim(` (${aliasCount} aliases)`) : ''
      process.stdout.write(`  ${pc.bold(name)} v${version} — ${status}${aliasPart}\n`)
    } else {
      process.stdout.write(`  ${pc.bold(name)} — ${pc.dim('not loaded')}\n`)
    }
  }
  process.stdout.write('\n')
}

async function pluginsToggle(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<void> {
  const config = loadConfig()
  const enabled = [...(config.plugins?.enabled ?? [])] as string[]

  const answer = await rl.question('Plugin name to toggle: ')
  const name = answer.trim()
  if (!name) return

  const idx = enabled.indexOf(name)
  const newEnabled = idx >= 0
    ? enabled.filter(p => p !== name)
    : [...enabled, name]

  saveConfig({
    ...config,
    plugins: { ...config.plugins, enabled: newEnabled },
  })

  const action = idx >= 0 ? 'disabled' : 'enabled'
  process.stdout.write(`Plugin "${name}" ${action}.\n`)
  triggerHotReload(ctx)
}

async function pluginsInstall(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<void> {
  const answer = await rl.question('Git repo URL or user/repo: ')
  const repoRef = answer.trim()
  if (!repoRef) return

  const manifest = await installPlugin(repoRef, rl)
  if (manifest) {
    // Auto-enable
    const config = loadConfig()
    const enabled = [...(config.plugins?.enabled ?? [])] as string[]
    if (!enabled.includes(manifest.name)) {
      saveConfig({
        ...config,
        plugins: { ...config.plugins, enabled: [...enabled, manifest.name] },
      })
    }
    triggerHotReload(ctx)
  }
}

async function pluginsRemove(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<void> {
  const answer = await rl.question('Plugin name to remove: ')
  const name = answer.trim()
  if (!name) return

  await removePlugin(name)
  process.stdout.write(`Plugin "${name}" removed.\n`)
  triggerHotReload(ctx)
}

async function pluginsSearch(rl: ReadlineInterface): Promise<void> {
  const answer = await rl.question('Search query: ')
  const query = answer.trim().toLowerCase()
  if (!query) return

  const matches = PLUGIN_CATALOG_LIST.filter(
    p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
  )

  if (matches.length === 0) {
    process.stdout.write(`\n${pc.dim('No plugins matched.')}\n`)
    return
  }

  process.stdout.write(`\n${pc.bold('Search Results')}\n\n`)
  for (const p of matches) {
    process.stdout.write(`  ${pc.bold(p.name)} — ${p.description} ${pc.dim(`[${p.category}]`)}\n`)
  }
  process.stdout.write('\n')
}

async function pluginsProfile(
  rl: ReadlineInterface,
  ctx: SettingsContext,
): Promise<void> {
  process.stdout.write(`\n${pc.bold('Plugin Profiles')}\n\n`)
  for (let i = 0; i < PROFILES.length; i++) {
    const p = PROFILES[i]
    const ext = p.extends ? pc.dim(` (extends ${p.extends})`) : ''
    process.stdout.write(`  [${i + 1}] ${pc.bold(p.name)}${ext} — ${p.description}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`Select (1-${PROFILES.length}) or q: `)
  const parsed = parseMenuChoice(answer, PROFILES.length)

  if (parsed.type !== 'selection') return

  const selected = PROFILES[parsed.index - 1]
  const plugins = expandProfile(selected.name)

  const config = loadConfig()
  saveConfig({
    ...config,
    plugins: { ...config.plugins, enabled: plugins as string[] },
  })

  process.stdout.write(`Profile "${selected.name}" applied (${plugins.length} plugins).\n`)
  triggerHotReload(ctx)
}

function pluginsDoctor(ctx: SettingsContext): void {
  const config = loadConfig()
  const enabled = config.plugins?.enabled ?? []
  const registry = ctx.pluginRegistry
  const entries = registry ? registry.getPlugins() : []

  const loaded = entries.filter(e => e.status === 'loaded')
  const failed = entries.filter(e => e.status === 'failed')

  process.stdout.write(`\n${pc.bold('Plugin Health')}\n\n`)
  process.stdout.write(`  Enabled: ${enabled.length}\n`)
  process.stdout.write(`  Loaded:  ${loaded.length}\n`)
  process.stdout.write(`  Failed:  ${failed.length}\n`)

  if (failed.length > 0) {
    process.stdout.write(`\n  ${pc.red('Failed plugins:')}\n`)
    for (const f of failed) {
      process.stdout.write(`    ${pc.red(f.manifest.name)}\n`)
    }
  }
  process.stdout.write('\n')
}

// ---------------------------------------------------------------------------
// Shell category
// ---------------------------------------------------------------------------

async function shellMenu(rl: ReadlineInterface): Promise<SettingsResult> {
  let accumulated: SettingsResult = {}

  for (;;) {
    const choice = await promptMenu(rl, 'Shell', SHELL_ITEMS)

    if (choice.type === 'quit') break
    if (choice.type === 'invalid') continue

    switch (choice.index) {
      case 1: {
        const result = await editPrefix(rl)
        accumulated = { ...accumulated, ...result }
        break
      }
      case 2: {
        const result = await editHistorySize(rl)
        accumulated = { ...accumulated, ...result }
        break
      }
      case 3: {
        await aliasesMenu(rl)
        break
      }
    }
  }

  return accumulated
}

async function editPrefix(rl: ReadlineInterface): Promise<SettingsResult> {
  const config = loadConfig()
  const current = config.prefix ?? 'a'
  process.stdout.write(`\nCurrent prefix: ${pc.bold(current)}\n`)

  const answer = await rl.question('New prefix (no spaces): ')
  const trimmed = answer.trim()

  if (!trimmed || /\s/.test(trimmed)) {
    process.stdout.write('Invalid prefix (must be non-empty with no whitespace).\n')
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

  const answer = await rl.question('New history size (minimum 100): ')
  const num = parseInt(answer.trim(), 10)

  if (isNaN(num) || num < 100) {
    process.stdout.write('Invalid value (must be an integer >= 100).\n')
    return {}
  }

  saveConfig({ ...config, history_size: num })
  process.stdout.write(`History size set to: ${pc.bold(String(num))}\n`)
  return { historySize: num }
}

// ---------------------------------------------------------------------------
// Aliases submenu
// ---------------------------------------------------------------------------

async function aliasesMenu(rl: ReadlineInterface): Promise<void> {
  for (;;) {
    const choice = await promptMenu(rl, 'Aliases', ALIASES_ITEMS)

    if (choice.type === 'quit') break
    if (choice.type === 'invalid') continue

    switch (choice.index) {
      case 1:
        aliasesListAll()
        break
      case 2:
        await aliasesAdd(rl)
        break
      case 3:
        await aliasesRemove(rl)
        break
    }
  }
}

function aliasesListAll(): void {
  const config = loadConfig()
  const userAliases = config.user_aliases ?? {}
  const entries = Object.entries(userAliases)

  if (entries.length === 0) {
    process.stdout.write(`\n${pc.dim('No user aliases defined.')}\n`)
    process.stdout.write(`${pc.dim('Note: plugin aliases are read-only.')}\n\n`)
    return
  }

  process.stdout.write(`\n${pc.bold('User Aliases')}\n\n`)
  for (const [name, expansion] of entries) {
    process.stdout.write(`  ${pc.bold(name)} → ${expansion}\n`)
  }
  process.stdout.write(`\n${pc.dim('Note: plugin aliases are read-only.')}\n\n`)
}

async function aliasesAdd(rl: ReadlineInterface): Promise<void> {
  const nameAnswer = await rl.question('Alias name (no spaces): ')
  const name = nameAnswer.trim()
  if (!name || /\s/.test(name)) {
    process.stdout.write('Invalid alias name.\n')
    return
  }

  const expansionAnswer = await rl.question('Expansion: ')
  const expansion = expansionAnswer.trim()
  if (!expansion) {
    process.stdout.write('Expansion cannot be empty.\n')
    return
  }

  const config = loadConfig()
  const current = config.user_aliases ?? {}
  saveConfig({
    ...config,
    user_aliases: { ...current, [name]: expansion },
  })
  process.stdout.write(`Alias "${name}" added.\n`)
}

async function aliasesRemove(rl: ReadlineInterface): Promise<void> {
  const config = loadConfig()
  const userAliases = config.user_aliases ?? {}
  const entries = Object.entries(userAliases)

  if (entries.length === 0) {
    process.stdout.write(`\n${pc.dim('No user aliases to remove.')}\n`)
    return
  }

  process.stdout.write(`\n${pc.bold('Remove Alias')}\n\n`)
  for (let i = 0; i < entries.length; i++) {
    const [name, expansion] = entries[i]
    process.stdout.write(`  [${i + 1}] ${pc.bold(name)} → ${expansion}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`Select (1-${entries.length}) or q: `)
  const parsed = parseMenuChoice(answer, entries.length)

  if (parsed.type !== 'selection') return

  const [nameToRemove] = entries[parsed.index - 1]
  const { [nameToRemove]: _, ...rest } = userAliases
  saveConfig({ ...config, user_aliases: rest })
  process.stdout.write(`Alias "${nameToRemove}" removed.\n`)
}
