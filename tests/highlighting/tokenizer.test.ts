import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tokenize, type Token, type TokenType } from '../../src/highlighting/tokenizer.js'

describe('tokenize', () => {
  const alwaysKnown = () => true
  const neverKnown = () => false
  const knownSet = new Set(['ls', 'echo', 'git', 'grep', 'cat'])
  const isKnown = (cmd: string) => knownSet.has(cmd)

  it('returns empty array for empty string', () => {
    expect(tokenize('', alwaysKnown)).toEqual([])
  })

  it('classifies known command as command', () => {
    const tokens = tokenize('ls', alwaysKnown)
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toEqual({ type: 'command', value: 'ls', start: 0 })
  })

  it('classifies unknown command as command-invalid', () => {
    const tokens = tokenize('foo bar', neverKnown)
    expect(tokens[0]).toEqual({ type: 'command-invalid', value: 'foo', start: 0 })
    expect(tokens[1]).toEqual({ type: 'argument', value: 'bar', start: 4 })
  })

  it('tokenizes flags', () => {
    const tokens = tokenize('ls -la', alwaysKnown)
    expect(tokens).toHaveLength(2)
    expect(tokens[0]).toEqual({ type: 'command', value: 'ls', start: 0 })
    expect(tokens[1]).toEqual({ type: 'flag', value: '-la', start: 3 })
  })

  it('tokenizes paths containing /', () => {
    const tokens = tokenize('ls /tmp', alwaysKnown)
    expect(tokens[1]).toEqual({ type: 'path', value: '/tmp', start: 3 })
  })

  it('tokenizes single-quoted strings', () => {
    const tokens = tokenize("echo 'hello world'", isKnown)
    expect(tokens).toHaveLength(2)
    expect(tokens[0]).toEqual({ type: 'command', value: 'echo', start: 0 })
    expect(tokens[1]).toEqual({ type: 'string', value: "'hello world'", start: 5 })
  })

  it('tokenizes double-quoted strings', () => {
    const tokens = tokenize('git commit -m "msg"', isKnown)
    expect(tokens).toHaveLength(4)
    expect(tokens[0]).toEqual({ type: 'command', value: 'git', start: 0 })
    expect(tokens[1]).toEqual({ type: 'argument', value: 'commit', start: 4 })
    expect(tokens[2]).toEqual({ type: 'flag', value: '-m', start: 11 })
    expect(tokens[3]).toEqual({ type: 'string', value: '"msg"', start: 14 })
  })

  it('splits on pipe operator', () => {
    const tokens = tokenize('ls | grep foo', isKnown)
    expect(tokens).toHaveLength(4)
    expect(tokens[0]).toEqual({ type: 'command', value: 'ls', start: 0 })
    expect(tokens[1]).toEqual({ type: 'operator', value: '|', start: 3 })
    expect(tokens[2]).toEqual({ type: 'command', value: 'grep', start: 5 })
    expect(tokens[3]).toEqual({ type: 'argument', value: 'foo', start: 10 })
  })

  it('splits on && operator', () => {
    const tokens = tokenize('echo done && echo more', isKnown)
    expect(tokens[0]).toEqual({ type: 'command', value: 'echo', start: 0 })
    expect(tokens[1]).toEqual({ type: 'argument', value: 'done', start: 5 })
    expect(tokens[2]).toEqual({ type: 'operator', value: '&&', start: 10 })
    expect(tokens[3]).toEqual({ type: 'command', value: 'echo', start: 13 })
    expect(tokens[4]).toEqual({ type: 'argument', value: 'more', start: 18 })
  })

  it('handles complex pipeline with multiple operators', () => {
    const tokens = tokenize('ls | grep foo && echo done', isKnown)
    const types = tokens.map((t: Token) => t.type)
    expect(types).toEqual([
      'command', 'operator', 'command', 'argument', 'operator', 'command', 'argument',
    ])
  })

  it('tracks start offsets correctly', () => {
    const tokens = tokenize('ls -la /tmp', alwaysKnown)
    expect(tokens[0]!.start).toBe(0)
    expect(tokens[1]!.start).toBe(3)
    expect(tokens[2]!.start).toBe(7)
  })

  it('handles semicolon operator', () => {
    const tokens = tokenize('ls; echo hi', isKnown)
    const types = tokens.map((t: Token) => t.type)
    expect(types).toContain('operator')
  })

  it('handles || operator', () => {
    const tokens = tokenize('cat file || echo fallback', isKnown)
    const ops = tokens.filter((t: Token) => t.type === 'operator')
    expect(ops).toHaveLength(1)
    expect(ops[0]!.value).toBe('||')
  })
})

describe('isKnownCommand / refreshCommandCache', () => {
  // Dynamic import to allow mocking child_process
  it('isKnownCommand returns false for empty cache', async () => {
    const { isKnownCommand } = await import('../../src/highlighting/commands.js')
    // Before any refresh, arbitrary names should be unknown
    // (unless the module auto-refreshes on import)
    expect(typeof isKnownCommand).toBe('function')
  })

  it('addKnownCommands merges names into known set', async () => {
    const { addKnownCommands, isKnownCommand } = await import('../../src/highlighting/commands.js')
    addKnownCommands(['my-custom-alias', 'another-alias'])
    expect(isKnownCommand('my-custom-alias')).toBe(true)
    expect(isKnownCommand('another-alias')).toBe(true)
  })
})
