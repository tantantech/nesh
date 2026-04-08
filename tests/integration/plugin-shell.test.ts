import { describe, it, expect } from 'vitest'
import { expandAlias } from '../../src/alias.js'
import { classifyInput } from '../../src/classify.js'
import { loadPluginsPhase1 } from '../../src/plugins/loader.js'
import { BUNDLED_PLUGINS } from '../../src/plugins/index.js'

describe('plugin-shell integration', () => {
  it('expandAlias + classifyInput: gst expands to git status (passthrough)', () => {
    const { registry } = loadPluginsPhase1({ enabled: ['git'] }, BUNDLED_PLUGINS)
    const expanded = expandAlias('gst', registry)
    expect(expanded).toBe('git status')
    const action = classifyInput(expanded, 'a')
    expect(action.type).toBe('passthrough')
    expect(action.type === 'passthrough' && action.command).toBe('git status')
  })

  it('expandAlias + classifyInput: aliases passes through as passthrough (no longer a builtin)', () => {
    const { registry } = loadPluginsPhase1({ enabled: ['git'] }, BUNDLED_PLUGINS)
    const expanded = expandAlias('aliases', registry)
    // 'aliases' is not a git alias so it should pass through unchanged
    expect(expanded).toBe('aliases')
    const action = classifyInput(expanded, 'a')
    expect(action.type).toBe('passthrough')
    expect(action.type === 'passthrough' && action.command).toBe('aliases')
  })

  it('loadPluginsPhase1 with git enabled: resolve(gst) returns git status', () => {
    const { registry } = loadPluginsPhase1({ enabled: ['git'] }, BUNDLED_PLUGINS)
    expect(registry.resolve('gst')).toBe('git status')
    expect(registry.resolve('glog')).toBe('git log --oneline --decorate --graph')
  })

  it('loadPluginsPhase1 with empty enabled: returns empty registry', () => {
    const { registry } = loadPluginsPhase1({ enabled: [] }, BUNDLED_PLUGINS)
    expect(registry.resolve('gst')).toBeUndefined()
    expect(registry.getAll().size).toBe(0)
  })
})
