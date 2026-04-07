import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CompletionGenerator, CompletionSpec } from '../../completions/types.js'
import type { PluginManifest } from '../types.js'

export const npmScriptGenerator: CompletionGenerator = async (context) => {
  try {
    const pkgPath = join(context.cwd, 'package.json')
    const raw = await readFile(pkgPath, 'utf-8')
    const pkg = JSON.parse(raw) as { scripts?: Record<string, string> }
    return Object.keys(pkg.scripts ?? {})
  } catch {
    return []
  }
}

const scriptArg = { name: 'script', generators: [npmScriptGenerator] } as const

const npmSpec: CompletionSpec = {
  name: 'npm',
  subcommands: {
    install: {
      name: 'install',
      args: [{ name: 'package' }],
      options: [
        { name: ['-D', '--save-dev'], description: 'Save as devDependency' },
        { name: ['-g', '--global'], description: 'Install globally' },
        { name: '--save-exact', description: 'Save exact version' },
      ],
    },
    run: { name: 'run', args: [scriptArg] },
    test: { name: 'test' },
    start: { name: 'start' },
    init: {
      name: 'init',
      options: [{ name: '-y', description: 'Accept defaults' }],
    },
    publish: {
      name: 'publish',
      options: [
        { name: '--access', description: 'Access level', args: [{ name: 'level' }] },
        { name: '--tag', description: 'Dist tag', args: [{ name: 'tag' }] },
      ],
    },
    uninstall: { name: 'uninstall', args: [{ name: 'package' }] },
    ls: { name: 'ls', options: [{ name: '--depth', description: 'Depth', args: [{ name: 'n' }] }] },
    outdated: { name: 'outdated' },
    update: { name: 'update' },
    ci: { name: 'ci' },
    exec: { name: 'exec' },
  },
}

const yarnSpec: CompletionSpec = {
  name: 'yarn',
  subcommands: {
    add: {
      name: 'add',
      args: [{ name: 'package' }],
      options: [
        { name: ['-D', '--dev'], description: 'Add as devDependency' },
        { name: '--exact', description: 'Exact version' },
      ],
    },
    remove: { name: 'remove', args: [{ name: 'package' }] },
    run: { name: 'run', args: [scriptArg] },
    build: { name: 'build' },
    test: { name: 'test' },
    install: { name: 'install', options: [{ name: '--frozen-lockfile', description: 'Frozen lockfile' }] },
    upgrade: { name: 'upgrade' },
    why: { name: 'why', args: [{ name: 'package' }] },
  },
}

const pnpmSpec: CompletionSpec = {
  name: 'pnpm',
  subcommands: {
    install: { name: 'install', options: [{ name: '--frozen-lockfile', description: 'Frozen lockfile' }] },
    add: {
      name: 'add',
      args: [{ name: 'package' }],
      options: [
        { name: ['-D', '--save-dev'], description: 'Save as devDependency' },
        { name: ['-g', '--global'], description: 'Install globally' },
      ],
    },
    remove: { name: 'remove', args: [{ name: 'package' }] },
    run: { name: 'run', args: [scriptArg] },
    build: { name: 'build' },
    test: { name: 'test' },
    exec: { name: 'exec' },
    dlx: { name: 'dlx' },
  },
}

export const plugin: PluginManifest = {
  name: 'npm-completions',
  version: '1.0.0',
  description: 'npm/yarn/pnpm Tab completions with package.json script generator',
  completionSpecs: [npmSpec, yarnSpec, pnpmSpec],
}
