/**
 * Command validity cache for syntax highlighting.
 *
 * Populates a known-command set via `compgen -c` (bash built-in that lists
 * all available commands). Supports non-blocking refresh when cache is stale
 * and merging plugin aliases into the known set.
 */

import { spawn } from 'node:child_process'

const REFRESH_INTERVAL_MS = 60_000

let knownCommands: Set<string> = new Set()
let lastRefresh = 0
let refreshInFlight = false

/**
 * Refresh the command cache by spawning `bash -c 'compgen -c'`.
 * Resolves silently on error (never rejects).
 */
export async function refreshCommandCache(): Promise<void> {
  if (refreshInFlight) return
  refreshInFlight = true

  try {
    const output = await new Promise<string>((resolve) => {
      const child = spawn('bash', ['-c', 'compgen -c'], {
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 5000,
      })

      let stdout = ''
      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString()
      })

      child.on('close', () => {
        resolve(stdout)
      })

      child.on('error', () => {
        resolve('')
      })
    })

    if (output.length > 0) {
      const names = output.split('\n').filter((n) => n.length > 0)
      // Build new set preserving any previously added aliases
      const fresh = new Set(names)
      for (const cmd of knownCommands) {
        fresh.add(cmd)
      }
      knownCommands = fresh
      lastRefresh = Date.now()
    }
  } finally {
    refreshInFlight = false
  }
}

/**
 * Check if a command name is known (exists in PATH or was added).
 * Triggers a non-blocking background refresh when cache is stale (>60s).
 */
export function isKnownCommand(name: string): boolean {
  if (Date.now() - lastRefresh > REFRESH_INTERVAL_MS) {
    // Fire-and-forget refresh
    void refreshCommandCache()
  }
  return knownCommands.has(name)
}

/**
 * Merge additional command names into the known set.
 * Used to register plugin aliases as valid commands.
 */
export function addKnownCommands(names: Iterable<string>): void {
  const updated = new Set(knownCommands)
  for (const name of names) {
    updated.add(name)
  }
  knownCommands = updated
}
