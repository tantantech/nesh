import * as path from 'node:path'
import * as os from 'node:os'
import * as readline from 'node:readline/promises'
import pc from 'picocolors'
import type { CdState } from './types.js'
import type { PluginRegistry } from './plugins/registry.js'
import { TEMPLATES, buildPromptFromTemplate } from './templates.js'
import { abbreviatePath, getGitBranch } from './prompt.js'

export function expandTilde(p: string): string {
  if (p === '~') return os.homedir()
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2))
  return p
}

export function executeCd(
  args: string,
  state: CdState
): { readonly newState: CdState; readonly error?: string; readonly output?: string } {
  const currentDir = process.cwd()
  let targetDir: string

  if (!args || args === '') {
    targetDir = os.homedir()
  } else if (args === '-') {
    if (!state.previousDir) {
      return { newState: state, error: 'cd: OLDPWD not set' }
    }
    targetDir = state.previousDir
  } else {
    targetDir = path.resolve(expandTilde(args))
  }

  try {
    process.chdir(targetDir)
    return {
      newState: { ...state, previousDir: currentDir },
      output: args === '-' ? targetDir : undefined,
    }
  } catch {
    return {
      newState: state,
      error: `cd: no such file or directory: ${args}`,
    }
  }
}

export function executeExport(args: string): string | undefined {
  const eqIndex = args.indexOf('=')
  if (eqIndex === -1) {
    return `export: invalid format: ${args} (expected KEY=VALUE)`
  }
  const key = args.slice(0, eqIndex)
  const value = args.slice(eqIndex + 1)
  process.env[key] = value
  return undefined
}

export async function executeTheme(rl: readline.Interface): Promise<string | undefined> {
  const cwd = process.cwd()
  const homedir = os.homedir()

  process.stdout.write('\nAvailable themes:\n\n')

  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i]
    const nerdNote = t.requiresNerdFont ? ' (requires Nerd Font)' : ''
    const preview = buildPromptFromTemplate(t, cwd, homedir)
    process.stdout.write(`  [${i + 1}] ${t.label} \u2014 ${t.description}${nerdNote}\n`)
    process.stdout.write(`      Preview: ${preview}\n\n`)
  }

  const answer = await rl.question(`Select theme (1-${TEMPLATES.length}): `)
  const num = parseInt(answer.trim(), 10)

  if (isNaN(num) || num < 1 || num > TEMPLATES.length) {
    process.stdout.write('Selection cancelled.\n')
    return undefined
  }

  return TEMPLATES[num - 1].name
}

export function executeAliases(registry: PluginRegistry): void {
  const allAliases = registry.getAll()
  if (allAliases.size === 0) {
    process.stdout.write('No aliases configured.\n')
    return
  }

  // Group by source
  const grouped = new Map<string, Array<{ alias: string; expansion: string }>>()
  for (const [alias, entry] of allAliases) {
    const list = grouped.get(entry.source) ?? []
    list.push({ alias, expansion: entry.expansion })
    grouped.set(entry.source, [...list])
  }

  // Print user aliases first, then plugins alphabetically
  const userAliases = grouped.get('user')
  if (userAliases) {
    process.stdout.write(`\n${pc.bold('User aliases')}\n`)
    for (const { alias, expansion } of userAliases.sort((a, b) => a.alias.localeCompare(b.alias))) {
      process.stdout.write(`  ${alias} ${pc.dim('->')} ${expansion}\n`)
    }
    grouped.delete('user')
  }

  const sortedPlugins = [...grouped.keys()].sort()
  for (const pluginName of sortedPlugins) {
    const aliases = grouped.get(pluginName)!
    process.stdout.write(`\n${pc.dim(`[${pluginName}]`)} ${pc.bold(pluginName)}\n`)
    for (const { alias, expansion } of aliases.sort((a, b) => a.alias.localeCompare(b.alias))) {
      process.stdout.write(`  ${alias} ${pc.dim('->')} ${expansion}\n`)
    }
  }
  process.stdout.write('\n')
}
