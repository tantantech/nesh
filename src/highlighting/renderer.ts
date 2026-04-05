/**
 * Syntax highlighting renderer for shell input.
 *
 * Produces ANSI-colored output that overwrites the visible readline line
 * without modifying rl.line. Uses raw ANSI escape codes (always-on, since
 * this only runs in TTY mode) and enforces a 16ms frame budget with
 * plain-text fallback.
 *
 * Color scheme:
 *   command       -> green
 *   command-invalid -> red
 *   flag          -> cyan
 *   string        -> yellow
 *   path          -> blue
 *   operator      -> magenta
 *   argument      -> default (no color)
 */

import { moveCursor } from 'node:readline'
import { tokenize, type Token, type TokenType } from './tokenizer.js'

const FRAME_BUDGET_MS = 16

const ANSI_RE = /\x1b\[[^m]*m/g

const RESET = '\x1b[0m'

/** Raw ANSI color codes -- always active (renderer only runs in TTY mode). */
const COLOR_MAP: Record<TokenType, string> = {
  'command': '\x1b[32m',       // green
  'command-invalid': '\x1b[31m', // red
  'flag': '\x1b[36m',          // cyan
  'string': '\x1b[33m',        // yellow
  'path': '\x1b[34m',          // blue
  'operator': '\x1b[35m',      // magenta
  'argument': '',               // no color
}

/** Strip ANSI escape codes to get visible character length. */
function visibleLength(s: string): number {
  return s.replace(ANSI_RE, '').length
}

/** Wrap a string with ANSI color for the given token type. */
function colorForToken(type: TokenType, value: string): string {
  const code = COLOR_MAP[type]
  if (code === '') return value
  return `${code}${value}${RESET}`
}

/**
 * Colorize an array of tokens into an ANSI-colored string.
 * Reconstructs spacing from token start offsets.
 */
export function colorize(tokens: readonly Token[]): string {
  if (tokens.length === 0) return ''

  let result = ''
  let pos = 0

  for (const token of tokens) {
    // Add whitespace gap between previous position and this token's start
    if (token.start > pos) {
      result += ' '.repeat(token.start - pos)
    }
    result += colorForToken(token.type, token.value)
    pos = token.start + token.value.length
  }

  return result
}

/**
 * Render syntax-highlighted version of the current readline line.
 *
 * Moves cursor back to start of typed content, writes colored version,
 * then restores cursor to original position. No-op when stdout is not TTY.
 * Falls back to plain text if rendering exceeds 16ms frame budget.
 */
export function renderHighlighted(
  rl: { readonly line: string; readonly cursor: number },
  isKnown: (cmd: string) => boolean,
): void {
  if (!process.stdout.isTTY) return

  const start = performance.now()

  const tokens = tokenize(rl.line, isKnown)
  if (tokens.length === 0) return

  const colored = colorize(tokens)

  // Check frame budget
  if (performance.now() - start > FRAME_BUDGET_MS) return

  // Move cursor back to start of typed content
  moveCursor(process.stdout, -rl.cursor, 0)

  // Write colored line and clear remainder
  process.stdout.write(colored + '\x1b[K')

  // Restore cursor position: move back from end of colored output to cursor pos
  const coloredVisible = visibleLength(colored)
  const moveBack = coloredVisible - rl.cursor
  if (moveBack !== 0) {
    moveCursor(process.stdout, -moveBack, 0)
  }
}

/**
 * Clear any syntax highlighting artifacts.
 * Writes erase-to-end-of-line escape sequence.
 */
export function clearHighlighting(): void {
  process.stdout.write('\x1b[K')
}
