import { describe, it, expect } from 'vitest'
import { validatePluginConfig } from '../../src/config.js'

describe('validatePluginConfig', () => {
  it('returns correct PluginConfig with valid enabled and aliases', () => {
    const result = validatePluginConfig({
      enabled: ['git'],
      aliases: { gs: 'git status' },
    })
    expect(result.enabled).toEqual(['git'])
    expect(result.aliases).toEqual({ gs: 'git status' })
  })

  it('omits enabled when not present', () => {
    const result = validatePluginConfig({ aliases: { gs: 'git status' } })
    expect(result.enabled).toBeUndefined()
    expect(result.aliases).toEqual({ gs: 'git status' })
  })

  it('filters out non-string values in aliases', () => {
    const result = validatePluginConfig({
      aliases: { gs: 'git status', bad: 123, also_bad: null },
    })
    expect(result.aliases).toEqual({ gs: 'git status' })
  })

  it('passes through per-plugin config objects', () => {
    const result = validatePluginConfig({
      enabled: ['git'],
      git: { disabled_aliases: ['gp'] },
    })
    expect(result.enabled).toEqual(['git'])
    expect((result as Record<string, unknown>).git).toEqual({ disabled_aliases: ['gp'] })
  })

  it('omits enabled when malformed (not an array)', () => {
    const result = validatePluginConfig({ enabled: 'git' as unknown })
    expect(result.enabled).toBeUndefined()
  })

  it('returns empty PluginConfig for empty object', () => {
    const result = validatePluginConfig({})
    expect(result.enabled).toBeUndefined()
    expect(result.aliases).toBeUndefined()
  })
})
