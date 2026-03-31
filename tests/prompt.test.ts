import { describe, it, expect } from 'vitest'
import { buildPrompt, abbreviatePath } from '../src/prompt.js'

describe('abbreviatePath', () => {
  it('returns ~ when cwd equals homedir', () => {
    expect(abbreviatePath('/Users/tal', '/Users/tal')).toBe('~')
  })

  it('abbreviates homedir subdirectory with ~/', () => {
    expect(abbreviatePath('/Users/tal/Projects', '/Users/tal')).toBe('~/Projects')
  })

  it('returns full path when not under homedir', () => {
    expect(abbreviatePath('/tmp', '/Users/tal')).toBe('/tmp')
  })

  it('does not abbreviate partial homedir match', () => {
    expect(abbreviatePath('/Users/taller', '/Users/tal')).toBe('/Users/taller')
  })
})

describe('buildPrompt', () => {
  it('contains claudeshell label', () => {
    const result = buildPrompt('/Users/tal', '/Users/tal')
    expect(result).toContain('claudeshell')
  })

  it('contains > character', () => {
    const result = buildPrompt('/Users/tal', '/Users/tal')
    expect(result).toContain('>')
  })

  it('contains tilde for home directory', () => {
    const result = buildPrompt('/Users/tal', '/Users/tal')
    expect(result).toContain('~')
  })

  it('does not contain literal homedir path when at home', () => {
    const result = buildPrompt('/Users/tal', '/Users/tal')
    expect(result).not.toContain('/Users/tal')
  })

  it('shows abbreviated subdirectory path', () => {
    const result = buildPrompt('/Users/tal/Projects', '/Users/tal')
    expect(result).toContain('~/Projects')
  })

  it('shows full path for non-home directory', () => {
    const result = buildPrompt('/tmp', '/Users/tal')
    expect(result).toContain('/tmp')
  })

  it('ends with a trailing space', () => {
    const result = buildPrompt('/tmp', '/Users/tal')
    expect(result.endsWith(' ')).toBe(true)
  })
})
