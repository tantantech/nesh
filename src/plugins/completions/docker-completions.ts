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

export const dockerContainerGenerator: CompletionGenerator = async () =>
  runWithTimeout('docker', ['ps', '-a', '--format', '{{.Names}}'])

export const dockerImageGenerator: CompletionGenerator = async () =>
  runWithTimeout('docker', ['images', '--format', '{{.Repository}}:{{.Tag}}'])

const containerArg = { name: 'container', generators: [dockerContainerGenerator] } as const
const imageArg = { name: 'image', generators: [dockerImageGenerator] } as const

const dockerSpec: CompletionSpec = {
  name: 'docker',
  subcommands: {
    run: {
      name: 'run',
      args: [imageArg],
      options: [
        { name: '-d', description: 'Detached mode' },
        { name: '-p', description: 'Port mapping', args: [{ name: 'port' }] },
        { name: '-v', description: 'Volume mount', args: [{ name: 'volume' }] },
        { name: '--name', description: 'Container name', args: [{ name: 'name' }] },
        { name: '-e', description: 'Environment variable', args: [{ name: 'var' }] },
        { name: '--rm', description: 'Remove on exit' },
        { name: '-it', description: 'Interactive TTY' },
      ],
    },
    build: {
      name: 'build',
      args: [{ name: 'path', template: 'filepaths' }],
      options: [
        { name: '-t', description: 'Tag', args: [{ name: 'tag' }] },
        { name: '-f', description: 'Dockerfile', args: [{ name: 'file', template: 'filepaths' }] },
        { name: '--no-cache', description: 'No cache' },
      ],
    },
    ps: {
      name: 'ps',
      options: [
        { name: '-a', description: 'Show all containers' },
        { name: '-q', description: 'Only show IDs' },
      ],
    },
    images: {
      name: 'images',
      options: [
        { name: '-a', description: 'Show all images' },
        { name: '-q', description: 'Only show IDs' },
      ],
    },
    pull: { name: 'pull', args: [imageArg] },
    push: { name: 'push', args: [imageArg] },
    exec: {
      name: 'exec',
      args: [containerArg],
      options: [
        { name: '-it', description: 'Interactive TTY' },
      ],
    },
    logs: {
      name: 'logs',
      args: [containerArg],
      options: [
        { name: '-f', description: 'Follow logs' },
        { name: '--tail', description: 'Number of lines', args: [{ name: 'lines' }] },
      ],
    },
    stop: { name: 'stop', args: [containerArg] },
    start: { name: 'start', args: [containerArg] },
    rm: {
      name: 'rm',
      args: [containerArg],
      options: [{ name: '-f', description: 'Force remove' }],
    },
    rmi: {
      name: 'rmi',
      args: [imageArg],
      options: [{ name: '-f', description: 'Force remove' }],
    },
    compose: {
      name: 'compose',
      subcommands: {
        up: {
          name: 'up',
          options: [
            { name: '-d', description: 'Detached mode' },
            { name: '--build', description: 'Build images' },
          ],
        },
        down: {
          name: 'down',
          options: [{ name: '-v', description: 'Remove volumes' }],
        },
        build: { name: 'build' },
        ps: { name: 'ps' },
        logs: {
          name: 'logs',
          options: [{ name: '-f', description: 'Follow logs' }],
        },
        exec: { name: 'exec' },
      },
    },
  },
}

export const plugin: PluginManifest = {
  name: 'docker-completions',
  version: '1.0.0',
  description: 'Docker Tab completions with container/image generators',
  completionSpecs: [dockerSpec],
}
