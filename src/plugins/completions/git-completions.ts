import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { CompletionGenerator, CompletionSpec } from '../../completions/types.js'
import type { PluginManifest } from '../types.js'

const execFileAsync = promisify(execFile)

const runWithTimeout = async (
  cmd: string,
  args: readonly string[],
  timeoutMs = 1000,
): Promise<readonly string[]> => {
  try {
    const { stdout } = await Promise.race([
      execFileAsync(cmd, [...args]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs),
      ),
    ])
    return stdout
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  } catch {
    return []
  }
}

export const gitBranchGenerator: CompletionGenerator = async () =>
  runWithTimeout('git', ['branch', '--list', "--format=%(refname:short)"])

export const gitRemoteGenerator: CompletionGenerator = async () =>
  runWithTimeout('git', ['remote'])

export const gitTagGenerator: CompletionGenerator = async () =>
  runWithTimeout('git', ['tag', '--list'])

const branchArg = { name: 'branch', generators: [gitBranchGenerator] } as const
const tagArg = { name: 'tag', generators: [gitTagGenerator] } as const
const remoteArg = { name: 'remote', generators: [gitRemoteGenerator] } as const

export const gitSpec: CompletionSpec = {
  name: 'git',
  subcommands: {
    checkout: {
      name: 'checkout',
      args: [branchArg],
      options: [
        { name: '-b', description: 'Create and checkout new branch' },
        { name: '-f', description: 'Force checkout' },
      ],
    },
    branch: {
      name: 'branch',
      args: [branchArg],
      options: [
        { name: ['-d', '-D'], description: 'Delete branch' },
        { name: '-a', description: 'List all branches' },
        { name: '-r', description: 'List remote branches' },
        { name: '-m', description: 'Rename branch' },
      ],
    },
    merge: {
      name: 'merge',
      args: [branchArg],
      options: [
        { name: '--abort', description: 'Abort merge' },
        { name: '--continue', description: 'Continue merge' },
        { name: '--squash', description: 'Squash merge' },
      ],
    },
    rebase: {
      name: 'rebase',
      args: [branchArg],
      options: [
        { name: '--abort', description: 'Abort rebase' },
        { name: '--continue', description: 'Continue rebase' },
        { name: ['-i', '--interactive'], description: 'Interactive rebase' },
        { name: '--onto', description: 'Rebase onto', args: [branchArg] },
      ],
    },
    commit: {
      name: 'commit',
      options: [
        { name: '-m', description: 'Commit message', args: [{ name: 'message' }] },
        { name: '-a', description: 'Stage all modified files' },
        { name: '--amend', description: 'Amend last commit' },
        { name: '--no-edit', description: 'Keep existing commit message' },
        { name: '-v', description: 'Show diff in editor' },
      ],
    },
    push: {
      name: 'push',
      options: [
        { name: '--force', description: 'Force push' },
        { name: '--force-with-lease', description: 'Safe force push' },
        { name: '-u', description: 'Set upstream' },
        { name: '--tags', description: 'Push tags' },
      ],
    },
    pull: {
      name: 'pull',
      options: [
        { name: '--rebase', description: 'Rebase instead of merge' },
        { name: '--ff-only', description: 'Fast-forward only' },
      ],
    },
    fetch: {
      name: 'fetch',
      options: [
        { name: '--all', description: 'Fetch all remotes' },
        { name: '--prune', description: 'Prune stale branches' },
      ],
    },
    stash: {
      name: 'stash',
      subcommands: {
        push: { name: 'push' },
        pop: { name: 'pop' },
        apply: { name: 'apply' },
        list: { name: 'list' },
        drop: { name: 'drop' },
        show: { name: 'show' },
      },
    },
    log: {
      name: 'log',
      options: [
        { name: '--oneline', description: 'One line per commit' },
        { name: '--graph', description: 'Show graph' },
        { name: '--all', description: 'All branches' },
        { name: '--stat', description: 'Show stats' },
        { name: '-n', description: 'Limit commits', args: [{ name: 'count' }] },
      ],
    },
    diff: {
      name: 'diff',
      options: [
        { name: '--staged', description: 'Show staged changes' },
        { name: '--word-diff', description: 'Word-level diff' },
        { name: '--name-only', description: 'Show file names only' },
      ],
    },
    add: {
      name: 'add',
      args: [{ name: 'pathspec', template: 'filepaths' }],
      options: [
        { name: ['-A', '--all'], description: 'Stage all changes' },
        { name: ['-p', '--patch'], description: 'Interactive staging' },
        { name: ['-u', '--update'], description: 'Stage modified and deleted' },
      ],
    },
    reset: {
      name: 'reset',
      args: [branchArg],
      options: [
        { name: '--hard', description: 'Hard reset' },
        { name: '--soft', description: 'Soft reset' },
        { name: '--mixed', description: 'Mixed reset' },
      ],
    },
    tag: {
      name: 'tag',
      args: [tagArg],
      options: [
        { name: '-a', description: 'Annotated tag' },
        { name: '-d', description: 'Delete tag' },
        { name: '-m', description: 'Tag message', args: [{ name: 'message' }] },
      ],
    },
    remote: {
      name: 'remote',
      args: [remoteArg],
      subcommands: {
        add: { name: 'add' },
        remove: { name: 'remove', args: [remoteArg] },
        rename: { name: 'rename', args: [remoteArg] },
        show: { name: 'show', args: [remoteArg] },
      },
    },
    switch: {
      name: 'switch',
      args: [branchArg],
      options: [
        { name: ['-c', '--create'], description: 'Create new branch' },
      ],
    },
    'cherry-pick': {
      name: 'cherry-pick',
      args: [branchArg],
      options: [
        { name: '--abort', description: 'Abort cherry-pick' },
        { name: '--continue', description: 'Continue cherry-pick' },
      ],
    },
    revert: {
      name: 'revert',
      options: [
        { name: '--abort', description: 'Abort revert' },
        { name: '--continue', description: 'Continue revert' },
      ],
    },
    bisect: {
      name: 'bisect',
      subcommands: {
        start: { name: 'start' },
        bad: { name: 'bad' },
        good: { name: 'good' },
        reset: { name: 'reset' },
        skip: { name: 'skip' },
      },
    },
    clean: {
      name: 'clean',
      options: [
        { name: '-f', description: 'Force clean' },
        { name: '-d', description: 'Remove directories' },
        { name: '-n', description: 'Dry run' },
        { name: '-x', description: 'Remove ignored files too' },
      ],
    },
  },
}

export const plugin: PluginManifest = {
  name: 'git-completions',
  version: '1.0.0',
  description: 'Git Tab completions with dynamic branch/remote/tag generators',
  completionSpecs: [gitSpec],
}
