/**
 * Auto-suggestions facade.
 *
 * Wires together history-search, renderer, and keypress handler
 * into a single setup call. Returns a cleanup function for shell exit.
 */

import type { Interface as ReadlineInterface } from 'node:readline'
import type { NeshConfig } from '../config.js'
import { buildSensitiveFilters } from './history-search.js'
import { createKeypressHandler } from './keypress.js'

const DEFAULT_DEBOUNCE_MS = 50

/**
 * Set up auto-suggestions on the given readline interface.
 *
 * @param rl - The readline interface to attach suggestions to
 * @param config - Nesh configuration (checks suggestions.enabled)
 * @returns Cleanup function that removes the keypress listener
 */
export function setupAutoSuggestions(
  rl: ReadlineInterface,
  config: NeshConfig
): () => void {
  // Disabled by config (per D-22/D-23)
  if (config.suggestions?.enabled === false) {
    return () => {}
  }

  // Suggestions only work in TTY mode
  if (!process.stdout.isTTY) {
    return () => {}
  }

  // Access history array (per D-16 -- established pattern from shell.ts)
  const history = (rl as unknown as { history: string[] }).history

  // Build sensitive filters (per D-18)
  const filters = buildSensitiveFilters(
    config.suggestions?.sensitive_patterns ?? []
  )

  // Get debounce setting (per D-07/D-21)
  const debounceMs = config.suggestions?.debounce_ms ?? DEFAULT_DEBOUNCE_MS

  // Create and attach keypress handler
  const handler = createKeypressHandler(rl, history, filters, debounceMs)
  process.stdin.on('keypress', handler)

  // Return cleanup function (per D-27)
  return () => {
    process.stdin.removeListener('keypress', handler)
  }
}
