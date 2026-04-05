import type { PluginManifest } from './types.js'

export interface SortResult {
  readonly sorted: readonly PluginManifest[]
  readonly cycles: readonly string[]
}

export function topologicalSort(plugins: readonly PluginManifest[]): SortResult {
  const nameMap = new Map<string, PluginManifest>()
  for (const plugin of plugins) {
    nameMap.set(plugin.name, plugin)
  }

  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const plugin of plugins) {
    inDegree.set(plugin.name, 0)
    adjacency.set(plugin.name, [])
  }

  for (const plugin of plugins) {
    const deps = plugin.dependencies ?? []
    for (const dep of deps) {
      // Skip missing dependencies gracefully
      if (!nameMap.has(dep)) continue

      const neighbors = adjacency.get(dep) ?? []
      adjacency.set(dep, [...neighbors, plugin.name])
      inDegree.set(plugin.name, (inDegree.get(plugin.name) ?? 0) + 1)
    }
  }

  // Kahn's algorithm
  const queue: string[] = []
  for (const plugin of plugins) {
    if ((inDegree.get(plugin.name) ?? 0) === 0) {
      queue.push(plugin.name)
    }
  }

  const sorted: PluginManifest[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    const manifest = nameMap.get(current)!
    sorted.push(manifest)

    const neighbors = adjacency.get(current) ?? []
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  const cycles: string[] = []
  if (sorted.length < plugins.length) {
    for (const plugin of plugins) {
      if (!sorted.some((s) => s.name === plugin.name)) {
        cycles.push(plugin.name)
      }
    }
    process.stderr.write(
      `[nesh] plugin dependency cycle detected: ${cycles.join(', ')}\n`,
    )
  }

  return { sorted, cycles }
}
