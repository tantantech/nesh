/**
 * Shell input tokenizer for syntax highlighting.
 *
 * Pure function that splits a shell command line into typed tokens
 * (command, flag, string, path, operator, argument) with start offsets.
 * No side effects, no I/O.
 */

export type TokenType =
  | 'command'
  | 'command-invalid'
  | 'flag'
  | 'string'
  | 'path'
  | 'operator'
  | 'argument'

export interface Token {
  readonly type: TokenType
  readonly value: string
  readonly start: number
}

const OPERATOR_RE = /(\|{1,2}|&&|;)/

/**
 * Tokenize a shell input line into typed tokens.
 *
 * Splits on shell operators (|, ||, &&, ;), then classifies each word
 * within a segment: first word is command (valid/invalid via callback),
 * remaining words classified by prefix/content.
 */
export function tokenize(
  line: string,
  isKnown: (cmd: string) => boolean,
): readonly Token[] {
  if (line.length === 0) return []

  const tokens: Token[] = []
  // Split line into segments separated by operators, keeping operators
  const parts = line.split(OPERATOR_RE)

  let offset = 0

  for (const part of parts) {
    // Check if this part is an operator
    if (OPERATOR_RE.test(part) && (part === '|' || part === '||' || part === '&&' || part === ';')) {
      // Find actual position in original line
      const actualStart = line.indexOf(part, offset)
      tokens.push({ type: 'operator', value: part, start: actualStart })
      offset = actualStart + part.length
      continue
    }

    // Parse segment words
    const segmentTokens = tokenizeSegment(part, isKnown, offset)
    for (const token of segmentTokens) {
      tokens.push(token)
    }
    offset += part.length
  }

  return tokens
}

function tokenizeSegment(
  segment: string,
  isKnown: (cmd: string) => boolean,
  baseOffset: number,
): readonly Token[] {
  const tokens: Token[] = []
  let pos = 0
  let isFirstWord = true

  while (pos < segment.length) {
    // Skip whitespace
    if (segment[pos] === ' ' || segment[pos] === '\t') {
      pos++
      continue
    }

    // Check for quoted string
    if (segment[pos] === "'" || segment[pos] === '"') {
      const quote = segment[pos]!
      let end = pos + 1
      while (end < segment.length && segment[end] !== quote) {
        end++
      }
      if (end < segment.length) end++ // include closing quote
      const value = segment.slice(pos, end)

      if (isFirstWord) {
        // Quoted first word is still a command
        const type = isKnown(value) ? 'command' : 'command-invalid'
        tokens.push({ type, value, start: baseOffset + pos })
        isFirstWord = false
      } else {
        tokens.push({ type: 'string', value, start: baseOffset + pos })
      }
      pos = end
      continue
    }

    // Read a word (until whitespace or end)
    let end = pos
    while (end < segment.length && segment[end] !== ' ' && segment[end] !== '\t') {
      end++
    }
    const value = segment.slice(pos, end)

    if (isFirstWord) {
      const type = isKnown(value) ? 'command' : 'command-invalid'
      tokens.push({ type, value, start: baseOffset + pos })
      isFirstWord = false
    } else if (value.startsWith('-')) {
      tokens.push({ type: 'flag', value, start: baseOffset + pos })
    } else if (value.includes('/')) {
      tokens.push({ type: 'path', value, start: baseOffset + pos })
    } else if (value.startsWith("'") || value.startsWith('"')) {
      tokens.push({ type: 'string', value, start: baseOffset + pos })
    } else {
      tokens.push({ type: 'argument', value, start: baseOffset + pos })
    }

    pos = end
  }

  return tokens
}
