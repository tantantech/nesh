import type { CompletionSpec } from '../../completions/types.js'
import type { PluginManifest } from '../types.js'

const cargoSpec: CompletionSpec = {
  name: 'cargo',
  subcommands: {
    build: {
      name: 'build',
      options: [
        { name: '--release', description: 'Release mode' },
        { name: '--target', description: 'Target triple', args: [{ name: 'target' }] },
        { name: ['-p', '--package'], description: 'Package', args: [{ name: 'package' }] },
      ],
    },
    run: {
      name: 'run',
      options: [
        { name: '--release', description: 'Release mode' },
        { name: '--example', description: 'Run example', args: [{ name: 'name' }] },
      ],
    },
    test: {
      name: 'test',
      options: [
        { name: '--release', description: 'Release mode' },
        { name: '--lib', description: 'Test library' },
        { name: '--doc', description: 'Test docs' },
        { name: '--no-run', description: 'Compile only' },
      ],
    },
    bench: { name: 'bench' },
    doc: {
      name: 'doc',
      options: [
        { name: '--open', description: 'Open in browser' },
        { name: '--no-deps', description: 'Skip dependencies' },
      ],
    },
    clean: { name: 'clean' },
    check: {
      name: 'check',
      options: [
        { name: '--all-targets', description: 'Check all targets' },
      ],
    },
    clippy: { name: 'clippy' },
    fmt: { name: 'fmt', options: [{ name: '--check', description: 'Check only' }] },
    add: { name: 'add', args: [{ name: 'crate' }] },
    remove: { name: 'remove', args: [{ name: 'crate' }] },
    init: { name: 'init' },
    new: { name: 'new', args: [{ name: 'name' }] },
    publish: { name: 'publish' },
  },
}

const pipSpec: CompletionSpec = {
  name: 'pip',
  subcommands: {
    install: {
      name: 'install',
      args: [{ name: 'package' }],
      options: [
        { name: '-r', description: 'Requirements file', args: [{ name: 'file', template: 'filepaths' }] },
        { name: '--upgrade', description: 'Upgrade package' },
        { name: '-e', description: 'Editable install', args: [{ name: 'path', template: 'filepaths' }] },
      ],
    },
    uninstall: { name: 'uninstall', args: [{ name: 'package' }] },
    freeze: { name: 'freeze' },
    list: {
      name: 'list',
      options: [
        { name: '--outdated', description: 'Show outdated' },
      ],
    },
    show: { name: 'show', args: [{ name: 'package' }] },
  },
}

const COMMON_MODULES = [
  'venv', 'http.server', 'json.tool', 'pip',
  'pytest', 'unittest', 'pdb', 'cProfile',
  'timeit', 'ensurepip', 'zipfile', 'compileall',
] as const

const pythonSpec: CompletionSpec = {
  name: 'python',
  options: [
    {
      name: '-m',
      description: 'Run module',
      args: [{ name: 'module', generators: [async () => [...COMMON_MODULES]] }],
    },
    { name: '-c', description: 'Run command', args: [{ name: 'command' }] },
    { name: '-u', description: 'Unbuffered output' },
    { name: '-i', description: 'Interactive mode' },
    { name: '-V', description: 'Show version' },
  ],
  args: [{ name: 'script', template: 'filepaths' }],
}

const nodeSpec: CompletionSpec = {
  name: 'node',
  options: [
    { name: '-e', description: 'Evaluate script', args: [{ name: 'script' }] },
    { name: '--inspect', description: 'Enable inspector' },
    { name: '--inspect-brk', description: 'Inspect with break' },
    { name: '-p', description: 'Print expression', args: [{ name: 'expr' }] },
    { name: '--loader', description: 'Module loader', args: [{ name: 'loader' }] },
    { name: '-v', description: 'Show version' },
  ],
  args: [{ name: 'script', template: 'filepaths' }],
}

const makeSpec: CompletionSpec = {
  name: 'make',
  args: [{ name: 'target', template: 'filepaths' }],
  options: [
    { name: '-f', description: 'Makefile', args: [{ name: 'file', template: 'filepaths' }] },
    { name: '-j', description: 'Parallel jobs', args: [{ name: 'jobs' }] },
    { name: '-C', description: 'Change directory', args: [{ name: 'dir', template: 'folders' }] },
    { name: '-n', description: 'Dry run' },
    { name: '-B', description: 'Unconditionally make' },
  ],
}

export const plugin: PluginManifest = {
  name: 'devtools-completions',
  version: '1.0.0',
  description: 'Cargo/pip/python/node/make Tab completions',
  completionSpecs: [cargoSpec, pipSpec, pythonSpec, nodeSpec, makeSpec],
}
