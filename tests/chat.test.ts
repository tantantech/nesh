import { describe, it, expect } from 'vitest'
import { parseSlashCommand } from '../src/chat.js'

describe('parseSlashCommand', () => {
  it('parses /exit as exit command', () => {
    expect(parseSlashCommand('/exit')).toEqual({ type: 'exit' })
  })

  it('parses /shell as exit command', () => {
    expect(parseSlashCommand('/shell')).toEqual({ type: 'exit' })
  })

  it('parses /new as new command', () => {
    expect(parseSlashCommand('/new')).toEqual({ type: 'new' })
  })

  it('parses /settings as settings command', () => {
    expect(parseSlashCommand('/settings')).toEqual({ type: 'settings' })
  })

  it('returns unknown for unrecognized slash commands', () => {
    expect(parseSlashCommand('/unknown')).toEqual({
      type: 'unknown',
      input: '/unknown',
    })
  })

  it('returns unknown for /help', () => {
    expect(parseSlashCommand('/help')).toEqual({
      type: 'unknown',
      input: '/help',
    })
  })

  it('trims whitespace from input', () => {
    expect(parseSlashCommand('  /exit  ')).toEqual({ type: 'exit' })
  })

  it('returns unknown for /model (no longer a slash command)', () => {
    expect(parseSlashCommand('/model')).toEqual({
      type: 'unknown',
      input: '/model',
    })
  })

  it('returns unknown for /model with argument (no longer a slash command)', () => {
    expect(parseSlashCommand('/model claude-sonnet-4-5-20250514')).toEqual({
      type: 'unknown',
      input: '/model claude-sonnet-4-5-20250514',
    })
  })

  it('returns unknown for /permissions (no longer a slash command)', () => {
    expect(parseSlashCommand('/permissions')).toEqual({
      type: 'unknown',
      input: '/permissions',
    })
  })

  it('returns unknown for /permissions auto (no longer a slash command)', () => {
    expect(parseSlashCommand('/permissions auto')).toEqual({
      type: 'unknown',
      input: '/permissions auto',
    })
  })
})
