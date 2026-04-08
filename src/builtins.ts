import * as path from 'node:path'
import * as os from 'node:os'
import type { CdState } from './types.js'

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

// ThemeResult is kept as a type export since wizard.ts extends it
export interface ThemeResult {
  readonly templateName?: string
  readonly colorScheme?: string
  readonly segments?: readonly string[]
  readonly iconMode?: 'nerd-font' | 'unicode' | 'ascii'
  readonly separatorStyle?: string
  readonly headStyle?: string
  readonly height?: string
  readonly spacing?: string
  readonly iconDensity?: string
  readonly flow?: string
  readonly transient?: boolean
  readonly timeFormat?: string
}
