/**
 * Keypress handler for auto-suggestions.
 *
 * Listens to stdin keypress events, debounces suggestion lookups,
 * renders ghost text via the renderer, and handles right-arrow acceptance.
 * Never modifies rl.line directly -- all visual output goes through renderer.
 */

import type { Interface as ReadlineInterface, Key } from 'node:readline'
import { clearGhost, renderGhost } from './renderer.js'
import { findSuggestion } from './history-search.js'

/**
 * Create a keypress handler that provides auto-suggestions.
 *
 * @param rl - The readline interface (rl.line and rl.cursor are read)
 * @param history - History array (newest-first, from readline)
 * @param filters - Sensitive pattern filters to skip
 * @param debounceMs - Debounce delay in milliseconds
 * @returns The keypress handler function for attaching to process.stdin
 */
export function createKeypressHandler(
  rl: ReadlineInterface,
  history: readonly string[],
  filters: readonly RegExp[],
  debounceMs: number
): (str: string, key: Key) => void {
  let activeSuggestion: string | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  function clearDebounce(): void {
    if (debounceTimer !== undefined) {
      clearTimeout(debounceTimer)
      debounceTimer = undefined
    }
  }

  function handler(_str: string, key: Key): void {
    if (!key) return

    // Always clear ghost text first (per research Pitfall 1)
    clearGhost()

    // Right-arrow acceptance (per D-08)
    if (key.name === 'right' && activeSuggestion !== null && rl.cursor === rl.line.length) {
      rl.write(activeSuggestion)
      activeSuggestion = null
      return
    }

    // Escape or Ctrl+C: clear suggestion (per D-11)
    if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
      activeSuggestion = null
      clearDebounce()
      return
    }

    // Tab: clear suggestion, no new scheduling (per research Open Question 2)
    if (key.name === 'tab') {
      activeSuggestion = null
      clearDebounce()
      return
    }

    // Enter/Return: clear suggestion
    if (key.name === 'return') {
      activeSuggestion = null
      clearDebounce()
      return
    }

    // Default: schedule debounced suggestion update
    clearDebounce()
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined
      const currentLine = rl.line

      const match = findSuggestion(currentLine, history, filters)
      if (match !== null) {
        const suffix = match.slice(currentLine.length)
        renderGhost(suffix)
        activeSuggestion = suffix
      } else {
        activeSuggestion = null
      }
    }, debounceMs)
  }

  return handler
}
