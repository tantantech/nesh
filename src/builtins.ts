import * as path from 'node:path'
import * as os from 'node:os'
import * as readline from 'node:readline/promises'
import type { CdState } from './types.js'
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
