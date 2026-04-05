import { describe, expect, it, vi } from 'vitest'
import { topologicalSort } from '../../src/plugins/resolver.js'
import type { PluginManifest } from '../../src/plugins/types.js'

function makePlugin(name: string, dependencies?: readonly string[]): PluginManifest {
  return {
    name,
    version: '1.0.0',
    description: `Test plugin ${name}`,
    dependencies,
  }
}

describe('topologicalSort', () => {
  it('returns [B, A] when A depends on B', () => {
    const a = makePlugin('A', ['B'])
    const b = makePlugin('B')

    const { sorted, cycles } = topologicalSort([a, b])

    expect(cycles).toEqual([])
    const names = sorted.map((p) => p.name)
    expect(names.indexOf('B')).toBeLessThan(names.indexOf('A'))
  })

  it('preserves input order when no dependencies', () => {
    const a = makePlugin('A')
    const b = makePlugin('B')
    const c = makePlugin('C')

    const { sorted, cycles } = topologicalSort([a, b, c])

    expect(cycles).toEqual([])
    expect(sorted.map((p) => p.name)).toEqual(['A', 'B', 'C'])
  })

  it('detects A <-> B cycle and returns both in cycles array', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true)

    const a = makePlugin('A', ['B'])
    const b = makePlugin('B', ['A'])

    const { sorted, cycles } = topologicalSort([a, b])

    expect(cycles).toContain('A')
    expect(cycles).toContain('B')
    expect(sorted).toEqual([])
    expect(stderrSpy).toHaveBeenCalled()

    stderrSpy.mockRestore()
  })

  it('skips missing dependency gracefully', () => {
    const a = makePlugin('A', ['X'])
    const b = makePlugin('B')

    const { sorted, cycles } = topologicalSort([a, b])

    expect(cycles).toEqual([])
    // Both should be in sorted since X is not in the list (skip it)
    expect(sorted.map((p) => p.name)).toContain('A')
    expect(sorted.map((p) => p.name)).toContain('B')
  })
})
