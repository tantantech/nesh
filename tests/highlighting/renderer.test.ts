import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { colorize, renderHighlighted, clearHighlighting } from '../../src/highlighting/renderer.js'
import type { Token } from '../../src/highlighting/tokenizer.js'

describe('colorize', () => {
  it('applies green to valid command tokens', () => {
    const tokens: readonly Token[] = [
      { type: 'command', value: 'ls', start: 0 },
    ]
    const result = colorize(tokens)
    // picocolors green wraps with ANSI codes
    expect(result).toContain('ls')
    expect(result).toContain('\x1b[') // has ANSI escape
  })

  it('applies red to invalid command tokens', () => {
    const tokens: readonly Token[] = [
      { type: 'command-invalid', value: 'foo', start: 0 },
    ]
    const result = colorize(tokens)
    expect(result).toContain('foo')
    expect(result).toContain('\x1b[')
  })

  it('applies cyan to flag tokens', () => {
    const tokens: readonly Token[] = [
      { type: 'flag', value: '-la', start: 3 },
    ]
    const result = colorize(tokens)
    expect(result).toContain('-la')
    expect(result).toContain('\x1b[')
  })

  it('applies yellow to string tokens', () => {
    const tokens: readonly Token[] = [
      { type: 'string', value: "'hello'", start: 5 },
    ]
    const result = colorize(tokens)
    expect(result).toContain("'hello'")
    expect(result).toContain('\x1b[')
  })

  it('applies blue to path tokens', () => {
    const tokens: readonly Token[] = [
      { type: 'path', value: '/tmp', start: 3 },
    ]
    const result = colorize(tokens)
    expect(result).toContain('/tmp')
    expect(result).toContain('\x1b[')
  })

  it('applies magenta to operator tokens', () => {
    const tokens: readonly Token[] = [
      { type: 'operator', value: '|', start: 3 },
    ]
    const result = colorize(tokens)
    expect(result).toContain('|')
    expect(result).toContain('\x1b[')
  })

  it('leaves argument tokens uncolored (default)', () => {
    const tokens: readonly Token[] = [
      { type: 'argument', value: 'bar', start: 4 },
    ]
    const result = colorize(tokens)
    expect(result).toContain('bar')
  })

  it('colorizes multiple tokens preserving spacing', () => {
    const tokens: readonly Token[] = [
      { type: 'command', value: 'ls', start: 0 },
      { type: 'flag', value: '-la', start: 3 },
      { type: 'path', value: '/tmp', start: 7 },
    ]
    const result = colorize(tokens)
    expect(result).toContain('ls')
    expect(result).toContain('-la')
    expect(result).toContain('/tmp')
  })

  it('returns empty string for empty token array', () => {
    const result = colorize([])
    expect(result).toBe('')
  })
})

describe('renderHighlighted', () => {
  const originalIsTTY = process.stdout.isTTY

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, writable: true })
  })

  it('is a no-op when stdout is not TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: false, writable: true })
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    renderHighlighted({ line: 'ls -la', cursor: 6 }, () => true)

    // Should not have written any ANSI output
    expect(writeSpy).not.toHaveBeenCalled()
    writeSpy.mockRestore()
  })

  it('writes colored output when stdout is TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true })
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    renderHighlighted({ line: 'ls', cursor: 2 }, () => true)

    expect(writeSpy).toHaveBeenCalled()
    writeSpy.mockRestore()
  })
})

describe('clearHighlighting', () => {
  it('writes erase sequence', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    clearHighlighting()

    expect(writeSpy).toHaveBeenCalledWith('\x1b[K')
    writeSpy.mockRestore()
  })
})
